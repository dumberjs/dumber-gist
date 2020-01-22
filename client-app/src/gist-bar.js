import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {ConfirmationDialog} from './dialogs/confirmation-dialog';
import {EditSession} from './edit/edit-session';
import {Oauth} from './github/oauth';
import {User} from './github/user';

@inject(EventAggregator, DialogService, EditSession, Oauth, User)
export class GistBar {
  constructor(ea, dialogService, session, oauth, user) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.session = session;
    this.oauth = oauth;
    this.user = user;
  }

  loginPopup() {
    this.dialogService.open({
      viewModel: ConfirmationDialog,
      model: {
        message: `Please Sign in with GitHub to save/fork a gist.`,
        confirmationLabel: 'Sign in with GitHub'
      }
    }).whenClosed(response => {
      if (response.wasCancelled) return;
      this.oauth.login();
    });
  }

  save() {
    console.log('saveable', this.saveable);
    console.log('files.length', this.session.files.length);
    if (!this.saveable) return;
    if (!this.user.authenticated) {
      return this.loginPopup();
    }
    this.ea.publish('save-gist');
  }

  fork() {
    if (!this.forkable) return;
    if (!this.user.authenticated) {
      return this.loginPopup();
    }
    this.ea.publish('fork-gist');
  }

  share() {
    if (!this.shareable) return;
  }

  @computedFrom('session.gist', 'session.mutation', 'user.authenticated')
  get saveable() {
    const {gist, isChanged, files} = this.session;
    const {user} = this;
    // Give a choice for popup
    if (!user.authenticated) return true;
    if (gist.owner && gist.owner.login !== user.login) return false;
    if (!isChanged) return false;
    return files.length > 0;
  }

  @computedFrom('session.gist')
  get forkable() {
    const {gist} = this.session;
    // Give a choice for popup even when user is not authenticated
    return !!gist.id;
  }

  @computedFrom('session.gist')
  get shareable() {
    const {gist} = this.session;
    return !!gist.id;
  }
}
