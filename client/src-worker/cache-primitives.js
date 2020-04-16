// Local and remote cache
// shared by:
// 1. dumber-cache
// 2. package-file-reader
// 3. aurelia-deps-finder

import localforage from 'localforage';
import {encode} from 'base64-arraybuffer';

const cacheUrl = HOST_NAMES.cacheUrl;
const DUMBER_CACHE_PATH_PREFIX = cacheUrl + '/npm/';
const DUMBER_CACHE_PREFIX = cacheUrl + '/';

export const JSDELIVR_DATA_PREFIX = `${HOST_NAMES.jsdelivrDataUrl || '//data.jsdelivr.com'}/v1/package/npm/`;
export const JSDELIVR_PREFIX = `//${HOST_NAMES.jsdelivrCdnDomain || 'cdn.jsdelivr.net'}/npm/`;

function globalFetch() {
  return fetch.apply(global, arguments);
}

export class CachePrimitives {
  constructor(_localforage, _fetch) {
    this._localforage = _localforage || localforage;
    this._fetch = _fetch || globalFetch;
  }

  async getLocalCacheWithPath(filePath) {
    let result;
    const hash = await this._localforage.getItem(filePath);
    if (hash) {
      result = await this._localforage.getItem(hash);
    }
    if (!result) throw new Error();
    return result;
  }

  async setLocalCacheWithPath(filePath, object) {
    // __dumber_hash was added by cache.dumber.app
    const hash = object.__dumber_hash;
    if (!hash) return;
    await this._localforage.setItem(hash, object);
    await this._localforage.setItem(filePath, hash);
  }

  async getLocalCache(hash) {
    const result = await this._localforage.getItem(hash);
    if (!result) throw new Error();
    return result;
  }

  async setLocalCache(hash, object) {
    await this._localforage.setItem(hash, object)
    const path = object && object.path || '';
    if (path.startsWith(JSDELIVR_PREFIX)) {
      // slice to 'npm/...'
      await this._localforage.setItem(
        object.path.slice(JSDELIVR_PREFIX.length - 4),
        hash
      );
    }
  }

  async getLocalRawFileCache(filePath) {
    const result = await this._localforage.getItem('raw!' + filePath);
    if (!result) throw new Error();
    return result;
  }

  async setLocalRawFileCache(filePath, contents) {
    await this._localforage.setItem('raw!' + filePath, contents);
  }

  // Only exported for testing purposes.
  buildFiles(files, folder) {
    var hash = {};
    var prefix = folder ? (folder + '/') : '';

    files.forEach(node => {
      if (node.type === 'directory') {
        const sub = this.buildFiles(node.files, prefix + node.name);
        Object.keys(sub).forEach(f => hash[f] = 1);
      } else if (node.type === 'file') {
        hash[prefix + node.name] = 1;
      }
    });

    return hash;
  }

  // local memory cache when indexeddb is not available in safari iframe
  npmPackageFilesCache = {};

  async getNpmPackageFiles(packageWithVersion) {
    let files;
    try {
      files = await this._localforage.getItem('files!npm/' + packageWithVersion);
      if (files) return files;
    } catch (e) {
      // indexeddb doesn't work in safari iframe (shared iframe snippet for dumber-gist).
      if (this.npmPackageFilesCache[packageWithVersion]) {
        this.npmPackageFilesCache[packageWithVersion]
      }
    }

    const response = await this._fetch(JSDELIVR_DATA_PREFIX + packageWithVersion, {mode: 'cors'});
    if (response.ok) {
      files = this.buildFiles((await response.json()).files);
    } else {
      files = {};
    }
    if (Object.keys(files).length) {
      try {
        await this._localforage.setItem('files!npm/' + packageWithVersion, files);
      } catch (e) {
        // indexeddb doesn't work in safari iframe (shared iframe snippet for dumber-gist).
        this.npmPackageFilesCache[packageWithVersion] = files;
      }
    }
    return files;
  }

  async doesJsdelivrFileExist(packageWithVersion, filePath) {
    try {
      const files = await this.getNpmPackageFiles(packageWithVersion);
      return files.hasOwnProperty(filePath);
    } catch (e) {
      return false;
    }
  }

  async getJsdelivrFile(packageWithVersion, filePath) {
    const pathWithPackageAndVersion = packageWithVersion + '/' + filePath;
    const url = JSDELIVR_PREFIX + pathWithPackageAndVersion;

    // Cache package.json contents
    if (filePath === 'package.json') {
      try {
        const contents = await this.getLocalRawFileCache('npm/' + pathWithPackageAndVersion);
        return {path: url, contents};
      } catch (e) {
        // ignore
        // indexeddb doesn't work in safari iframe (shared iframe snippet for dumber-gist).
      }
    }

    const response = await this._fetch(url, {mode: 'cors'});
    if (response.ok) {
      if (response.redirected) {
        // jsdelivr redirects directory access to a html page that
        // lists all files in the directory
        throw new Error('it is a directory');
      }

      let contents;
      if (filePath.endsWith('.wasm')) {
        contents = encode(await response.arrayBuffer());
      } else {
        contents = await response.text();
      }

      if (filePath === 'package.json') {
        try {
          await this.setLocalRawFileCache('npm/' + pathWithPackageAndVersion, contents);
        } catch (e) {
          // ignore
          // indexeddb doesn't work in safari iframe (shared iframe snippet for dumber-gist).
        }
      }

      return {path: url, contents};
    }
    throw new Error(`Failed to fetch ${url}`);
  }

  async getRemoteCacheWithPath(pathWithPackageAndVersion) {
    const url = DUMBER_CACHE_PATH_PREFIX + pathWithPackageAndVersion;
    const response = await this._fetch(url, {mode: 'cors'});
    if (response.ok) return response.json();
    throw new Error(`Failed to fetch ${url}`);
  }

  async getRemoteCache(hash) {
    const url = DUMBER_CACHE_PREFIX + hash.slice(0, 2) + '/' + hash.slice(2);
    const response = await this._fetch(url, {mode: 'cors'});
    if (response.ok) return response.json();
    throw new Error(`Failed to fetch ${url}`);
  }

  async setRemoteCache(hash, object) {
    // Only set remote cache if user signed in.
    const token = global.__github_token;
    if (!token) return;
    const accessToken = token.access_token;
    if (!accessToken) return;

    return await this._fetch(cacheUrl, {
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify({
        token: accessToken,
        hash,
        object
      }),
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    })
  }

  async getNpmPackageFile(packageWithVersion, filePath) {
    const pathWithPackageAndVersion = packageWithVersion + '/' + filePath;
    const url = JSDELIVR_PREFIX + pathWithPackageAndVersion;
    const files = await this.getNpmPackageFiles(packageWithVersion);
    if (!files[filePath]) throw new Error(`Cannot find file ${url}`);

    try {
      // Try local traced cache.
      return await this.getLocalCacheWithPath('npm/' + pathWithPackageAndVersion);
    } catch (e) {
      try {
        // Try remote traced cache.
        const result = await this.getRemoteCacheWithPath(pathWithPackageAndVersion);

        try {
          await this.setLocalCacheWithPath('npm/' + pathWithPackageAndVersion, result);
        } catch (e) {
          // ignore
          // indexeddb doesn't work in safari iframe (shared iframe snippet for dumber-gist).
        }

        return result;
      } catch (e) {
        // Finally try to read source (not traced).
        return await this.getJsdelivrFile(packageWithVersion, filePath);
      }
    }
  }
}
