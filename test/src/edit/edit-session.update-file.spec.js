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

test('EditSession updates file after rendering', async t => {
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

  es.updateFile({filename: 'src/main.js', content:'main2'});
  es.mutationChanged();

  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.deepEqual(es.files, [
    {
      filename: 'src/main.js',
      content: 'main2',
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
        filename: 'src/main.js',
        content: 'main2'
      }
    ]},
    {type: 'build'}
  ]);
});

test('EditSession skips unchanged update after rendering', async t => {
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

  es.updateFile({filename: 'src/main.js', content:'main'});
  es.mutationChanged();

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

test('EditSession skips update on file not existing after rendering', async t => {
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

  es.updateFile({filename: 'src/app.js', content:'app'});
  es.mutationChanged();

  t.deepEqual(published, [
    ['error', 'Cannot update src/app.js because it does not exist.']
  ]);

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

  t.ok(es.isRendered);
  t.notOk(es.isChanged);
});
