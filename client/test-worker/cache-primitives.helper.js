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

function mockLocalStorage(db = {}) {
  return {
    getItem(key) {
      return db[key];
    },
    setItem(key, value) {
      db[key] = value;
      return value;
    },
    clear() {
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
  return async (url, opts = {}) => {
    if (opts.method === 'POST') {
      const {hash, object} = JSON.parse(opts.body);
      remote[url + '/' + hash.slice(0, 2) + '/' + hash.slice(2)] = object;
    } else if (remote[url]) {
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

export default function create(db = {}, remote = {}, localDb = {}) {
  return new CachePrimitives(mockLocalforage(db), mockFetch(remote), mockLocalStorage(localDb));
}
