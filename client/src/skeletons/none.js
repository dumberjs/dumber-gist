const packageJson = `{
  "dependencies": {
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
The starting module is pointed to "main" (data-main attribute on script)
which is your src/main${ext}.
-->
<body>
  <script src="/dist/entry-bundle.js" data-main="main"></script>
</body>
</html>
`;

const main = `const el = document.createElement('p');
el.textContent = 'Hello Dumber Gist!';
document.body.appendChild(el);
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
      filename: `src/main${ext}`,
      content: main
    }
  ];
  return files;
}
