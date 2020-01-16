const http = require('http');
const path = require('path');
const fs = require('fs');
const {receiveData, fetch} = require('../request');

const port = 5001;
const cache_dir = path.join(__dirname, 'public');

const getCorsHeaders = origin => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': false,
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
});

function valid(origin) {
  return typeof origin === 'string' &&
    origin.match(/^https:\/\/(\w+\.)?gist-code\.com/);
}

const knownTokens = {};

async function getUser(token) {
  if (!token) throw new Error('Invalid user');
  if (knownTokens[token]) return knownTokens[token];

  const {statusCode, body} = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`
    }
  });

  if (statusCode !== 200) {
    throw new Error('Invalid user');
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
  return path.resolve(cache_dir, folder, fileName);
}

function setCache(hash, object) {
  const filePath = cachedFilePath(hash);
  fs.mkdirSync(path.dirname(filePath), {recursive: true});
  fs.writeFile(
    filePath,
    JSON.stringify(object),
    {flag: 'wx'}, // x means fail if file already exists
    err => {
      if (!err.code === 'EEXIST') {
        console.log(`Failed to write cache ${filePath}: ${err.message}`);
      }
    }
  );
}

async function handleRequest(req, res) {
  const origin = req.headers.origin;

  if (valid(origin)) {
    const corsHeaders = getCorsHeaders(origin);

    if (req.method === 'OPTIONS') {
      res.writeHead(200, corsHeaders);
      res.end();
      return;
    }

    if (req.method === 'POST') {
      try {
        const d = await receiveData(req)
        const {token, hash, data} = d;
        if (!token || !hash || !data) {
          throw new Error('In complete request');
        }

        await getUser(token);
        setCache(hash, data);

        res.writeHead(204);
        res.end();

      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(error.message, 'utf8');
      }
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end(`Not Found: ${req.method} ${req.url}\n`, 'utf8');
}

console.log('Start gist-code dumber-cache server ...');
http.createServer(handleRequest).listen(port);
