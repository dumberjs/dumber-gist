const packageJson = `{
  "dependencies": {
    "react": "^16.0.0",
    "react-dom": "^16.0.0"
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

const index = `import React from "react";
import ReactDOM from "react-dom";

import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
`;

const app = `import React from "react";
// Try to create a css/scss/sass/less file then import it here

export default function App() {
  return (
    <div>
      <h1>Hello React!</h1>
    </div>
  );
}
`;

export default function(transpiler) {
  const ext = transpiler === 'typescript' ? '.tsx' : '.jsx';
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
      filename: `src/App${ext}`,
      content: app
    }
  ];
  return files;
}
