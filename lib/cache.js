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

async function update() {
    const pp = endpoints.map(async function(ep) {
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
        } else if (ep === 'linux-distros') {
            const val = await rversions.linux_distros();
            console.log("Update " + ep + " done.");
            return set('linux-distros', val)
        }
    });

    return Promise.all(pp);
}

// if one is missing, then update all, we should do better than this.
async function maybe_update() {
    for (const ep of endpoints) {
        const old = await get(ep);
        if (old === null) {
            return await update()
        }
    }
}

export default {
    get: get,
    set: set,
    update: update,
    maybe_update: maybe_update
};
