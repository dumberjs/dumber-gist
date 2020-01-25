import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {User} from '../../github/user';

@inject(DialogController, User)
export class ShareGistDialog {
  constructor(controller, user) {
    this.controller = controller;
    this.user = user;
  }

  activate(model) {
    this.gist = model.gist;
  }
}
