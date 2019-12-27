# gist-code

Run GitHub gist as full SPA app.

gist-code is inspired by [gist-run](https://github.com/gist-run), it is gist-run on dumber bundler.

Don't need to write any bundler config, just write code in `src/` folder, adjust `index.html`, gist-code takes care of the rest.

## Run in dev mode, plus watch

    npm start

## Run in production mode, plus watch

It updates index.html with hashed file name.

    npm run start:prod

## Build in dev mode

Generates `scripts/*-bundle.js`

    npm run build:dev

## Build in production mode

Generates `scripts/*-bundle.[hash].js`, update index.html with hashed file name.

    npm run build

## To clear cache

Clear tracing cache. In rare situation, you might need to run clear-cache after upgrading to new version of dumber bundler.

    npm run clear-cache

## Test

    npm test
