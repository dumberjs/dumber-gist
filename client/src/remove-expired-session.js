// Remove expired service worker on used random session id.
// The expired ids were saved by session-id callback on 'unload' event.
export class RemoveExpiredSession {
  constructor() {
    this.removeExpired = this.removeExpired.bind(this);
  }

  start() {
    setInterval(this.removeExpired, 5 * 1000);
  }

  async removeExpired() {
    let i = 0;
    let key;
    while ((key = localStorage.key(i)) !== null) {
      if (key.startsWith('expired:')) {
        const expired = key.slice(8);
        try {
          await this._removeServiceWorker(expired);
          localStorage.removeItem(key);
        } catch (e) {
          console.error(e);
        }
      }
      i += 1;
    }
  }

  async _removeServiceWorker(expiredId) {
    // An invisible iframe to clean up expired session.
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', `https://${expiredId}.${HOST_NAMES.host}/__remove-expired-worker.html`);
    iframe.setAttribute('style', 'display: none');
    document.body.appendChild(iframe);

    return new Promise((resolve, reject) => {
      const handleMessage = e => {
        if (!e.data) return;
        // Use '_type' instead of 'type' to avoid cross-talk
        // with worker-service.
        const {_type, result} = e.data;
        if (_type === 'worker-removed') {
          if (result) {
            console.info(`Removed an expired previously used service worker on ${expiredId}.${HOST_NAMES.host}`);
          }
          resolve();
        } else {
          reject(new Error(result));
        }

        removeEventListener('message', handleMessage);
        iframe.remove();
      };

      addEventListener('message', handleMessage);
    });
  }
}
