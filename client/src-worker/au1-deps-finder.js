import {inject} from 'aurelia-dependency-injection';
import findDeps from 'aurelia-deps-finder';
import {
  JSDELIVR_PREFIX,
  CachePrimitives
} from './cache-primitives';

@inject(CachePrimitives)
export class Au1DepsFinder {
  constructor(primitives) {
    this.primitives = primitives;
    this.findDeps = this.findDeps.bind(this);
    this.readFile = this.readFile.bind(this);
  }

  async readFile(filename) {
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

    if (! await this.primitives.doesJsdelivrFileExist(packageWithVersion, filePath)) {
      throw new Error('File does not exist');
    }
  }

  findDeps(filename, contents) {
    return findDeps(filename, contents, {readFile: this.readFile});
  }
}

