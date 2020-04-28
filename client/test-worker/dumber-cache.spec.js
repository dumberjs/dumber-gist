import test from 'tape';
import {DumberCache} from '../src-worker/dumber-cache';

test('DumberCache reads local cache', async t => {
  const primitives = {
    async getLocalCache(hash) {
      if (hash === 'hash') return {local: 1};
      throw new Error('no cache');
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

test('DumberCache reports missing cache', async t => {
  const primitives = {
    async getLocalCache(hash) {
      if (hash === 'hash') return {local: 1};
      throw new Error('no cache');
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

  const events = [];
  function _postMessage(action) {
    events.push(action);
  }

  const c = new DumberCache(primitives, _postMessage);
  try {
    await c.getCache('hash2', {a: 1});
    t.fail('should not pass');
  } catch (e) {
    t.pass(e.message);
  }
  t.deepEqual(events, [{type: 'miss-cache', meta: {a: 1}}]);
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
