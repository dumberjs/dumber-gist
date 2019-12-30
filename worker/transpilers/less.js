import path from 'path';
import createLess from 'less/lib/less';
import AbstractFileManager from 'less/lib/less/environment/abstract-file-manager';
import PluginLoader from 'less/lib/less-browser/plugin-loader';
import _ from 'lodash';

class FileManager extends AbstractFileManager {
  files = {};

  resetFiles() {
    this.files = {};
  }

  setFiles(files) {
    this.files = files;
  }

  alwaysMakePathsAbsolute() {
    return false; // test true/false
  }

  supports() {
    return true;
  }

  loadFile(filename, currentDirectory, options) {
    if (currentDirectory && !this.isPathAbsolute(filename)) {
        filename = currentDirectory + filename;
    }

    filename = options.ext ? this.tryAppendExtension(filename, options.ext) : filename;

    return new Promise((resolve, reject) => {
      if (this.files[filename]) {
        resolve({filename, contents: this.files[filename]});
      } else {
        reject({filename, message: `less.js file manager cannot find file "${filename}"`});
      }
    });
  }
}

const fileManager = new FileManager();
const less = createLess(null, [fileManager]);
less.PluginLoader = PluginLoader;

export class LessTranspiler {
  match(file) {
    const ext = path.extname(file.filename);
    return ext === '.less';
  }

  async transpile(file, files) {
    const {filename, content} = file;
    if (!this.match(file)) throw new Error('Cannot use LessTranspiler for file: ' + filename);

    const ext = path.extname(filename);

    const cssFiles = {};
    _.each(files, f => {
      const ext = path.extname(f.filename);
      if (ext === '.less' || ext === '.css') {
        const relative = path.relative(path.dirname(filename), f.filename);
        cssFiles[relative] = f.content;
      }
    });

    fileManager.setFiles(cssFiles);

    const result = await less.render(content, {
      // TODO find a way to enable source map in browser.
      // The default less environment did not implement
      // getSourceMapGenerator.
      // The default less-browser env (we did not use) did
      // not implement it either.
      // It's possible to turn on, but less uses source-map
      // version 0.6.x, not latested 0.7.x that dumber uses.

      // sourceMap: {
      //   outputSourceFiles: true
      // }
    });
    console.log('result ' + JSON.stringify(result, null , 2));
    const {css} = result;
    const newFilename = filename.slice(0, -ext.length) + '.css';
    // const sourceMap = JSON.parse(map);
    // sourceMap.file = newFilename;

    return {
      filename: newFilename,
      content: css
      // sourceMap: sourceMap
    };
  }
}
