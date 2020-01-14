import {inject} from 'aurelia-framework';
import {InitParams} from './init-params';
import crypto from 'crypto';

@inject(InitParams)
export class SessionId {
  constructor(params) {
    this.params = params;
    this.id = this._generateId();
  }

  // id is the unique identifier for every gist-code instance.
  // Then worker and app are behind https://${id}.gist-code.com.
  _generateId() {
    if (this.params.sessionId) {
      return this.params.sessionId;
    }

    if (process.env.NODE_ENV !== 'production') {
      // Simplify dev app setup with a never-change session id.
      // For local dev, change local /etc/hosts
      // add following content:
      //
      // # Use localhost for gist-code
      // 127.0.0.1       gist-code.com app.gist-code.com
      //
      return 'app';
    }

    // Random id for every gist-code instance to avoid
    // cross talk.
    return crypto.randomBytes(20).toString('hex');
  }
}
