import path from 'path';
import {JsTranspiler} from './js';
import _ from 'lodash';

const EXTS = ['.html', '.js', '.ts'];

export class Au2Transpiler {
  constructor() {
    this.jsTranspiler = new JsTranspiler();
  }

  match(file, files) {
    const ext = path.extname(file.filename);
    if (!EXTS.includes(ext)) return false;

    const packageJson = _.find(files, {filename: 'package.json'});
    if (packageJson) {
      try {
        const meta = JSON.parse(packageJson.content);
        // package "aurelia" is for aurelia 2
        return _.has(meta, 'dependencies.aurelia');
      } catch (e) {
        // ignore
      }
    }
  }

  _lazyLoad() {
    if (!this._promise) {
      this._promise = import('@aurelia/plugin-conventions');
    }

    return this._promise;
  }

  async transpile(file, files) {
    if (!this.match(file, files)) throw new Error('Cannot use Au2Transpiler for file: ' + file.filename);

    const au2 = await this._lazyLoad();

    const au2Options = au2.preprocessOptions({
      useProcessedFilePairFilename: true,
      stringModuleWrap: id => `text!${id}`,
      hmr: false
    });

    const result = au2.preprocess(
      {
        path: file.filename,
        contents: file.content
      },
      au2Options,
      (unit, filePath) => {
        let resolved = path.resolve(path.dirname(unit.path), filePath);
        // in browser env, path.resolve('src', './app.html') yields '/src/app.html'
        // Remove leading "/"
        resolved = resolved.substring(1);
        return !!_.find(files, {filename: resolved});
      },
      (unit, filePath) => {
        let resolved = path.resolve(path.dirname(unit.path), filePath);
        // in browser env, path.resolve('src', './app.html') yields '/src/app.html'
        // Remove leading "/"
        resolved = resolved.substring(1);
        const file = _.find(files, {filename: resolved});
        if (file) {
          return file.content;
        }
        return "";
      },
    );

    if (result) {
      const ext = path.extname(file.filename);
      const newFilename = file.filename + (ext === '.html' ? '.js': '');

      return this.jsTranspiler.transpile(
        // ignore result.map for now
        {filename: newFilename, content: result.code},
        files
      );
    }
  }
}
