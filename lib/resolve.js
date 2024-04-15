
import rversions from 'rversions';
import cache from '../lib/cache.js';

async function resolve(ver, os, arch) {
    const key = ver + "/" + (os || "") + "/" + (arch || "");
    var cached = await cache.get(key);

    if (cached !== null) {
	// to fix a messup in the cache
	while (typeof(cached) == "string") {
	    cached = JSON.parse(cached);
	}
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

	// to fix a messup in the cache
	while (typeof(ans) == "string") {
	    ans = JSON.parse(ans);
	}
    }

    await cache.set(key, ans, { EX: 3600 });
    await cache.set(key + "/old", ans);
    return ans;
}

export default resolve;
