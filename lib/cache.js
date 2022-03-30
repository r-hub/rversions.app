
let client;

if (process.env.NODE_RVERSIONS_APP_REDIS_MOCK !== "true") {
    const redis = require('redis');
    const redis_host = process.env.REDIS_HOST || '127.0.0.1';
    const redis_port = process.env.REDIS_PORT || 6379;
    client = redis.createClient(redis_port, redis_host);
} else {
    const redis_mock = require('redis-mock');
    client = redis_mock.createClient();
}

const { promisify } = require("util");
const redis_get = promisify(client.get).bind(client);
const redis_set = promisify(client.set).bind(client);

const rversions = require('rversions');

const endpoints = require('./endpoints');

async function get(key) {
    return redis_get(key);
}

async function set(key, value) {
    const str = JSON.stringify(value);
    return redis_set(key, str);
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
        } else if (ep === 'r-release-macos') {
            const val = await rversions.r_release_macos();
            return set('r-release-macos', val);
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
        } else if (ep === 'r-next-macos' || ep === 'r-prerelease-macos') {
            const val = await rversions.r_next_macos();
            set('r-next-macos', val);
            return set('r-prerelease-macos', val);
        }
    });

    return Promise.all(pp);
}

async function maybe_update() {
    const pp = endpoints.map(async function(ep) {
        const old = await redis_get(ep);
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
