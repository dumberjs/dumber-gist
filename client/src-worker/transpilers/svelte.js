import path from 'path';
import {JsTranspiler} from './js';
import {LessTranspiler} from './less';
import {SassTranspiler} from './sass';

export class SvelteTranspiler {
  constructor() {
    this.jsTranspiler = new JsTranspiler();
    this.sassTranspiler = new SassTranspiler();
    this.lessTranspiler = new LessTranspiler();

    this.transpileCss = this.transpileCss.bind(this);
    this.transpileJs = this.transpileJs.bind(this);
  }

  match(file) {
    const ext = path.extname(file.filename);
    return ext === '.svelte';
  }

  _lazyLoad() {
    if (!this._promise) {
      this._promise = import('svelte/compiler');
    }

    return this._promise;
  }

  async transpileCss({content, attributes, filename}, files) {
    let ext = '.css';
    if (attributes.lang === 'scss' || (attributes.type && attributes.type.startsWith('text/scss'))) {
      ext = '.scss';
    } else if (attributes.lang === 'sass' || (attributes.type && attributes.type.startsWith('text/sass'))) {
      ext = '.sass';
    } else if (attributes.lang === 'less' || (attributes.type && attributes.type.startsWith('text/less'))) {
      ext = '.less';
    }

    const file = {filename: filename + ext, content};
    if (ext === '.scss' || ext === '.sass') {
      const result = await this.sassTranspiler.transpile(
        file,
        [...files, file]
      );
      return {
        code: result.content,
        map: result.sourceMap
      }
    } else if (ext === '.less') {
      const result = await this.lessTranspiler.transpile(
        file,
        [...files, file]
      );
      return {
        code: result.content,
        map: result.sourceMap
      }
    } else { // css pass through
      return {code: content};
    }
  }

  async transpileJs({content, filename}) {
    const result = await this.jsTranspiler.transpile(
      // Just go through typescript syntax for any js.
      {filename: filename + '.ts', content}
    );
    return {
      code: result.content,
      map: result.sourceMap
    };
  }

  async transpile(file, files) {
    if (!this.match(file)) throw new Error('Cannot use SvelteTranspiler for file: ' + file.filename);

    const {compile, preprocess} = await this._lazyLoad();

    const {filename, content} = file;

    const newFilename = file.filename + '.js';
    const preprocessed = await preprocess(
      content,
      {
        style: opts => this.transpileCss(opts, files),
        script: this.transpileJs
      },
      {filename: filename}
    );

    const compiled = compile(preprocessed.toString(), {
      filename: filename,
      format: 'esm',
      outputFilename: newFilename
    });

    let {code, map} = compiled.js;
    map.file = newFilename;
    map.sources = [filename];
    map.sourceRoot = '';

    return {
      filename: newFilename,
      content: code,
      sourceMap: map
    };
  }
}
