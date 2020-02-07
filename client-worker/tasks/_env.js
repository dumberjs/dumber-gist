const {NODE_ENV, DUMBER_ENV} = process.env;

module.exports = {
  isRelease: DUMBER_ENV === 'production',
  isTest: NODE_ENV === 'test'
}
