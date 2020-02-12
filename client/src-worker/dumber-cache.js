import {
  getLocalCache,
  setLocalCache,
  getRemoteCache,
  setRemoteCache
} from './cache-primitives';

export class DumberCache {
  async getCache(hash, meta) {
    try {
      return await getLocalCache(hash);
    } catch (e) {
      if (meta.packageName) {
        const object = await getRemoteCache(hash);
        await setLocalCache(hash, object);
        return object;
      }
    }
  }

  async setCache(hash, object) {
    await setLocalCache(hash, object);
    if (object.packageName) {
      // Globally share traced result for npm packages
      try {
        // Note this is noop for user not signed in.
        await setRemoteCache(hash, object);
      } catch (e) {
        // ignore
      }
    }
  }

  // To satisfy dumber
  async clearCache() {}
}
