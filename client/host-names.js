const domainSubfix = process.env.NODE_ENV === 'production' ? 'app' : 'local';
const DUMBER_DOMAIN = process.env.DUMBER_DOMAIN || `dumber.${domainSubfix}`;
const JSDELIVR_CDN_DOMAIN = process.env.JSDELIVR_CDN_DOMAIN || 'cdn.jsdelivr.net';
const JSDELIVR_DATA_DOMAIN = process.env.JSDELIVR_DATA_DOMAIN || 'data.jsdelivr.com';

module.exports = {
  domain : DUMBER_DOMAIN,
  host: `gist.${DUMBER_DOMAIN}`,
  clientUrl: `https://gist.${DUMBER_DOMAIN}`,
  cacheUrl: `https://cache.${DUMBER_DOMAIN}`,
  oauthUrl: `https://github-oauth.gist.${DUMBER_DOMAIN}`,
  jsdelivrDataDomain: JSDELIVR_DATA_DOMAIN,
  jsdelivrCdnDomain: JSDELIVR_CDN_DOMAIN,
  npmUrl : process.env.NPM_URL || 'https://registry.npmjs.cf'
};
