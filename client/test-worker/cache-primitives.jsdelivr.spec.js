import test from 'tape-promise/tape';
import {decode} from 'base64-arraybuffer';
import create from './cache-primitives.helper';

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
    '//data.jsdelivr.com/v1/package/npm/foo@1.0.0': {
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

test('getNpmPackageFiles gets files from set local cache', async t => {
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
    '//data.jsdelivr.com/v1/package/npm/foo@1.0.0': {
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
    '//cdn.jsdelivr.net/npm/foo@1.0.0/index.js': 'lorem'
  };
  const p = create(db, remote);
  const file = await p.getJsdelivrFile('foo@1.0.0', 'index.js');
  t.deepEqual(file, {
    path: '//cdn.jsdelivr.net/npm/foo@1.0.0/index.js',
    contents: 'lorem'
  });
  await t.rejects(() => p.getJsdelivrFile('foo@1.0.0', 'unknown'));
  await t.rejects(() => p.getJsdelivrFile('bar@1.0.0', 'package.json'));
  t.deepEqual(db, {});
});

test('getJsdelivrFile gets remote wasm file', async t => {
  const db = {};
  const remote = {
    '//cdn.jsdelivr.net/npm/foo@1.0.0/index.wasm': decode('YQ==') // string "a"
  };
  const p = create(db, remote);
  const file = await p.getJsdelivrFile('foo@1.0.0', 'index.wasm');
  t.deepEqual(file, {
    path: '//cdn.jsdelivr.net/npm/foo@1.0.0/index.wasm',
    contents: 'YQ=='
  });
  t.deepEqual(db, {});
});

test('getJsdelivrFile gets remote package.json, and cache raw content', async t => {
  const db = {};
  const remote = {
    '//cdn.jsdelivr.net/npm/foo@1.0.0/package.json': '{"name":"foo"}'
  };
  const p = create(db, remote);
  const file = await p.getJsdelivrFile('foo@1.0.0', 'package.json');
  t.deepEqual(file, {
    path: '//cdn.jsdelivr.net/npm/foo@1.0.0/package.json',
    contents: '{"name":"foo"}'
  });
  t.deepEqual(db, {
    'raw!npm/foo@1.0.0/package.json': '{"name":"foo"}'
  });
});

test('getJsdelivrFile reads local cached raw package.json', async t => {
  const db = {
    'raw!npm/foo@1.0.0/package.json': '{"name":"foo"}'
  };
  const p = create(db);
  const file = await p.getJsdelivrFile('foo@1.0.0', 'package.json');
  t.deepEqual(file, {
    path: '//cdn.jsdelivr.net/npm/foo@1.0.0/package.json',
    contents: '{"name":"foo"}'
  });
  await t.rejects(() => p.getJsdelivrFile('bar@1.0.0', 'package.json'));
  t.deepEqual(db, {
    'raw!npm/foo@1.0.0/package.json': '{"name":"foo"}'
  });
});



