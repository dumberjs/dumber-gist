import test from 'tape-promise/tape';
import {SassTranspiler} from '../../src-worker/transpilers/sass';

test('SassTranspiler matches sass/scss files', t => {
  const jt = new SassTranspiler();
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
  const jt = new SassTranspiler();
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
  const jt = new SassTranspiler();
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
  const jt = new SassTranspiler();
  const code = '.a {';
  const f = {
    filename: 'src/foo.scss',
    content: code
  };
  await t.rejects(async () => jt.transpile(f, [f]))
});

test('SassTranspiler cannot tranpile other file', async t => {
  const jt = new SassTranspiler();
  await t.rejects(async () => jt.transpile({
    filename: 'src/foo.js',
    content: ''
  }));
});

test('SassTranspiler ignore scss partial', async t => {
  const jt = new SassTranspiler();
  const code = '.a { .b { color: red; } }';
  const f = {
    filename: 'src/_foo.scss',
    content: code
  };
  const file = await jt.transpile(f, [f]);
  t.equal(file, undefined);
});

test('SassTranspiler transpile scss file with partial import', async t => {
  const jt = new SassTranspiler();
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
  const jt = new SassTranspiler();
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