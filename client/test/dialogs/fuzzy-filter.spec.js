import {test} from 'zora';
import {fuzzyFilter} from '../../src/dialogs/fuzzy-filter';

test('fuzzyFilter returns original list', t => {
  t.deepEqual(
    fuzzyFilter('', ['foo', 'bar', 'lo']),
    [['foo'], ['bar'], ['lo']]
  );
});

test('fuzzyFilter returns sorted filtered list', t => {
  t.deepEqual(
    fuzzyFilter('o', ['foo', 'bar', 'lo']),
    [['l', 'o'], ['f', 'o', 'o']]
  );
});

test('fuzzyFilter returns sorted filtered list, case2', t => {
  const list = ['package.json', 'src/main.js', 'src/app.html', 'src/app.js', 'index.html'];
  t.deepEqual(
    fuzzyFilter(' aj ', list),
    [
      ['p', 'a', 'ckage.', 'j', 'son'],
      ['src/m', 'a', 'in.', 'j', 's'],
      ['src/', 'a', 'pp.', 'j', 's']
    ]
  );
});

test('fuzzyFilter returns sorted filtered list, case3', t => {
  const list = ['package.json', 'src/main.js', 'src/app.html', 'src/app.js', 'index.html'];
  t.deepEqual(
    fuzzyFilter('smain', list),
    [
      ['', 's', 'rc/', 'main', '.js'],
    ]
  );
});

test('fuzzyFilter returns sorted filtered list, case4', t => {
  const list = ['package.json', 'src/main.js', 'src/app.html', 'src/app.js', 'index.html'];
  t.deepEqual(
    fuzzyFilter('js', list),
    [
      ['src/main.', 'js'],
      ['src/app.', 'js'],
      ['package.', 'js', 'on']
    ]
  );
});
