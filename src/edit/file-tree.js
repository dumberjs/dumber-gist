import {inject, BindingEngine} from 'aurelia-framework';
import {EditSession} from './edit-session';
import _ from 'lodash';
import path from 'path';

@inject(EditSession, BindingEngine)
export class FileTree {
  tree = [];

  constructor(session, bindingEngine) {
    this._updateTree = this._updateTree.bind(this);
    this.session = session;
    bindingEngine.propertyObserver(session, 'mutation').subscribe(this._updateTree);
    this._updateTree();
  }

  _updateTree() {
    const tree = [];

    _(this.session.files)
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
    this.tree = tree;
  }
}

function markIsChanged(tree) {
  let isChanged = false;

  _.each(tree, branch => {
    if (branch.files) {
      branch.isChanged = markIsChanged(branch.files);
    }

    if (branch.isChanged) {
      isChanged = true;
    }
  });

  return isChanged;
}
