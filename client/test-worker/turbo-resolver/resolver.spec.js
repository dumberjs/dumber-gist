import test from 'tape-promise/tape';
import _ from 'lodash';
import {NpmHttpRegistry} from '../../src-worker/turbo-resolver/registries/npm-http';
import {Resolver} from '../../src-worker/turbo-resolver/resolver';

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

test('Resolver resolves invalid deps', async t => {
  const r = new Resolver(new NpmHttpRegistry());

  await t.rejects(r.resolve({'aninvalidmodulename': '^2.0.0'}), /Could not load npm registry for aninvalidmodulename: Not found/);
});

test('Resolver resolves invalid version', async t => {
  const r = new Resolver(new NpmHttpRegistry());

  await t.rejects(r.resolve({'vue': '^2000.0.0'}), /npm package "vue" was not found with requested version: "\^2000.0.0"./);
});
