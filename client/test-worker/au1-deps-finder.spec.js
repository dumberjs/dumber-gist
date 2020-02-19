import test from 'tape-promise/tape';
import {Au1DepsFinder} from '../src-worker/au1-deps-finder';

test('Au1DepsFinder find deps for local js file', async t => {
  const primitives = {
    async doesJsdelivrFileExist() { return false; }
  }
  const f = new Au1DepsFinder(primitives);
  const deps = await f.findDeps('src/foo.js', 'exports.Foo = class Foo {}');
  t.deepEqual(deps, []);
});

test('Au1DepsFinder find deps for local html file', async t => {
  const primitives = {
    async doesJsdelivrFileExist() { return false; }
  }
  const f = new Au1DepsFinder(primitives);
  const deps = await f.findDeps('src/foo.html', '<template><require from="./a.css"></require></template>');
  t.deepEqual(deps, ['text!./a.css']);
});

test('Au1DepsFinder find deps for npm js file', async t => {
  const primitives = {
    async doesJsdelivrFileExist(packageWithVersion, filePath) {
      if (packageWithVersion === 'foo@1.0.0' && filePath === 'dist/bar.html') {
        return true;
      }
    }
  }
  const f = new Au1DepsFinder(primitives);
  const deps = await f.findDeps('//cdn.jsdelivr.net/npm/foo@1.0.0/dist/bar.js', 'exports.Bar = class Bar {}');
  t.deepEqual(deps, ['text!./bar.html']);

  const deps2 = await f.findDeps('//cdn.jsdelivr.net/npm/foo@1.0.0/dist/bar2.js', 'exports.Bar = class Bar2 {}');
  t.deepEqual(deps2, []);
});

test('Au1DepsFinder find deps for npm html file', async t => {
  const primitives = {
    async doesJsdelivrFileExist() { return false; }
  }
  const f = new Au1DepsFinder(primitives);
  const deps = await f.findDeps('//cdn.jsdelivr.net/npm/foo@1.0.0/dist/foo.html', '<template><require from="./a.css"><require from="./b"></require></template>');
  t.deepEqual(deps, ['text!./a.css', './b']);
});
