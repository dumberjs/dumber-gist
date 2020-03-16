const packageJson = `{
  "dependencies": {
    "svelte": "^3.0.0"
  }
}
`;

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

export default function({transpiler}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      content: packageJson
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
  return files;
}
