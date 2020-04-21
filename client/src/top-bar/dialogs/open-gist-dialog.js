import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogController} from 'aurelia-dialog-lite';
import Validation from 'bcx-validation';
import {Gists} from '../../github/gists';
import {Helper} from '../../helper';
import _ from 'lodash';

const gistIdRegex = /^[0-9a-f]{7,32}$/;
const gistUrlRegex = /^https:\/\/gist.github.com\/([0-9a-zA-Z](([0-9a-zA-Z-]*)?[0-9a-zA-Z])?\/)?[0-9a-f]{7,32}$/;

const idRegex = /[0-9a-f]+$/;

@inject(EventAggregator, DialogController, Validation, Gists, Helper)
export class OpenGistDialog {
  triedOnce = false;
  gistUrl = '';
  githubUser = '';

  constructor(ea, controller, validation, gists, helper) {
    this.ea = ea;
    this.controller = controller;
    this.gists = gists;
    this.helper = helper;

    this.validator = validation.generateValidator({
      gistUrl: [
        'mandatory',
        url => {
          url = url.trim();
          if (gistIdRegex.test(url)) return;
          if (gistUrlRegex.test(url)) return;
          return 'Unrecognizable gist id or URL'
        }
      ]
    });
  }

  open() {
    this.triedOnce = true;
    if (!this.errors) {
      const m = this.gistUrl.trim().match(idRegex);
      if (m) {
        const id = m[0];

        return this.helper.waitFor(
          `Loading Gist ${id.slice(0, 7)} ...`,
          this.gists.load(id)
        ).then(
          gist => this.controller.ok(gist),
          err => this.ea.publish('error', err.message)
        );
      }
    }

    // Try list gists of githubUser
    const githubUser = this.githubUser.trim();
    if (githubUser) {
      return this.controller.cancel().then(() => {
        this.ea.publish('list-gists', githubUser);
      });
    }
  }

  @computedFrom('triedOnce', 'gistUrl')
  get errors() {
    if (this.triedOnce) {
      const errors = this.validator(this);
      return _.capitalize(_.get(errors, 'gistUrl', []).join(', '));
    }
  }
}
