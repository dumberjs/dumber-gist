import {inject, computedFrom, BindingEngine} from 'aurelia-framework';
import {EditSession} from '../edit/edit-session';
import {User} from '../github/user';
import _ from 'lodash';

@inject(BindingEngine, EditSession, User)
export class GistInfo {
  constructor(bindingEngine, session, user) {
    this.bindingEngine = bindingEngine;
    this.session = session;
    this.user = user;
    this.fitSize = this.fitSize.bind(this);
  }

  attached() {
    this.subscribers = [
      this.bindingEngine.propertyObserver(this.session, 'description').subscribe(this.fitSize)
    ];
    this.fitSize();
  }

  detached() {
    _.each(this.subscribers, s => s.dispose());
  }

  @computedFrom('session.gist')
  get owner() {
    return _.get(this.session, 'gist.owner');
  }

  @computedFrom('session.gist', 'user.login')
  get ownedByMe() {
    return _.get(this.session, 'gist.owner.login') === _.get(this.user, 'login');
  }

  fitSize() {
    if (!this.textarea) return;
    // Auto fit text area height to content size
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }
}
