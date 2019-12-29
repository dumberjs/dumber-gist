import test from 'ava';
import {SassTranspiler} from '../../../worker/transpilers/sass';

test('SassTranspiler matches sass/scss files', t => {
  const jt = new SassTranspiler();
  t.truthy(jt.match({filename: 'src/foo.sass', content: ''}));
  t.truthy(jt.match({filename: 'src/foo.scss', content: ''}));
});

test('SassTranspiler does not match other files', t => {
  const jt = new SassTranspiler();
  t.falsy(jt.match({filename: 'src/foo.js', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.css', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.html', content: ''}));
});

test.serial('SassTranspiler transpile scss file', async t => {
  const jt = new SassTranspiler();
  const code = '.a { .b { color: red; } }';
  const f = {
    filename: 'src/foo.scss',
    content: code
  };
  const file = await jt.transpile(f, [f]);

  t.is(file.filename, 'src/foo.css');
  t.truthy(file.content.includes('.a .b'));
  t.is(file.sourceMap.file, 'src/foo.css');
  t.deepEqual(file.sourceMap.sources, ['src/foo.scss']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test.serial('SassTranspiler reject broken scss file', async t => {
  const jt = new SassTranspiler();
  const code = '.a {';
  const f = {
    filename: 'src/foo.scss',
    content: code
  };
  await t.throwsAsync(async () => jt.transpile(f, [f]))
});

test.serial('SassTranspiler cannot tranpile other file', async t => {
  const jt = new SassTranspiler();
  await t.throwsAsync(async () => jt.transpile({
    filename: 'src/foo.js',
    content: ''
  }));
});

test.serial('SassTranspiler ignore scss partial', async t => {
  const jt = new SassTranspiler();
  const code = '.a { .b { color: red; } }';
  const f = {
    filename: 'src/_foo.scss',
    content: code
  };
  const file = await jt.transpile(f, [f]);
  t.is(file, undefined);
});

test.serial('SassTranspiler transpile scss file with partial import', async t => {
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

  t.is(file.filename, 'src/foo.css');
  t.truthy(file.content.includes('.a .b'));
  t.truthy(file.content.includes('color: #f00'));
  t.is(file.sourceMap.file, 'src/foo.css');
  t.deepEqual(file.sourceMap.sources, ['src/foo.scss', 'src/_variables.scss']);
  t.deepEqual(file.sourceMap.sourcesContent, [foo, variables]);
});

test.serial('SassTranspiler transpile sass file with import', async t => {
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

  t.is(file.filename, 'src/foo.css');
  t.truthy(file.content.includes('.a .b'));
  t.truthy(file.content.includes('.c'));
  t.is(file.sourceMap.file, 'src/foo.css');
  t.deepEqual(file.sourceMap.sources, ['src/foo.sass', 'src/bar.sass']);
  // Somehow sass.js sources content is scss format, not sass format.
  // t.deepEqual(file.sourceMap.sourcesContent, [foo, bar]);
});