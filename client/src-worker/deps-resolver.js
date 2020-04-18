import semver from 'semver';
import {Factory, inject} from 'aurelia-dependency-injection';
import {Resolver} from './turbo-resolver/resolver';
import {CachePrimitives} from './cache-primitives';
import {generateHash} from 'dumber/lib/shared';
import _ from 'lodash';

const CACHE_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day

function hashOf(dependencies) {
  const all = _(dependencies)
    .map((version, name) => `${name}@${version}`)
    .sort()
    .join('|');
  return generateHash(all);
}


// Turn turbo-resolver result into dumber config deps
@inject(Factory.of(Resolver), CachePrimitives)
export class DepsResolver {
  constructor(getResolver, primitives) {
    this.getResolver = getResolver;
    this.primitives = primitives;
  }

  async _getCache(hash) {
    const cached = await this.primitives.getLocalCache(hash);
    const now = (new Date()).getTime();
    if (cached && (now - cached.time) < CACHE_TIMEOUT) {
      return cached.result;
    }
    throw new Error('cache is expired');
  }

  async _setCache(hash, result) {
    const time = (new Date()).getTime();
    await this.primitives.setLocalCache(hash, {time, result});
  }

  async resolve(dependencies) {
    if (!dependencies || Object.keys(dependencies).length === 0) {
      return [];
    }

    const hash = hashOf(dependencies);
    try {
      return await this._getCache(hash);
    } catch (e) {
      // ignore
      // indexeddb doesn't work in safari iframe (shared iframe snippet for dumber-gist).
    }

    const result = await this._resolve(dependencies);

    try {
      await this._setCache(hash, result);
    } catch (e) {
      // ignore
      // indexeddb doesn't work in safari iframe (shared iframe snippet for dumber-gist).
    }

    return result;
  }

  async _resolve(dependencies) {

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
        console.warn(`[dumber] duplicated package "${name}" versions detected: ${JSON.stringify(version)}`);
        version = _.last(version);
        console.warn(`[dumber] only uses package "${name}" version ${version}`);
      }
      const dep = {name, version, lazyMain: true};
      if (name === 'vue' && semver.major(version) === 2) {
        // Use vue file with built-in template compiler
        dep.main = 'dist/vue.min.js'
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
