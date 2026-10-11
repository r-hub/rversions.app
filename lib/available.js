import rversions from 'rversions';
import cache from '../lib/cache.js';

async function available(os, arch) {
    const key = 'available/' + (os || "") + '/' + (arch || '');
    try {
        return await cache.stale(
            key,
            () => rversions.available(os, arch)
        );
    } catch (error) {
        const error2 = new Error(
            "Cannot list available R versions for '" + key + "': " + error
        );
        // Keep the code, so the caller knows if this is a final answer
        error2.code = error.code;
        throw error2;
    }
}

export default available;
