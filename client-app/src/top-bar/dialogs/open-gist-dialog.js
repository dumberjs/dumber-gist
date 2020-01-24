import {inject, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {DialogController} from 'aurelia-dialog';
import Validation from 'bcx-validation';
import {Gists} from '../../github/gists';
import {Helper} from '../../helper';
import _ from 'lodash';

const gistIdRegex = /^[0-9a-f]{32}$/;
const gistUrlRegex = /^https:\/\/gist.github.com\/([0-9a-zA-Z](([0-9a-zA-Z-]*)?[0-9a-zA-Z])?\/)?[0-9a-f]{32}$/;

@inject(EventAggregator, DialogController, Validation, Gists, Helper)
export class OpenGistDialog {
  triedOnce = false;
  gistUrl = '';

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
    if (this.errors) return;
    const id = this.gistUrl.trim().slice(-32);

    this.helper.waitFor(
      `Loading Gist ${id.slice(0, 7)} ...`,
      this.gists.load(id)
    ).then(
      gist => this.controller.ok(gist),
      err => this.ea.publish('error', err.message)
    );
  }

  @computedFrom('triedOnce', 'gistUrl')
  get errors() {
    if (this.triedOnce) {
      const errors = this.validator(this);
      return _.capitalize(_.get(errors, 'gistUrl', []).join(', '));
    }
  }
}
