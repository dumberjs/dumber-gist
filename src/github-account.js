import {inject} from 'aurelia-framework';
import {DialogService} from 'aurelia-dialog';
import {Oauth} from './github/oauth';
import {User} from './github/user';
import {SessionId} from './session-id';
import {ContextMenu} from './dialogs/context-menu';

@inject(DialogService, SessionId, Oauth, User)
export class GithubAccount {
  constructor(dialogService, sessionId, oauth, user) {
    this.dialogService = dialogService;
    this.sessionId = sessionId;
    this.oauth = oauth;
    this.user = user;
  }

  login() {
    this.oauth.login(this.sessionId.id);
  }

  userMenu(e) {
    const rect = e.target.getBoundingClientRect();
    this.dialogService.open({
      viewModel: ContextMenu,
      model: {
        right: 7,
        top: rect.bottom + 4,
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
