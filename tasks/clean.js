const del = require('del');
const {outputDir} = require('./_env');

module.exports = function() {
  return del([outputDir]);
}
