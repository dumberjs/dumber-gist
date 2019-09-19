if ('serviceWorker' in navigator) {
  addEventListener('message', event => {
    console.log('iframe got message: ', event.data);
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(event.data);
    }
  });

  navigator.serviceWorker.register('/worker.js', {scope: './'}).then(
    function(registration) {
      console.log('Service worker registration succeeded:', registration);

      if (registration.active) {
        console.log('worker is active');
      }
    },
    function(error) {
      console.log('Service worker registration failed:', error);
    }
  );

  navigator.serviceWorker.addEventListener('message', function(event) {
    var data = event.data;
    console.log('send back message', event);
    parent.postMessage(data, '*');
  });
} else {
  var msg = 'Service workers are not supported in this browser. Please get a better browser.';
  console.log(msg);
  var error = document.createElement('h1');
  error.textContent = msg;
  document.body.appendChild(error);
}
