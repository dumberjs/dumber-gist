import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog';
import {ConfirmOpenDialog} from './dialogs/confirm-open-dialog';
import {OpenGistDialog} from './dialogs/open-gist-dialog';
import {ConfirmDraftDialog} from './dialogs/confirm-draft-dialog';
import {ConfirmForkDialog} from './dialogs/confirm-fork-dialog';
import {ConfirmShareDialog} from './dialogs/confirm-share-dialog';
import {ShareGistDialog} from './dialogs/share-gist-dialog';
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

      await this.dialogService.open({viewModel: OpenGistDialog})
        .whenClosed(response => {
          if (response.wasCancelled) return;
          const gist = response.output;
          this.session.loadGist(gist);
        });
    } catch (e) {
      // ignore
    }
  }

  async new() {
    if (!this.renewable) return; // already in a draft
    try {
      if (this.saveable) {
        await this.dialogService.open({viewModel: ConfirmDraftDialog})
          .whenClosed(response => {
            if (response.wasCancelled) throw new Error('cancelled');
            if (response.output) {
              return this.save();
            }
          });
      } else {
        await this.helper.confirm('Close current gist, then create a new draft?');
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

  async fork() {
    if (!this.forkable) return;
    if (!this.user.authenticated) {
      return this.loginPopup();
    }

    if (this.ownedByMe) {
      try {
        await this.helper.confirm(
          'GitHub Gist does not allow forking your own gist. Do you want to copy current gist to a new gist?',
          {confirmationLabel: 'Copy to new gist'}
        );
        this.ea.publish('save-gist', {forceNew: true});
      } catch (e) {
        // ignore
      }
      return;
    }

    try {
      await this.dialogService.open({
        viewModel: ConfirmForkDialog,
        model: {gist: this.session.gist}
      }).whenClosed(response => {
        if (response.wasCancelled) throw new Error('cancelled');
      });
      this.ea.publish('fork-gist');
    } catch (e) {
      // ignore
    }
  }

  async share() {
    if (!this.gistId) return;
    const {gist} = this.session;
    if (!gist.public) {
      this.ea.publish('warning', 'Can not share a private gist');
      return;
    }

    try {
      if (this.saveable) {
        await this.dialogService.open({viewModel: ConfirmShareDialog})
          .whenClosed(response => {
            if (response.wasCancelled) throw new Error('cancelled');
            if (response.output) {
              return this.save();
            }
          });
      }

      this.dialogService.open({
        viewModel: ShareGistDialog,
        model: {gist: this.session.gist}
      });
    } catch (e) {
      // ignore
    }
  }

  listGists() {
    const {owner} = this;
    if (!owner) return;
    this.ea.publish('list-gists', owner.login);
  }

  @computedFrom('session.mutation', 'gistId')
  get renewable() {
    return _.get(this.session, 'files.length') || this.gistId;
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
    if (!gist.id) return false;
    // Give a choice for popup
    if (!this.user.authenticated) return true;
    // Cannot fork own gist
    // Now checked in fork()
    // if (this.ownedByMe) return false;
    return true;
  }

  @computedFrom('session.gist')
  get gistId() {
    return _.get(this.session, 'gist.id', '');
  }

  @computedFrom('session.gist')
  get owner() {
    return _.get(this.session, 'gist.owner');
  }

  @computedFrom('session.gist', 'user')
  get ownedByMe() {
    return _.get(this.session, 'gist.owner.login') === _.get(this.user, 'login');
  }

  @computedFrom('session.gist')
  get isPrivate() {
    return !_.get(this.session, 'gist.public');
  }
}
