import {inject, computedFrom} from 'aurelia-framework';
import {Oauth} from './github/oauth';
import {User} from './github/user';
import {UrlHandler} from './url-handler';

@inject(Oauth, User, UrlHandler)
export class App {
  constructor(oauth, user, urlHandler) {
    this.oauth = oauth;
    this.user = user;
    this.urlHandler = urlHandler;
    urlHandler.start();
  }

  @computedFrom('oauth.initialised', 'urlHandler.initialised', 'user.loading')
  get loading() {
    return !this.oauth.initialised ||
      !this.urlHandler.initialised ||
      this.user.loading;
  }
}
