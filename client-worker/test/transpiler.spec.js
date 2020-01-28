import test from 'tape-promise/tape';
import {Transpiler} from '../src/transpiler';

test('Transpiler transpiles ts file', async t => {
  const jt = new Transpiler();
  const code = `import {autoinject, bindable} from 'aurelia-framework';
@autoinject
export class Foo {
  @bindable public bar: string = '';
  constructor(private element: Element) {}
}
`;
  const file = await jt.transpile({
    filename: 'src/foo.ts',
    content: code
  });

  t.equal(file.filename, 'src/foo.js');
  t.equal(file.moduleId, 'foo');
  t.ok(file.content.includes('_initializerDefineProperty(this, "bar", _descriptor, this)'));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.ts']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('Transpiler transpiles jsx file in inferno way with fragment', async t => {
  const jt = new Transpiler();
  const code = `const descriptions = items.map(item => (
  <>
    <dt>{item.name}</dt>
    <dd>{item.value}</dd>
  </>
));`;
  const file = await jt.transpile({
    filename: 'src/foo.jsx',
    content: code
  }, [], {jsxPragma: 'Inferno.createVNode'});

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes(".createVNode"));
  t.ok(file.content.includes(".createFragment"));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.jsx']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('Transpiler transpile scss file', async t => {
  const jt = new Transpiler();
  const code = '.a { .b { color: red; } }';
  const f = {
    filename: 'src/foo.scss',
    content: code
  };
  const file = await jt.transpile(f, [f]);

  t.equal(file.filename, 'src/foo.css');
  t.equal(file.moduleId, 'foo.css');
  t.ok(file.content.includes('.a .b'));
  t.equal(file.sourceMap.file, 'src/foo.css');
  t.deepEqual(file.sourceMap.sources, ['src/foo.scss']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('Transpiler transpiles supported text file', async t => {
  const jt = new Transpiler();
  const code = 'lorem';
  const file = await jt.transpile({
    filename: 'src/foo/bar.html',
    content: code
  });

  t.equal(file.filename, 'src/foo/bar.html');
  t.equal(file.moduleId, 'foo/bar.html');
  t.equal(file.content, code);
  t.notOk(file.sourceMap);
});

test('Transpiler cannot transpile binary file', async t => {
  const jt = new Transpiler();
  t.equal(await jt.transpile({
    filename: 'src/foo.jpg',
    content: ''
  }), undefined);
});