import {observable} from 'aurelia-framework';
import _ from 'lodash';
import path from 'path';

export class EditSession {
  _originalFiles = [];
  _files = [];

  @observable _mutationCounter = 0;
  fileTree = [];

  loadFiles(files) {
    this._originalFiles = _.map(files, f => ({filename: f.filename, content: f.content}));
    this._files = _.cloneDeep(this._originalFiles);

    if (this._mutationCounter !== 0) {
      this._mutationCounter = 0; // unset counter to 0, means files are in sync.
    } else {
      // Force state update.
      this._mutationCounterChanged();
    }

    console.log('load fileTree', this.fileTree);
  }

  _mutationCounterChanged() {
    this._updateFileTree();
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
}
