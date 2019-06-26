const iframe = document.createElement('iframe');
iframe.setAttribute('src', 'https://b.gist-code.com');
iframe.setAttribute('style', 'display: none');

export function activate() {
  console.log('create booting iframe');
  document.body.appendChild(iframe);
}

let resolveWorkerPage = null;
const workerPageReady = new Promise(resolve => resolveWorkerPage = resolve);

function handleMessage(event) {
  if (event.data === 'worker-ready') {
    resolveWorkerPage();
    return;
  }
}
addEventListener('message', handleMessage);

export function postMessageToWorker(message) {
  workerPageReady.then(() => iframe.contentWindow.postMessage(message, '*'));
}
