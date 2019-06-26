if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/worker.js', {scope: './'}).then(
    function(registration) {
      console.log('Service worker registration succeeded:', registration);

      addEventListener('message', event => {
        const data = Object.create(event.data);
        data.parent = parent;
        registration.active.postMessage(data);
      });

      setTimeout(function() {
        parent.postMessage('worker-ready');
      });
    },
    function(error) {
      console.log('Service worker registration failed:', error);
    }
  );
} else {
  var msg = 'Service workers are not supported in this browser. Please get a better browser.';
  console.log(msg);
  var error = document.createElement('h1');
  error.textContent = msg;
  document.body.appendChild(error);
}
