import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogService} from 'aurelia-dialog-lite';
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
    if (this.dialogService.hasActiveDialog) return;

    try {
      if (this.saveable) {
        const saveFirst = await this.dialogService.open({viewModel: ConfirmOpenDialog})
        if (saveFirst) await this.save();
      }

      const gist = await this.dialogService.open({viewModel: OpenGistDialog});
      this.session.loadGist(gist);
    } catch (e) {
      // ignore cancelled dialog
    }
  }

  async new() {
    if (this.dialogService.hasActiveDialog) return;

    if (!this.renewable) return; // already in a draft
    try {
      if (this.saveable) {
        const saveFirst = await this.dialogService.open({viewModel: ConfirmDraftDialog});
        if (saveFirst) await this.save();
      } else {
        await this.helper.confirm('Close current gist, then create a new draft?');
      }
      this.ea.publish('new-draft');
    } catch (e) {
      // ignore cancelled dialog
    }
  }

  async save() {
    if (this.dialogService.hasActiveDialog) return;
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
    if (this.dialogService.hasActiveDialog) return;
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
        // ignore cancelled dialog
      }
      return;
    }

    try {
      await this.dialogService.open({
        viewModel: ConfirmForkDialog,
        model: {gist: this.session.gist}
      });
      this.ea.publish('fork-gist');
    } catch (e) {
      // ignore cancelled dialog
    }
  }

  async share() {
    if (this.dialogService.hasActiveDialog) return;
    if (!this.gistId) return;
    const {gist} = this.session;
    if (!gist.public) {
      this.ea.publish('warning', 'Can not share a private gist');
      return;
    }

    try {
      if (this.saveable) {
        const saveFirst = await this.dialogService.open({viewModel: ConfirmShareDialog});
        if (saveFirst) await this.save();
      }

      this.dialogService.open({
        viewModel: ShareGistDialog,
        model: {gist: this.session.gist}
      }).then(() => {}, () => {});
    } catch (e) {
      // ignore cancelled dialog
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
