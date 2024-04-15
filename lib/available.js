
import rversions from 'rversions';
import cache from '../lib/cache.js';

async function available(os, arch) {
    const key = 'available/' + (os || "") + '/' + (arch || '');
    const cached = await cache.get(key);
    if (cached !== null) {
        return cached;
    }

    var ans = undefined;
    try {
        ans = await rversions.available(os, arch);
    } catch (error) {
        and = await cache.get(key + '/old');
        if (ans === null) {
            throw new Error(
                "Cannot list available R versions for '" + key + "': " + error
            );
        }
    }

    await cache.set(key, ans, { EX: 3600 });
    await cache.set(key + '/old', ans);
    return ans
}

export default available;
