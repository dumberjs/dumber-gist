import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {ConfirmOpenDialog} from './dialogs/confirm-open-dialog';
import {ConfirmDraftDialog} from './dialogs/confirm-draft-dialog';
import {Helper} from '../helper';
import {EditSession} from '../edit/edit-session';
import {Oauth} from '../github/oauth';
import {User} from '../github/user';
import _ from 'lodash';

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
        await this.dialogService.open({viewModel: ConfirmOpenDialog})
          .whenClosed(response => {
            if (response.wasCancelled) throw new Error('cancelled');
            if (response.output) {
              return this.save();
            }
          });
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
        await this.dialogService.open({viewModel: ConfirmOpenDialog})
          .whenClosed(response => {
            if (response.wasCancelled) throw new Error('cancelled');
            if (response.output) {
              return this.save();
            }
          });
      } else {
        await this.helper.confirm('Create a new gist draft?');
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

    return new Promise((resolve, reject) => {
      const sub = this.ea.subscribe('saved-gist', result => {
        if (result.success) {
          resolve();
        } else {
          reject(new Error('Failed to save gist'));
        }
        sub.dispose();
      })
      this.ea.publish('save-gist');
    });
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
    if (!isChanged) return false;
    if (files.length === 0) return false;
    // Give a choice for popup
    if (!user.authenticated) return true;
    if (gist.owner && gist.owner.login !== user.login) return false;
    return true;
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

  @computedFrom('session.gist')
  get gistId() {
    return _.get(this.session, 'gist.id', '');
  }

  @computedFrom('session.gist')
  get owner() {
    return _.get(this.session, 'gist.owner.login', '');
  }
}
