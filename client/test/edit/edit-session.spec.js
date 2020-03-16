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

test('EditSession loads gist', t => {
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
  t.deepEqual(published, [
    ['loaded-gist', undefined]
  ]);
  t.equal(es.description, 'desc');
  t.notOk(es.isRendered);
  t.notOk(es.isChanged);
  t.end();
});

test('EditSession detects changed description', t => {
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
  t.deepEqual(published, [
    ['loaded-gist', undefined]
  ]);
  t.equal(es.description, 'desc');
  t.notOk(es.isRendered);
  t.notOk(es.isChanged);

  es.description = 'desc2';
  es._mutationCounter += 1;
  es.mutationChanged();

  t.deepEqual(published, [
    ['loaded-gist', undefined]
  ]);
  t.equal(es.description, 'desc2');
  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.end();
});

test('EditSession renders pass on deps from package.json', async t => {
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
        content: '{"dependencies":{"foo":"^1.0.0","bar":"~2.1.0"}}'
      }
    ]
  };

  es.loadGist(gist);
  t.deepEqual(published, [
    ['loaded-gist', undefined]
  ]);
  t.notOk(es.isRendered);
  t.notOk(es.isChanged);

  await es.render();
  es.mutationChanged();
  t.deepEqual(published, [
    ['loaded-gist', undefined]
  ]);
  t.ok(es.isRendered);
  t.notOk(es.isChanged);
  t.deepEqual(actions, [
    {type: 'init', config: {deps: {foo: '^1.0.0', bar: '~2.1.0'}}},
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
        content: '{"dependencies":{"foo":"^1.0.0","bar":"~2.1.0"}}'
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

