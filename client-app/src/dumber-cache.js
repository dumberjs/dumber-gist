import {inject} from 'aurelia-framework';
import localforage from 'localforage';
import {AccessToken} from './github/access-token';
import {cacheUrl} from './host-name';
import _ from 'lodash';

const SMALL_CACHE_SIZE = 200 * 1024; // 200K

async function getRemoteCache(hash) {
  const response = await fetch(cacheUrl + '/' + hash, {mode: 'cors'});
  if (response.ok) return response.json();
  throw new Error(response.statusText);
}

async function setRemoteCache(token, hash, object) {
  return fetch(cacheUrl, {
    mode: 'cors',
    method: 'POST',
    body: JSON.stringify({token, hash, object}),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

// Dumber cache implementation runs in https://gist.dumber.app
// Not in the service worker https://[random-id].gist.dumber.app
// This eases the back-end CORS configuration.
// It also can share local cache (for local files) in indexedDB
// for multiple dumber-gist instances (every instance has different
// random-id for the service worker and embedded app).
//
// npm packages were remotely cached in cache.gist.dumber.app, the
// static files got some Cache-Control header to let your browser
// to cache them for a long period of time.
@inject(AccessToken)
export class DumberCache {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async getCache(hash, meta) {
    if (meta.packageName) {
      // If there is no local cache, use remote cache.
      return localforage.getItem(hash)
        .then(result => result || Promise.reject())
        .catch(() => {
          return getRemoteCache(hash).then(object => {
            if (_.get(object, 'contents.length', 0) < SMALL_CACHE_SIZE) {
              return localforage.setItem(hash, object).then(
                () => object, () => object
              );
            }
            return object;
          });
        });
    }

    // Use local cache for local files
    return localforage.getItem(hash)
  }

  async setCache(hash, object) {
    if (object.packageName) {
      if (_.get(object, 'contents.length', 0) < SMALL_CACHE_SIZE) {
        await localforage.setItem(hash, object);
      }

      if (this.accessToken.value) {
        // Globally share traced result for npm packages
        try {
          await setRemoteCache(
            this.accessToken.value,
            hash,
            object
          );
        } catch (e) {
          // ignore error
        }
      }
    } else {
      // Use local cache for local files,
      // and npm files only when not logged in.
      await localforage.setItem(hash, object);
    }
  }
}
