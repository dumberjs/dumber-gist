import {test} from 'zora';
import {decode} from 'base64-arraybuffer';
import create from './cache-primitives.helper';
import {JSDELIVR_DATA_PREFIX, JSDELIVR_PREFIX} from '../src-worker/cache-primitives';

const CACHE_URL = HOST_NAMES.cacheUrl;

test('buildFiles builds file list', async t => {
  const files = [
    {type: 'file', name: 'package.json'},
    {
      type: 'directory',
      name: 'dist',
      files: [
        {type: 'file', name: 'index.js'},
        {type: 'file', name: 'foo.js'},
        {
          type: 'directory',
          name: 'lo',
          files: [
            {type: 'file', name: 'index.js'},
            {type: 'file', name: 'lo.js'},

          ]
        },
      ]
    },
    {type: 'file', name: 'index.js'}
  ];

  const p = create();
  t.deepEqual(p.buildFiles(files), {
    'package.json': 1,
    'index.js': 1,
    'dist/index.js': 1,
    'dist/foo.js': 1,
    'dist/lo/index.js': 1,
    'dist/lo/lo.js': 1
  });
});

test('getNpmPackageFiles gets files from remote, and set local cache', async t => {
  const db = {};
  const remote = {
    [`${JSDELIVR_DATA_PREFIX}foo@1.0.0`]: {
      files: [
        {type: 'file', name: 'package.json'},
        {
          type: 'directory',
          name: 'dist',
          files: [
            {type: 'file', name: 'index.js'}
          ]
        }
      ]
    }
  };

  const p = create(db, remote);
  const files = await p.getNpmPackageFiles('foo@1.0.0');
  t.deepEqual(files, {'package.json': 1, 'dist/index.js': 1});
  t.deepEqual(db, {
    'files!npm/foo@1.0.0':  {'package.json': 1, 'dist/index.js': 1}
  });
});

test('getNpmPackageFiles gets files from remote, ignores unavailable local cache', async t => {
  const remote = {
    [`${JSDELIVR_DATA_PREFIX}foo@1.0.0`]: {
      files: [
        {type: 'file', name: 'package.json'},
        {
          type: 'directory',
          name: 'dist',
          files: [
            {type: 'file', name: 'index.js'}
          ]
        }
      ]
    }
  };

  const p = create(undefined, remote);
  const files = await p.getNpmPackageFiles('foo@1.0.0');
  t.deepEqual(files, {'package.json': 1, 'dist/index.js': 1});
});

test('getNpmPackageFiles gets files local cache', async t => {
  const db = {
    'files!npm/foo@1.0.0':  {'package.json': 1, 'dist/index.js': 1}
  };

  const p = create(db);
  const files = await p.getNpmPackageFiles('foo@1.0.0');
  t.deepEqual(files, {'package.json': 1, 'dist/index.js': 1});
});

test('getNpmPackageFiles returns empty for unknown package', async t => {
  const db = {};
  const p = create(db);
  const files = await p.getNpmPackageFiles('foo@1.0.0');
  t.deepEqual(files, {});
  // Does not cache empty result
  t.deepEqual(db, {});
});

test('doesJsdelivrFileExist checks files from remote', async t => {
  const db = {};
  const remote = {
    [`${JSDELIVR_DATA_PREFIX}foo@1.0.0`]: {
      files: [
        {type: 'file', name: 'package.json'},
        {
          type: 'directory',
          name: 'dist',
          files: [
            {type: 'file', name: 'index.js'}
          ]
        }
      ]
    }
  };

  const p = create(db, remote);
  t.ok(await p.doesJsdelivrFileExist('foo@1.0.0', 'package.json'));
  t.deepEqual(db, {
    'files!npm/foo@1.0.0':  {'package.json': 1, 'dist/index.js': 1}
  });
  t.ok(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist/index.js'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'unknown'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist/unknown'));
});

test('doesJsdelivrFileExist checks files from remote, ignores unavailable local cache', async t => {
  const remote = {
    [`${JSDELIVR_DATA_PREFIX}foo@1.0.0`]: {
      files: [
        {type: 'file', name: 'package.json'},
        {
          type: 'directory',
          name: 'dist',
          files: [
            {type: 'file', name: 'index.js'}
          ]
        }
      ]
    }
  };

  const p = create(undefined, remote);
  t.ok(await p.doesJsdelivrFileExist('foo@1.0.0', 'package.json'));
  t.ok(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist/index.js'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'unknown'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist/unknown'));
});

