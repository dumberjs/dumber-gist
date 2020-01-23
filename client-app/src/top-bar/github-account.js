import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {Oauth} from '../github/oauth';
import {User} from '../github/user';
import {SessionId} from '../session-id';
import {ContextMenu} from '../dialogs/context-menu';

@inject(DialogService, SessionId, Oauth, User)
export class GithubAccount {
  constructor(dialogService, sessionId, oauth, user) {
    this.dialogService = dialogService;
    this.sessionId = sessionId;
    this.oauth = oauth;
    this.user = user;
  }

  login() {
    this.oauth.login();
  }

  userMenu() {
    if (!this.user.login) return;

    const rect = this.el.getBoundingClientRect();
    this.dialogService.open({
      viewModel: ContextMenu,
      model: {
        right: 5,
        top: rect.bottom + 4,
        items: [
          {html: `Signed in as <strong>${this.user.login}</strong>`},
          {separator: true},
          {title: 'Your gists', code: 'gists'},
          {title: 'Sign out', code: 'logout'}
        ]
      }
    }).whenClosed(response => {
      if (response.wasCancelled) return;

      const code = response.output;
      if (code === 'logout') return this.oauth.logout();
    });
  }

  helpMenu() {
    const rect = this.el.getBoundingClientRect();
    this.dialogService.open({
      viewModel: ContextMenu,
      model: {
        right: 5,
        top: rect.bottom + 4,
        items: [
          {title: 'Dumber gist', icon: "fab fa-github", href: 'https://github.com/dumberjs/dumber-gist'},
          {separator: true},
          {title: 'GitHub Wiki', href: 'https://github.com/dumberjs/dumber-gist/wiki'},
          {title: 'GitHub Issues', href: 'https://github.com/dumberjs/dumber-gist/issues'}
        ]
      }
    }).whenClosed(response => {
      if (response.wasCancelled) return;

      const code = response.output;
      if (code === 'logout') return this.oauth.logout();
    });
  }
}
