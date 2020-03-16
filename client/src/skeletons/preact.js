const packageJson = `{
  "dependencies": {
    "preact": "^10.0.0",
    "preact-router": "^3.0.0"
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

const index = `import { h, render } from 'preact';
import App from './app';

render(<App />, document.getElementById('root'));
`;

const app = `import { h, Component } from 'preact';
// Try to create a css/scss/sass/less file then import it here.
//
// Note to preact-cli users: preact-cli turns on css-mdules by default. But for simplicity, dumber-gist did not turn on css-modules.
// https://github.com/css-modules/css-modules
//
// However, dumber bundler supports css-modules through gulp.
// https://github.com/dumberjs/gulp-dumber-css-module

export default class App extends Component {
  render() {
    return (
      <div>
        <h1>Hello Preact!</h1>
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
      filename: `src/app${ext}`,
      content: app
    }
  ];
  return files;
}