test('doesJsdelivrFileExist checks files from local cache', async t => {
  const db = {
    'files!npm/foo@1.0.0':  {'package.json': 1, 'dist/index.js': 1}
  };

  const p = create(db);
  t.ok(await p.doesJsdelivrFileExist('foo@1.0.0', 'package.json'));
  t.ok(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist/index.js'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'unknown'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist/unknown'));
});

test('doesJsdelivrFileExist return false for unknown package', async t => {
  const db = {};
  const p = create(db);
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'package.json'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'unknown'));
  t.notOk(await p.doesJsdelivrFileExist('foo@1.0.0', 'dist/index.js'));
  // Does not cache empty result
  t.deepEqual(db, {});
});

test('getJsdelivrFile gets remote file, rejects missing file', async t => {
  const db = {};
  const remote = {
    [`${JSDELIVR_PREFIX}foo@1.0.0/index.js`]: 'lorem'
  };
  const p = create(db, remote);
  const file = await p.getJsdelivrFile('foo@1.0.0', 'index.js');
  t.deepEqual(file, {
    path: `${JSDELIVR_PREFIX}foo@1.0.0/index.js`,
    contents: 'lorem'
  });

  try {
    await p.getJsdelivrFile('foo@1.0.0', 'unknown');
    t.fail('shoud not pass');
  } catch (err) {
    t.ok(true, err.message);
  }

  try {
    await p.getJsdelivrFile('bar@1.0.0', 'package.json');
    t.fail('shoud not pass');
  } catch (err) {
    t.ok(true, err.message);
  }

  t.deepEqual(db, {});
});

test('getJsdelivrFile gets remote wasm file', async t => {
  const db = {};
  const remote = {
    [`${JSDELIVR_PREFIX}foo@1.0.0/index.wasm`]: decode('YQ==') // string "a"
  };
  const p = create(db, remote);
  const file = await p.getJsdelivrFile('foo@1.0.0', 'index.wasm');
  t.deepEqual(file, {
    path: `${JSDELIVR_PREFIX}foo@1.0.0/index.wasm`,
    contents: 'YQ=='
  });
  t.deepEqual(db, {});
});

test('getJsdelivrFile gets remote package.json, and cache raw content', async t => {
  const db = {};
  const remote = {
    [`${JSDELIVR_PREFIX}foo@1.0.0/package.json`]: '{"name":"foo"}'
  };
  const p = create(db, remote);
  const file = await p.getJsdelivrFile('foo@1.0.0', 'package.json');
  t.deepEqual(file, {
    path: `${JSDELIVR_PREFIX}foo@1.0.0/package.json`,
    contents: '{"name":"foo"}'
  });
  t.deepEqual(db, {
    'raw!npm/foo@1.0.0/package.json': '{"name":"foo"}'
  });
});

test('getJsdelivrFile gets remote package.json, ignores unavailable local cache', async t => {
  const remote = {
    [`${JSDELIVR_PREFIX}foo@1.0.0/package.json`]: '{"name":"foo"}'
  };
  const p = create(undefined, remote);
  const file = await p.getJsdelivrFile('foo@1.0.0', 'package.json');
  t.deepEqual(file, {
    path: `${JSDELIVR_PREFIX}foo@1.0.0/package.json`,
    contents: '{"name":"foo"}'
  });
});

test('getJsdelivrFile reads local cached raw package.json', async t => {
  const db = {
    'raw!npm/foo@1.0.0/package.json': '{"name":"foo"}'
  };
  const p = create(db);
  const file = await p.getJsdelivrFile('foo@1.0.0', 'package.json');
  t.deepEqual(file, {
    path: `${JSDELIVR_PREFIX}foo@1.0.0/package.json`,
    contents: '{"name":"foo"}'
  });

  try {
    await p.getJsdelivrFile('bar@1.0.0', 'package.json');
    t.fail('should not pass');
  } catch (err) {
    t.ok(true, err.message);
  }

  t.deepEqual(db, {
    'raw!npm/foo@1.0.0/package.json': '{"name":"foo"}'
  });
});

