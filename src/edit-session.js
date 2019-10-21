import {inject, observable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';
import path from 'path';

@inject(EventAggregator)
export class EditSession {
  _gist = null;
  _originalFiles = [];
  _files = [];
  _originalDescription = '';
  _description = '';

  @observable _mutationCounter = 0;
  fileTree = [];
  editingFilenames = [];
  focusedEditingIndex = -1;
  isRendered = false;
  isChanged = false;

  constructor(ea) {
    this.ea = ea;

    ea.subscribe('update-file', ({filename, content}) => {
      const f = _.find(this._files, {filename});
      const oldF = _.find(this._originalFiles, {filename});
      if (f && f.content !== content) {
        f.content = content;
        f.isRendered = false;
        f.isChanged = !oldF || oldF.content !== content;
        this._mutationCounter += 1;
      }
    });
  }

  loadGist(gist) {
    this._gist = gist;
    this._originalFiles = _.map(gist.files, f => ({
      filename: f.filename,
      content: f.content
    }));
    this._files = _.map(this._originalFiles, f => ({
      filename: f.filename,
      content: f.content,
      isRendered: false,
      isChanged: false
    }));
    this._originalDescription = gist.description;
    this.description = gist.description;
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

  stopEditingFile(file) {
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

  @computedFrom('editingFilenames', 'focusedEditingIndex')
  get editingFile() {
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

    this.isRendered = _.every(this._files, 'isRendered');
    this.isChanged = _.some(this._files, 'isChanged') ||
      this._files.length !== this._originalFiles.length;
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
            filePath: filename,
            name: p,
            isChanged: f.isChanged,
            file: f
          });
        } else {
          // dir
          const existingFolder = _.find(branch, b => b.files && b.name === p);
          if (existingFolder) {
            branch = existingFolder.files;
          } else {
            const newFolder = {
              filePath: parts.slice(0, i + 1).join('/'),
              name: p,
              files: []
            };
            branch.push(newFolder);
            branch = newFolder.files;
          }
        }
      });
    });

    markIsChanged(tree);
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

function markIsChanged(tree) {
  let isChanged = false;
  _.each(tree, branch => {
    if (branch.files) {
      isChanged = markIsChanged(branch.files);
      branch.isChanged = isChanged;
    } else {
      if (branch.isChanged) {
        isChanged = true;
      }
    }
  });
  return isChanged;
}
