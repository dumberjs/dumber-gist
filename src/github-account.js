import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {Oauth} from './github/oauth';
import {User} from './github/user';
import {ContextMenu} from './dialogs/context-menu';

@inject(DialogService, Oauth, User)
export class GithubAccount {
  constructor(dialogService, oauth, user) {
    this.dialogService = dialogService;
    this.oauth = oauth;
    this.user = user;
  }

  login() {
    this.oauth.login();
  }

  userMenu(e) {
    const rect = e.target.getBoundingClientRect();
    this.dialogService.open({
      viewModel: ContextMenu,
      model: {
        right: 7,
        top: rect.bottom,
        items: [
          {title: 'Logout', code: 'logout'}
        ]
      }
    }).whenClosed(response => {
      if (response.wasCancelled) return;

      const code = response.output;
      if (code === 'logout') return this.oauth.logout();
    });
  }
}