test('getNpmPackageFile rejects file path not listed in files', async t => {
  const db = {};
  const remote = {
    [`${JSDELIVR_DATA_PREFIX}foo@1.0.0`]: {
      files: [
        {type: 'file', name: 'package.json'},
        {
          type: 'directory',
          name: 'dist',
          files: [
            {type: 'file', name: 'index.js'}
          ]
        }
      ]
    }
  };

  const p = create(db, remote);
  try {
    await p.getNpmPackageFile('foo@1.0.0', 'dist/unknown.js');
    t.fail('should not pass');
  } catch (err) {
    t.ok(true, err.message);
  }
});

test('getNpmPackageFile gets file from local cache', async t => {
  const db = {
    'npm/foo@1.0.0/dist/index.js': 'hash',
    'hash': {
      __dumber_hash: 'hash',
      foo: 'bar'
    }
  };
  const remote = {
    [`${JSDELIVR_DATA_PREFIX}foo@1.0.0`]: {
      files: [
        {type: 'file', name: 'package.json'},
        {
          type: 'directory',
          name: 'dist',
          files: [
            {type: 'file', name: 'index.js'}
          ]
        }
      ]
    }
  };

  const p = create(db, remote);
  const result = await p.getNpmPackageFile('foo@1.0.0', 'dist/index.js');
  t.deepEqual(result, {
    __dumber_hash: 'hash',
    foo: 'bar'
  });
});

test('getNpmPackageFile gets file from remote cache, add it to local cache', async t => {
  const db = {};
  const remote = {
    [`${JSDELIVR_DATA_PREFIX}foo@1.0.0`]: {
      files: [
        {type: 'file', name: 'package.json'},
        {
          type: 'directory',
          name: 'dist',
          files: [
            {type: 'file', name: 'index.js'}
          ]
        }
      ]
    },
    [`${CACHE_URL}/npm/foo@1.0.0/dist/index.js`]: {
      __dumber_hash: 'hash',
      foo: 'bar'
    }
  };

  const p = create(db, remote);
  const result = await p.getNpmPackageFile('foo@1.0.0', 'dist/index.js');
  t.deepEqual(result, {
    __dumber_hash: 'hash',
    foo: 'bar'
  });
  t.deepEqual(db, {
    'files!npm/foo@1.0.0': {"package.json":1,"dist/index.js":1},
    'npm/foo@1.0.0/dist/index.js': 'hash',
    'hash': {
      __dumber_hash: 'hash',
      foo: 'bar'
    }
  });
});

test('getNpmPackageFile gets file from remote cache, ignores unavailable local cache', async t => {
  const remote = {
    [`${JSDELIVR_DATA_PREFIX}foo@1.0.0`]: {
      files: [
        {type: 'file', name: 'package.json'},
        {
          type: 'directory',
          name: 'dist',
          files: [
            {type: 'file', name: 'index.js'}
          ]
        }
      ]
    },
    [`${CACHE_URL}/npm/foo@1.0.0/dist/index.js`]: {
      __dumber_hash: 'hash',
      foo: 'bar'
    }
  };

  const p = create(undefined, remote);
  const result = await p.getNpmPackageFile('foo@1.0.0', 'dist/index.js');
  t.deepEqual(result, {
    __dumber_hash: 'hash',
    foo: 'bar'
  });
});

test('getNpmPackageFile gets original file from jsdelivr', async t => {
  const db = {

  };
  const remote = {
    [`${JSDELIVR_DATA_PREFIX}foo@1.0.0`]: {
      files: [
        {type: 'file', name: 'package.json'},
        {
          type: 'directory',
          name: 'dist',
          files: [
            {type: 'file', name: 'index.js'}
          ]
        }
      ]
    },
    [`${JSDELIVR_PREFIX}foo@1.0.0/dist/index.js`]: 'lorem'
  };

  const p = create(db, remote);
  const result = await p.getNpmPackageFile('foo@1.0.0', 'dist/index.js');
  t.deepEqual(result, {
    path: `${JSDELIVR_PREFIX}foo@1.0.0/dist/index.js`,
    contents: 'lorem'
  });
  t.deepEqual(db, {
    'files!npm/foo@1.0.0': {"package.json":1,"dist/index.js":1}
  });
});

