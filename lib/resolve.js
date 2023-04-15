
const rversions = require('rversions');
const cache = require('../lib/cache');

async function resolve(ver, os, arch) {
    const key = ver + "/" + (os || "") + "/" + (arch || "");
    const cached = await cache.get(key);
    if (cached !== null) {
        return cached;
    }
    const ans = await rversions.resolve(ver, os, arch)
    await cache.set(key, ans, { EX: 3600 });
    return ans;
}

module.exports = resolve;
