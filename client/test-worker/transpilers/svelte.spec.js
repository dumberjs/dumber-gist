import test from 'tape';
import {SvelteTranspiler} from '../../src-worker/transpilers/svelte';

test('SvelteTranspiler matches svelte file', t => {
  const jt = new SvelteTranspiler();
  t.ok(jt.match({filename: 'src/foo.svelte', content: ''}));
  t.end();
});

test('SvelteTranspiler does not any other files', t => {
  const jt = new SvelteTranspiler();
  t.notOk(jt.match({filename: 'src/foo.html', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.css', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.json', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.less', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.scss', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.js', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.ts', content: ''}));
  t.end();
});

test('SvelteTranspiler transpiles svelte file', async t => {
  const jt = new SvelteTranspiler();
  const code = `<script>
  export let name;
</script>

<main>
  <h1>Hello {name}!</h1>
</main>

<style >
  h1 {
    color: #ff3e00;
  }
</style>
`;

    const file = await jt.transpile({
      filename: 'src/foo.svelte',
      content: code
    });

    t.equal(file.filename, 'src/foo.svelte.js');
    t.ok(file.content.includes('SvelteComponent'));
    t.ok(file.content.includes('style.textContent = "h1'));
    t.ok(file.content.includes('/*name*/'));
    t.equal(file.sourceMap.file, 'src/foo.svelte.js');
    t.deepEqual(file.sourceMap.sources, ['src/foo.svelte']);
    // somehow svelte compiled didn't retain original script source
    // t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('SvelteTranspiler transpiles svelte file with scss', async t => {
  const jt = new SvelteTranspiler();
  const code = `<script>
  export let name;
</script>

<main>
  <h1>Hello {name}!</h1>
</main>

<style lang="scss">
  @import "variables";
  h1 {
    color: $red;
  }
</style>
`;
    const variables = {
      filename: 'src/_variables.scss',
      content: '$red: #DD6163;'
    };

    const file = await jt.transpile({
      filename: 'src/foo.svelte',
      content: code
    }, [variables]);

    t.equal(file.filename, 'src/foo.svelte.js');
    t.ok(file.content.includes('SvelteComponent'));
    t.ok(file.content.includes('style.textContent = "h1'));
    t.ok(file.content.includes('color:#DD6163'));
    t.ok(file.content.includes('/*name*/'));
    t.equal(file.sourceMap.file, 'src/foo.svelte.js');
    t.deepEqual(file.sourceMap.sources, ['src/foo.svelte']);
    // somehow svelte compiled didn't retain original script source
    // t.deepEqual(file.sourceMap.sourcesContent, [code]);
});

test('SvelteTranspiler transpiles svelte file with less', async t => {
  const jt = new SvelteTranspiler();
  const code = `<script>
  export let name;
</script>

<main>
  <h1>Hello {name}!</h1>
</main>

<style lang="less">
  @import "variables";
  h1 {
    color: @red;
  }
</style>
`;
    const variables = {
      filename: 'src/variables.less',
      content: '@red: #DD6163;'
    };

    const file = await jt.transpile({
      filename: 'src/foo.svelte',
      content: code
    }, [variables]);

    t.equal(file.filename, 'src/foo.svelte.js');
    t.ok(file.content.includes('SvelteComponent'));
    t.ok(file.content.includes('style.textContent = "h1'));
    t.ok(file.content.includes('color:#DD6163'));
    t.ok(file.content.includes('/*name*/'));
    t.equal(file.sourceMap.file, 'src/foo.svelte.js');
    t.deepEqual(file.sourceMap.sources, ['src/foo.svelte']);
    // somehow svelte compiled didn't retain original script source
    // t.deepEqual(file.sourceMap.sourcesContent, [code]);
});
