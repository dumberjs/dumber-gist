const http = require('http');
const {receiveData, fetch} = require('../request');

const port = 5000;
const client_id = process.env.GIST_CODE_CLIENTID || '';
const client_secret = process.env.GIST_CODE_SECRET || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://gist-code.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': false,
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
};

function valid(origin) {
  return typeof origin === 'string' &&
    origin.match(/^https:\/\/(\w+\.)?gist-code\.com/);
}

async function handleRequest(req, res) {
  const origin = req.headers.origin;

  if (valid(origin)) {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }

    if (req.method === 'POST' && /^\/access_token$/.test(req.url)) {
      try {
        const data = await receiveData(req);
        const params = {
          client_id: client_id,
          client_secret: client_secret,
          code: data.code,
          redirect_uri: data.redirect_uri,
          state: data.state
        };

        const result = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          params
        });
        res.writeHead(200, Object.assign({}, result.headers, corsHeaders));
        res.end(result.body, 'utf8');
      } catch(error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(error.message, 'utf8');
      }
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end(`Not Found: ${req.method} ${req.url}\n`, 'utf8');
}

console.log('Start gist-code github-oauth server ...');
http.createServer(handleRequest).listen(port);
