import crypto from 'crypto';

export class SessionId {
  constructor() {
    this.id = this._generateId();
    this.expireWhenExit();
  }

  expireWhenExit() {
    if (process.NODE_ENV === 'test' || !process.browser) return;
    window.addEventListener('unload', () => {
      localStorage.setItem('expired:' + this.id, (new Date()).toString());
    });
  }

  // id is the unique identifier for every dumber-gist instance.
  // Then worker and app are behind https://${id}.gist.dumber.app.
  _generateId() {
    // Random id (32 chars) for every dumber-gist instance to avoid
    // cross talk.
    return crypto.randomBytes(16).toString('hex');
  }
}
