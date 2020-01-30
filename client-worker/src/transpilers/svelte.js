import path from 'path';
import {compile, preprocess} from 'svelte/compiler';
import _ from 'lodash';

export class SvelteTranspiler {
  match(file) {
    if (file.svelteProcessed) return;
    const ext = path.extname(file.filename);
    return ext === '.svelte';
  }

  async transpile(file) {
    if (!this.match(file)) throw new Error('Cannot use SvelteTranspiler for file: ' + file.filename);

    const preprocessed = await preprocess(code, {filename: 'src/App.svelte'});

    const compiled = compile(preprocessed.toString(), {filename: 'src/App.svelte', format: 'esm', outputFilename: 'src/App.svelte.js'});

    console.log('compiled', compiled);
    console.log(compiled.js.code);
    console.log(compiled.js.map);
  })


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
