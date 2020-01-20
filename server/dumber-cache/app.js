const http = require('http');
const path = require('path');
const fs = require('fs');
const {receiveData, fetch} = require('../request');

const PORT = 5001;
const CACHE_DIR = path.join(__dirname, 'public');
const HOST = process.env.NODE_ENV === 'production' ? 'https://gist.dumber.app' : 'https://gist.dumber.dev';
const knownTokens = {};

async function getUser(token) {
  if (!token) throw new Error('Invalid user');
  if (knownTokens[token]) return knownTokens[token];

  const {statusCode, body} = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
      'User-Agent': `dumber-gist/0.0.1 (${HOST})`
    }
  });

  if (statusCode !== 200) {
    throw new Error('Invalid user: ' + body);
  }

  try {
    const user = JSON.parse(body);
    knownTokens[token] = user.login;
    return user.login;
  } catch (e) {
    throw new Error('Invalid user: ' + e.message);
  }
}

function cachedFilePath(hash) {
  const folder = hash.slice(0, 2);
  const fileName = hash.slice(2);
  return path.resolve(CACHE_DIR, folder, fileName);
}

function setCache(hash, object) {
  const filePath = cachedFilePath(hash);
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFile(
    filePath,
    JSON.stringify(object),
    {flag: 'wx'}, // x means fail if file already exists
    err => {
      if (err && !err.code === 'EEXIST') {
        console.log(`Failed to write cache ${filePath}: ${err.message}`);
      }
    }
  );
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

    // Only set-cache action is handled by nodejs + passenger.
    // get-cache is handled by nginx directly.
    if (req.method === 'POST') {
      try {
        const d = await receiveData(req)
        const {token, hash, object} = d;
        if (!token || !hash || !object) {
          throw new Error('In complete request');
        }

        await getUser(token);
        setCache(hash, object);

        res.writeHead(200);
        res.end();
      } catch (error) {
        res.writeHead(500);
        res.end(error.message, 'utf8');
      }
      return;
    }
  }

  res.writeHead(404);
  res.end(`Not Found: ${req.method} ${req.url}\n`, 'utf8');
}

console.log('Start dumber-gist cache server ...');
http.createServer(handleRequest).listen(PORT);
