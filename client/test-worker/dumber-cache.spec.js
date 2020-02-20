import test from 'tape-promise/tape';
import {DumberCache} from '../src-worker/dumber-cache';

test('DumberCache reads local cache', async t => {
  const primitives = {
    async getLocalCache(hash) {
      if (hash === 'hash') return {local: 1};
    },
    async setLocalCache() {
      t.fail('should not call setLocalCache');
    },
    async getRemoteCache() {
      t.fail('should not call getRemoteCache');
    },
    async setRemoteCache() {
      t.fail('should not call setRemoteCache');
    }
  };

  const c = new DumberCache(primitives);
  const result = await c.getCache('hash', {});
  t.deepEqual(result, {local: 1});
});

test('DumberCache does not read remote cache for local file', async t => {
  const local = {};
  const primitives = {
    async getLocalCache() {
      throw new Error('');
    },
    async setLocalCache(hash, object) {
      local[hash] = object;
    },
    async getRemoteCache(hash) {
      if (hash === 'hash') return {local: 1};
    },
    async setRemoteCache() {
      t.fail('should not call setRemoteCache');
    }
  };

  const c = new DumberCache(primitives);
  await t.rejects(() => c.getCache('hash', {}));
  t.deepEqual(local, {});
});

test('DumberCache reads remote cache for npm package, and set local cache', async t => {
  const local = {};
  const primitives = {
    async getLocalCache() {
      throw new Error();
    },
    async setLocalCache(hash, object) {
      local[hash] = object;
    },
    async getRemoteCache(hash) {
      if (hash === 'hash') return {local: 1};
    },
    async setRemoteCache() {
      t.fail('should not call setRemoteCache');
    }
  };

  const c = new DumberCache(primitives);
  const result = await c.getCache('hash', {packageName: 'foo'});
  t.deepEqual(result, {local: 1});
  t.deepEqual(local, {'hash': {local: 1}});
});

test('DumberCache sets local cache, does not set remote cache for local file', async t => {
  const local = {};
  const primitives = {
    async getLocalCache() {
      t.fail('should not call getLocalCache');
    },
    async setLocalCache(hash, object) {
      local[hash] = object;
    },
    async getRemoteCache() {
      t.fail('should not call getRemoteCache');
    },
    async setRemoteCache() {
      t.fail('should not call setRemoteCache');
    }
  };

  const c = new DumberCache(primitives);
  await c.setCache('hash', {local: 1});
  t.deepEqual(local, {'hash': {local: 1}});
});

test('DumberCache sets local cache and remote cache for npm file', async t => {
  const local = {};
  const remote = {};
  const primitives = {
    async getLocalCache() {
      t.fail('should not call getLocalCache');
    },
    async setLocalCache(hash, object) {
      local[hash] = object;
    },
    async getRemoteCache() {
      t.fail('should not call getRemoteCache');
    },
    async setRemoteCache(hash, object) {
      remote[hash] = object;
    }
  };

  const c = new DumberCache(primitives);
  await c.setCache('hash', {local: 1, packageName: 'foo'});
  t.deepEqual(local, {'hash': {local: 1, packageName: 'foo'}});
  t.deepEqual(remote, {'hash': {local: 1, packageName: 'foo'}});
});

test('DumberCache sets local cache and remote cache for npm file, but ignore remote error', async t => {
  const local = {};
  const primitives = {
    async getLocalCache() {
      t.fail('should not call getLocalCache');
    },
    async setLocalCache(hash, object) {
      local[hash] = object;
    },
    async getRemoteCache() {
      t.fail('should not call getRemoteCache');
    },
    async setRemoteCache() {
      throw new Error('');
    }
  };

  const c = new DumberCache(primitives);
  await c.setCache('hash', {local: 1, packageName: 'foo'});
  t.deepEqual(local, {'hash': {local: 1, packageName: 'foo'}});
});
