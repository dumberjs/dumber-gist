import test from 'ava';
import {Transpiler} from '../../worker/transpiler';

test('Transpiler transpiles ts file', t => {
  const jt = new Transpiler();
  const code = `import {autoinject, bindable} from 'aurelia-framework';
@autoinject
export class Foo {
  @bindable public bar: string = '';
  constructor(private element: Element) {}
}
`;
  const file = jt.transpile({
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

test('Transpiler transpiles supported text file', t => {
  const jt = new Transpiler();
  const code = 'lorem';
  const file = jt.transpile({
    filename: 'src/foo/bar.html',
    content: code
  });

  t.is(file.filename, 'src/foo/bar.html');
  t.is(file.moduleId, 'foo/bar.html');
  t.is(file.content, code);
  t.falsy(file.sourceMap);
});

test('Transpiler cannot transpile binary file', t => {
  const jt = new Transpiler();
  t.is(jt.transpile({
    filename: 'src/foo.jpg',
    content: ''
  }), undefined);
});