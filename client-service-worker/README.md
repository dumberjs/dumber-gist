# Dumber gist service worker

For `https://random-id.gist.dumber.app/`, `__boot-up-worker.html` is loaded by an invisible iframe to setup a service worker.

Once service worker is in place, a user app `index.html` will be added to cache and then be served as entry of the embedded app in the second visible iframe under exactly same host name `https://random-id.gist.dumber.app/`.
