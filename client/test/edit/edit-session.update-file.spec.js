import test from 'tape';
import {EditSession} from '../../src/edit/edit-session';

let actions = [];
let published = [];

function clearUp() {
  actions = [];
  published = [];
}

const ea = {
  publish(event, data) {
    published.push([event, data]);
  }
};

const workerService = {
  async perform(action) {
    actions.push(action);

    if (action.type === 'bundle') {
      // Test async
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(['bundled-files']);
        });
      });
    }
  }
};

const consoleLog = {
  dumberLogs: {
    push() {}
  }
}

test('EditSession updates file after rendering', async t => {
  clearUp();
  const es = new EditSession(ea, workerService, consoleLog);

  const gist = {
    description: 'desc',
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

  es.loadGist(gist);
  t.notOk(es.isRendered);
  t.notOk(es.isChanged);
  await es.render();
  es.mutationChanged();
  t.deepEqual(actions, [
    {type: 'bundle', files: [
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
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updateFile('src/main.js', 'main2');
  es.mutationChanged();

  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/main.js',
      content: 'main2',
      isChanged: true
    },
    {
      filename: 'index.html',
      content: 'index-html',
      isChanged: false
    },
    {
      filename: 'package.json',
      content: '{"dependencies":{}}',
      isChanged: false
    }
  ]);

  await es.render();
  es.mutationChanged();
  t.deepEqual(actions.slice(2), [
    {type: 'bundle', files: [
      {
        filename: 'src/main.js',
        content: 'main2'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);
});

test('EditSession skips unchanged update after rendering', async t => {
  clearUp();
  const es = new EditSession(ea, workerService, consoleLog);

  const gist = {
    description: 'desc',
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

  es.loadGist(gist);
  t.notOk(es.isRendered);
  t.notOk(es.isChanged);
  await es.render();
  es.mutationChanged();
  t.deepEqual(actions, [
    {type: 'bundle', files: [
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
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updateFile('src/main.js', 'main');
  es.mutationChanged();

  t.ok(es.isRendered);
  t.notOk(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/main.js',
      content: 'main',
      isChanged: false
    },
    {
      filename: 'index.html',
      content: 'index-html',
      isChanged: false
    },
    {
      filename: 'package.json',
      content: '{"dependencies":{}}',
      isChanged: false
    }
  ]);

  await es.render();
  es.mutationChanged();
  t.deepEqual(actions.slice(2), [
    {type: 'bundle', files: [
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
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);
});

test('EditSession skips update on file not existing after rendering', async t => {
  clearUp();
  const es = new EditSession(ea, workerService, consoleLog);

  const gist = {
    description: 'desc',
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

  es.loadGist(gist);
  t.notOk(es.isRendered);
  t.notOk(es.isChanged);
  await es.render();
  es.mutationChanged();
  t.deepEqual(actions, [
    {type: 'bundle', files: [
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
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updateFile('src/app.js', 'app');
  es.mutationChanged();

  t.deepEqual(published, [
    ['loaded-gist', undefined],
    ['error', 'Cannot update src/app.js because it does not exist.']
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/main.js',
      content: 'main',
      isChanged: false
    },
    {
      filename: 'index.html',
      content: 'index-html',
      isChanged: false
    },
    {
      filename: 'package.json',
      content: '{"dependencies":{}}',
      isChanged: false
    }
  ]);

  await es.render();
  es.mutationChanged();
  t.deepEqual(actions.slice(2), [
    {type: 'bundle', files: [
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
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);
});

test('EditSession updates file again during rendering', async t => {
  clearUp();
  const es = new EditSession(ea, workerService, consoleLog);

  const gist = {
    description: 'desc',
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

  es.loadGist(gist);
  t.notOk(es.isRendered);
  t.notOk(es.isChanged);
  await es.render();
  es.mutationChanged();
  t.deepEqual(actions, [
    {type: 'bundle', files: [
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
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updateFile('src/main.js', 'main2');
  es.mutationChanged();

  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/main.js',
      content: 'main2',
      isChanged: true
    },
    {
      filename: 'index.html',
      content: 'index-html',
      isChanged: false
    },
    {
      filename: 'package.json',
      content: '{"dependencies":{}}',
      isChanged: false
    }
  ]);

  // update file again after next render
  setTimeout(() => {
    es.updateFile('src/main.js', 'main3');
  });

  await es.render();
  es.mutationChanged();

  t.deepEqual(actions.slice(2), [
    {type: 'bundle', files: [
      {
        filename: 'src/main.js',
        content: 'main2'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);
  t.notOk(es.isRendered); // has new change to render
  t.ok(es.isChanged);

  await es.render();
  es.mutationChanged();

  t.deepEqual(actions.slice(4), [
    {type: 'bundle', files: [
      {
        filename: 'src/main.js',
        content: 'main3'
      },
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'package.json',
        content: '{"dependencies":{}}'
      }
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);
  t.ok(es.isRendered);
  t.ok(es.isChanged);
});