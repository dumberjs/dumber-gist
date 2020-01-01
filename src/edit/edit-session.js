import {inject, observable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';
import {WorkerService} from '../worker-service';

@inject(EventAggregator, WorkerService)
export class EditSession {
  _gist = null;
  _originalFiles = [];
  files = [];
  _originalDescription = '';
  description = '';

  @observable mutation = 0;
  editingFilenames = [];
  focusedEditingIndex = -1;
  isRendered = false;
  isChanged = false;

  constructor(ea, ws) {
    this.ea = ea;
    this.ws = ws;
  }

  _mutate() {
    if (this.mutation >= 9999) {
      this.mutation = 0;
    } else {
      this.mutation += 1;
    }
  }

  loadGist(gist) {
    this._gist = gist;
    this._originalFiles = _.map(gist.files, f => ({
      filename: f.filename,
      content: f.content
    }));
    this.files = _.map(this._originalFiles, f => ({
      filename: f.filename,
      content: f.content,
      isRendered: false,
      isChanged: false
    }));
    this._originalDescription = gist.description;
    this.description = gist.description;
    this._reset();

    this._mutate();
  }

  openFile(file) {
    if (file.folder) return;
    const filename = file.filename || file;
    const idx = this.editingFilenames.indexOf(filename);
    if (idx === -1) {
      this.editingFilenames.push(filename);
      this.focusedEditingIndex = this.editingFilenames.length - 1;
    } else {
      this.focusedEditingIndex = idx;
    }
    this.ea.publish('edit-file', file);
  }

  closeFile(file) {
    const filename = file.filename || file;
    const idx = this.editingFilenames.indexOf(filename);
    if (idx !== -1) {
      this.editingFilenames.splice(idx, 1);
      if (this.focusedEditingIndex > idx) {
        this.focusedEditingIndex -= 1;
        if (this.focusedEditingIndex < 0 && this.editingFilenames.length) {
          this.focusedEditingIndex = 0;
        }
      } else if (this.focusedEditingIndex === idx) {
        if (this.focusedEditingIndex >= this.editingFilenames.length) {
          this.focusedEditingIndex = this.editingFilenames.length - 1;
        } else {
          // force reload
          this.focusedEditingIndex += 1;
          this.focusedEditingIndex -= 1;
        }
      }
    }
  }

  updateFile({filename, content}) {
    const f = _.find(this.files, {filename});
    const oldF = _.find(this._originalFiles, {filename});

    if (f) {
      if (f.content === content) return;
      f.content = content;
      f.isRendered = false;
      f.isChanged = !oldF || oldF.content !== content;
    } else {
      this.files.push({
        filename,
        content,
        isRendered: false,
        isChanged: true
      });
    }

    this._mutate();
  }

  updateFilePath(node, newFilePath) {
    const _updateFilePath = (node, newFilePath) => {
      if (node.filePath === newFilePath) return;

      let isChanged = false;
      const {file, files} = node;

      if (file) {
        const existingF = _.find(this.files, {filename: newFilePath});
        if (existingF) {
          // ignore
          this.ea.publish('error', 'Cannot rename ' + file.filename + ' to ' + newFilePath + ' because there is an existing file.');
          return false;
        }

        const isEditing = this.editingFilenames.includes(file.filename);

        if (isEditing) {
          this.closeFile(file);
        }

        isChanged = true;
        file.filename = newFilePath;
        file.isRendered = false;
        const oldF = _.find(this._originalFiles, {filename: newFilePath});
        file.isChanged = !oldF || oldF.content !== file.content;

        if (isEditing) {
          this.openFile(file);
        }
      } else if (files) {
        _.each(files, n => {
          isChanged = _updateFilePath(n, newFilePath + '/' + n.name) || isChanged;
        });
      }
      return isChanged;
    }

    if (_updateFilePath(node, newFilePath)) {
      this._mutate();
    }
  }

  createFile(filename, content = '', skipOpen = false) {
    const existingF = _.find(this.files, {filename});
    if (existingF) {
      // ignore
      this.ea.publish('error', 'Cannot create ' + filename + ' because there is an existing file.');
      return;
    }

    const file = {
      filename: filename,
      content,
      isRendered: false,
      isChanged: true
    };

    this.files.push(file);
    if (!skipOpen) this.openFile(file);
    this._mutate();
  }

  deleteFolder(filePath) {
    let idx;
    let isChanged = false;
    while ((idx = _.findLastIndex(this.files, f => f.filename.startsWith(filePath))) !== -1) {
      isChanged = true;
      this.closeFile(this.files[idx]);
      this.files.splice(idx, 1);
    }

    if (isChanged) {
      this._mutate();
    }
  }

  deleteFile(filename) {
    const idx = _.findIndex(this.files, {filename});
    if (idx !== -1) {
      this.closeFile(this.files[idx]);
      this.files.splice(idx, 1);
      this._mutate();
    }
  }

  async render() {
    // This flag is only for app didn't provide package.json
    // which contains aurelia-bootstrapper.
    const isAurelia1 = _.some(this.files, f => {
      const m = f.content.match(/\bconfigure\s*\(\s*(\w)+\s*\)/);
      if (!m) return false;
      const auVar = m[1];

      return _.includes(f.content, `${auVar}.start`) &&
        _.includes(f.content, `${auVar}.setRoot`);
    });

    // Get dependencies from package.json
    let deps = {};
    _.each(this.files, f => {
      if (f.filename !== 'package.json') return;
      const json = JSON.parse(f.content);
      deps = json.dependencies;
      return false; // exit early
    })

    const result = await this.ws.perform({
      type: 'init',
      config: {isAurelia1, deps}
    });

    await this.ws.perform({
      type: 'update',
      files: result.isNew ?
        this.files.map(f => f) :
        this.files.filter(f => !f.isRendered)
    });

    await this.ws.perform({type: 'build'});

    this.files.forEach(f => f.isRendered = true);
    this.isRendered = true;
  }

  @computedFrom('editingFilenames', 'focusedEditingIndex', 'mutation')
  get editingFile() {
    if (this.focusedEditingIndex >= 0) {
      const fn = this.editingFilenames[this.focusedEditingIndex];
      if (fn) {
        return _.find(this.files, {filename: fn});
      }
    }
  }

  _reset() {
    this.editingFilenames = [];
    this.focusedEditingIndex = -1;
  }

  mutationChanged() {
    this._trimEditingFiles();

    this.isRendered = _.every(this.files, 'isRendered');
    this.isChanged = _.some(this.files, 'isChanged') ||
      this.files.length !== this._originalFiles.length ||
      this.description !== this._originalDescription;
  }

  _trimEditingFiles() {
    const toRemove = [];
    _.each(this.editingFilenames, (fn, i) => {
      if (!_.find(this.files, {filename: fn})) {
        toRemove.unshift(i);
      }
    });
    toRemove.forEach(i => this.editingFilenames.splice(i, 1));
    if (this.editingFilenames.length - 1 < this.focusedEditingIndex) {
      this.focusedEditingIndex = this.editingFilenames.length - 1;
    }
  }
}
