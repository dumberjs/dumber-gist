import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import queryString from 'querystring';
import {AccessToken} from './access-token';
import {SessionId} from '../session-id';
import {PersistSession} from './persist-session';
import {clientUrl, oauthUrl} from 'host-name';
import {Helper} from '../helper';

// github oauth client id/secret
export const client_id =
  process.env.NODE_ENV === 'production' ?
  '366fabacbad89519ff19' :
  'a505c051c5291a3f3618';
const oauthUri = 'https://github.com/login/oauth/authorize';
const tokenUri = `${oauthUrl}/access_token`;

@inject(EventAggregator, AccessToken, SessionId, PersistSession, Helper)
export class Oauth {
  initialised = false;

  constructor(ea, accessToken, sessionId, persistSession, helper) {
    this.ea = ea;
    this.accessToken = accessToken;
    this.sessionId = sessionId;
    this.persistSession = persistSession;
    this.helper = helper;
  }

  async login() {
    this.helper.waitFor(
      'Signing to GitHub ...',
      new Promise((resolve, reject) => {
        this._login().then(
          () => {
            // Wait for the re-route.
            setTimeout(resolve, 5000);
          },
          reject
        );
      }),
      { delay: 0 }
    )
    .then(() => {}, () => {});
  }

  async _login() {
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
    this.ea.publish('info', 'Signed out from GitHub');
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
