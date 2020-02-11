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

test('EditSession deletes folder after rendering', async t => {
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
        filename: 'src-js.js',
        content: 'src-js'
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
    {type: 'init', config: {deps: {}, dev: true}},
    {type: 'update', files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'src-js.js',
        content: 'src-js'
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

  es.deleteFolder('src');
  es.mutationChanged();

  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src-js.js',
      content: 'src-js',
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
    {type: 'init', config: {deps: {}, dev: true}},
    {type: 'update', files: [
      {
        filename: 'src-js.js',
        content: 'src-js'
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

test('EditSession deletes nested folder after rendering', async t => {
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
        filename: 'src/foo/lo.js',
        content: 'foo-lo'
      },
      {
        filename: 'src/foo/bar/bar.js',
        content: 'foo-bar-bar'
      },
      {
        filename: 'foo',
        content: 'foo'
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
    {type: 'init', config: {deps: {}, dev: true}},
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
        filename: 'src/foo/lo.js',
        content: 'foo-lo'
      },
      {
        filename: 'src/foo/bar/bar.js',
        content: 'foo-bar-bar'
      },
      {
        filename: 'foo',
        content: 'foo'
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

  es.deleteFolder('src/foo');
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
      filename: 'foo',
      content: 'foo',
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
    {type: 'init', config: {deps: {}, dev: true}},
    {type: 'update', files: [
      {
        filename: 'src/main.js',
        content: 'main'
      },
      {
        filename: 'foo',
        content: 'foo'
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


test('EditSession ignores deleting unknown folder after rendering', async t => {
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
        filename: 'src/foo/lo.js',
        content: 'foo-lo'
      },
      {
        filename: 'src/foo/bar/bar.js',
        content: 'foo-bar-bar'
      },
      {
        filename: 'foo',
        content: 'foo'
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
    {type: 'init', config: {deps: {}, dev: true}},
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
        filename: 'src/foo/lo.js',
        content: 'foo-lo'
      },
      {
        filename: 'src/foo/bar/bar.js',
        content: 'foo-bar-bar'
      },
      {
        filename: 'foo',
        content: 'foo'
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

  es.deleteFolder('foo/bar');
  es.mutationChanged();

  t.deepEqual(published, [
    ['loaded-gist', undefined],
    ['error', 'Cannot delete folder foo/bar because it does not exist.']
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
      filename: 'src/foo/index.js',
      content: 'foo-index',
      isChanged: false
    },
    {
      filename: 'src/foo/lo.js',
      content: 'foo-lo',
      isChanged: false
    },
    {
      filename: 'src/foo/bar/bar.js',
      content: 'foo-bar-bar',
      isChanged: false
    },
    {
      filename: 'foo',
      content: 'foo',
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
    {type: 'init', config: {deps: {}, dev: true}},
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
        filename: 'src/foo/lo.js',
        content: 'foo-lo'
      },
      {
        filename: 'src/foo/bar/bar.js',
        content: 'foo-bar-bar'
      },
      {
        filename: 'foo',
        content: 'foo'
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

