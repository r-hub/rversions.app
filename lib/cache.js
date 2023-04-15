
let client = undefined;

async function create() {
    if (process.env.NODE_RVERSIONS_APP_REDIS_MOCK !== "true") {
        const redis = require('redis');
        const redis_host = process.env.REDIS_HOST || '127.0.0.1';
        const redis_port = process.env.REDIS_PORT || 6379;
        client = redis.createClient(redis_port, redis_host);
        await client.connect();
    } else {
        const Redis = require('ioredis-mock');
        client = new Redis();
    }
}

const rversions = require('rversions');
const endpoints = require('./endpoints');

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
        if (ep === 'r-versions') {
            const val = await rversions.r_versions();
            return set('r-versions', val);
        } else if (ep === 'r-release') {
            const val = await rversions.r_release();
            return set('r-release', val);
        } else if (ep === 'r-oldrel') {
            const val = await rversions.r_oldrel();
            return set('r-oldrel', val);
        } else if (/^r-oldrel/.test(ep)) {
            const n = parseInt(ep.split('/')[1]);
            const val = await rversions.r_oldrel(n);
            return set("r-oldrel/" + n, val)
        } else if (ep === 'r-release-macos' || ep === 'r-release-macos-x86_64') {
            const val = await rversions.r_release_macos();
            set('r-release-macos-x86_64', val);
            return set('r-release-macos', val);
        } else if (ep === 'r-release-macos-arm64') {
            const val = await rversions.r_release_macos(true, 'arm64');
            return set('r-release-macos-arm64', val);
        } else if (ep === 'r-release-tarball') {
            const val = await rversions.r_release_tarball();
            return set('r-release-tarball', val);
        } else if (ep === 'r-release-win') {
            const val = await rversions.r_release_win();
            return set('r-release-win', val);
        } else if (ep === 'r-next' || ep === 'r-prerelease') {
            const val = await rversions.r_next();
            set('r-next', val);
            return set('r-prerelease', val);
        } else if (ep === 'r-next-win' || ep === 'r-prerelease-win') {
            const val = await rversions.r_next_win();
            set('r-next-win', val);
            return set('r-prerelease-win', val);
        } else if (ep === 'r-next-macos' ||
                   ep === 'r-prerelease-macos' ||
                   ep === 'r-next-macos-x86_64' ||
                   ep === 'r-prerelease-macos-x86_64') {
            const val = await rversions.r_next_macos();
            set('r-next-macos', val);
            set('r-next-macos-x86_64', val);
            set('r-prerelease-macos-x86_64', val);
            return set('r-prerelease-macos', val);
        } else if (ep === 'r-next-macos-arm64' ||
                   ep === 'r-prerelease-macos-arm64') {
            const val = await rversions.r_next_macos(undefined, 'arm64');
            set('r-next-macos-arm64', val);
            return set('r-prerelease-macos-arm64', val);
        }
    });

    return Promise.all(pp);
}

async function maybe_update() {
    const pp = endpoints.map(async function(ep) {
        const old = await get(ep);
        if (old === null) {
            return update(ep)
        } else {
            return old;
        }
    });

    Promise.all(pp);
}

module.exports = {
    get: get,
    set: set,
    update: update,
    maybe_update: maybe_update
};
