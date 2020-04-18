import test from 'tape-promise/tape';
import _ from 'lodash';
import {DepsResolver} from '../src-worker/deps-resolver';

class TurboResolver {
  async resolve(deps) {
    if (_.isEqual(deps, {'aurelia-bootstrapper': '^2.0.0'})) {
      return {
        appDependencies: {
          'aurelia-bootstrapper': {
            version: '2.3.3'
          }
        },
        resDependencies: {
          'aurelia-framework@1.0.0': {},
          'aurelia-binding@2.0.0': {}
        }
      };
    } else if (_.isEqual(deps, {'vue': '^2.0.0'})) {
      return {
        appDependencies: {
          'vue': {
            version: '2.1.0'
          }
        },
        resDependencies: {}
      };
    } else if (_.isEqual(deps, {'inferno': '^7.0.0'})) {
      return {
        appDependencies: {
          'inferno': {
            version: '7.4.0'
          }
        },
        resDependencies: {
          'inferno-vnode-flags@7.4.0': {},
          'inferno-shared@7.4.0': {}
        }
      };
    } else if (_.isEqual(deps, {'readable-stream': '^3.0.0'})) {
      return {
        appDependencies: {
          'readable-stream': {
            version: '3.6.0'
          }
        },
        resDependencies: {}
      };
    } else if (_.isEqual(deps, {'foo': '^1.0.0', 'bar': '^2.0.0'})) {
      return {
        appDependencies: {
          'foo': {
            version: '1.5.1'
          },
          'bar': {
            version: '2.1.2'
          }
        },
        resDependencies: {
          'lodash@2.3.1': {},
          'lodash@3.5.0': {},
          'lodash@1.2.3': {},
          'readable-stream@3.0.0': {},
          'readable-stream@2.3.6': {},
          'readable-stream@2.1.2': {},
        }
      };
    }
  }
}

test('DepsResolver lists empty deps', async t => {
  const primitives = {
    async getLocalCache() {
      t.fail('Should not called getLocalCache');
    },
    async setLocalCache() {
      t.fail('Should not called setLocalCache');
    }
  }
  const r = new DepsResolver(() => new TurboResolver(), primitives);
  const deps = await r.resolve({});
  t.equal(deps.length, 0);
});

test('DepsResolver lists all deps from appDependencies, set cache, then reads from cache', async t => {
  const db = {}
  const primitives = {
    async getLocalCache(hash) {
      if (db[hash]) return db[hash];
      throw new Error('no cache');
    },
    async setLocalCache(hash, object) {
      db[hash] = object;
    }
  }

  const r = new DepsResolver(() => new TurboResolver(), primitives);
  const deps = await r.resolve({'vue': '^2.0.0'});
  t.deepEqual(deps, [
    {name: 'vue', version: '2.1.0', main: 'dist/vue.min.js', lazyMain: true}
  ]);

  const cached = Object.values(db)[0];
  t.equal(typeof cached.time, 'number');
  t.deepEqual(cached.result, [
    {name: 'vue', version: '2.1.0', main: 'dist/vue.min.js', lazyMain: true}
  ]);

  const r2 = new DepsResolver(() => ({
    async resolve() {
      t.fail('should not call turbo-resolver');
    }
  }), primitives);
  const deps2 = await r2.resolve({'vue': '^2.0.0'});
  t.deepEqual(deps2, [
    {name: 'vue', version: '2.1.0', main: 'dist/vue.min.js', lazyMain: true}
  ]);
});

test('DepsResolver lists all deps from appDependencies, ignore unavailable primitives error', async t => {
  const primitives = {
    async getLocalCache() {
      throw new Error('indexeddb is not available');
    },
    async setLocalCache() {
      throw new Error('indexeddb is not available');
    }
  }
  const r = new DepsResolver(() => new TurboResolver(), primitives);
  const deps = await r.resolve({'inferno': '^7.0.0'});
  t.deepEqual(deps, [
    {name: 'inferno', version: '7.4.0', main: 'dist/index.dev.esm.js', lazyMain: true},
    {name: 'inferno-shared', version: '7.4.0', main: 'dist/index.dev.esm.js', lazyMain: true},
    {name: 'inferno-vnode-flags', version: '7.4.0', main: 'dist/index.dev.esm.js', lazyMain: true}
  ]);
});

test('DepsResolver lists all deps from appDependencies and resDependencies', async t => {
  const primitives = {
    async getLocalCache() {
      throw new Error('indexeddb is not available');
    },
    async setLocalCache() {
      throw new Error('indexeddb is not available');
    }
  }
  const r = new DepsResolver(() => new TurboResolver(), primitives);
  const deps = await r.resolve({'aurelia-bootstrapper': '^2.0.0'});
  t.deepEqual(deps, [
    {name: 'aurelia-binding', version: '2.0.0', lazyMain: true},
    {name: 'aurelia-bootstrapper', version: '2.3.3', lazyMain: true},
    {name: 'aurelia-framework', version: '1.0.0', lazyMain: true}
  ]);
});

test('DepsResolver kepts only max version for duplicated package versions', async t => {
  const primitives = {
    async getLocalCache() {
      throw new Error('indexeddb is not available');
    },
    async setLocalCache() {
      throw new Error('indexeddb is not available');
    }
  }
  const r = new DepsResolver(() => new TurboResolver(), primitives);
  const deps = await r.resolve({'foo': '^1.0.0', 'bar': '^2.0.0'});
  t.deepEqual(deps, [
    {name: 'bar', version: '2.1.2', lazyMain: true},
    {name: 'foo', version: '1.5.1', lazyMain: true},
    {name: 'lodash', version: '3.5.0', lazyMain: true},
    {name: 'readable-stream', version: '3.0.0', lazyMain: true},
  ]);
});
