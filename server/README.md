# Gist Code back-end support

This back-end only does caching and GitHub OAuth.

GitHub oauth server for gist-code

## Running in dev mode

Use local nginx+passenger to start both apps. TODO guide.

## Or run them manually

Start github-oauth server at port 500

    node github-oauth/app

Start dumber-cache server at port 5001

    node dumber-cache/app

