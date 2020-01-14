const fs = require('fs');
const path = require('path');

const fps = fs.readdirSync('./tasks');
for (const p of fps) {
  // don't load file starts with _xxx
  if (p.startsWith('_')) continue;
  // load build.js as exports.build
  exports[path.parse(p).name] = require('./tasks/' + p);
}

// default gulp task is "run"
exports.default = exports.run;
