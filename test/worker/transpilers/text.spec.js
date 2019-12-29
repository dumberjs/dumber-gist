import test from 'ava';
import {TextTranspiler} from '../../../worker/transpilers/text';

test('TextTranspiler matches html/css/svg/xml/json files', t => {
  const jt = new TextTranspiler();
  t.truthy(jt.match({filename: 'src/foo.html', content: ''}));
  t.truthy(jt.match({filename: 'src/foo.css', content: ''}));
  t.truthy(jt.match({filename: 'src/foo.svg', content: ''}));
  t.truthy(jt.match({filename: 'src/foo.xml', content: ''}));
  t.truthy(jt.match({filename: 'src/foo.json', content: ''}));
});

test('TextTranspiler does not match other files', t => {
  const jt = new TextTranspiler();
  t.falsy(jt.match({filename: 'src/foo.js', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.jsx', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.ts', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.tsx', content: ''}));
  t.falsy(jt.match({filename: 'src/foo.scss', content: ''}));
});

test('TextTranspiler passes through supported file', t => {
  const jt = new TextTranspiler();
  const code = 'lorem';
  const file = jt.transpile({
    filename: 'src/foo.html',
    content: code
  });

  t.is(file.filename, 'src/foo.html');
  t.is(file.content, code);
  t.falsy(file.sourceMap);
});

test('TextTranspiler cannot tranpile other file', t => {
  const jt = new TextTranspiler();
  t.throws(() => jt.transpile({
    filename: 'src/foo.js',
    content: ''
  }));
});
