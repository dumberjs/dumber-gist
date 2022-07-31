import {test} from 'zora';
import {EditSession} from '../../src/edit/edit-session';

function makeEa(published) {
  return {
    publish(event, data) {
      published.push([event, data]);
    }
  };
}

function makeWorkerService(actions) {
  return {
    async perform(action) {
      actions.push(action);

      if (action.type === 'bundle') {
        return ['bundled-files'];
      }
    }
  };
}

const consoleLog = {
  dumberLogs: {
    push() {}
  }
}

test('EditSession loads gist', t => {
  const actions = [];
  const published = [];

  const ea = makeEa(published);
  const workerService = makeWorkerService(actions);
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
});

test('EditSession detects changed description', t => {
  const actions = [];
  const published = [];

  const ea = makeEa(published);
  const workerService = makeWorkerService(actions);
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
});

test('EditSession renders pass on deps from package.json', async t => {
  const actions = [];
  const published = [];

  const ea = makeEa(published);
  const workerService = makeWorkerService(actions);
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
        content: '{"dependencies":{"foo":"^1.0.0","bar":"~2.1.0"}}'
      }
    ]},
    {type: 'sw:update-files', files:['bundled-files']}
  ]);
});
