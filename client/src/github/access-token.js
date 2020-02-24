import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
const storageKey = 'github-oauth-token';

@inject(EventAggregator)
export class AccessToken {
  _token = null;

  constructor(ea) {
    this.ea = ea;
    this.init();
  }

  async init() {
    return new Promise(resolve => {
      // delay init so others can listen to update-token event.
      setTimeout(() => {
        try {
          const json = localStorage.getItem(storageKey);
          if (json) {
            this._token = JSON.parse(json);
            this.ea.publish('update-token', this._token);
          }
        } catch (e) {
          // ignore
          // localStorage could be unavailable in iframe.
        }
        resolve();
      });
    });
  }

  @computedFrom('_token')
  get value() {
    return this._token ? this._token.access_token : null;
  }

  @computedFrom('_token')
  get scope() {
    return this._token ? this._token.scope : null;
  }

  setToken(token) {
    this._token = token;
    this.ea.publish('update-token', this._token);
    try {
      if (token) {
        localStorage.setItem(storageKey, JSON.stringify(token));
      } else {
        localStorage.removeItem(storageKey)
      }
    } catch (e) {
      // ignore
      // localStorage could be unavailable in iframe.
    }
  }
}
