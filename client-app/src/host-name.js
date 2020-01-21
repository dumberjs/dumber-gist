const isProd = process.env.NODE_ENV === 'production';
export const host = isProd ? 'gist.dumber.app' : 'gist.dumber.local';
export const clientUrl = 'https://' + host;
export const cacheUrl = 'https://cache.' + host;
export const oauthUrl = 'https://github-oauth.' + host;
