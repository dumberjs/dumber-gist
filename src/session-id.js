import crypto from 'crypto';
import queryString from 'query-string';

export class SessionId {
  constructor(mockSearch) {
    this._search = mockSearch || location.search;
    this.id = this._generateId();
  }

  // id is the unique identifier for every gist-code instance.
  // Then worker and app are behind https://${id}.gist-code.com.
  _generateId() {
    const params = queryString.parse(this._search);
    if (params.sessionId) {
      return params.sessionId;
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
