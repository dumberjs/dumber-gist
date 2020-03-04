# Dumber gist client side

App is in `src/`, worker (dumber bundler) is in `src-worker/`.

Following scripts are in `package.json`.

# Dev build

    npm run build

Continuously build in watch mode:

    npm start

# Production build

    npm run build:prod

# Unit tests in browser

    npm test

# Unit tests in nodejs

   ./nodejs-test test/a-test-file
   ./nodejs-test test-worker/a-test-file
