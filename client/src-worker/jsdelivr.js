// Copied from dumber, enhanced with local and remote cache
import {inject} from 'aurelia-dependency-injection';
import {JSDELIVR_PREFIX, CachePrimitives} from './cache-primitives';

@inject(CachePrimitives)
export class Jsdelivr {
  constructor(primitives) {
    this.primitives = primitives;
    this.create = this.create.bind(this);
  }

  // use jsdelivr to find npm package files
  async create(packageConfig) {
    const name = packageConfig.name;
    let version = packageConfig.version;
    const dumberForcedMain = packageConfig.main;

    let packagePath;
    if (packageConfig.location) {
      const m = packageConfig.location.match(/^(.+)@(\d[^@]*)$/);
      if (m) {
        packagePath = m[1];
        version = m[2];
      } else {
        packagePath = packageConfig.location;
      }
    } else {
      packagePath = name;
    }

    if (version) {
      packagePath += '@' + version;
    }

    const packageJson = JSON.parse(
      (await this.primitives.getJsdelivrFile(packagePath, 'package.json')).contents
    );

    if (!version) {
      // fillup version
      version = packageJson.version;
      packagePath += '@' + version;
    } else if (version !== packageJson.version) {
      packagePath = packagePath.slice(0, -version.length) + packageJson.version;
      version = packageJson.version;
    }

    const exists = async filePath => {
      if (filePath.startsWith('./')) filePath = filePath.slice(2);
      return this.primitives.doesJsdelivrFileExist(packagePath, filePath);
    };

    const fileReader = async filePath => {
      if (filePath.startsWith('./')) filePath = filePath.slice(2);

      // Patch package.json with name and forced main
      if (filePath === 'package.json') {
        const meta = JSON.parse(packageJson);
        if (meta.name !== name) {
          meta.name = name;
        }
        if (dumberForcedMain) {
          meta.dumberForcedMain = dumberForcedMain;
        }
        return {
          path: JSDELIVR_PREFIX + packagePath + '/' + filePath,
          contents: JSON.stringify(meta)
        };
      }

      if (! await exists(filePath)) {
        throw new Error('no file "' + filePath + '" in ' + packagePath);
      }

      return this.primitives.getNpmPackageFile(packagePath, filePath);
    };

    fileReader.packageConfig = packageConfig;
    fileReader.exists = exists;
    return fileReader;
  }
}
