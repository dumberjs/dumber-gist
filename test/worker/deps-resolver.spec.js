import test from 'ava';
import _ from 'lodash';
import {NpmHttpRegistry} from '../../worker/registries/npm-http';
import {DepsResolver} from '../../worker/deps-resolver';

test.serial('DepsResolver resolves au1 deps', async t => {
  const r = new DepsResolver(new NpmHttpRegistry());

  const result = await r.resolve({
    'aurelia-bootstrapper': '^2.0.0'
  });

  t.deepEqual(Object.keys(result.appDependencies), ['aurelia-bootstrapper']);
  t.truthy(_.some(Object.keys(result.resDependencies), k => k.startsWith('aurelia-framework')));
});

test.serial('DepsResolver resolves vue2 deps', async t => {
  const r = new DepsResolver(new NpmHttpRegistry());

  const result = await r.resolve({
    'vue': '^2.0.0'
  });

  t.deepEqual(Object.keys(result.appDependencies), ['vue']);
  t.is(Object.keys(result.resDependencies).length, 0);
});
