# Dumber Gist

WIP, https://gist.dumber.app

An online IDE to write JS SPA prototypes in your own GitHub gists.

Dumber Gist is inspired by [gist-run](https://github.com/gist-run), it is the gist-run on [dumber bundler](https://github.com/dumberjs).

## Structure of the project

### client-app

The main front-end app, it will boot up a service worker. Borrowed many code from [gist-run](https://github.com/gist-run).

### client-worker

The front-end service worker, runs dumber bundler inside browser. Cache traced local files locally in indexedDB (localforage), cache traced npm files in globally shared `https://cache.dumber.app` (`https://cache.dumber.local` for local dev environment).

Npm packages are retrieved from [jsdelivr](https://www.jsdelivr.com). Dependencies tree is resolved using code borrowed from [stackblitz turbo-resolver](https://github.com/stackblitz/core/tree/master/turbo-resolver).

### server/dumber-cache

The back-end for client to save globally shared tracing cache. Note all tracing work is done at front-end, the back-end is very simple. To avoid abuse, saving-cache only applies for front-end signed in with GitHub account. The back-end double-checks user GitHub token.

Caches are saved in `server/dumber-cache/public`. The static files are served directly from nginx, not from passenger.

### server/github-oauth

The back-end for retrieving GitHub token after user attempted GitHub signing in. The back-end exchanges a code with a token. This back-end is necessary for hiding GitHub client secret from front-end side.

The code is based on [gist-run github-oauth-server](https://github.com/gist-run/github-oauth-server).

### nginx.dev.conf

A local nginx dev config file for local development against `gist.dumber.local`. This file is for macOS. It requires some changes to work in Linux. See below for more details.

### nginx.prod.conf

An example config file for production deployment for `gist.dumber.app`, without real certificate and GitHub client secret.

It will be deployed to a small box in Digital Ocean. Technical, this single VM structure doesn't scale, the static files (including tracing caches) should be handled by DO spaces (or AWS S3) with CDN network, the tiny cache and oauth back-end can be two simple AWS lambda. But this single VM structure is simplest for local development, also nginx+passenger+nodejs with two extremely simple back-ends should be able to handle very large traffic, even on a $5/month DO box.

## Local dev (macOS)

### Local DNS for gist.dumber.local

Add following line to `/etc/hosts`, this turns on few DNS entries locally.

```sh
# Use localhost for dumber-gist
127.0.0.1       gist.dumber.local 0123456789abcdef0123456789abcdef.gist.dumber.local cache.dumber.local github-oauth.gist.dumber.local
```

### nginx and passenger

    brew install nginx passenger

Overwrite `/usr/local/etc/nginx/nginx.conf` with the content of `nginx.dev.conf`.
Then need to adjust values of few paths inside the config.

```sh
# You need to generate a self-signed certificate for these two
ssl_certificate
ssl_certificate_key

# You local nodejs path
passenger_nodejs

# Change to your local dumber-gist folder
alias
root
```

Start nginx with

```sh
brew services restart nginx
```

You may encounter permission issue that nginx cannot open port 443, try

```sh
sudo brew services restart nginx
```

I don't need sudo for port 443 to work for me. I don't remember what I did long time ago to allow port below 1024.

If you use sudo to start nginx, don't worry, as a security feature, nginux will downgrade itself to a user (default to the user of the app) after it was started.

### Start local app

Before browse the app, you need to build both `client-app` and `client-worker`. Run

    npm i # or yarn or pnpm i
    npm run build

In both `client-app` and `client-worker`, optionally, replace `npm run build` with `npm start` to build them in watch mode.

Use Safari, Chrome or Firefox to navigate to `https://gist.dumber.local`.

Note, in watch mode, there is no special dev server to auto refresh browser window. You need to manually refresh browser window after the code changes were built.

If uses Chrome, start Chrome with:

```sh
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --ignore-certificate-errors --unsafely-treat-insecure-origin-as-secure=https://gist.dumber.local,https://cache.dumber.local,https://github-oauth.gist.dumber.local,https://0123456789abcdef0123456789abcdef.gist.dumber.local
```

This will bypass ssl check on local self-signed certificate.
