import test from 'tape-promise/tape';
import _ from 'lodash';
import {DepsResolver} from '../src/deps-resolver';

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
          'lodash@1.2.3': {}
        }
      };
    }
  }
}

test('DepsResolver lists empty deps', async t => {
  const r = new DepsResolver(() => new TurboResolver());
  const deps = await r.resolve({});
  t.equal(deps.length, 0);
});

test('DepsResolver lists all deps from appDependencies', async t => {
  const r = new DepsResolver(() => new TurboResolver());
  const deps = await r.resolve({'vue': '^2.0.0'});
  t.deepEqual(deps, [
    {name: 'vue', version: '2.1.0', main: 'dist/vue.js', lazyMain: true}
  ]);
});

test('DepsResolver lists all deps from appDependencies and resDependencies', async t => {
  const r = new DepsResolver(() => new TurboResolver());
  const deps = await r.resolve({'aurelia-bootstrapper': '^2.0.0'});
  t.deepEqual(deps, [
    {name: 'aurelia-binding', version: '2.0.0', lazyMain: true},
    {name: 'aurelia-bootstrapper', version: '2.3.3', lazyMain: true},
    {name: 'aurelia-framework', version: '1.0.0', lazyMain: true}
  ]);
});

test('DepsResolver kepts only max version for duplicated package versions', async t => {
  const r = new DepsResolver(() => new TurboResolver());
  const deps = await r.resolve({'foo': '^1.0.0', 'bar': '^2.0.0'});
  t.deepEqual(deps, [
    {name: 'bar', version: '2.1.2', lazyMain: true},
    {name: 'foo', version: '1.5.1', lazyMain: true},
    {name: 'lodash', version: '3.5.0', lazyMain: true}
  ]);
});
