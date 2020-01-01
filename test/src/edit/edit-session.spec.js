import test from 'tape-promise/tape';
import {EditSession} from '../../../src/edit/edit-session';

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
  }
};

test('EditSession loads gist', t => {
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
  t.equal(es.description, 'desc');
  t.notOk(es.isRendered);
  t.notOk(es.isChanged);
  t.end();
});

test('EditSession detects changed description', t => {
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
  t.equal(es.description, 'desc');
  t.notOk(es.isRendered);
  t.notOk(es.isChanged);

  es.description = 'desc2';
  es._mutationCounter += 1;
  es.mutationChanged();

  t.equal(es.description, 'desc2');
  t.notOk(es.isRendered);
  t.ok(es.isChanged);
  t.end();
});
