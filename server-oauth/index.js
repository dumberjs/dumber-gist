const http = require('http');
const url = require('url');
const request = require('request');

const port = process.env.PORT || 5000;
const client_id = process.env.GIST_CODE_CLIENTID || '';
const client_secret = process.env.GIST_CODE_SECRET || '';

function addCorsHeaders(headers) {
  headers['Access-Control-Allow-Origin'] = 'https://gist-code.com';
  headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  headers['Access-Control-Allow-Credentials'] = false;
  headers['Access-Control-Max-Age'] = '86400'; // 24 hours
  headers['Access-Control-Allow-Headers'] = 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept';
}

function handleRequest(req, res) {
  if (req.method === 'POST' && /^\/access_token[?]/.test(req.url)) {
    const query = url.parse(req.url, true).query;
    const args = {
      client_id: client_id,
      client_secret: client_secret,
      code: query.code,
      redirect_uri: query.redirect_uri,
      state: query.state
    };
    request.post('https://github.com/login/oauth/access_token')
      .form(args)
      .on('response', function(githubResponse) {
        addCorsHeaders(githubResponse.headers);
      })
      .pipe(res);
    return;
  }
  if (req.method === 'OPTIONS') {
    const headers = {};
    addCorsHeaders(headers);
    res.writeHead(200, headers);
    res.end();
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.write('Not Found: ' + req.method + ' ' + req.url);
  res.end();
}

http.createServer(handleRequest).listen(port);
