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
  <div id="root"><h2></h2></div>
  <script src="/dist/entry-bundle.js" data-main="main"></script>
</body>
</html>
`;

const main = `import * as Backbone from 'backbone';

const AppView = Backbone.View.extend({
  el: '#root',
  render: function() {
    this.$('h2').text('Hello Backbone');
  }
});

const app = new AppView();
app.render();
`;


export default function({transpiler}) {
  const ext = transpiler === 'typescript' ? '.ts' : '.js';
  const files = [
    {
      filename: 'package.json',
      dependencies: {'backbone': '^1.0.0'}
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
