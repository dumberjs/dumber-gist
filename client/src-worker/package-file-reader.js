import jsdelivr from 'dumber/lib/package-file-reader/default';
import localforage from 'localforage';

async function getLocalCache(filePath) {
  let result;
  const hash = await localforage.getItem(filePath);
  if (hash) {
    result = await localforage.getItem(hash);
  }
  if (!result) throw new Error();
  return result;
}

async function setLocalCache(filePath, object) {
  try {
    const hash = object.__dumber_hash;
    if (!hash) return;
    await localforage.setItem(hash, object);
    await localforage.setItem(filePath, hash);
  } catch (e) {
    // ignore
  }
}

// Temporarily hold jsdelivr results for few seconds to avoid
// dumber package-reader to repeatedly hit the same remote file.
const transientResults = {};

// Wrap original jsdelivr reader to read/write local cache
export default function (cachePrefix) {
  return async function (packageConfig) {
    const fileRead = await jsdelivr(packageConfig, {cachePrefix})

    const meta = await fileRead('package.json');
    const {version} = JSON.parse(meta.contents);
    const {name} = packageConfig;

    const prefix = `npm/${name}@${version}/`;

    const wrapped = async function (filePath) {
      if (filePath.startsWith('./')) {
        filePath = filePath.slice(2);
      }

      const npmPath = prefix + filePath;

      try {
        const r = await getLocalCache(npmPath);
        return r;
      } catch (e) {
        if (transientResults[npmPath]) {
          return transientResults[npmPath];
        }

        let result
        try {
          result = await fileRead(filePath);
        } catch (e) {
          result = Promise.reject(e);
        }

        transientResults[npmPath] = result;
        setTimeout(() => {
          delete transientResults[npmPath];
        }, 2000);

        if (result.defined) {
          // Locally cache traced result
          await setLocalCache(npmPath, result);
        }
        return result;
      }
    };

    wrapped.packageConfig = packageConfig;
    return wrapped;
  };
}
