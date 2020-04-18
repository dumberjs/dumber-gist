#! /bin/bash --login

# Copy js before html files
scp client/dist/* huocp@a.gist.dumber.app:dumber-gist/client/dist/
scp client/favicon.ico huocp@a.gist.dumber.app:dumber-gist/client/
scp client/index.html huocp@a.gist.dumber.app:dumber-gist/client/

scp client-service-worker/__dumber-gist-worker.js huocp@a.gist.dumber.app:dumber-gist/client-service-worker/
scp client-service-worker/__boot-up-worker.html huocp@a.gist.dumber.app:dumber-gist/client-service-worker/
scp client-service-worker/__remove-expired-worker.html huocp@a.gist.dumber.app:dumber-gist/client-service-worker/
scp client-service-worker/favicon.ico huocp@a.gist.dumber.app:dumber-gist/client-service-worker/
scp client-service-worker/index.html huocp@a.gist.dumber.app:dumber-gist/client-service-worker/

scp server/dumber-cache/app.js huocp@a.gist.dumber.app:dumber-gist/server/dumber-cache/
scp server/github-oauth/app.js huocp@a.gist.dumber.app:dumber-gist/server/github-oauth/
scp server/request.js huocp@a.gist.dumber.app:dumber-gist/server/
