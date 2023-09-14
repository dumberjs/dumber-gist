import {test} from 'zora';
import create from './cache-primitives.helper';

const cacheUrl = HOST_NAMES.cacheUrl;

test('getRemoteCacheWithPath rejects missing cache, gets valid cache', async t => {
  const remote = {
    [`${cacheUrl}/npm/foo@1.0.0/index.js`]: {foo: 1}
  };
  const p = create({}, remote);
  t.deepEqual(
    await p.getRemoteCacheWithPath('foo@1.0.0/index.js'),
    {foo: 1}
  );
  try {
    await p.getRemoteCacheWithPath('bar@1.0.0/index.js');
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }
});

test('getRemoteCache rejects missing cache, gets valid cache', async t => {
  const remote = {
    [`${cacheUrl}/ha/sh`]: {foo: 1}
  };
  const p = create({}, remote);
  t.deepEqual(
    await p.getRemoteCache('hash'),
    {foo: 1}
  );
  try {
    await p.getRemoteCache('hash2');
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }
});

// test('setRemoteCache does not set cache if user is not signed in', async t => {
//   const remote = {};
//   const p = create({}, remote);
//   await p.setRemoteCache('12345', {a: 1});
//   t.deepEqual(remote, {});
//   try {
//     await p.getRemoteCache('12345');
//     t.fail('should not pass');
//   } catch (e) {
//     t.ok(true, e.message);
//   }
// });

test('setRemoteCache sets cache', async t => {
  // global.__github_token = {access_token: '1'};
  try {
    const remote = {};
    const p = create({}, remote);
    await p.setRemoteCache('12345', {a: 1});
    t.deepEqual(remote, {
      [`${cacheUrl}/12/345`]: {a: 1}
    });
    t.deepEqual(
      await p.getRemoteCache('12345'),
      {a: 1}
    );
  } catch (e) {
    delete global.__github_token;
    throw e;
  }
});
