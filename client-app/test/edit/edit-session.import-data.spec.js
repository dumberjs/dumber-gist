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

test('EditSession imports data', t => {
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
  t.equal(es.description, 'new-desc');
  t.equal(es.files.length, 0);
  t.equal(es.gist, newGist);
  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.end();
});

test('EditSession imports data with only files', t => {
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
  t.end();
});
