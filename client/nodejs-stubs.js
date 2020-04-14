const domainSubfix = process.env.NODE_ENV === 'production' ? 'app' : 'local';
const DUMBER_DOMAIN = process.env.DUMBER_DOMAIN ? process.env.DUMBER_DOMAIN.trim() : `dumber.${domainSubfix}`;
const JSDELIVR_CDN_DOMAIN = process.env.JSDELIVR_CDN_DOMAIN ? process.env.JSDELIVR_CDN_DOMAIN.trim() : 'cdn.jsdelivr.net';

global.HOST_NAMES = {
  domain : DUMBER_DOMAIN,
  host: `gist.${DUMBER_DOMAIN}`,
  clientUrl: `https://gist.${DUMBER_DOMAIN}`,
  cacheUrl: `https://cache.${DUMBER_DOMAIN}`,
  oauthUrl: `https://github-oauth.gist.${DUMBER_DOMAIN}`,
  jsdelivrDataUrl: process.env.JSDELIVR_DATA_URL ? process.env.JSDELIVR_DATA_URL.trim() : '//data.jsdelivr.com',
  jsdelivrCdnUrl: `https://${JSDELIVR_CDN_DOMAIN}`,
  jsdelivrCdnDomain: JSDELIVR_CDN_DOMAIN,
  npmUrl : process.env.NPM_URL ? process.env.NPM_URL.trim() : 'https://registry.npmjs.cf'
};

global.DUMBER_MODULE_LOADER_DIST = 'dumber-module-loader dist content';

global.fetch = require('node-fetch');
