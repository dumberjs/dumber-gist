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
  }

  async setAnonymous() {
    this.authenticated = false;
    this.login = null;
    this.avatar_url = null;
    await this.accessToken.setToken(null);
  }

  async load() {
    if (this.accessToken.value) {
      this.loading = true;

      try {
        const response = await this.api.fetch('user')
        const user = response.ok ?
          await response.json() :
          null;
        if (user) {
          this.authenticated = true;
          this.login = user.login;
          this.avatar_url = user.avatar_url;
        } else {
          await this.setAnonymous();
        }
      } catch(e) {
        // ignore
      }

      this.loading = false;
    } else {
      await this.setAnonymous();
    }
  }
}
