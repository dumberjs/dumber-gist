import {CachePrimitives} from '../src-worker/cache-primitives';

function mockLocalforage(db = {}) {
  return {
    async getItem(key) {
      return db[key];
    },
    async setItem(key, value) {
      db[key] = value;
      return value;
    },
    async clear() {
      Object.getOwnPropertyNames(db).forEach(function (prop) {
        delete db[prop];
      });
    }
  };
}

function mkResponse (text) {
  return {
    ok: true,
    text: async () => text
  };
}

function mkBufferResponse (arrayBuffer) {
  return {
    ok: true,
    arrayBuffer: async () => arrayBuffer
  };
}

function mkJsonResponse (obj) {
  return {
    ok: true,
    json: async () => obj
  };
}

function mkFailedResponse () {
  return {
    ok: false
  };
}

function mockFetch(remote = {}) {
  return async url => {
    if (remote[url]) {
      const result = remote[url];
      if (typeof result === 'string') {
        return mkResponse(result);
      } else if (typeof result === 'object') {
        if (typeof result.byteLength === 'number') {
          return mkBufferResponse(result);
        }
        return mkJsonResponse(result);
      }
    }
    return mkFailedResponse();
  }
}

export default function create(db = {}, remote = {}) {
  return new CachePrimitives(mockLocalforage(db), mockFetch(remote));
}
