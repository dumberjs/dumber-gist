const indexHtml = ext => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Dumber Gist</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
</head>
<!--
Dumber Gist uses dumber bundler, the default bundle file
is /dist/entry-bundle.js.
The starting module is pointed to "index" (data-main attribute on script)
which is your src/index${ext}.
-->
<body>
  <div id="root"></div>
  <script src="/dist/entry-bundle.js" data-main="index"></script>
</body>
</html>
`;

const index = `import App from './App.svelte';

const app = new App({
  target: document.getElementById('root'),
  props: {
    name: 'Svelte'
  }
});

export default app;
`;

const app = ext => `<script ${ext === '.ts' ? 'lang="ts"' : ''}>
  export let name${ext === '.ts' ? ': string' : ''};
</script>

<main>
  <h1>Hello {name}!</h1>
</main>

<!--
To use scss: <style lang="scss"> or <style type="text/scss">
To use sass: <style lang="sass"> or <style type="text/sass">
To use less: <style lang="less"> or <style type="text/less">
-->
<style>
  h1 {
    color: #ff3e00;
  }
</style>
`;

const jasmineTest = `import App from '../src/App.svelte';

describe('Component App', () => {
  it('should render message', () => {
    const div = document.createElement('div');
    new App({
      target: div,
      props: {
        name: 'Svelte'
      }
    });
    expect(div.textContent).toEqual('Hello Svelte!');
  });
});
`;

const mochaTest = `import {expect} from 'chai';
import App from '../src/App.svelte';

describe('Component App', () => {
  it('should render message', () => {
    const div = document.createElement('div');
    new App({
      target: div,
      props: {
        name: 'Svelte'
      }
    });
    expect(div.textContent).to.equal('Hello Svelte!');
  });
});
`

const tapeTest = `import test from 'tape';
import App from '../src/App.svelte';

test('should render message', t => {
  const div = document.createElement('div');
  new App({
    target: div,
    props: {
      name: 'Svelte'
    }
  });
  t.equal(div.textContent, 'Hello Svelte!');
  t.end();
});
`;

export default function({transpiler, testFramework}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'svelte': '^3.0.0'}
    },
    {
      filename: 'index.html',
      content: indexHtml(ext)
    },
    {
      filename: `src/index${ext}`,
      content: index
    },
    {
      filename: `src/App.svelte`,
      content: app(ext)
    }
  ];

  if (testFramework === 'jasmine') {
    files.push({
      filename: `test/app.spec${ext}`,
      content: jasmineTest
    });
  } if (testFramework === 'mocha') {
    files.push({
      filename: `test/app.spec${ext}`,
      content: mochaTest
    });
  } if (testFramework === 'tape') {
    files.push({
      filename: `test/app.spec${ext}`,
      content: tapeTest
    });
  }

  return files;
}
