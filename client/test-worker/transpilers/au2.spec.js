import test from 'tape';
import {Au2Transpiler} from '../../src-worker/transpilers/au2';

const au2PackageJson = {
  filename: 'package.json', content: '{"dependencies":{"aurelia":"dev"}}'
};

test('Au2Transpiler matches js/ts/html if using aurelia2', t => {
  const jt = new Au2Transpiler();
  t.ok(jt.match({filename: 'src/foo.js', content: ''}, [au2PackageJson]));
  t.ok(jt.match({filename: 'src/foo.ts', content: ''}, [au2PackageJson]));
  t.ok(jt.match({filename: 'src/foo.html', content: ''}, [au2PackageJson]));
  t.notOk(jt.match({filename: 'src/foo.css', content: ''}, [au2PackageJson]));
  t.end();
});

test('Au2Transpiler does not any files if not using aurelia2', t => {
  const jt = new Au2Transpiler();
  t.notOk(jt.match({filename: 'src/foo.html', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.css', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.json', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.less', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.scss', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.js', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.ts', content: ''}));
  t.end();
});

test('Au2Transpiler transpiles js file', async t => {
  const jt = new Au2Transpiler();
  const code = `export class Foo {
}
`;
  const htmlPair = {filename: 'src/foo.html', content: ''};

  const file = await jt.transpile({
    filename: 'src/foo.js',
    content: code
  }, [htmlPair, au2PackageJson]);

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes('customElement'));
  // t.notOk(file.content.includes("sourceMappingURL"));
  // t.equal(file.sourceMap.file, 'src/foo.js');
  // t.deepEqual(file.sourceMap.sources, ['src/foo.js']);
  // t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('Au2Transpiler transpiles ts file', async t => {
  const jt = new Au2Transpiler();
  const code = `export class Foo {
  public name: string;
}
`;
  const htmlPair = {filename: 'src/foo.html', content: ''};

  const file = await jt.transpile({
    filename: 'src/foo.ts',
    content: code
  }, [htmlPair, au2PackageJson]);

  t.equal(file.filename, 'src/foo.js');
  t.ok(file.content.includes('customElement'));
  // t.notOk(file.content.includes("sourceMappingURL"));
  // t.equal(file.sourceMap.file, 'src/foo.js');
  // t.deepEqual(file.sourceMap.sources, ['src/foo.ts']);
  // t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('Au2Transpiler transpiles html file', async t => {
  const jt = new Au2Transpiler();
  const code = `<import from="./foo.css">
<p>\${name}</p>
`;
  const file = await jt.transpile({
    filename: 'src/foo.html',
    content: code
  }, [au2PackageJson]);

  t.equal(file.filename, 'src/foo.html.js');
  t.ok(file.content.includes('name = "foo"'));
  t.ok(file.content.includes('import d0 from "./foo.css"'));
  // t.notOk(file.content.includes("sourceMappingURL"));
  // t.equal(file.sourceMap.file, 'src/foo.html.js');
  // t.deepEqual(file.sourceMap.sources, ['src/foo.html']);
  // t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

