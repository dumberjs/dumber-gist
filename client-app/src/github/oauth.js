import {inject} from 'aurelia-framework';
import queryString from 'query-string';
import {AccessToken} from './access-token';
import {SessionId} from '../session-id';
import {PersistSession} from './persist-session';
import {clientUrl, oauthUrl} from '../host-name';

// github oauth client id/secret
export const client_id =
  process.env.NODE_ENV === 'production' ?
  '366fabacbad89519ff19' :
  'a505c051c5291a3f3618';
const oauthUri = 'https://github.com/login/oauth/authorize';
const tokenUri = `${oauthUrl}/access_token`;

@inject(AccessToken, SessionId, PersistSession)
export class Oauth {
  initialised = false;

  constructor(accessToken, sessionId, persistSession) {
    this.accessToken = accessToken;
    this.sessionId = sessionId;
    this.persistSession = persistSession;
  }

  async login() {
    this.initialised = false;
    // Save session data to be restored after login
    await this.persistSession.saveSession();

    const args = {
      client_id,
      redirect_uri: `${clientUrl}?sessionId=${this.sessionId.id}`,
      scope: 'gist',
      state: this.sessionId.id
    };

    const url = `${oauthUri}?${queryString.stringify(args)}`;

    // Avoid window.open by using current window for GitHub login.
    window.location = url;
  }

  async logout() {
    this.accessToken.setToken(null);
  }

  async init(code) {
    if (code) await this.exchangeAccessToken(code);
    this.initialised = true;
  }

  async exchangeAccessToken(code) {
    let args = {
      redirect_uri: `${clientUrl}?sessionId=${this.sessionId.id}`,
      code,
      state: this.sessionId.id
    };

    return fetch(tokenUri, {
      mode: 'cors',
      method: 'POST',
      body: JSON.stringify(args),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.text())
      .then(body => queryString.parse(body))
      .then(token => this.accessToken.setToken(token))
      .catch(err => {
        this.accessToken.setToken(null);
        throw err;
      });
  }
}
