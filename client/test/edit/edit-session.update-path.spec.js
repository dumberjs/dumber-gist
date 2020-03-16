import test from 'tape-promise/tape';
import {EditSession} from '../../src/edit/edit-session';
import _ from 'lodash';

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
    let isNew;
    if (action.type === 'init') {
      isNew = !_.find(actions, {type: 'init'});
    }
    actions.push(action);
    if (action.type === 'init') {
      return {isNew};
    }
    if (action.type === 'build') {
      return 'entry-bundle';
    }
  }
};

const consoleLog = {
  dumberLogs: {
    push() {}
  }
}

test('EditSession updates path after rendering', async t => {
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
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updatePath('src/main.js', 'src/app.js');
  es.mutationChanged();

  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/app.js',
      content: 'main',
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
  t.deepEqual(actions.slice(4), [
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
      {
        filename: 'src/app.js',
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);
});

test('EditSession skips file path not existing after rendering', async t => {
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
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updatePath('src/app.js', 'src/app2.js');
  es.mutationChanged();

  t.deepEqual(published, [
    ['loaded-gist', undefined],
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
  t.deepEqual(actions.slice(4), [
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);
});

test('EditSession skips existing target file path after rendering', async t => {
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
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updatePath('src/main.js', 'index.html');
  es.mutationChanged();

  t.deepEqual(published, [
    ['loaded-gist', undefined],
    ['error', 'Cannot rename src/main.js to index.html because there is an existing file.']
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
  t.deepEqual(actions.slice(4), [
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);
});

test('EditSession update folder path after rendering', async t => {
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
        filename: 'src/foo/index.js',
        content: 'foo-index'
      },
      {
        filename: 'src/foo/bar/lo.js',
        content: 'foo-bar-lo'
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
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'src/foo/index.js',
        content: 'foo-index'
      },
      {
        filename: 'src/foo/bar/lo.js',
        content: 'foo-bar-lo'
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updatePath('src/foo', 'src/foo2');
  es.mutationChanged();

  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/main.js',
      content: 'main',
      isChanged: false
    },
    {
      filename: 'src/foo2/index.js',
      content: 'foo-index',
      isChanged: true
    },
    {
      filename: 'src/foo2/bar/lo.js',
      content: 'foo-bar-lo',
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
  t.deepEqual(actions.slice(4), [
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'src/foo2/index.js',
        content: 'foo-index'
      },
      {
        filename: 'src/foo2/bar/lo.js',
        content: 'foo-bar-lo'
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);

  t.ok(es.isRendered);
  t.ok(es.isChanged);
});

test('EditSession update file path without side effect after rendering', async t => {
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
        filename: 'src/foo/index.js',
        content: 'foo-index'
      },
      {
        filename: 'src/foo/bar/lo.js',
        content: 'foo-bar-lo'
      },
      {
        filename: 'src/fo',
        content: 'fo'
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
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'src/foo/index.js',
        content: 'foo-index'
      },
      {
        filename: 'src/foo/bar/lo.js',
        content: 'foo-bar-lo'
      },
      {
        filename: 'src/fo',
        content: 'fo'
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updatePath('src/fo', 'src/fo2');
  es.mutationChanged();

  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/main.js',
      content: 'main',
      isChanged: false
    },
    {
      filename: 'src/foo/index.js',
      content: 'foo-index',
      isChanged: false
    },
    {
      filename: 'src/foo/bar/lo.js',
      content: 'foo-bar-lo',
      isChanged: false
    },
    {
      filename: 'src/fo2',
      content: 'fo',
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
  t.deepEqual(actions.slice(4), [
    {type: 'init', config: {deps: {}}},
    {type: 'update', files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'src/foo/index.js',
        content: 'foo-index'
      },
      {
        filename: 'src/foo/bar/lo.js',
        content: 'foo-bar-lo'
      },
      {
        filename: 'src/fo2',
        content: 'fo'
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
    {type: 'build'},
    {type: 'sw:update-files', files:[
      {
        filename: 'index.html',
        content: 'index-html'
      },
      {
        filename: 'dist/entry-bundle.js',
        content: 'entry-bundle'
      }
    ]}
  ]);

  t.ok(es.isRendered);
  t.ok(es.isChanged);
});
