import test from 'ava';
import {JsTranspiler} from '../../../worker/transpilers/js';

test('JsTranspiler matches js/ts/jsx/tsx files', t => {
  const jt = new JsTranspiler();
  t.truthy(jt.match({filename: 'src/foo.js', content: ''}));
  t.truthy(jt.match({filename: 'src/foo.jsx', content: ''}));
  t.truthy(jt.match({filename: 'src/foo.ts', content: ''}));
  t.truthy(jt.match({filename: 'src/foo.tsx', content: ''}));
});

test('JsTranspiler does not match other files', t => {
  const jt = new JsTranspiler();
  t.falsy(jt.match({filename: 'src/foo.html', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.css', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.json', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.less', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.scss', content: ''}));
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

  t.is(file.filename, 'src/foo.js');
  t.truthy(file.content.includes("this.bar = '';"));
  t.falsy(file.content.includes("sourceMappingURL"));
  t.is(file.sourceMap.file, 'src/foo.js');
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

  t.is(file.filename, 'src/foo.js');
  t.truthy(file.content.includes("this.bar = '';"));
  t.falsy(file.content.includes("sourceMappingURL"));
  t.is(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.js']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler transpiles tsx file', async t => {
  const jt = new JsTranspiler();
  const code = 'export default (void) => <p>lorem</p>;';
  const file = await jt.transpile({
    filename: 'src/foo.tsx',
    content: code
  });

  t.is(file.filename, 'src/foo.js');
  t.truthy(file.content.includes("React.createElement"));
  t.falsy(file.content.includes("sourceMappingURL"));
  t.is(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.tsx']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler transpiles jsx file', async t => {
  const jt = new JsTranspiler();
  const code = 'export default () => <p>lorem</p>;';
  const file = await jt.transpile({
    filename: 'src/foo.jsx',
    content: code
  });

  t.is(file.filename, 'src/foo.js');
  t.truthy(file.content.includes("React.createElement"));
  t.falsy(file.content.includes("sourceMappingURL"));
  t.is(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.jsx']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('JsTranspiler cannot tranpile other file', async t => {
  const jt = new JsTranspiler();
  await t.throwsAsync(async () => jt.transpile({
    filename: 'src/foo.html',
    content: ''
  }));
});