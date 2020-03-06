import test from 'tape-promise/tape';
import {AuTsTranspiler} from '../../src-worker/transpilers/au-ts';

const p = {
  filename: 'package.json',
  content: '{"dependencies":{"aurelia-bootstrapper":"1.0.0"}}'
};
const p2 = {
  filename: 'package.json',
  content: '{"dependencies":{"aurelia":"dev"}}'
};


test('AuTsTranspiler matches nothing in non au1 project', t => {
  const jt = new AuTsTranspiler();
  t.notOk(jt.match({filename: 'src/foo.js', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.jsx', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.ts', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.tsx', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.html', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.css', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.json', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.less', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.scss', content: ''}));
  t.end();
});

test('AuTsTranspiler matches ts file in au1 project', t => {

  const jt = new AuTsTranspiler();
  t.notOk(jt.match({filename: 'src/foo.js', content: ''}, [p]));
  t.notOk(jt.match({filename: 'src/foo.jsx', content: ''}, [p]));
  t.ok(jt.match({filename: 'src/foo.ts', content: ''}, [p]));
  t.ok(jt.match({filename: 'src/foo.ts', content: ''}, [p2]));
  t.notOk(jt.match({filename: 'src/foo.tsx', content: ''}, [p2]));
  t.notOk(jt.match({filename: 'src/foo.html', content: ''}, [p]));
  t.notOk(jt.match({filename: 'src/foo.css', content: ''}, [p]));
  t.notOk(jt.match({filename: 'src/foo.json', content: ''}, [p2]));
  t.notOk(jt.match({filename: 'src/foo.less', content: ''}, [p2]));
  t.notOk(jt.match({filename: 'src/foo.scss', content: ''}, [p]));
  t.end();
});

test('AuTsTranspiler transpiles ts file', async t => {
  const jt = new AuTsTranspiler();
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
  }, [p]);

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes("this.bar = '';"));
  t.ok(file.content.includes("__decorate("));
  t.ok(file.content.includes("__metadata("));
  t.notOk(file.content.includes("sourceMappingURL"));
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.ts']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('AuTsTranspiler stubs an empty es module for ts file with only type definition', async t => {
  const jt = new AuTsTranspiler();
  const code = `export interface Foo<T> {
  value: T;
  children: (Foo<T> | undefined)[];
}

`;
  const file = await jt.transpile({
    filename: 'src/foo.ts',
    content: code
  }, [p]);

  t.equal(file.filename, 'src/foo.js');
  t.equal(file.content, 'exports.__esModule = true;\n');
  t.equal(file.sourceMap.file, 'src/foo.js');
  t.deepEqual(file.sourceMap.sources, ['src/foo.ts']);
  t.deepEqual(file.sourceMap.sourcesContent, [code]);
});
