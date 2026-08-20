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
        throw new Error(
            "Cannot list available R versions for '" + key + "': " + error
        );
    }
}

export default available;
