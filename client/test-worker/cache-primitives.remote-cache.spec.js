import test from 'tape-promise/tape';
import create from './cache-primitives.helper';

test('getRemoteCacheWithPath rejects missing cache, gets valid cache', async t => {
  const remote = {
    '//cache.dumber.local/npm/foo@1.0.0/index.js': {foo: 1}
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
    '//cache.dumber.local/ha/sh': {foo: 1}
  };
  const p = create({}, remote);
  t.deepEqual(
    await p.getRemoteCache('hash'),
    {foo: 1}
  );
  await t.rejects(() => p.getRemoteCache('hash2'));
});
