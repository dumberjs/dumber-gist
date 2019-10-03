import {observable, computedFrom} from 'aurelia-framework';
import _ from 'lodash';
import path from 'path';

export class EditSession {
  _originalFiles = [];
  _files = [];

  @observable _mutationCounter = 0;
  fileTree = [];
  editingFilenames = [];
  focusedEditingIndex = -1;

  loadFiles(files) {
    this._originalFiles = _.map(files, f => ({filename: f.filename, content: f.content}));
    this._files = _.cloneDeep(this._originalFiles);
    this._reset();

    if (this._mutationCounter !== 0) {
      this._mutationCounter = 0; // unset counter to 0, means files are in sync.
    } else {
      // Force state update.
      this._mutationCounterChanged();
    }
  }

  editFile(file) {
    if (file.folder) return;
    const idx = this.editingFilenames.indexOf(file.filename);
    if (idx === -1) {
      this.editingFilenames.push(file.filename);
      this.focusedEditingIndex = this.editingFilenames.length - 1;
    } else {
      this.focusedEditingIndex = idx;
    }
  }

  stopEditingFile(file) {
    const idx = this.editingFilenames.indexOf(file.filename);
    if (idx !== -1) {
      this.editingFilenames.splice(idx, 1);
    }
  }

  @computedFrom('editingFilenames', 'focusedEditingIndex')
  get focusedEditingFile() {
    if (this.focusedEditingIndex >= 0) {
      const fn = this.editingFilenames[this.focusedEditingIndex];
      if (fn) {
        return _.find(this._files, {filename: fn});
      }
    }
  }

  _reset() {
    this.fileTree = [];
    this.editingFilenames = [];
    this.focusedEditingIndex = -1;
  }
  _mutationCounterChanged() {
    this._updateFileTree();
    this._trimEditingFiles();
  }

  _updateFileTree() {
    const tree = [];

    _.each(this._files, f => {
      const filename = path.normalize(f.filename);
      const parts = filename.split('/');
      const len = parts.length;
      let branch = tree;
      _.each(parts, (p, i) => {
        if (i === len - 1) {
          // file
          branch.push({
            file: p,
            filename,
            content: f.content
          });
        } else {
          // dir
          const existingFolder = _.find(branch, {folder: p});
          if (existingFolder) {
            branch = existingFolder.files;
          } else {
            const newFolder = {
              folder: p,
              filename: parts.slice(0, i + 1).join('/'),
              files: []
            };
            branch.push(newFolder);
            branch = newFolder.files;
          }
        }
      });
    });

    this.fileTree = tree;
  }

  _trimEditingFiles() {
    const toRemove = [];
    _.each(this.editingFilenames, (fn, i) => {
      if (!_.find(this._files, {filename: fn})) {
        toRemove.unshift(i);
      }
    });
    toRemove.forEach(i => this.editingFilenames.splice(i, 1));
  }
}
