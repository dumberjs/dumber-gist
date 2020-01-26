/* global ClipboardJS */
import {DialogController} from 'aurelia-dialog';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject, BindingEngine} from 'aurelia-framework';
import {User} from '../../github/user';
import {clientUrl} from '../../host-name';
import _ from 'lodash';

@inject(EventAggregator, DialogController, BindingEngine, User)
export class ShareGistDialog {
  selectedFiles = [];

  constructor(ea, controller, bindingEngine, user) {
    this.ea = ea;
    this.controller = controller;
    this.controller.settings.overlayDismiss = false;
    this.bindingEngine = bindingEngine;
    this.user = user;
    this._update = this._update.bind(this);
  }

  activate(model) {
    this.gist = model.gist;
    this.originalFiles = _.map(this.gist.files, 'filename');
    this.subscribers = [
      this.bindingEngine.collectionObserver(this.selectedFiles).subscribe(this._update)
    ];
    this._update();
  }

  attached() {
    this.copyUrl = new ClipboardJS(this.copyUrlBtn, {text: () => this.url});

    this.copyUrl.on('success', () => {
      this.ea.publish('success', 'URL copied');
    });

    this.copyIframed = new ClipboardJS(this.copyIframedBtn, {text: () => this.iframed});

    this.copyIframed.on('success', () => {
      this.ea.publish('success', 'iframe snippet copied');
    });
  }

  deactivate() {
    this.subscribers.forEach(s => s.dispose());
  }

  detached() {
    if (this.copyUrl) {
      this.copyUrl.destroy();
      this.copyUrl = null;
    }

    if (this.copyIframed) {
      this.copyIframed.destroy();
      this.copyIframed = null;
    }
  }

  _update() {
    let url = `${clientUrl}/?gist=${this.gist.id}`;

    const {selectedFiles} = this;
    if (selectedFiles.length) {
      url += _(selectedFiles)
        .map(f => `&open=${encodeURIComponent(f)}`)
        .join('');
    }

    this.url = url;
    this.iframed = `<iframe style="width: 100%; height: 400px" src="${this.url}"></iframe>`;
  }
}
