import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {AccessToken} from './access-token';
import {ApiClient} from './api-client'

@inject(AccessToken, ApiClient, EventAggregator)
export class User {
  loading = false;
  authenticated = false;
  login = null;
  avatar_url = null;

  constructor(accessToken, api, ea) {
    this.accessToken = accessToken;
    this.api = api;

    this.load = this.load.bind(this);
    this._subscriber = ea.subscribe('update-token', this.load);
  }

  async setAnonymous() {
    this.authenticated = false;
    this.login = null;
    this.avatar_url = null;
    this.accessToken.setToken(null);
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
