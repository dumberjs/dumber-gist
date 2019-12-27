import fetch from 'node-fetch';
global.fetch =  fetch;

import {Options} from 'aurelia-loader-nodejs';
import path from 'path';
Options.relativeToDir = path.join(__dirname, '..', 'src');
import {globalize} from 'aurelia-pal-nodejs';
globalize();
// ignore css modules
function skipCSS(module) {
  module.exports = '';
}

require.extensions['.css'] = skipCSS;
require.extensions['.less'] = skipCSS;
require.extensions['.scss'] = skipCSS;
