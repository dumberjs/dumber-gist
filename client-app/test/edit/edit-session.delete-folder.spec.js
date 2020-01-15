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
    {type: 'init', config: {isAurelia1: false, deps: {}}},
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
    {type: 'build'}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.deleteFolder('src');
  es.mutationChanged();

  t.ok(es.isRendered);
  t.ok(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src-js.js',
      content: 'src-js',
      isRendered: true,
      isChanged: false
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
es.mutationChanged();
    t.deepEqual(actions.slice(3), [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
    {type: 'update', files: []},
    {type: 'build'}
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
    {type: 'build'}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.deleteFolder('src/foo');
  es.mutationChanged();

  t.ok(es.isRendered);
  t.ok(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/main.js',
      content: 'main',
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'foo',
      content: 'foo',
      isRendered: true,
      isChanged: false
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
  es.mutationChanged();
  t.deepEqual(actions.slice(3), [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
    {type: 'update', files: []},
    {type: 'build'}
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
    {type: 'build'}
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);

  es.deleteFolder('foo/bar');
  es.mutationChanged();

  t.deepEqual(published, [
    ['error', 'Cannot delete folder foo/bar because it does not exist.']
  ]);

  t.ok(es.isRendered);
  t.notOk(es.isChanged);
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
      filename: 'src/foo/lo.js',
      content: 'foo-lo',
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'src/foo/bar/bar.js',
      content: 'foo-bar-bar',
      isRendered: true,
      isChanged: false
    },
    {
      filename: 'foo',
      content: 'foo',
      isRendered: true,
      isChanged: false
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
  es.mutationChanged();
  t.deepEqual(actions.slice(3), [
    {type: 'init', config: {isAurelia1: false, deps: {}}},
    {type: 'update', files: []},
    {type: 'build'}
  ]);
});

