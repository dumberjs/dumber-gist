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
  <div id="root"></div>
  <script src="/dist/entry-bundle.js" data-main="main"></script>
</body>
</html>
`;

const main = `import App from './app';
const app = new App({el: '#root'});
app.render();
`;

const app = `import * as Backbone from 'backbone';
import _ from 'underscore';

export default Backbone.View.extend({
  messageTemplate: _.template("<h2><%- message %></h2>"),
  render: function() {
    this.$el.html(
      this.messageTemplate({message: 'Hello Backbone!'})
    );
  }
});
`;

const jasmineTest = `import App from '../src/app';

describe('Component App', () => {
  it('should render message', () => {
    const div = document.createElement('div');
    const app = new App({el: div});
    app.render();
    expect(div.textContent).toEqual('Hello Backbone!');
  });
});
`;

const mochaTest = `import {expect} from 'chai';
import App from '../src/app';

describe('Component App', () => {
  it('should render message', () => {
    const div = document.createElement('div');
    const app = new App({el: div});
    app.render();
    expect(div.textContent).to.equal('Hello Backbone!');
  });
});
`;

export default function({transpiler, testFramework}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'backbone': 'latest'}
    },
    {
      filename: 'index.html',
      content: indexHtml(ext)
    },
    {
      filename: `src/main${ext}`,
      content: main
    },
    {
      filename: `src/app${ext}`,
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
