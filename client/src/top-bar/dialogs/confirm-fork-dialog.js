import {DialogController} from 'aurelia-dialog';
import {inject} from 'aurelia-framework';
import {User} from '../../github/user';
import _ from 'lodash';

@inject(DialogController, User)
export class ConfirmForkDialog {
  constructor(controller, user) {
    this.controller = controller;
    this.user = user;
  }

  activate(model) {
    this.gist = model.gist;
    this.ownedByMe = _.get(this.gist, 'owner.login') === _.get(this.user, 'login');
  }
}
