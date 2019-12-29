import {inject, observable, computedFrom} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';
import path from 'path';
import {WorkerService} from './worker-service';

@inject(EventAggregator, WorkerService)
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

  constructor(ea, ws) {
    this.ea = ea;
    this.ws = ws;
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
    const f = _.find(this._files, {filename});
    const oldF = _.find(this._originalFiles, {filename});

    if (f) {
      if (f.content === content) return;
      f.content = content;
      f.isRendered = false;
      f.isChanged = !oldF || oldF.content !== content;
    } else {
      this._files.push({
        filename,
        content,
        isRendered: false,
        isChanged: true
      });
    }

    this._mutationCounter += 1;
  }

  updateFilePath(node, newFilePath) {
    const _updateFilePath = (node, newFilePath) => {
      if (node.filePath === newFilePath) return;

      let isChanged = false;
      const {file, files} = node;

      if (file) {
        const existingF = _.find(this._files, {filename: newFilePath});
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
      this._mutationCounter += 1;
    }
  }

  createFile(filename, content = '', skipOpen = false) {
    const existingF = _.find(this._files, {filename});
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

    this._files.push(file);
    if (!skipOpen) this.openFile(file);
    this._mutationCounter += 1;
  }

  deleteFolder(filePath) {
    let idx;
    let isChanged = false;
    while ((idx = _.findLastIndex(this._files, f => f.filename.startsWith(filePath))) !== -1) {
      isChanged = true;
      this.closeFile(this._files[idx]);
      this._files.splice(idx, 1);
    }

    if (isChanged) {
      this._mutationCounter += 1;
    }
  }

  deleteFile(filename) {
    const idx = _.findIndex(this._files, {filename});
    if (idx !== -1) {
      this.closeFile(this._files[idx]);
      this._files.splice(idx, 1);
      this._mutationCounter += 1;
    }
  }

  async render() {
    // This flag is only for app didn't provide package.json
    // which contains aurelia-bootstrapper.
    const isAurelia1 = _.some(this._files, f => {
      const m = f.content.match(/\bconfigure\s*\(\s*(\w)+\s*\)/);
      if (!m) return false;
      const auVar = m[1];

      return _.includes(f.content, `${auVar}.start`) &&
        _.includes(f.content, `${auVar}.setRoot`);
    });

    // Get dependencies from package.json
    let deps = {};
    _.each(this._files, f => {
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
        this._files :
        this._files.filter(f => !f.isRendered)
    });

    await this.ws.perform({type: 'build'});

    this._files.forEach(f => f.isRendered = true);
    this.isRendered = true;
  }

  @computedFrom('editingFilenames', 'focusedEditingIndex', '_mutationCounter')
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

    _(this._files)
      .map(f => {
        const filename = path.normalize(f.filename);
        const parts = filename.split('/');
        const len = parts.length;
        return {filename, parts, len, f};
      })
      .sortBy(f => -f.len)
      .each(({filename, parts, len, f}) => {
        let branch = tree;
        _.each(parts, (p, i) => {
          if (i === len - 1) {
            // file
            branch.push({
              filePath: filename,
              dirPath: parts.slice(0, i).join('/'),
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
                dirPath: parts.slice(0, i).join('/'),
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
    if (this.editingFilenames.length - 1 < this.focusedEditingIndex) {
      this.focusedEditingIndex = this.editingFilenames.length - 1;
    }
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
