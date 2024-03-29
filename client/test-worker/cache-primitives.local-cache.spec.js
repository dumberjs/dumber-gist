import {test} from 'zora';
import create from './cache-primitives.helper';
import {JSDELIVR_PREFIX} from '../src-worker/cache-primitives';

test('getLocalCacheWithPath rejects missing cache, gets valid cache', async t => {
  const p = create({
    'hash': {foo: 1},
    'a-path': 'hash'
  });

  try {
    await p.getLocalCacheWithPath('unknown');
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }

  try {
    await p.getLocalCacheWithPath('hash');
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }

  t.deepEqual(
    await p.getLocalCacheWithPath('a-path'),
    {foo: 1}
  );
});

test('setLocalCacheWithPath sets cache', async t => {
  const db = {};
  const p = create(db);
  const object = {
    __dumber_hash: 'xyz',
    foo: 'bar'
  };
  await p.setLocalCacheWithPath('a-path', object);
  t.deepEqual(db, {
    'a-path': 'xyz',
    'xyz': {
      __dumber_hash: 'xyz',
      foo: 'bar'
    }
  });
  t.deepEqual(
    await p.getLocalCacheWithPath('a-path'),
    {__dumber_hash: 'xyz', foo: 'bar'}
  );
});

test('getLocalCache rejects missing cache, gets valid cache', async t => {
  const p = create({
    'hash': {foo: 1},
    'a-path': 'hash'
  });
  try {
    await p.getLocalCache('unknown');
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }
  t.deepEqual(
    await p.getLocalCache('hash'),
    {foo: 1}
  );
  t.deepEqual(
    await p.getLocalCache('a-path'),
    'hash'
  );
});

test('setLocalCache sets cache', async t => {
  const db = {};
  const p = create(db);
  const object = {
    foo: 'bar'
  };
  await p.setLocalCache('hash', object);
  t.deepEqual(db, {
    'hash': {
      foo: 'bar'
    }
  });
  t.deepEqual(
    await p.getLocalCache('hash'),
    {foo: 'bar'}
  );
});

test('setLocalCache sets cache with npm filePath', async t => {
  const db = {};
  const p = create(db);
  const object = {
    path: `${JSDELIVR_PREFIX}foo@1.0.0/index.js`,
    foo: 'bar'
  };
  await p.setLocalCache('hash', object);
  t.deepEqual(db, {
    'hash': {
      path: `${JSDELIVR_PREFIX}foo@1.0.0/index.js`,
      foo: 'bar'
    },
    'npm/foo@1.0.0/index.js': 'hash'
  });
  t.deepEqual(
    await p.getLocalCache('hash'),
    {path: `${JSDELIVR_PREFIX}foo@1.0.0/index.js`, foo: 'bar'}
  );
  t.deepEqual(
    await p.getLocalCache('npm/foo@1.0.0/index.js'),
    'hash'
  );
  t.deepEqual(
    await p.getLocalCacheWithPath('npm/foo@1.0.0/index.js'),
    {path: `${JSDELIVR_PREFIX}foo@1.0.0/index.js`, foo: 'bar'}
  );
});

test('getLocalRawFileCache rejects missing cache, gets valid cache', async t => {
  const p = create({
    'raw!a-path': 'lorem'
  });
  try {
    await p.getLocalRawFileCache('unknown');
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }
  t.deepEqual(
    await p.getLocalRawFileCache('a-path'),
    'lorem'
  );
});

test('setLocalRawFileCache sets raw cache', async t => {
  const db = {};
  const p = create(db);
  await p.setLocalRawFileCache('a-path', 'lorem');
  t.deepEqual(db, {
    'raw!a-path': 'lorem'
  });
  t.deepEqual(
    await p.getLocalRawFileCache('a-path'),
    'lorem'
  );
});