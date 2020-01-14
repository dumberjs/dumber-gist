const dr = require('./_dumber');

// clear dumber (tracing) cache
module.exports = function () {
  return dr.clearCache();
}
