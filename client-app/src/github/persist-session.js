import {inject} from 'aurelia-framework';
import {SessionId} from '../session-id';
import {EditSession} from '../edit/edit-session';
import localforage from 'localforage';
import _ from 'lodash';

const KEY = 'gist-code-session:';

// Save session data before user attempt login,
// restore them after logged in (or cancelled login).
@inject(SessionId, EditSession)
export class PersistSession {
  constructor(sessionId, editSession) {
    this.id = sessionId.id;
    this.editSession = editSession;
  }

  _sessionData() {
    return {
      description: this.editSession.description,
      files: _.map(this.editSession.files, f => ({
        filename: f.filename,
        content: f.content,
        isRendered: false,
        isChanged: !!f.isChanged
      })),
      gist: this.editSession.gist
    };
  }

  tryRestoreSession() {
    return localforage.getItem(KEY)
      .then(data => {
        const sessionData = data[this.id];
        if (sessionData) {
          this.editSession.importData(sessionData);
        }
        return localforage.removeItem(KEY);
      })
      .catch();
  }

  saveSession() {
    return localforage.setItem(KEY, {[this.id]: this._sessionData()});
  }
}
