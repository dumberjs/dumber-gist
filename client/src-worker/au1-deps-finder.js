import findDeps from 'aurelia-deps-finder';
import {
  doesJsdelivrFileExist,
  JSDELIVR_PREFIX
} from './cache-primitives';

async function readFile(filename) {
  let packageWithVersion;
  let filePath;
  if (filename.startsWith(JSDELIVR_PREFIX)) {
    const part = filename.slice(JSDELIVR_PREFIX.length);
    const idx = part.indexOf('/');
    if (idx > 0) {
      packageWithVersion = part.slice(0, idx);
      filePath = part.slice(idx + 1);
    }
  }

  if (!packageWithVersion) {
    throw new Error('do not care');
  }

  if (! await doesJsdelivrFileExist(packageWithVersion, filePath)) {
    throw new Error('File does not exist');
  }
}

export default function(filename, contents) {
  return findDeps(filename, contents, {readFile});
}
