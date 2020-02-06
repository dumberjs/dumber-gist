#! /bin/bash --login

cd client-app
npm run build:prod

cd ../client-worker
npm run build:prod

cd ..

echo "Deploy files to Digital Ocean ..."

./copy-to-server.sh

echo "Deployed!"
echo "To restart cache or oauth server, ssh to dumber.app and touch server/dumber-cache/tmp/restart.txt and server/dumber-cache/tmp/restart.txt"
