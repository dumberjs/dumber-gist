const packageJson = `{
  "dependencies": {
    "vue": "^2.0.0"
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
The starting module is "main" (data-main attribute on script)
which is your src/main${ext}.
-->
<body>
  <div id="vue-root"></div>
  <script src="/dist/entry-bundle.js" data-main="main"></script>
</body>
</html>
`;

const main = `import Vue from 'vue';
import App from './App';

new Vue({
  components: {App},
  template: '<App></App>'
}).$mount('#vue-root');
`;

const app = `// Try to create a css/scss/sass/less file then import it here
export default {
  template: \`
    <div>
      <h1>{{ msg }}</h1>
    </div>
  \`,
  data() {
    return {
      msg: 'Hello Vue!'
    };
  }
};
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
      content: main
    },
    {
      filename: `src/App${ext}`,
      content: app
    }
  ];
  return files;
}
