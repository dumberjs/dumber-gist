const DUMBER_DOMAIN = process.env.DUMBER_DOMAIN || `dumber.local`;
const JSDELIVR_CDN_DOMAIN = process.env.JSDELIVR_CDN_DOMAIN || 'cdn.jsdelivr.net';

global.HOST_NAMES = {
  domain : DUMBER_DOMAIN,
  host: `gist.${DUMBER_DOMAIN}`,
  clientUrl: `https://gist.${DUMBER_DOMAIN}`,
  cacheUrl: `https://cache.${DUMBER_DOMAIN}`,
  oauthUrl: `https://github-oauth.gist.${DUMBER_DOMAIN}`,
  jsdelivrDataUrl: process.env.JSDELIVR_DATA_URL || '//data.jsdelivr.com',
  jsdelivrCdnDomain: JSDELIVR_CDN_DOMAIN,
  npmUrl : process.env.NPM_URL || 'https://registry.npmjs.cf'
};

global.DUMBER_MODULE_LOADER_DIST = 'dumber-module-loader dist content';

global.fetch = require('node-fetch');
