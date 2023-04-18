
const rversions = require('rversions');
const cache = require('../lib/cache');

async function resolve(ver, os, arch) {
    const key = ver + "/" + (os || "") + "/" + (arch || "");
    const cached = await cache.get(key);
    if (cached !== null) {
        return cached;
    }

    var ans = undefined;
    try {
        ans = await rversions.resolve(ver, os, arch);
    } catch (error) {
        ans = await cache.get(key + "/old");
        if (ans === null) {
            throw new Error(
                "Cannot resolve R version '" + key + "': " + error
            );
        }
    }

    await cache.set(key, ans, { EX: 3600 });
    await cache.set(key + "/old", ans);
    return ans;
}

module.exports = resolve;
