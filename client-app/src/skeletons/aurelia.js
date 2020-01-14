const packageJson = `{
  "dependencies": {
    "aurelia-bootstrapper": "^2.3.3"
  }
}
`;

const indexHtml = ext => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Gist Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no">
  <base href="/">
</head>
<!--
Gist Code uses dumber bundler, the default bundle file
is /dist/entry-bundle.js.
The starting module is aurelia-bootstrapper (data-main
attribute on script) for Aurelia,
it then loads up user module "main" (aurelia-app
attribute on <body>) which is your src/main${ext}.
-->
<body aurelia-app="main">
  <script src="/dist/entry-bundle.js" data-main="aurelia-bootstrapper"></script>
</body>
</html>
`;

const mainJs = `export function configure(aurelia) {
  aurelia.use.standardConfiguration();
  aurelia.use.developmentLogging('warn');
  aurelia.start().then(() => aurelia.setRoot());
}
`;

const mainTs = `import {Aurelia} from 'aurelia-framework';

export function configure(aurelia: Aurelia) {
  aurelia.use.standardConfiguration();
  aurelia.use.developmentLogging('warn');
  aurelia.start().then(() => aurelia.setRoot());
}
`;

const appHtml = `<template>
  <!-- Try to create a css/scss/sass/less file then require it here -->
  <h1>\${message}</h1>
</template>
`;

const appJs = `export class App {
  message = 'Hello Aurelia!';
}
`;

const appTs = `export class App {
  public message: string = 'Hello Aurelia!';
}
`;

export default function(transpiler) {
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
      filename: `src/main${ext}`,
      content: ext === '.js' ? mainJs : mainTs
    },
    {
      filename: 'src/app.html',
      content: appHtml
    },
    {
      filename: `src/app${ext}`,
      content: ext === '.js' ? appJs : appTs
    }
  ];
  return files;
}
