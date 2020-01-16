import {inject, computedFrom} from 'aurelia-framework';
import {Oauth} from './github/oauth';
import {User} from './github/user';
import {UrlHandler} from './url-handler';

@inject(Oauth, User, UrlHandler)
export class App {
  constructor(oauth, user, urlHandler) {
    this.oauth = oauth;
    this.user = user;
    urlHandler.start();
  }

  @computedFrom('oauth.initialised', 'user.loading')
  get loading() {
    return !this.oauth.initialised || this.user.loading;
  }
}
