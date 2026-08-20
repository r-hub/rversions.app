import { createClient } from 'redis';
let client = undefined;

async function create() {
    const redis_url = process.env.REDIS_URL ||'redis://localhost:6379';
    client = createClient({ url: redis_url });
    await client.connect();
}

import rversions from 'rversions';
import endpoints from './endpoints.js';

async function get(key) {
    if (client === undefined) {
        await create();
    }
    return client.get(key);
}

async function set(key, value, options) {
    if (client === undefined) {
        await create();
    }
    const str = JSON.stringify(value);
    return client.set(key, str, options);
}

// How long a cached value is considered fresh.
const MAX_AGE = 3600;

// How long we wait before trying the upstream servers again, after a
// failed update.
const RETRY_AFTER = 300;

// Updates that are currently running, keyed by cache key. We never run
// more than one update for the same key at the same time.
const updating = new Map();

function parse(value) {
    // to fix a messup in the cache
    while (typeof(value) == "string") {
        value = JSON.parse(value);
    }
    return value;
}

// Query the upstream servers and update the cache. `key` holds the fresh
// value and expires, `key + "/old"` holds the last known good value and
// never expires.

function refresh(key, fetcher) {
    const running = updating.get(key);
    if (running !== undefined) {
        return running;
    }
    const pp = (async function() {
        try {
            const value = await fetcher();
            await set(key, value, { EX: MAX_AGE });
            await set(key + "/old", value);
            return value;
        } finally {
            updating.delete(key);
        }
    })();
    updating.set(key, pp);
    return pp;
}

// Serve the cached value and update it in the background, if it is stale.
// Only the very first query for a key has to wait for the upstream
// servers, after that we always answer from the cache, even if the
// upstream servers are down.

async function stale(key, fetcher) {
    const fresh = await get(key);
    if (fresh !== null) {
        return parse(fresh);
    }

    const old = await get(key + "/old");
    if (old === null) {
        return await refresh(key, fetcher);
    }

    const value = parse(old);
    refresh(key, fetcher).catch(async function(error) {
        console.log("Cannot update '" + key + "': " + error);
        // Keep serving the cached value, but do not hammer the upstream
        // servers while they are down.
        try {
            await set(key, value, { EX: RETRY_AFTER });
        } catch (error2) {
            console.log("Cannot write cache for '" + key + "': " + error2);
        }
    });

    return value;
}

async function update_one(ep) {
        console.log("Update " + ep);
        if (ep === 'r-versions') {
            const val = await rversions.r_versions();
            console.log("Update " + ep + " done.");
            return set('r-versions', val);
        } else if (ep === 'r-release') {
            const val = await rversions.r_release();
            console.log("Update " + ep + " done.");
            return set('r-release', val);
        } else if (ep === 'r-oldrel') {
            const val = await rversions.r_oldrel();
            console.log("Update " + ep + " done.");
            return set('r-oldrel', val);
        } else if (/^r-oldrel/.test(ep)) {
            const n = parseInt(ep.split('/')[1]);
            const val = await rversions.r_oldrel(n);
            console.log("Update " + ep + " done.");
            return set("r-oldrel/" + n, val)
        } else if (ep === 'r-release-macos' || ep === 'r-release-macos-x86_64') {
            const val = await rversions.r_release_macos();
            set('r-release-macos-x86_64', val);
            console.log("Update " + ep + " done.");
            return set('r-release-macos', val);
        } else if (ep === 'r-release-macos-arm64') {
            const val = await rversions.r_release_macos(true, 'arm64');
            console.log("Update " + ep + " done.");
            return set('r-release-macos-arm64', val);
        } else if (ep === 'r-release-tarball') {
            const val = await rversions.r_release_tarball();
            console.log("Update " + ep + " done.");
            return set('r-release-tarball', val);
        } else if (ep === 'r-release-win') {
            const val = await rversions.r_release_win();
            console.log("Update " + ep + " done.");
            return set('r-release-win', val);
        } else if (ep === 'r-next' || ep === 'r-prerelease') {
            const val = await rversions.r_next();
            set('r-next', val);
            console.log("Update " + ep + " done.");
            return set('r-prerelease', val);
        } else if (ep === 'r-next-win' || ep === 'r-prerelease-win') {
            const val = await rversions.r_next_win();
            set('r-next-win', val);
            console.log("Update " + ep + " done.");
            return set('r-prerelease-win', val);
        } else if (ep === 'r-next-macos' ||
                   ep === 'r-prerelease-macos' ||
                   ep === 'r-next-macos-x86_64' ||
                   ep === 'r-prerelease-macos-x86_64') {
            const val = await rversions.r_next_macos();
            set('r-next-macos', val);
            set('r-next-macos-x86_64', val);
            set('r-prerelease-macos-x86_64', val);
            console.log("Update " + ep + " done.");
            return set('r-prerelease-macos', val);
        } else if (ep === 'r-next-macos-arm64' ||
                   ep === 'r-prerelease-macos-arm64') {
            const val = await rversions.r_next_macos(undefined, 'arm64');
            set('r-next-macos-arm64', val);
            console.log("Update " + ep + " done.");
            return set('r-prerelease-macos-arm64', val);
        } else if (ep === 'rtools-versions') {
            const val = await rversions.rtools_versions();
            console.log("Update " + ep + " done.");
            return set('rtools-versions', val);
        } else if (ep === 'rtools-versions/aarch64') {
            const val = await rversions.rtools_versions("aarch64");
            console.log("Update " + ep + " done.");
            return set('rtools-versions/aarch64', val);
        } else if (ep === 'linux-distros') {
            const val = await rversions.linux_distros();
            console.log("Update " + ep + " done.");
            return set('linux-distros', val)
        }
}

// Update all end points. A failing end point does not affect the others,
// and it does not invalidate the cached value, either, we keep serving
// that. Returns the list of end points we could not update.

async function update() {
    const pp = endpoints.map(async function(ep) {
        try {
            await update_one(ep);
            return null;
        } catch (error) {
            console.log("Update " + ep + " failed: " + error);
            return ep;
        }
    });

    const failed = await Promise.all(pp);
    return failed.filter(ep => ep !== null);
}

// if one is missing, then update all, we should do better than this.
async function maybe_update() {
    for (const ep of endpoints) {
        const old = await get(ep);
        if (old === null) {
            return await update()
        }
    }
    return [];
}

export default {
    get: get,
    set: set,
    stale: stale,
    update: update,
    maybe_update: maybe_update
};
