import test from 'tape';
import {SassTranspiler, possiblePaths} from '../../src-worker/transpilers/sass';
import {JSDELIVR_PREFIX} from '../../src-worker/cache-primitives';

const primitives = {
  async getJsdelivrFile(packageWithVersion, filePath) {
    if (packageWithVersion === '@scope/foo@1.0.0') {
      if (filePath === 'dist/_button.scss') {
        return {
          path: `${JSDELIVR_PREFIX}@scope/foo/dist/_button.scss`,
          contents: '@import "mixin";'
        };
      } else if (filePath === 'dist/_mixin.scss') {
        return {
          path: `${JSDELIVR_PREFIX}@scope/foo/dist/_mixin.scss`,
          contents: '$green: #34C371;'
        };
      }
    } else if (packageWithVersion === '@scope/foo') {
      if (filePath === 'package.json') {
        return {
          path: `${JSDELIVR_PREFIX}@scope/foo/package.json`,
          contents: '{"name":"@scope/foo","version":"1.0.0"}'
        };
      }
    }
  },
  async doesJsdelivrFileExist(packageWithVersion, filePath) {
    if (packageWithVersion === '@scope/foo@1.0.0') {
      return filePath === 'dist/_button.scss' ||
        filePath === 'dist/_mixin.scss';
    }
  },
};

test('possiblePaths returns nothing for non-remote path', t => {
  t.deepEqual(
    possiblePaths('foo'),
    []
  );
  t.end();
});

test('possiblePaths returns index paths', t => {
  t.deepEqual(
    possiblePaths('foo/bar.scss'),
    [
      {packagePath: 'foo', filePath: 'bar.scss'},
      {packagePath: 'foo', filePath: 'bar.scss/_index.scss'},
      {packagePath: 'foo', filePath: 'bar.scss/_index.sass'}
    ]
  );
  t.end();
});

test('possiblePaths returns index paths and partial paths', t => {
  t.deepEqual(
    possiblePaths('@scope/foo/dist/bar'),
    [
      {packagePath: '@scope/foo', filePath: 'dist/bar.scss'},
      {packagePath: '@scope/foo', filePath: 'dist/bar.sass'},
      {packagePath: '@scope/foo', filePath: 'dist/bar.css'},
      {packagePath: '@scope/foo', filePath: 'dist/_bar.scss'},
      {packagePath: '@scope/foo', filePath: 'dist/_bar.sass'},
      {packagePath: '@scope/foo', filePath: 'dist/bar/_index.scss'},
      {packagePath: '@scope/foo', filePath: 'dist/bar/_index.sass'}
    ]
  );
  t.end();
});

test('SassTranspiler matches sass/scss files', t => {
  const jt = new SassTranspiler(primitives);
  t.ok(jt.match({filename: 'src/foo.sass', content: ''}));
  t.ok(jt.match({filename: 'src/foo.scss', content: ''}));
  t.end();
});

test('SassTranspiler does not match other files', t => {
  const jt = new SassTranspiler();
  t.notOk(jt.match({filename: 'src/foo.js', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.css', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.html', content: ''}));
  t.end();
});

