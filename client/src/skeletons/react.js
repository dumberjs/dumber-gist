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

const index = ext => `import React from "react";
import { createRoot } from 'react-dom/client';

import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container${ext === '.tsx' ? '!' : ''});
root.render(<App />);
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

const jasmineTest = `import React from 'react';
import ShallowRenderer from 'react-shallow-renderer';
import App from '../src/App';

describe('Component App', () => {
  it('should render message', () => {
    const renderer = new ShallowRenderer();
    renderer.render(<App />);
    let result = renderer.getRenderOutput();
    expect(result.type).toBe('div');
    expect(result.props.children).toEqual(
      <h1>Hello React!</h1>
    );
  });
});
`;

const mochaTest = `import React from 'react';
import ShallowRenderer from 'react-shallow-renderer';
import {expect} from 'chai';
import App from '../src/App';

describe('Component App', () => {
  it('should render message', () => {
    const renderer = new ShallowRenderer();
    renderer.render(<App />);
    let result = renderer.getRenderOutput();
    expect(result.type).to.equal('div');
    expect(result.props.children).to.deep.equal(
      <h1>Hello React!</h1>
    );
  });
});
`;

export default function({transpiler, testFramework}) {
  const ext = transpiler === 'typescript' ? '.tsx' : '.jsx';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'react': 'latest', 'react-dom': 'latest'}
    },
    {
      filename: 'index.html',
      content: indexHtml(ext)
    },
    {
      filename: `src/index${ext}`,
      content: index(ext)
    },
    {
      filename: `src/App${ext}`,
      content: app
    }
  ];

  if (testFramework === 'jasmine') {
    files.push({
      filename: `test/app.spec${ext}`,
      content: jasmineTest
    });
  } else if (testFramework === 'mocha') {
    files.push({
      filename: `test/app.spec${ext}`,
      content: mochaTest
    });
  }

  return files;
}
