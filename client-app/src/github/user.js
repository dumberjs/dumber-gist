import {inject, BindingEngine} from 'aurelia-framework';
import {AccessToken} from './access-token';
import {ApiClient} from './api-client'

@inject(AccessToken, ApiClient, BindingEngine)
export class User {
  loading = false;
  authenticated = false;
  login = null;
  avatar_url = null;

  constructor(accessToken, api, bindingEngine) {
    this.accessToken = accessToken;
    this.api = api;

    this.load = this.load.bind(this);
    this._subscriber = bindingEngine.propertyObserver(accessToken, 'value').subscribe(this.load);
    this.load();
  }

  setAnonymous() {
    this.authenticated = false;
    this.login = null;
    this.avatar_url = null;
    this.accessToken.setToken(null);
  }

  async load() {
    if (this.accessToken.value) {
      this.loading = true;
      return this.api.fetch('user')
        .then(response => {
          if (response.ok) {
            return response.json();
          }
          return null;
        })
        .then(user => {
          if (user) {
            this.authenticated = true;
            this.login = user.login;
            this.avatar_url = user.avatar_url;
          } else {
            this.setAnonymous();
          }
        })
        .catch()
        .then(() => this.loading = false);
    }
    this.setAnonymous();
    return Promise.resolve(null);
  }
}
