import {inject, BindingEngine} from 'aurelia-framework';
import {InitParams} from './init-params';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Oauth} from './github/oauth';
import {PersistSession} from './github/persist-session';
import {Gists} from './github/gists';
import {EditSession} from './edit/edit-session';
import queryString from 'querystring';
import _ from 'lodash';

@inject(EventAggregator, InitParams, BindingEngine, Oauth, PersistSession, Gists, EditSession)
export class UrlHandler {
  constructor(ea, initParams, bindingEngine, oauth, persistSession, gists, session, mockSearch) {
    this.ea = ea;
    this.initParams = initParams;
    this.oauth = oauth;
    this.persistSession = persistSession;
    this.gists = gists;
    this.session = session;
    this.search = mockSearch || location.search;
    this.initialised = false;
    this._firstLoad = true;

    this.syncUrl = this.syncUrl.bind(this);
    this.subscriber = bindingEngine.propertyObserver(session, 'gist').subscribe(this.syncUrl);
  }

  async start() {
    this.initialised = false;
    try {
      await this.init(this.initParams);
    } catch (err) {
      this.ea.publish('error', err.message);
    }

    addEventListener('popstate', () => {
      this.init(this.currentParams());
    });

    this.initialised = true;
  }

  currentParams() {
    return queryString.parse(location.search.slice(1));
  }

  async init(params) {
    let {code, sessionId, gist, open} = params;
    await this.oauth.init(code);

    if (sessionId) {
      await this.persistSession.tryRestoreSession();
    } else if (gist && gist !== _.get(this.session, 'gist.id')) {
      const g = await this.gists.load(gist);
      this.session.loadGist(g);

      // Delay open files to fix edge case on Safari
      setTimeout(() => {
        if (open) {
          if (!Array.isArray(open)) open = [open];
          if (open.length) {
            _.each(open, fn => this.ea.publish('open-file', fn));
            // set focus back to first opened file
            this.ea.publish('open-file', open[0]);
          }
        } else {
          // Try open readme file if there is one
          this.ea.publish('open-file', 'README.md');
          this.ea.publish('open-file', 'readme.md');
        }
      });
    }
  }

  syncUrl(gist) {
    let title = 'Dumber Gist';
    const gistTitle = (gist && gist.id) ? `${gist.owner.login} / ${gist.description}` : '';
    if (gistTitle) {
      title += ` | ${gistTitle}`;
      if (this._firstLoad) {
        this._firstLoad = false;
      } else {
        this.ea.publish('info', `Loaded Gist: ${gistTitle}`);
      }
    }
    document.title = title;

    const params = this.currentParams();

    if (!gist || !gist.id) {
      if (params.gist) {
        // No gist loaded, or with unsaved new gist.
        // Clean up url.
        this._updateParams();
      }
      return;
    }

    if (gist.id === params.gist) {
      // Unchanged.
      return;
    }

    const replace = params.sessionId || params.code;

    // Update gist id in url
    return this._updateParams({gist: gist.id}, title, replace);
  }

  _updateParams(params, title = 'Dumber Gist', replace = false) {
    const newSearch = queryString.stringify(params);
    const newHref = newSearch ? `/?${newSearch}` : '/';

    if (replace) {
      history.replaceState(null, title, newHref);
    } else {
      history.pushState(null, title, newHref);
    }
  }
}
