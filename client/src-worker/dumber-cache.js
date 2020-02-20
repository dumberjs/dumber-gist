import {inject} from 'aurelia-dependency-injection';
import {CachePrimitives} from './cache-primitives';

@inject(CachePrimitives)
export class DumberCache {
  constructor(primitives) {
    this.primitives = primitives;
    this.getCache = this.getCache.bind(this);
    this.setCache = this.setCache.bind(this);
    this.clearCache = this.clearCache.bind(this);
  }

  async getCache(hash, meta) {
    try {
      return await this.primitives.getLocalCache(hash);
    } catch (e) {
      if (meta.packageName) {
        const object = await this.primitives.getRemoteCache(hash);
        await this.primitives.setLocalCache(hash, object);
        return object;
      }
      throw e;
    }
  }

  async setCache(hash, object) {
    await this.primitives.setLocalCache(hash, object);
    if (object.packageName) {
      // Globally share traced result for npm packages
      try {
        // Note this is noop for user not signed in.
        await this.primitives.setRemoteCache(hash, object);
      } catch (e) {
        // ignore
      }
    }
  }

  // To satisfy dumber
  async clearCache() {}
}
