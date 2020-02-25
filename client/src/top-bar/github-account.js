import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Oauth} from '../github/oauth';
import {User} from '../github/user';
import {ContextMenu} from '../dialogs/context-menu';
import {ShortCutsDialog} from './dialogs/short-cuts-dialog';

@inject(EventAggregator, DialogService, Oauth, User)
export class GithubAccount {
  constructor(ea, dialogService, oauth, user) {
    this.ea = ea;
    this.dialogService = dialogService;
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
      if (code === 'logout') {
        return this.oauth.logout();
      } else if (code === 'gists') {
        this.ea.publish('list-gists', this.user.login);
      }
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
          {title: 'Dumber Gist', icon: "fab fa-github", href: 'https://github.com/dumberjs/dumber-gist'},
          {separator: true},
          {title: 'GitHub Wiki', href: 'https://github.com/dumberjs/dumber-gist/wiki'},
          {title: 'GitHub Issues', href: 'https://github.com/dumberjs/dumber-gist/issues'},
          {separator: true},
          {title: 'List of Short-cuts', code: 'short-cuts'}
        ]
      }
    }).whenClosed(response => {
      if (response.wasCancelled) return;

      const code = response.output;
      if (code === 'short-cuts') return this.listShortCuts();
    });
  }

  listShortCuts() {
    this.dialogService.open({viewModel: ShortCutsDialog});
  }
}
