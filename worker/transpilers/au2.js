import path from 'path';
import {preprocess, preprocessOptions} from '@aurelia/plugin-conventions';
import _ from 'lodash';

const au2Options = preprocessOptions({
  useProcessedFilePairFilename: true,
  stringModuleWrap: id => `text!${id}`
});

const EXTS = ['.html', '.js', '.ts'];

export class Au2Transpiler {
  match(file, files) {
    if (file.au2Processed) return;
    const ext = path.extname(file.filename);

    if (!EXTS.includes(ext)) return;

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

  async transpile(file, files) {
    if (!this.match(file, files)) throw new Error('Cannot use Au2Transpiler for file: ' + file.filename);

    const result = preprocess(
      {
        path: file.filename,
        contents: file.content
      },
      au2Options,
      filePath => !!_.find(files, {filename: filePath})
    );

    if (result) {
      const ext = path.extname(file.filename);
      const newFilename = file.filename + (ext === '.html' ? '.js': '');

      return {
        filename: newFilename,
        content: result.code,
        au2Processed: true,
        intermediate: true
        // ignore result.map for now
      };
    }
  }
}
