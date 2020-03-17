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

const index = `import { render } from 'inferno';
import App from './App';

render(<App />, document.getElementById('root'));
`;

const app = `import { Component } from 'inferno';
// Try to create a css/scss/sass/less file then import it here.

export default class App extends Component {
  render() {
    return (
      <div>
        <h1>Hello Inferno!</h1>
      </div>
    );
  }
}
`;

export default function({transpiler}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'inferno': '^7.0.0'}
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
      filename: `src/App${ext}`,
      content: app
    }
  ];
  return files;
}
