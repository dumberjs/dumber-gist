import {inject} from 'aurelia-framework';
import queryString from 'query-string';
import {AccessToken} from './access-token';
import {SessionId} from '../session-id';
import {PersistSession} from './persist-session';

export const client_id = 'd154f3cc22c30d65b28c';
const tokenUri = 'https://gist-code-oauth.herokuapp.com/access-token';

@inject(AccessToken, SessionId, PersistSession)
export class Oauth {
  initialised = false;

  constructor(accessToken, sessionId, persistSession, mockSearch) {
    this.accessToken = accessToken;
    this.sessionId = sessionId;
    this.persistSession = persistSession;
    this._search = mockSearch || location.search;
  }

  async login() {
    this.initialised = false;
    // Save session data to be restored after login
    await this.persistSession.saveSession();

    const args = {
      client_id,
      redirect_uri: `https://gist-code.com?sessionId=${this.sessionId.id}`,
      scope: 'gist',
      state: this.sessionId.id
    };

    const url = `https://github.com/login/oauth/authorize?${queryString.stringify(args)}`;

    // Avoid window.open by using current window for GitHub login.
    window.location = url;
  }

  async logout() {
    this.accessToken.setToken(null);
  }

  async init() {
    const params = queryString.parse(this._search);
    if (params.code) {
      await this.persistSession.tryRestoreSession();

      await this.exchangeAccessToken(params.code);
    } else {
      // TODO maybe not here, but need to open files
      // for params.open after gist is loaded.
    }

    // TODO sync location.search with gist id or ''
    this.initialised = true;
  }

  async exchangeAccessToken(code) {
    let args = {
      redirect_uri: `https://gist-code.com?sessionId=${this.sessionId.id}`,
      code,
      state: this.sessionId.id
    };

    let url = `${tokenUri}?${queryString.stringify(args)}`;
    return fetch(url, {mode: 'cors', method: 'POST'})
      .then(response => response.text())
      .then(body => queryString.parse(body))
      .then(token => this.accessToken.setToken(token))
      .catch(err => {
        this.accessToken.setToken(null);
        throw err;
      });
  }
}
