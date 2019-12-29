import test from 'ava';
import {Transpiler} from '../../worker/transpiler';

test.serial('Transpiler transpiles ts file', async t => {
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

  t.is(file.filename, 'src/foo.js');
  t.is(file.moduleId, 'foo');
  t.truthy(file.content.includes("this.bar = '';"));
  t.falsy(file.content.includes("sourceMappingURL"));
  t.is(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.ts']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test.serial('Transpiler transpile scss file', async t => {
  const jt = new Transpiler();
  const code = '.a { .b { color: red; } }';
  const f = {
    filename: 'src/foo.scss',
    content: code
  };
  const file = await jt.transpile(f, [f]);

  t.is(file.filename, 'src/foo.css');
  t.is(file.moduleId, 'foo.css');
  t.truthy(file.content.includes('.a .b'));
  t.is(file.sourceMap.file, 'src/foo.css');
  t.deepEqual(file.sourceMap.sources, ['src/foo.scss']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test.serial('Transpiler transpiles supported text file', async t => {
  const jt = new Transpiler();
  const code = 'lorem';
  const file = await jt.transpile({
    filename: 'src/foo/bar.html',
    content: code
  });

  t.is(file.filename, 'src/foo/bar.html');
  t.is(file.moduleId, 'foo/bar.html');
  t.is(file.content, code);
  t.falsy(file.sourceMap);
});

test.serial('Transpiler cannot transpile binary file', async t => {
  const jt = new Transpiler();
  t.is(await jt.transpile({
    filename: 'src/foo.jpg',
    content: ''
  }), undefined);
});