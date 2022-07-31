import {test} from 'zora';
import {Jsdelivr} from '../src-worker/jsdelivr';
import {JSDELIVR_PREFIX} from '../src-worker/cache-primitives';


const primitives = {
  async getJsdelivrFile(packageWithVersion, filePath) {
    if (packageWithVersion === 'foo@1.0.0' || packageWithVersion === 'foo') {
      if (filePath === 'package.json') {
        return {
          path: `${JSDELIVR_PREFIX}foo@1.0.0/package.json`,
          contents: JSON.stringify({
            name: 'foo',
            version: '1.0.0',
            main: 'dist/index.js'
          })
        };
      }
    } else if  (packageWithVersion === '@scope/foo@1.0.0' || packageWithVersion === '@scope/foo') {
      if (filePath === 'package.json') {
        return {
          path: `${JSDELIVR_PREFIX}@scope/foo@1.0.0/package.json`,
          contents: JSON.stringify({
            name: '@scope/foo',
            version: '1.0.0',
            main: 'dist/index.js'
          })
        };
      }
    }
  },
  async doesJsdelivrFileExist(packageWithVersion, filePath) {
    if (packageWithVersion === 'foo@1.0.0' || packageWithVersion === '@scope/foo@1.0.0') {
      return filePath === 'package.json' ||
        filePath === 'dist/index.js';
    }
  },
  async getNpmPackageFile(packageWithVersion, filePath) {
    if (packageWithVersion === 'foo@1.0.0' && filePath === 'dist/index.js') {
      return {
        path: `${JSDELIVR_PREFIX}foo@1.0.0/dist/index.js`,
        contents: 'lorem'
      };
    } else if (packageWithVersion === '@scope/foo@1.0.0' && filePath === 'dist/index.js') {
      return {
        path: `${JSDELIVR_PREFIX}@scope/foo@1.0.0/dist/index.js`,
        contents: 'lorem'
      };
    }
  }
};

test('Jsdelivr rejects unknown package', async t => {
  const j = new Jsdelivr(primitives);
  try {
    await j.create({name: 'unknown'});
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }
});

test('Jsdelivr rejects unknown version', async t => {
  const j = new Jsdelivr(primitives);
  try {
    await j.create({name: 'foo', version: '2.0.0'});
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }
});

test('Jsdelivr gets files on default version', async t => {
  const j = new Jsdelivr(primitives);
  const reader = await j.create({name: 'foo'});

  t.deepEqual(
    await reader('package.json'),
    {
      path: `${JSDELIVR_PREFIX}foo@1.0.0/package.json`,
      contents: JSON.stringify({
        name: 'foo',
        version: '1.0.0',
        main: 'dist/index.js'
      })
    }
  );

  t.deepEqual(reader.packageConfig, {name: 'foo'});
  t.ok(await reader.exists('package.json'));
  t.ok(await reader.exists('dist/index.js'));
  t.notOk(await reader.exists('dist/unknown.js'));

  t.deepEqual(
    await reader('dist/index.js'),
    {
      path: `${JSDELIVR_PREFIX}foo@1.0.0/dist/index.js`,
      contents: 'lorem'
    }
  );
});

test('Jsdelivr gets files on explicit version', async t => {
  const j = new Jsdelivr(primitives);
  const reader = await j.create({name: 'foo', version: '1.0.0'});

  t.deepEqual(
    await reader('package.json'),
    {
      path: `${JSDELIVR_PREFIX}foo@1.0.0/package.json`,
      contents: JSON.stringify({
        name: 'foo',
        version: '1.0.0',
        main: 'dist/index.js'
      })
    }
  );

  t.deepEqual(reader.packageConfig, {name: 'foo', version: '1.0.0'});
  t.ok(await reader.exists('package.json'));
  t.ok(await reader.exists('dist/index.js'));
  t.notOk(await reader.exists('dist/unknown.js'));

  t.deepEqual(
    await reader('dist/index.js'),
    {
      path: `${JSDELIVR_PREFIX}foo@1.0.0/dist/index.js`,
      contents: 'lorem'
    }
  );
});

test('Jsdelivr gets files with aliased package', async t => {
  const j = new Jsdelivr(primitives);
  const reader = await j.create({name: 'bar', location: 'foo'});

  t.deepEqual(
    await reader('package.json'),
    {
      path: `${JSDELIVR_PREFIX}foo@1.0.0/package.json`,
      contents: JSON.stringify({
        name: 'bar',
        version: '1.0.0',
        main: 'dist/index.js'
      })
    }
  );

  t.deepEqual(reader.packageConfig, {name: 'bar', location: 'foo'});
  t.ok(await reader.exists('package.json'));
  t.ok(await reader.exists('dist/index.js'));
  t.notOk(await reader.exists('dist/unknown.js'));

  t.deepEqual(
    await reader('dist/index.js'),
    {
      path: `${JSDELIVR_PREFIX}foo@1.0.0/dist/index.js`,
      contents: 'lorem'
    }
  );
});

test('Jsdelivr gets files with aliased package case 2', async t => {
  const j = new Jsdelivr(primitives);
  const reader = await j.create({name: 'bar', location: 'foo@1.0.0'});

  t.deepEqual(
    await reader('package.json'),
    {
      path: `${JSDELIVR_PREFIX}foo@1.0.0/package.json`,
      contents: JSON.stringify({
        name: 'bar',
        version: '1.0.0',
        main: 'dist/index.js'
      })
    }
  );

  t.deepEqual(reader.packageConfig, {name: 'bar', location: 'foo@1.0.0'});
  t.ok(await reader.exists('package.json'));
  t.ok(await reader.exists('dist/index.js'));
  t.notOk(await reader.exists('dist/unknown.js'));

  t.deepEqual(
    await reader('dist/index.js'),
    {
      path: `${JSDELIVR_PREFIX}foo@1.0.0/dist/index.js`,
      contents: 'lorem'
    }
  );
});

test('Jsdelivr rejects unknown alias', async t => {
  const j = new Jsdelivr(primitives);
  try {
    await j.create({name: 'bar', location: 'foo@2.0.0'});
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }
});

test('Jsdelivr gets files for scoped npm package', async t => {
  const j = new Jsdelivr(primitives);
  const reader = await j.create({name: '@scope/foo'});

  t.deepEqual(
    await reader('package.json'),
    {
      path: `${JSDELIVR_PREFIX}@scope/foo@1.0.0/package.json`,
      contents: JSON.stringify({
        name: '@scope/foo',
        version: '1.0.0',
        main: 'dist/index.js'
      })
    }
  );

  t.deepEqual(reader.packageConfig, {name: '@scope/foo'});
  t.ok(await reader.exists('package.json'));
  t.ok(await reader.exists('dist/index.js'));
  t.notOk(await reader.exists('dist/unknown.js'));

  t.deepEqual(
    await reader('dist/index.js'),
    {
      path: `${JSDELIVR_PREFIX}@scope/foo@1.0.0/dist/index.js`,
      contents: 'lorem'
    }
  );
});
