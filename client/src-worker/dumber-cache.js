import {inject} from 'aurelia-dependency-injection';
import {CachePrimitives} from './cache-primitives';

function globalPostMessage() {
  return postMessage.apply(global, arguments);
}

@inject(CachePrimitives)
export class DumberCache {
  constructor(primitives, _postMessage) {
    this.primitives = primitives;
    this._postMessage = _postMessage || globalPostMessage;
    this.getCache = this.getCache.bind(this);
    this.setCache = this.setCache.bind(this);
    this.clearCache = this.clearCache.bind(this);
  }

  async getCache(hash, meta) {
    try {
      return await this.primitives.getLocalCache(hash);
    } catch (e) {
      this._postMessage({type:'miss-cache', meta});
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
