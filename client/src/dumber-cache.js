import {inject} from 'aurelia-framework';
import {AccessToken} from './github/access-token';
import {cacheUrl} from './host-name';

async function getRemoteCache(hash) {
  const response = await fetch(
    cacheUrl + '/' + hash.slice(0, 2) + '/' + hash.slice(2),
    {mode: 'cors'}
  );
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
// npm packages were remotely cached in cache.dumber.app, the
// static files got some Cache-Control header to let your browser
// to cache them for a long period of time.
@inject(AccessToken)
export class DumberCache {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async getCache(hash, meta) {
    if (meta.packageName) return getRemoteCache(hash);
  }

  async setCache(hash, object) {
    if (object.packageName && this.accessToken.value) {
      // Globally share traced result for npm packages
      try {
        await setRemoteCache(
          this.accessToken.value,
          hash,
          object
        );
      } catch (e) {
        // ignore
      }
    }
  }
}
