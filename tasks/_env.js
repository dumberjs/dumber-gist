const {NODE_ENV} = process.env;

module.exports = {
  isProduction: NODE_ENV === 'production',
  isTest: NODE_ENV === 'test',
  outputDir: 'dist'
}
