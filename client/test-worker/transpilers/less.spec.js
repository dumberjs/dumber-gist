import test from 'tape-promise/tape';
import {LessTranspiler} from '../../src-worker/transpilers/less';

test('LessTranspiler matches less files', t => {
  const jt = new LessTranspiler();
  t.ok(jt.match({filename: 'src/foo.less', content: ''}));
  t.end();
});

test('LessTranspiler does not match other files', t => {
  const jt = new LessTranspiler();
  t.notOk(jt.match({filename: 'src/foo.scss', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.css', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.html', content: ''}));
  t.end();
});

test('LessTranspiler transpile less file', async t => {
  const jt = new LessTranspiler();
  const code = '.a { .b { color: red; } }';
  const f = {
    filename: 'src/foo.less',
    content: code
  };
  const file = await jt.transpile(f, [f]);

  t.equal(file.filename, 'src/foo.css');
  t.ok(file.content.includes('.a .b'));
  // t.equal(file.sourceMap.file, 'src/foo.css');
  // t.deepEqual(file.sourceMap.sources, ['src/foo.less']);
  // t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('LessTranspiler transpile empty less file', async t => {
  const jt = new LessTranspiler();
  const code = '\n\t\n';
  const f = {
    filename: 'src/foo.less',
    content: code
  };
  const file = await jt.transpile(f, [f]);

  t.equal(file.filename, 'src/foo.css');
  t.equal(file.content, '');
  t.notOk(file.sourceMap);
});

test('LessTranspiler reject broken less file', async t => {
  const jt = new LessTranspiler();
  const code = '.a {';
  const f = {
    filename: 'src/foo.less',
    content: code
  };
  await t.rejects(async () => jt.transpile(f, [f]))
});

test('LessTranspiler cannot tranpile other file', async t => {
  const jt = new LessTranspiler();
  await t.rejects(async () => jt.transpile({
    filename: 'src/foo.js',
    content: ''
  }));
});

test('LessTranspiler transpile less file with less import', async t => {
  const jt = new LessTranspiler();
  const foo = '@import "variables";\n.a { .b { color: red; } }';
  const variables = '.c { color: green }';
  const f = {
    filename: 'src/foo.less',
    content: foo
  };
  const f2 = {
    filename: 'src/variables.less',
    content: variables
  }
  const file = await jt.transpile(f, [f, f2]);

  t.equal(file.filename, 'src/foo.css');
  t.ok(file.content.includes('.a .b'));
  t.ok(file.content.includes('.c'));
  // t.equal(file.sourceMap.file, 'src/foo.css');
  // t.deepEqual(file.sourceMap.sources, ['src/foo.less', 'src/variables.less']);
  // t.deepEqual(file.sourceMap.sourcesContent, [foo, variables]);
});
