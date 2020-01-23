import {inject, BindingEngine} from 'aurelia-framework';
import {InitParams} from './init-params';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Oauth} from './github/oauth';
import {PersistSession} from './github/persist-session';
import {Gists} from './github/gists';
import {EditSession} from './edit/edit-session';
import queryString from 'query-string';
import _ from 'lodash';

@inject(EventAggregator, InitParams, BindingEngine, Oauth, PersistSession, Gists, EditSession)
export class UrlHandler {
  constructor(ea, params, bindingEngine, oauth, persistSession, gists, session, mockSearch) {
    this.ea = ea;
    this.params = params;
    this.oauth = oauth;
    this.persistSession = persistSession;
    this.gists = gists;
    this.session = session;
    this.search = mockSearch || location.search;
    this.initialised = false;

    this.syncUrl = this.syncUrl.bind(this);
    this.subscriber = bindingEngine.propertyObserver(session, 'gist').subscribe(this.syncUrl);
  }

  async start() {
    try {
      await this.init();
    } catch (err) {
      this.ea.publish('error', err.message);
    }
    this.initialised = true;
  }

  async init() {
    let {code, sessionId, gist, open} = this.params;
    await this.oauth.init(code);

    if (sessionId) {
      await this.persistSession.tryRestoreSession();
    } else if (gist) {
      const g = await this.gists.load(gist);
      this.session.loadGist(g);

      if (open) {
        if (!Array.isArray(open)) open = [open];
        _.each(open, fn => this.ea.publish('open-file', fn));
      } else {
        // Try open readme file if there is one
        this.ea.publish('open-file', 'README.md');
        this.ea.publish('open-file', 'readme.md');
      }
    }
  }

  syncUrl(gist) {
    if (!gist || !gist.id) {
      // no gist loaded, or with unsaved new gist
      return this._updateParams();
    }

    if (gist.id === this.params.gist) {
      return;
    }

    return this._updateParams({gist: gist.id});
  }

  _updateParams(params) {
    const newSearch = queryString.stringify(params);
    const newHref = newSearch ? `/?${newSearch}` : '/';
    history.replaceState(null, document.title, newHref);
  }
}
