const http = require('http');
const {receiveData, fetch} = require('../request');

const PORT = 5000;
const CLIENT_ID = process.env.DUMBER_GIST_CLIENTID;
const CLIENT_SECRET = process.env.DUMBER_GIST_SECRET;
const HOST = process.env.NODE_ENV === 'production' ? 'https://gist.dumber.app' : 'https://gist.dumber.local';

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('no client_id or client_secret');
}

// Note CORS headers are now added by nginx
async function handleRequest(req, res) {
  const origin = req.headers.origin;
  res.setHeader('Content-Type', 'text/plain');

  if (origin === HOST) {
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.method === 'POST' && /^\/access_token$/.test(req.url)) {
      try {
        const data = await receiveData(req);
        console.error('data ' + JSON.stringify(data));
        const params = {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: data.code,
          redirect_uri: data.redirect_uri,
          state: data.state
        };

        const result = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          params
        });
        res.writeHead(200, result.headers);
        res.end(result.body, 'utf8');
      } catch(error) {
        res.writeHead(500);
        res.end(error.message, 'utf8');
      }
      return;
    }
  }

  res.writeHead(404);
  res.end(`Not Found: ${req.method} ${req.url}\n`, 'utf8');
}

console.log('Start dumber-gist github-oauth server ...');
http.createServer(handleRequest).listen(PORT);
