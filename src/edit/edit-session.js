import {inject, observable} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';
import {WorkerService} from '../worker-service';

@inject(EventAggregator, WorkerService)
export class EditSession {
  _gist = null;
  files = [];
  description = '';

  // mutation value 0 and -1 is reserved
  // for just newly loaded gist.
  @observable mutation = -1;
  isRendered = false;
  isChanged = false;

  constructor(ea, ws) {
    this.ea = ea;
    this.ws = ws;
  }

  _mutate() {
    if (this.mutation >= 9999) {
      this.mutation = 1;
    } else if (this.mutation < 0) {
      this.mutation = 1;
    } else {
      this.mutation += 1;
    }
  }

  mutationChanged() {
    this.isRendered = _.every(this.files, 'isRendered');
    this.isChanged = _.some(this.files, 'isChanged') ||
      this.files.length !== this._gist.files.length ||
      this.description !== this._gist.description;
  }

  loadGist(gist) {
    this._gist = gist;
    this.files = _.map(this._gist.files, f => ({
      filename: f.filename,
      content: f.content,
      isRendered: false,
      isChanged: false
    }));
    this.description = gist.description;

    // set mutation to 0 or -1 to indicate
    // newly loaded gist.
    if (this.mutation === 0) {
      this.mutation = -1;
    } else {
      this.mutation = 0;
    }
  }

  updateFile({filename, content}) {
    const f = _.find(this.files, {filename});
    const oldF = _.find(this._gist.files, {filename});

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

        isChanged = true;
        const oldFilename = file.filename;
        file.filename = newFilePath;
        file.isRendered = false;
        const oldF = _.find(this._gist.files, {filename: newFilePath});
        file.isChanged = !oldF || oldF.content !== file.content;

        this.ea.publish('renamed-file', {
          newFilename: newFilePath,
          oldFilename
        });
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
    if (!skipOpen) this.ea.publish('open-file', filename);
    this._mutate();
  }

  deleteFolder(filePath) {
    let idx;
    let isChanged = false;
    while ((idx = _.findLastIndex(this.files, f => f.filename.startsWith(filePath))) !== -1) {
      isChanged = true;
      this.files.splice(idx, 1);
    }

    if (isChanged) {
      this._mutate();
    }
  }

  deleteFile(filename) {
    const idx = _.findIndex(this.files, {filename});
    if (idx !== -1) {
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
    });

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
}
