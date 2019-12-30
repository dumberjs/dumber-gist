import path from 'path';
import {JsTranspiler} from './transpilers/js';
import {SassTranspiler} from './transpilers/sass';
import {LessTranspiler} from './transpilers/less';
import {TextTranspiler} from './transpilers/text';

export class Transpiler {
  constructor() {
    this.transpilers = [
      new JsTranspiler(),
      new SassTranspiler(),
      new LessTranspiler(),
      new TextTranspiler()
    ];
  }

  findTranspiler(file) {
    return this.transpilers.find(t => t.match(file));
  }

  async transpile(file, files) {
    const transpiler = this.findTranspiler(file);
    let result;

    if (transpiler) {
      result = await transpiler.transpile(file, files);
    }

    if (result) {
      let moduleId = path.relative('src', result.filename);
      if (moduleId.endsWith('.js')) moduleId = moduleId.slice(0, -3);

      return {...result, moduleId};
    }
  }
}
