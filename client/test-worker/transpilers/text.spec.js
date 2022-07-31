import {test} from 'zora';
import {TextTranspiler} from '../../src-worker/transpilers/text';

test('TextTranspiler matches html/css/svg/xml/json files', t => {
  const jt = new TextTranspiler();
  t.ok(jt.match({filename: 'src/foo.html', content: ''}));
  t.ok(jt.match({filename: 'src/foo.css', content: ''}));
  t.ok(jt.match({filename: 'src/foo.svg', content: ''}));
  t.ok(jt.match({filename: 'src/foo.xml', content: ''}));
  t.ok(jt.match({filename: 'src/foo.json', content: ''}));
});

test('TextTranspiler does not match other files', t => {
  const jt = new TextTranspiler();
  t.notOk(jt.match({filename: 'src/foo.js', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.jsx', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.ts', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.tsx', content: ''}));
  t.notOk(jt.match({filename: 'src/foo.scss', content: ''}));
});

test('TextTranspiler passes through supported file', async t => {
  const jt = new TextTranspiler();
  const code = 'lorem';
  const file = await jt.transpile({
    filename: 'src/foo.html',
    content: code
  });

  t.equal(file.filename, 'src/foo.html');
  t.equal(file.content, code);
  t.notOk(file.sourceMap);
});

test('TextTranspiler cannot tranpile other file', async t => {
  const jt = new TextTranspiler();
  try {
    await jt.transpile({
      filename: 'src/foo.js',
      content: ''
    });
    t.fail('should not pass');
  } catch (e) {
    t.ok(true, e.message);
  }
});
