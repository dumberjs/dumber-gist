import test from 'tape-promise/tape';
import {OpenedFiles} from '../../src/edit/opened-files';

const bindingEngine = {
  propertyObserver() {
    return {
      subscribe() {}
    };
  }
};

let published = [];

function clearUp() {
  published = [];
}

const ea = {
  subscribe() {},
  publish(event, data) {
    published.push([event, data]);
  }
};

test('OpenedFiles opens nothing by default', t => {
  clearUp();
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]
  };

  const fs = new OpenedFiles(ea, session, bindingEngine);
  fs._reset();

  t.equal(fs.filenames.length, 0);
  t.equal(fs.focusedIndex, -1);
  t.end();
});

test('OpenedFiles opens/closes file', t => {
  clearUp();
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]
  };

  const fs = new OpenedFiles(ea, session, bindingEngine);

  fs.openFile('index.html');
  t.deepEqual(fs.filenames, ['index.html']);
  t.equal(fs.focusedIndex, 0);
  t.deepEqual(published, [
    ['opened-file', 'index.html']
  ]);
  t.equal(fs.editingFile.filename, 'index.html');

  fs.openFile('src/main.js');
  t.deepEqual(fs.filenames, ['index.html', 'src/main.js']);
  t.equal(fs.focusedIndex, 1);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js']
  ]);
  t.equal(fs.editingFile.filename, 'src/main.js');

  fs.openFile('unexpected/file.name');
  t.deepEqual(fs.filenames, ['index.html', 'src/main.js']);
  t.equal(fs.focusedIndex, 1);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js']
  ]);
  t.equal(fs.editingFile.filename, 'src/main.js');

  fs.openFile('package.json');
  t.deepEqual(fs.filenames, ['index.html', 'src/main.js', 'package.json']);
  t.equal(fs.focusedIndex, 2);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json']
  ]);
  t.equal(fs.editingFile.filename, 'package.json');

  fs.closeFile('src/main.js')
  t.deepEqual(fs.filenames, ['index.html', 'package.json']);
  t.equal(fs.focusedIndex, 1);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json'],
    ['closed-file', 'src/main.js']
  ]);
  t.equal(fs.editingFile.filename, 'package.json');

  fs.closeFile('unexpected/file.name')
  t.deepEqual(fs.filenames, ['index.html', 'package.json']);
  t.equal(fs.focusedIndex, 1);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json'],
    ['closed-file', 'src/main.js']
  ]);
  t.equal(fs.editingFile.filename, 'package.json');

  fs.closeFile('package.json')
  t.deepEqual(fs.filenames, ['index.html']);
  t.equal(fs.focusedIndex, 0);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json'],
    ['closed-file', 'src/main.js'],
    ['closed-file', 'package.json']
  ]);
  t.equal(fs.editingFile.filename, 'index.html');

  fs.closeFile('index.html')
  t.equal(fs.filenames.length, 0);
  t.equal(fs.focusedIndex, -1);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json'],
    ['closed-file', 'src/main.js'],
    ['closed-file', 'package.json'],
    ['closed-file', 'index.html']
  ]);
  t.notOk(fs.editingFile);
  t.end();
});

test('OpenedFiles closes file case 1', t => {
  clearUp();
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]
  };

  const fs = new OpenedFiles(ea, session, bindingEngine);

  fs.openFile('index.html');
  fs.openFile('src/main.js');
  fs.openFile('package.json');
  fs.focusedIndex = 0;

  fs.closeFile('src/main.js')
  t.deepEqual(fs.filenames, ['index.html', 'package.json']);
  t.equal(fs.focusedIndex, 0);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json'],
    ['closed-file', 'src/main.js']
  ]);
  t.equal(fs.editingFile.filename, 'index.html');

  fs.closeFile('index.html')
  t.deepEqual(fs.filenames, ['package.json']);
  t.equal(fs.focusedIndex, 0);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json'],
    ['closed-file', 'src/main.js'],
    ['closed-file', 'index.html']
  ]);
  t.equal(fs.editingFile.filename, 'package.json');
  t.end();
});

test('OpenedFiles closes file case 2', t => {
  clearUp();
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]
  };

  const fs = new OpenedFiles(ea, session, bindingEngine);

  fs.openFile('index.html');
  fs.openFile('src/main.js');
  fs.openFile('package.json');
  fs.focusedIndex = 0;

  fs.closeFile('index.html')
  t.deepEqual(fs.filenames, ['src/main.js', 'package.json']);
  t.equal(fs.focusedIndex, 0);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json'],
    ['closed-file', 'index.html']
  ]);
  t.equal(fs.editingFile.filename, 'src/main.js');
  t.end();
});

test('OpenedFiles opens opened file', t => {
  clearUp();
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]
  };

  const fs = new OpenedFiles(ea, session, bindingEngine);

  fs.openFile('index.html');
  fs.openFile('src/main.js');
  fs.openFile('package.json');

  fs.openFile('index.html');

  t.deepEqual(fs.filenames, ['index.html', 'src/main.js', 'package.json']);
  t.equal(fs.focusedIndex, 0);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json'],
    ['opened-file', 'index.html']
  ]);
  t.equal(fs.editingFile.filename, 'index.html');
  t.end();
});

test('OpenedFiles renames opened file case 1', t => {
  clearUp();
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]
  };

  const fs = new OpenedFiles(ea, session, bindingEngine);

  fs.openFile('index.html');
  fs.openFile('src/main.js');
  fs.openFile('package.json');

  session.files[0].filename = 'src/index.js';
  fs.afterRenameFile('src/main.js', 'src/index.js');

  t.deepEqual(fs.filenames, ['index.html', 'src/index.js', 'package.json']);
  t.equal(fs.focusedIndex, 2);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json']
  ]);
  t.equal(fs.editingFile.filename, 'package.json');
  t.end();
});

test('OpenedFiles renames opened file case 2', t => {
  clearUp();
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]
  };

  const fs = new OpenedFiles(ea, session, bindingEngine);

  fs.openFile('index.html');
  fs.openFile('src/main.js');
  fs.openFile('package.json');
  fs.focusedIndex = 1;

  session.files[0].filename = 'src/index.js';
  fs.afterRenameFile('src/main.js', 'src/index.js');

  t.deepEqual(fs.filenames, ['index.html', 'src/index.js', 'package.json']);
  t.equal(fs.focusedIndex, 1);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json']
  ]);
  t.equal(fs.editingFile.filename, 'src/index.js');
  t.end();
});

test('OpenedFiles syncs with session', t => {
  clearUp();
  const session = {
    files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]
  };

  const fs = new OpenedFiles(ea, session, bindingEngine);

  fs.openFile('index.html');
  fs.openFile('src/main.js');
  fs.openFile('package.json');
  session.files = [
    {
      filename: 'index.html',
      content: 'index-html'
    },
    {
      filename: 'src/app.js',
      content: 'app'
    }
  ];

  fs._cleanUp();
  t.deepEqual(fs.filenames, ['index.html']);
  t.equal(fs.focusedIndex, 0);
  t.deepEqual(published, [
    ['opened-file', 'index.html'],
    ['opened-file', 'src/main.js'],
    ['opened-file', 'package.json']
  ]);
  t.equal(fs.editingFile.filename, 'index.html');
  t.end();
});
