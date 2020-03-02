import {EventAggregator} from 'aurelia-event-aggregator';
import {inject, computedFrom, BindingEngine} from 'aurelia-framework';
import {EditSession} from '../edit/edit-session';
import {User} from '../github/user';
import _ from 'lodash';

@inject(EventAggregator, BindingEngine, EditSession, User)
export class GistInfo {
  constructor(ea, bindingEngine, session, user) {
    this.ea = ea;
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

  listGists() {
    const {owner} = this;
    if (!owner) return;
    this.ea.publish('list-gists', owner.login);
  }

  @computedFrom('session.gist')
  get owner() {
    return _.get(this.session, 'gist.owner');
  }

  @computedFrom('session.gist', 'user.login')
  get ownedByMe() {
    return _.get(this.session, 'gist.owner.login') === _.get(this.user, 'login');
  }

  // https://stephanwagner.me/auto-resizing-textarea-with-vanilla-javascript
  // We don't need `element.offsetHeight - element.clientHeight` because
  // our textarea has no border.
  fitSize() {
    if (!this.textarea) return;
    // Auto fit text area height to content size
    this.textarea.style.height = 'auto';
    this.textarea.style.height = this.textarea.scrollHeight + 'px';
  }

  keyDownInDescription(e) {
    if (e.code === 'Enter') {
      // Prevent enter key's default behavior:
      // creating new line
      return false;
    }

    return true;
  }
}
