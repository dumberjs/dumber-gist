import test from 'tape-promise/tape';
import _ from 'lodash';
import {NpmHttpRegistry} from '../../../worker/turbo-resolver/registries/npm-http';
import {Resolver} from '../../../worker/turbo-resolver/resolver';

test('Resolver resolves au1 deps', async t => {
  const r = new Resolver(new NpmHttpRegistry());

  const result = await r.resolve({
    'aurelia-bootstrapper': '^2.0.0'
  });

  t.deepEqual(Object.keys(result.appDependencies), ['aurelia-bootstrapper']);
  t.ok(_.some(Object.keys(result.resDependencies), k => k.startsWith('aurelia-framework')));
});

test('Resolver resolves vue2 deps', async t => {
  const r = new Resolver(new NpmHttpRegistry());

  const result = await r.resolve({
    'vue': '^2.0.0'
  });

  t.deepEqual(Object.keys(result.appDependencies), ['vue']);
  t.equal(Object.keys(result.resDependencies).length, 0);
});
