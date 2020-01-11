import {inject} from 'aurelia-framework';
import {SessionId} from '../session-id';
import {EditSession} from '../edit/edit-session';
import localforage from 'localforage';
import _ from 'lodash';

const PREFIX = 'gist-code-session:';

// Save session data before user attempt login,
// restore them after logged in (or cancelled login).
@inject(SessionId, EditSession)
export class PersistSession {
  constructor(sessionId, editSession) {
    this.key = PREFIX + sessionId.id;
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
    return localforage.getItem(this.key)
      .then(data => {
        this.editSession.importData(data);
        return localforage.removeItem(this.key);
      })
      .catch();
  }

  saveSession() {
    return localforage.setItem(this.key, this._sessionData());
  }
}
