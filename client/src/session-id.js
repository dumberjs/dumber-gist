import {inject} from 'aurelia-framework';
import {InitParams} from './init-params';
import crypto from 'crypto';

@inject(InitParams)
export class SessionId {
  constructor(params) {
    this.params = params;
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
    if (this.params.sessionId) {
      return this.params.sessionId;
    }

    // Random id (32 chars) for every dumber-gist instance to avoid
    // cross talk.
    return crypto.randomBytes(16).toString('hex');
  }
}
