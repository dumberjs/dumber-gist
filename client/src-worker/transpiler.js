import path from 'path';
import {inject} from 'aurelia-dependency-injection';
import {SvelteTranspiler} from './transpilers/svelte';
import {Au2Transpiler} from './transpilers/au2';
import {JsTranspiler} from './transpilers/js';
import {SassTranspiler} from './transpilers/sass';
import {LessTranspiler} from './transpilers/less';
import {TextTranspiler} from './transpilers/text';

@inject(
  SvelteTranspiler,
  Au2Transpiler,
  JsTranspiler,
  SassTranspiler,
  LessTranspiler,
  TextTranspiler
)
export class Transpiler {
  constructor(...transpilers) {
    this.transpilers = transpilers;
  }

  findTranspiler(file, files) {
    return this.transpilers.find(t => t.match(file, files));
  }

  async transpile(file, files, opts) {
    const transpiler = this.findTranspiler(file, files);
    let result;

    if (transpiler) {
      result = await transpiler.transpile(file, files, opts);
    }

    if (result) {
      let moduleId = path.relative('src', result.filename);
      return {...result, moduleId};
    }
  }
}
