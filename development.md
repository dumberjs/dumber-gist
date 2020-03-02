# Development

## client/src

The main front-end app, it will boot up a service worker (see below client-service-worker) for user's SPA project. Borrowed many code from [gist-run](https://github.com/gist-run).

## client/src-worker

The front-end worker, runs dumber bundler inside browser. Cache traced local files locally in indexedDB (localforage), cache traced npm files in globally shared `https://cache.dumber.app` (`https://cache.dumber.local` for local dev environment).

Npm packages are retrieved from [jsdelivr](https://www.jsdelivr.com). Dependencies tree is resolved using code borrowed from [stackblitz turbo-resolver](https://github.com/stackblitz/core/tree/master/turbo-resolver).

## client-service-worker

The front-end service worker, generates responses for embedded app `https://[random-32-chars-hex].gist.dumber.app`.

The static resources are not cached by CloudFlare. Because:
1. CloudFlare free plan doesn't cache wild card DNS name.
2. it doesn't make any sense to cache unrepeatable host name.

## server/dumber-cache

The back-end for client to save globally shared tracing cache. Note all tracing work is done at front-end, the back-end is very simple. To avoid abuse, saving-cache only applies for front-end signed in with GitHub account. The back-end double-checks user GitHub token.

Caches are saved in `server/dumber-cache/public`. The static files are served directly from nginx, not from passenger.

For privacy, only traced code for npm packages are cached globally. Users' code are cached only locally in indexedDB.

## server/github-oauth

The back-end for retrieving GitHub token after user attempted GitHub signing in. The back-end exchanges a code with a token. This back-end is necessary for hiding GitHub client secret from front-end side.

The code is based on [gist-run github-oauth-server](https://github.com/gist-run/github-oauth-server).

## nginx.dev.conf

A local nginx dev config file for local development against `gist.dumber.local`. This file is for macOS. It requires some changes to work in Linux. See below for more details.

## nginx.prod.conf

An example config file for production deployment for `gist.dumber.app`, without real certificate and GitHub client secret.

It is deployed to a small box in Digital Ocean. Technical, this single VM structure doesn't scale, but this single VM structure is the simplest for local development, also nginx+passenger+nodejs with two extremely simple back-ends should be able to handle very large traffic, even on a $5/month DO box.

In addition, `gist.dumber.app` and `cache.dumber.app` are behind a CloudFlare free plan. Thanks for CloudFlare, all static resources of dumber gist are properly cached in a CDN to enable fast boot up.

## Local dev (macOS)

### Local DNS for gist.dumber.local

Following dnsmasq setup resolves `any.domain.ends.with.local` to `127.0.0.1`.

```sh
brew install dnsmasq
echo 'address=/local/127.0.0.1' >> `brew --prefix`/etc/dnsmasq.conf
sudo mkdir -p /etc/resolver
sudo echo 'nameserver 127.0.0.1' > /etc/resolver/local
sudo brew services start dnsmasq
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

I don't need sudo for port 443 to work. I don't remember what I did (long time ago) to allow port below 1024.

If you use sudo to start nginx, don't worry, as a security feature, nginx will downgrade itself to a user (default to the user of the app) after started.

### Start local app

Before using the app, you need to build `client` code. Run

    cd client/
    npm i # or yarn or pnpm i
    npm run build

Optionally, replace `npm run build` with `npm start` to build them in watch mode.

Use Safari, Chrome or Firefox to navigate to `https://gist.dumber.local`.

Note, in watch mode, there is no special dev server to auto refresh browser window. You need to manually refresh browser window after the code changes were built.

### SSL local root

Because of self-signed certificate, you will see browser complains about the security. You need to create your own certificate authority root certificate, install [mkcert](https://github.com/FiloSottile/mkcert)

```bash
brew install mkcert nss
mkcert -install
mkcert dumber.local '*.dumber.local' '*.gist.dumber.local' localhost 127.0.0.1 ::1
```

Note `nginx.dev.conf` uses the generated certificate.


