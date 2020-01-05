import test from 'tape-promise/tape';
import {EditSession} from '../../../src/edit/edit-session';
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
  }
};

test('EditSession updates path after rendering', async t => {
  clearUp();
  const es = new EditSession(ea, workerService);

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
  t.deepEqual(actions, [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
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
    {type: 'build'}
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
      isRendered: false,
      isChanged: true,
    },
    {
      filename: 'index.html',
      content: 'index-html',
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'package.json',
      content: '{"dependencies":{}}',
      isRendered: true,
      isChanged: false
    }
  ]);

  await es.render();
  t.deepEqual(actions.slice(3), [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
    {type: 'update', files: [
      {
        filename: 'src/app.js',
        content: 'main'
      }
    ]},
    {type: 'build'}
  ]);
});

test('EditSession skips file path not existing after rendering', async t => {
  clearUp();
  const es = new EditSession(ea, workerService);

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
  t.deepEqual(actions, [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
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
    {type: 'build'}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.updatePath('src/app.js', 'src/app2.js');
  es.mutationChanged();

  t.deepEqual(published, []);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/main.js',
      content: 'main',
      isRendered: true,
      isChanged: false,
    },
    {
      filename: 'index.html',
      content: 'index-html',
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'package.json',
      content: '{"dependencies":{}}',
      isRendered: true,
      isChanged: false
    }
  ]);

  await es.render();
  t.deepEqual(actions.slice(3), [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
    {type: 'update', files: []},
    {type: 'build'}
  ]);
});

test('EditSession update folder path after rendering', async t => {
  clearUp();
  const es = new EditSession(ea, workerService);

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
  t.deepEqual(actions, [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
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
    {type: 'build'}
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
      isRendered: true,
      isChanged: false,
    },
    {
      filename: 'src/foo2/index.js',
      content: 'foo-index',
      isRendered: false,
      isChanged: true
    },
    {
      filename: 'src/foo2/bar/lo.js',
      content: 'foo-bar-lo',
      isRendered: false,
      isChanged: true
    },
    {
      filename: 'index.html',
      content: 'index-html',
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'package.json',
      content: '{"dependencies":{}}',
      isRendered: true,
      isChanged: false
    }
  ]);

  await es.render();
  t.deepEqual(actions.slice(3), [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
    {type: 'update', files: [
      {
        filename: 'src/foo2/index.js',
        content: 'foo-index'
      },
      {
        filename: 'src/foo2/bar/lo.js',
        content: 'foo-bar-lo'
      }
    ]},
    {type: 'build'}
  ]);

  t.ok(es.isRendered);
  t.ok(es.isChanged);
});

test('EditSession update file path without side effect after rendering', async t => {
  clearUp();
  const es = new EditSession(ea, workerService);

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
  t.deepEqual(actions, [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
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
    {type: 'build'}
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
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'src/foo/index.js',
      content: 'foo-index',
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'src/foo/bar/lo.js',
      content: 'foo-bar-lo',
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'src/fo2',
      content: 'fo',
      isRendered: false,
      isChanged: true
    },
    {
      filename: 'index.html',
      content: 'index-html',
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'package.json',
      content: '{"dependencies":{}}',
      isRendered: true,
      isChanged: false
    }
  ]);

  await es.render();
  t.deepEqual(actions.slice(3), [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
    {type: 'update', files: [
      {
        filename: 'src/fo2',
        content: 'fo'
      }
    ]},
    {type: 'build'}
  ]);

  t.ok(es.isRendered);
  t.ok(es.isChanged);
});
