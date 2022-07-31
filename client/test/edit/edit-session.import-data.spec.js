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

test('EditSession imports data', t => {
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

  const newGist = {
    description: 'new-gist-desc',
    files: [
      {
        filename: 'src/main.js',
        content: 'main2'
      }
    ]
  };

  es.loadGist(gist);
  es.importData({
    description: 'new-desc',
    files: [],
    gist: newGist
  });
  es.mutationChanged();
  t.deepEqual(published, [
    ['loaded-gist', undefined],
    ['imported-data', undefined]
  ]);
  t.equal(es.description, 'new-desc');
  t.equal(es.files.length, 0);
  t.equal(es.gist, newGist);
  t.notOk(es.isRendered);
  t.ok(es.isChanged);
});

test('EditSession imports data with only files', t => {
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
  es.importData({
    files: [
      {
        filename: 'foo.js',
        content: 'foo',
        isChanged: true
      },
      {
        filename: 'index.html',
        content: 'html',
        isChanged: false
      }
    ]
  });
  es.mutationChanged();
  t.deepEqual(published, [
    ['loaded-gist', undefined],
    ['imported-data', undefined]
  ]);
  t.equal(es.description, 'desc');
  t.deepEqual(es.files, [
    {
      filename: 'foo.js',
      content: 'foo',
      isChanged: true
    },
    {
      filename: 'index.html',
      content: 'html',
      isChanged: false
    }
  ]);
  t.equal(es.gist, gist);
  t.notOk(es.isRendered);
  t.ok(es.isChanged);
});
