import {computedFrom} from 'aurelia-framework';
import localforage from 'localforage';
const storageKey = 'github-oauth-token';

export class AccessToken {
  _token = null;

  constructor() {
    this.init();
  }

  async init() {
    let json = await localforage.getItem(storageKey);
    if (json) {
      this._token = JSON.parse(json);
    }
  }

  @computedFrom('_token')
  get value() {
    return this._token ? this._token.access_token : null;
  }

  @computedFrom('_token')
  get scope() {
    return this._token ? this._token.scope : null;
  }

  async setToken(token) {
    this._token = token;
    if (token) {
      await localforage.setItem(storageKey, JSON.stringify(token));
    } else {
      await localforage.removeItem(storageKey)
    }
  }
}
