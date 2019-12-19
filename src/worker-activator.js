const iframe = document.createElement('iframe');
iframe.setAttribute('src', 'https://b.gist-code.com/boot-up-worker.html');
iframe.setAttribute('style', 'display: none');

export function activate() {
  document.body.appendChild(iframe);
}

export function init() {
  iframe.contentWindow.postMessage({type: 'init'}, '*');
}

let resolveWorkerPage = null;
const workerPageReady = new Promise(resolve => resolveWorkerPage = resolve);

function handleMessage(event) {
  if (event.data && event.data.type === 'worker-ready') {
    console.log('Worker is ready!');
    // removeEventListener('message', handleMessage);
    resolveWorkerPage();
    return;
  }
}

addEventListener('message', handleMessage);

export function postMessageToWorker(message) {
  workerPageReady.then(() => {
    iframe.contentWindow.postMessage(message, '*');
  });
}
