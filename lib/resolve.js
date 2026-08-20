import rversions from 'rversions';
import cache from '../lib/cache.js';

async function resolve(ver, os, arch) {
    const key = ver + "/" + (os || "") + "/" + (arch || "");
    try {
        return await cache.stale(
            key,
            () => rversions.resolve(ver, os, arch)
        );
    } catch (error) {
        throw new Error(
            "Cannot resolve R version '" + key + "': " + error
        );
    }
}

export default resolve;
