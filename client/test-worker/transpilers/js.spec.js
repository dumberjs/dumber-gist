import test from 'tape-promise/tape';
import {JsTranspiler} from '../../src-worker/transpilers/js';

test('JsTranspiler matches js/ts/jsx/tsx files', t => {
  const jt = new JsTranspiler();
  t.ok(jt.match({filename: 'src/foo.js', content: ''}));
  t.ok(jt.match({filename: 'src/foo.jsx', content: ''}));
  t.ok(jt.match({filename: 'src/foo.ts', content: ''}));
  t.ok(jt.match({filename: 'src/foo.tsx', content: ''}));
  t.end();
});

test('JsTranspiler does not match other files', t => {
  const jt = new JsTranspiler();
  t.notOk(jt.match({filename: 'src/foo.html', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.css', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.json', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.less', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.scss', content: ''}));
  t.end();
});

test('JsTranspiler does not match au1 ts files', t => {
  const jt = new JsTranspiler();
  t.notOk(jt.match(
    {filename: 'src/foo.ts', content: ''},
    [{filename: 'package.json', content: '{"dependencies":{"aurelia-bootstrapper":"1.0.0"}}'}]
  ));
  t.end();
});

test('JsTranspiler does not match au2 ts files', t => {
  const jt = new JsTranspiler();
  t.notOk(jt.match(
    {filename: 'src/foo.ts', content: ''},
    [{filename: 'package.json', content: '{"dependencies":{"aurelia":"dev"}}'}]
  ));
  t.end();
});

test('JsTranspiler transpiles ts file', async t => {
  const jt = new JsTranspiler();
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
  t.ok(file.content.includes('_initializerDefineProperty(this, "bar", _descriptor, this)'));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.ts']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler transpiles js file', async t => {
  const jt = new JsTranspiler();
  const code = `import {inject, bindable} from 'aurelia-framework';
@inject(Element)
export class Foo {
  @bindable bar = '';
  constructor(element) {
    this.element = element;
  }
}
`;
  const file = await jt.transpile({
    filename: 'src/foo.js',
    content: code
  });

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes('_initializerDefineProperty(this, "bar", _descriptor, this)'));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.js']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler transpiles tsx file', async t => {
  const jt = new JsTranspiler();
  const code = 'export default (name: string) => <p>{name}</p>;';
  const file = await jt.transpile({
    filename: 'src/foo.tsx',
    content: code
  });

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes("React.createElement"));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.tsx']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler cannot tranpile other file', async t => {
  const jt = new JsTranspiler();
  await t.rejects(async () => jt.transpile({
    filename: 'src/foo.html',
    content: ''
  }));
});

test('JsTranspiler transpiles jsx file', async t => {
  const jt = new JsTranspiler();
  const code = 'export default () => <p>lorem</p>;';
  const file = await jt.transpile({
    filename: 'src/foo.jsx',
    content: code
  });

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes("React.createElement"));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.jsx']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler transpiles jsx file with fragment', async t => {
  const jt = new JsTranspiler();
  const code = `const descriptions = items.map(item => (
  <>
    <dt>{item.name}</dt>
    <dd>{item.value}</dd>
  </>
));`;
  const file = await jt.transpile({
    filename: 'src/foo.jsx',
    content: code
  });

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes("React.createElement"));
  t.ok(file.content.includes("React.Fragment"));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.jsx']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler transpiles jsx file in preact way', async t => {
  const jt = new JsTranspiler();
  const code = 'export default () => <p>lorem</p>;';
  const file = await jt.transpile({
    filename: 'src/foo.jsx',
    content: code
  }, [], {jsxPragma: 'h'});

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes("h("));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.jsx']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler transpiles jsx file in preact way with fragment', async t => {
  const jt = new JsTranspiler();
  const code = `const descriptions = items.map(item => (
  <>
    <dt>{item.name}</dt>
    <dd>{item.value}</dd>
  </>
));`;
  const file = await jt.transpile({
    filename: 'src/foo.js',
    content: code
  }, [], {jsxPragma: 'h', jsxFrag: 'Fragment'});

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes("h("));
  t.ok(file.content.includes("Fragment"));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.js']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler transpiles jsx file in inferno way', async t => {
  const jt = new JsTranspiler();
  const code = 'export default () => <p>lorem</p>;';
  const file = await jt.transpile({
    filename: 'src/foo.jsx',
    content: code
  }, [], {jsxPragma: 'Inferno.createVNode'});

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes("createVNode"));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.jsx']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler transpiles jsx file in inferno way with fragment', async t => {
  const jt = new JsTranspiler();
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
  t.ok(file.content.includes("createVNode"));
  t.ok(file.content.includes("createFragment"));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.jsx']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});
