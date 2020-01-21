import {inject} from 'aurelia-framework';
import {InitParams} from './init-params';
import crypto from 'crypto';

@inject(InitParams)
export class SessionId {
  constructor(params) {
    this.params = params;
    this.id = this._generateId();
  }

  // id is the unique identifier for every dumber-gist instance.
  // Then worker and app are behind https://${id}.gist.dumber.app.
  _generateId() {
    if (this.params.sessionId) {
      return this.params.sessionId;
    }

    if (process.env.NODE_ENV !== 'production') {
      // Simplify dev app setup with a never-change session id.
      // For local dev, change local /etc/hosts
      // add following content:
      //
      // # Use localhost for dumber-gist
      // 127.0.0.1       gist.dumber.local 0123456789abcdef0123456789abcdef.gist.dumber.local cache.gist.dumber.local github-oauth.gist.dumber.local
      //
      return '0123456789abcdef0123456789abcdef';
    }

    // Random id (32 chars) for every dumber-gist instance to avoid
    // cross talk.
    return crypto.randomBytes(16).toString('hex');
  }
}
