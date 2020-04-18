const http = require('http');
const path = require('path');
const fs = require('fs').promises;
const {receiveData, fetch} = require('../request');

const PORT = 5001;
const CACHE_DIR = path.join(__dirname, 'public');

const domainSubfix = process.env.NODE_ENV === 'production' ? 'app' : 'local';
const DUMBER_DOMAIN = process.env.DUMBER_DOMAIN || `dumber.${domainSubfix}`;
const HOST = `https://gist.${DUMBER_DOMAIN}`;
const JSDELIVR_CDN_DOMAIN = process.env.JSDELIVR_CDN_DOMAIN || 'cdn.jsdelivr.net';

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

async function setCache(hash, object) {
  object.__dumber_hash = hash;
  const filePath = cachedFilePath(hash);
  await fs.mkdir(path.dirname(filePath), {recursive: true});

  try {
    // x means fail if file already exists
    await fs.writeFile(filePath, JSON.stringify(object), {flag: 'wx'});
  } catch (err) {
    if (err && !err.code === 'EEXIST') {
      console.error(`Failed to write cache ${filePath}: ${err.code} ${err.message}`);
    }
    return;
  }

  if (object.path.startsWith(`//${JSDELIVR_CDN_DOMAIN}/npm/`)) {
    // slice to "npm/..."
    const npmPath = path.resolve(CACHE_DIR, object.path.slice(19));
    await fs.mkdir(path.dirname(npmPath), {recursive: true});
    await fs.link(filePath, npmPath);
  }
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
