// Local and remote cache
// shared by:
// 1. dumber-cache
// 2. package-file-reader
// 3. aurelia-deps-finder

import {cacheUrl} from 'host-name';
import localforage from 'localforage';
import {encode} from 'base64-arraybuffer';

export async function getLocalCacheWithPath(filePath) {
  let result;
  const hash = await localforage.getItem(filePath);
  if (hash) {
    result = await localforage.getItem(hash);
  }
  if (!result) throw new Error();
  return result;
}

export async function getLocalCache(hash) {
  const result = await localforage.getItem(hash);
  if (!result) throw new Error();
  return result;
}

export async function setLocalCacheWithPath(filePath, object) {
  try {
    // __dumber_hash was added by cache.dumber.app
    const hash = object.__dumber_hash;
    if (!hash) return;
    await localforage.setItem(hash, object);
    await localforage.setItem(filePath, hash);
  } catch (e) {
    // ignore
  }
}

export async function setLocalCache(hash, object) {
  await localforage.setItem(hash, object)
  if (object.path.startsWith('//cdn.jsdelivr.net/npm/')) {
    // slice to 'npm/...'
    await localforage.setItem(object.path.slice(19), hash)
  }
}

export async function getLocalRawFileCache(filePath) {
  const result = await localforage.getItem('raw!' + filePath);
  if (!result) throw new Error();
  return result;
}

export async function setLocalRawFileCache(filePath, contents) {
  await localforage.setItem('raw!' + filePath, contents);
}

const JSDELIVR_DATA_PREFIX = '//data.jsdelivr.com/v1/package/npm/';

// Only exported for testing purposes.
export function buildFiles(files, folder) {
  var hash = {};
  var prefix = folder ? (folder + '/') : '';

  files.forEach(function(node) {
    if (node.type === 'directory') {
      buildFiles(node.files, prefix + node.name)
        .forEach(function(f) { hash[f] = 1; });
    } else if (node.type === 'file') {
      hash[prefix + node.name] = 1;
    }
  });

  return hash;
}

export async function getNpmPackageFiles(packageWithVersion) {
  let files = await localforage.getItem('npm/' + packageWithVersion);
  if (files) return files;
  const response = await fetch(JSDELIVR_DATA_PREFIX + packageWithVersion, {mode: 'cors'});
  if (response.ok) {
    files = buildFiles((await response.json()).files);
  } else {
    files = {};
  }
  await localforage.setItem('npm/' + packageWithVersion, files);
  return files;
}

export const JSDELIVR_PREFIX = '//cdn.jsdelivr.net/npm/';

export async function doesJsdelivrFileExist(packageWithVersion, filePath) {
  try {
    const files = await getNpmPackageFiles(packageWithVersion);
    return files.hasOwnProperty(filePath);
  } catch (e) {
    return false;
  }
}

export async function getJsdelivrFile(packageWithVersion, filePath) {
  const pathWithPackageAndVersion = packageWithVersion + '/' + filePath;
  const url = JSDELIVR_PREFIX + pathWithPackageAndVersion;

  // Cache package.json contents
  if (filePath === 'package.json') {
    try {
      const contents = await getLocalRawFileCache('npm/' + pathWithPackageAndVersion);
      return {path: url, contents};
    } catch (e) {
      // ignore
    }
  }

  const response = await fetch(url, {mode: 'cors'});
  if (response.ok) {
    if (response.redirected) {
      // jsdelivr redirects directory access to a html page that
      // lists all files in the directory
      throw new Error('it is a directory');
    }

    if (filePath.endsWith('.wasm')) {
      return response.arrayBuffer().then(buffer => encode(buffer));
    }

    const contents = await response.text();

    if (filePath === 'package.json') {
      try {
        await setLocalRawFileCache('npm/' + pathWithPackageAndVersion, contents);
      } catch (e) {
        // ignore
      }
    }

    return {path: url, contents};
  }
  throw new Error(`Failed to fetch ${url}`);
}

const DUMBER_CACHE_PATH_PREFIX = cacheUrl + '/npm/';
const DUMBER_CACHE_PREFIX = cacheUrl + '/';

export async function getRemoteCacheWithPath(pathWithPackageAndVersion) {
  const url = DUMBER_CACHE_PATH_PREFIX + pathWithPackageAndVersion;
  const response = await fetch(url, {mode: 'cors'});
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch ${url}`);
}

export async function getRemoteCache(hash) {
  const url = DUMBER_CACHE_PREFIX + hash;
  const response = await fetch(url, {mode: 'cors'});
  if (response.ok) return response.json();
  throw new Error(`Failed to fetch ${url}`);
}

export async function setRemoteCache(hash, object) {
  // Only set remote cache if user signed in.
  const token = localStorage.getItem('github-oauth-token');
  if (!token) return;
  const accessToken = JSON.parse(token).access_token;
  if (!accessToken) return;

  return await fetch(cacheUrl, {
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

export async function getNpmPackageFile(packageWithVersion, filePath) {
  const pathWithPackageAndVersion = packageWithVersion + '/' + filePath;
  const url = JSDELIVR_PREFIX + pathWithPackageAndVersion;
  const files = await getNpmPackageFiles(packageWithVersion);
  if (!files[filePath]) throw new Error(`Cannot find file ${url}`);

  try {
    // Try local traced cache.
    return await getLocalCacheWithPath('npm/' + pathWithPackageAndVersion);
  } catch (e) {
    try {
      // Try remote traced cache.
      const result = await getRemoteCacheWithPath(pathWithPackageAndVersion);
      await setLocalCacheWithPath('npm/' + pathWithPackageAndVersion, result);
      return result;
    } catch (e) {
      // Finally try to read source (not traced).
      return await getJsdelivrFile(packageWithVersion, filePath);
    }
  }
}
