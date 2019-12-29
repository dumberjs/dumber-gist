import path from 'path';
import {JsTranspiler} from './transpilers/js';
import {TextTranspiler} from './transpilers/text';

export class Transpiler {
  constructor() {
    this.transpilers = [
      new JsTranspiler(),
      new TextTranspiler()
    ];
  }

  findTranspiler(file) {
    return this.transpilers.find(t => t.match(file));
  }

  transpile(file) {
    const transpiler = this.findTranspiler(file);
    let result;

    if (transpiler) {
      result = transpiler.transpile(file);
    }

    if (result) {
      let moduleId = path.relative('src', result.filename);
      if (moduleId.endsWith('.js')) moduleId = moduleId.slice(0, -3);

      return {...result, moduleId};
    }
  }
}
