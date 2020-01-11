import {inject} from 'aurelia-framework';
import {Oauth} from './github/oauth';
import {User} from './github/user';

@inject(Oauth, User)
export class App {
  constructor(oauth, user) {
    this.oauth = oauth;
    this.user = user;
  }

  created() {
    this.oauth.init();
  }
}
