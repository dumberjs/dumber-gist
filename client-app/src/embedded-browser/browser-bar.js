import {inject, bindable} from 'aurelia-framework';
import {EditSession} from '../edit/edit-session';

@inject(EditSession)
export class BrowserBar {
  @bindable isBundling;
  @bindable bundle;

  constructor(session) {
    this.session = session;
  }
}
