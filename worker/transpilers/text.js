import path from 'path';

const EXTS = ['.html', '.css', '.svg', '.xml', '.json'];

export class TextTranspiler {
  match(file) {
    const ext = path.extname(file.filename);
    return EXTS.indexOf(ext) !== -1;
  }

  transpile(file) {
    if (!this.match(file)) throw new Error('Cannot use TextTranspiler for file: ' + file.filename);
    return file;
  }
}