test('SassTranspiler transpile scss file', async t => {
  const jt = new SassTranspiler(primitives);
  const code = '.a { .b { color: red; } }';
  const f = {
    filename: 'src/foo.scss',
    content: code
  };
  const file = await jt.transpile(f, [f]);

  t.equal(file.filename, 'src/foo.css');
  t.ok(file.content.includes('.a .b'));
  t.equal(file.sourceMap.file, 'src/foo.css');
  t.deepEqual(file.sourceMap.sources, ['src/foo.scss']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('SassTranspiler transpile empty scss file', async t => {
  const jt = new SassTranspiler(primitives);
  const code = '\n\t\n';
  const f = {
    filename: 'src/foo.scss',
    content: code
  };
  const file = await jt.transpile(f, [f]);

  t.equal(file.filename, 'src/foo.css');
  t.equal(file.content, '');
  t.notOk(file.sourceMap);
});

test('SassTranspiler reject broken scss file', async t => {
  const jt = new SassTranspiler(primitives);
  const code = '.a {';
  const f = {
    filename: 'src/foo.scss',
    content: code
  };
  try {
    await jt.transpile(f, [f]);
    t.fail('should not pass');
  } catch (e) {
    t.pass(e.message);
  }
});

test('SassTranspiler cannot tranpile other file', async t => {
  const jt = new SassTranspiler(primitives);
  try {
    await jt.transpile({
      filename: 'src/foo.js',
      content: ''
    });
    t.fail('should not pass');
  } catch (e) {
    t.pass(e.message);
  }
});

test('SassTranspiler ignore scss partial', async t => {
  const jt = new SassTranspiler(primitives);
  const code = '.a { .b { color: red; } }';
  const f = {
    filename: 'src/_foo.scss',
    content: code
  };
  const file = await jt.transpile(f, [f]);
  t.equal(file, undefined);
});

test('SassTranspiler transpile scss file with partial import', async t => {
  const jt = new SassTranspiler(primitives);
  const foo = '@import "variables";\n.a { .b { color: $red; } }';
  const variables = '$red: #f00;';
  const f = {
    filename: 'src/foo.scss',
    content: foo
  };
  const f2 = {
    filename: 'src/_variables.scss',
    content: variables
  }
  const file = await jt.transpile(f, [f, f2]);

  t.equal(file.filename, 'src/foo.css');
  t.ok(file.content.includes('.a .b'));
  t.ok(file.content.includes('color: #f00'));
  t.equal(file.sourceMap.file, 'src/foo.css');
  t.deepEqual(file.sourceMap.sources, ['src/foo.scss', 'src/_variables.scss']);
  t.deepEqual(file.sourceMap.sourcesContent, [foo, variables]);
});

test('SassTranspiler transpile sass file with import', async t => {
  const jt = new SassTranspiler(primitives);
  const foo = `@import "bar"
.a
  .b
    color: red
`;
  const bar = `.c
  color: green
`;
  const f = {
    filename: 'src/foo.sass',
    content: foo
  };
  const f2 = {
    filename: 'src/bar.sass',
    content: bar
  }
  const file = await jt.transpile(f, [f, f2]);

  t.equal(file.filename, 'src/foo.css');
  t.ok(file.content.includes('.a .b'));
  t.ok(file.content.includes('.c'));
  t.equal(file.sourceMap.file, 'src/foo.css');
  t.deepEqual(file.sourceMap.sources, ['src/foo.sass', 'src/bar.sass']);
  // Somehow sass.js sources content is scss format, not sass format.
  // t.deepEqual(file.sourceMap.sourcesContent, [foo, bar]);
});

test('SassTranspiler rejects missing import', async t => {
  const jt = new SassTranspiler(primitives);
  const foo = `@import "bar"
.a
  .b
    color: red
`;
  const f = {
    filename: 'src/foo.sass',
    content: foo
  };
  try {
    await jt.transpile(f, [f]);
    t.fail('should not pass');
  } catch (e) {
    t.pass(e.message);
  }
});

test('SassTranspiler transpile sass file with remote import', async t => {
  const jt = new SassTranspiler(primitives);
  const foo = `@import "@scope/foo/dist/button"
.a
  .b
    color: $green;
`;
  const f = {
    filename: 'src/foo.sass',
    content: foo
  };
  const file = await jt.transpile(f, [f]);

  t.equal(file.filename, 'src/foo.css');
  t.ok(file.content.includes('.a .b'));
  t.ok(file.content.includes('#34C371'));
  t.equal(file.sourceMap.file, 'src/foo.css');
  t.deepEqual(file.sourceMap.sources, [
    'src/foo.sass',
    'node_modules/@scope/foo/dist/_button.scss',
    'node_modules/@scope/foo/dist/_mixin.scss',
  ]);
  // Somehow sass.js sources content is scss format, not sass format.
  // t.deepEqual(file.sourceMap.sourcesContent, [foo, bar]);
});
