import semver from 'semver';
import {Factory, inject} from 'aurelia-dependency-injection';
import {Resolver} from './turbo-resolver/resolver';

// Turn turbo-resolver result into dumber config deps
@inject(Factory.of(Resolver))
export class DepsResolver {
  constructor(getResolver) {
    this.getResolver = getResolver;
  }

  async resolve(dependencies) {
    if (!dependencies || Object.keys(dependencies).length === 0) {
      return [];
    }

    const result = await this.getResolver().resolve(dependencies);

    const packages = {};
    Object.keys(result.appDependencies).forEach(name => {
      packages[name] = result.appDependencies[name].version;
    });

    Object.keys(result.resDependencies).sort().forEach(fullName => {
      const idx = fullName.lastIndexOf('@');
      if (idx === -1) return;
      const name = fullName.substr(0, idx);
      const version = fullName.substr(idx + 1);
      if (packages[name]) {
        if (typeof packages[name] === 'string') {
          packages[name] = [packages[name]];
        }
        packages[name].push(version);
      } else {
        packages[name] = version;
      }
    });

    const deps = [];
    Object.keys(packages).sort().forEach(name => {
      let version = packages[name];
      if (Array.isArray(version)) {
        version.sort(semver.compare);
        console.warn(`Duplicated package "${name}" versions detected: ${JSON.stringify(version)}`);
        // This is an overly simplified decision on duplicated versions.
        // Only take the last one which is most likely the biggest version (because of the sorting of resDeps keys).
        version = version[version.length - 1];
        console.warn(`Dumber only uses package "${name}" version ${version}`);
      }
      const dep = {name, version, lazyMain: true};
      if (name === 'vue' && semver.major(version) === 2) {
        // Use vue file with built-in template compiler
        dep.main = 'dist/vue.js'
      } else if (
        name === 'inferno' ||
        name === 'inferno-shared' ||
        name === 'inferno-vnode-flags'
      ) {
        // use inferno development build
        dep.main = 'dist/index.dev.esm.js';
      }
      deps.push(dep);
    });

    return deps;
  }
}
