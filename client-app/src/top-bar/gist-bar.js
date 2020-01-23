import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {Helper} from '../helper';
import {EditSession} from '../edit/edit-session';
import {Oauth} from '../github/oauth';
import {User} from '../github/user';

@inject(EventAggregator, DialogService, EditSession, Oauth, User, Helper)
export class GistBar {
  constructor(ea, dialogService, session, oauth, user, helper) {
    this.ea = ea;
    this.dialogService = dialogService;
    this.session = session;
    this.oauth = oauth;
    this.user = user;
    this.helper = helper;
  }

  loginPopup() {
    this.helper.confirm(
      `Please Sign in with GitHub to save/fork a gist.`,
      {confirmationLabel: 'Sign in with GitHub'}
    ).then(
      () => this.oauth.login(),
      () => {}
    );
  }

  async open() {
    try {
      if (this.saveable) {
        await this.helper.confirm('You have unsaved changes. Do you want to save them first before opening another GitHub Gist?', {
          confirmationLabel: 'Save Changes',
          cancelationLabel: 'Discard Changes'
        });
        await this.save();
      }
      // TODO open gist
    } catch (e) {
      // ignore
    }
  }

  async new() {
    if (!this.shareable) return; // already in a draft
    try {
      if (this.saveable) {
        await this.helper.confirm('You have unsaved changes. Do you want to save them first before creating new draft?', {
          confirmationLabel: 'Save Changes',
          cancelationLabel: 'Discard Changes'
        });
        await this.save();
      }
      this.ea.publish('new-draft');
    } catch (e) {
      // ignore
    }
  }

  async save() {
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

  @computedFrom('session.gist', 'session.mutation', 'session.description', 'user.authenticated')
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
