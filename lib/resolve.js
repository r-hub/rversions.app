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
        const error2 = new Error(
            "Cannot resolve R version '" + key + "': " + error
        );
        // Keep the code, so the caller knows if this is a final answer
        error2.code = error.code;
        throw error2;
    }
}

export default resolve;
