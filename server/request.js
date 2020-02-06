const https = require('https');
const querystring = require('querystring');

exports.receiveData = function(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', chunk => body += chunk);
    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    request.on('error', reject);
  });
};

exports.fetch = function(uri, opts = {}) {
  const options = {
    method: opts.method || 'GET',
    headers: {}
  };

  if (opts.headers) {
    Object.assign(options.headers, opts.headers);
  }

  const form = querystring.stringify(opts.params || {});
  if (options.method === 'POST') {
    Object.assign(options.headers, {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': form.length
    });
  }

  return new Promise((resolve, reject) => {
    const req = https.request(uri, options, res => {
      res.setEncoding('utf8');
      const { statusCode, headers } = res;
      let body = '';

      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode, headers, body }));
      res.on('error', reject);
    });

    if (options.method === 'POST') {
      req.write(form);
    }
    req.end();
  });
};
