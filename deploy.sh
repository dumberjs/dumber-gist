#! /bin/bash --login

cd client
npm run build:prod

cd ..

echo "Deploy files to Digital Ocean ..."

./copy-to-server.sh

echo "Deployed!"
echo "To restart cache or oauth server, ssh to dumber.app and touch dumber-gist/server/dumber-cache/tmp/restart.txt and dumber-gist/server/github-oauth/tmp/restart.txt"
