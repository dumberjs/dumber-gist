import test from 'tape-promise/tape';
import create from './cache-primitives.helper';

test('getRemoteCacheWithPath rejects missing cache, gets valid cache', async t => {
  const remote = {
    'https://cache.dumber.local/npm/foo@1.0.0/index.js': {foo: 1}
  };
  const p = create({}, remote);
  t.deepEqual(
    await p.getRemoteCacheWithPath('foo@1.0.0/index.js'),
    {foo: 1}
  );
  await t.rejects(() => p.getRemoteCacheWithPath('bar@1.0.0/index.js'));
});

test('getRemoteCache rejects missing cache, gets valid cache', async t => {
  const remote = {
    'https://cache.dumber.local/ha/sh': {foo: 1}
  };
  const p = create({}, remote);
  t.deepEqual(
    await p.getRemoteCache('hash'),
    {foo: 1}
  );
  await t.rejects(() => p.getRemoteCache('hash2'));
});

test('setRemoteCache does not set cache if user is not signed in', async t => {
  const remote = {};
  const p = create({}, remote);
  await p.setRemoteCache('12345', {a: 1});
  t.deepEqual(remote, {});
  await t.rejects(() => p.getRemoteCache('12345'));
});

test('setRemoteCache sets cache if user is signed in', async t => {
  const remote = {};
  const p = create({'github-oauth-token' : '{"access_token":"1"}'}, remote);
  await p.setRemoteCache('12345', {a: 1});
  t.deepEqual(remote, {
    'https://cache.dumber.local/12/345': {a: 1}
  });
  t.deepEqual(
    await p.getRemoteCache('12345'),
    {a: 1}
  );
});
