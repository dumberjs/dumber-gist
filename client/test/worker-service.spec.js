import test from 'tape';
import {WorkerService} from '../src/worker-service';

let actions = [];
let published = [];

function clearUp() {
  actions = [];
  published = [];
}

const ea = {
  publish(event, data) {
    published.push([event, data]);
  },
  subscribe() {}
}

class TestWorkerService extends WorkerService {
  constructor() {
    super(ea);
  }

  _bootUpBundlerWorker() {
    this.bundler = {
      postMessage: action => {
        actions.push({...action, toBundler: true});
      }
    };
    this._dumberWorkerUp = Promise.resolve();
  }

  _bootUpServiceWorker() {
    this.iframe = {
      contentWindow: {
        postMessage: action => {
          actions.push(action);
        }
      }
    };
    this._serviceWorkerUp = Promise.resolve();
  }
}

test('WorkerService queues and executes action', async t => {
  clearUp();
  const w = new TestWorkerService();
  t.notOk(w.isWaiting);

  const j = w.perform({type: 'work1', data: {a:1}});

  setTimeout(() => {
    t.ok(w.isWaiting);
    t.deepEqual(actions, [{id: 0, type: 'work1', data: {a:1}, toBundler: true}]);
    t.equal(published.length, 0);

    w._workerSaid({
      data: {
        type: 'ack',
        id: 0,
        data: { result: 1 }
      }
    });
  });

  const result = await j;
  t.deepEqual(result, {result: 1});
  t.notOk(w.isWaiting);
  t.equal(actions.length, 1);
  t.equal(published.length, 0);
});


test('WorkerService updates token', async t => {
  clearUp();
  const w = new TestWorkerService();
  t.notOk(w.isWaiting);

  const j = w.perform({type: 'update-token', token: {a:1}});

  setTimeout(() => {
    t.ok(w.isWaiting);
    t.deepEqual(actions, [{id: 0, type: 'update-token', token: {a:1}, toBundler: true}]);
    t.equal(published.length, 0);

    w._workerSaid({
      data: {
        type: 'ack',
        id: 0,
        data: undefined
      }
    });
  });

  const result = await j;
  t.equal(result, undefined);
  t.notOk(w.isWaiting);
  t.equal(actions.length, 1);
  t.equal(published.length, 0);
});

test('WorkerService queues and executes action with failure', async t => {
  clearUp();
  const w = new TestWorkerService();
  t.notOk(w.isWaiting);

  const j = w.perform({type: 'work1', data: {a:1}});

  setTimeout(() => {
    t.ok(w.isWaiting);
    t.deepEqual(actions, [{id: 0, type: 'work1', data: {a:1}, toBundler: true}]);
    t.equal(published.length, 0);

    w._workerSaid({
      data: {
        type: 'err',
        id: 0,
        error: 'lorem'
      }
    });
  });

  try {
    await j;
    t.fail('should not pass');
  } catch (err) {
    t.equal(err.message, 'lorem');
  }
  t.equal(published.length, 0);
});

test('WorkerService queues and executes action with unknown failure, ignores unknown message', async t => {
  clearUp();
  const w = new TestWorkerService();
  t.notOk(w.isWaiting);

  const j = w.perform({type: 'work1', data: {a:1}});


  setTimeout(() => {
    t.ok(w.isWaiting);
    t.deepEqual(actions, [{id: 0, type: 'work1', data: {a:1}, toBundler: true}]);
    t.equal(published.length, 0);

    w._workerSaid({
      data: {
        type: 'a'
      }
    });
    w._workerSaid({
      data: {
        type: 'err',
        id: 0
      }
    });
  });

  try {
    await j;
    t.fail('should not pass');
  } catch (err) {
    t.equal(err.message, 'unknown error');
  }
  t.deepEqual(published, [
    ['warning', 'While waiting for acknowledgement id:0 from service worker, received unexpected result {"type":"a"}.']
  ]);
});

test('WorkerService queues and executes actions', async t => {
  clearUp();
  const w = new TestWorkerService();
  t.notOk(w.isWaiting);

  const j = w.perform({type: 'work1', data: {a:1}});
  const j2 = w.perform({type: 'work2', data: {a:2}});
  const j3 = w.perform({type: 'sw:work3', data: {a:3}});

  setTimeout(() => {
    t.ok(w.isWaiting);
    t.deepEqual(actions, [{id: 0, type: 'work1', data: {a:1}, toBundler: true}]);
    t.equal(published.length, 0);

    w._workerSaid({
      data: {
        type: 'ack',
        id: 0,
        data: { result: 1 }
      }
    });

    setTimeout(() => {
      w._workerSaid({
        data: {
          type: 'ack',
          id: 1,
          data: { result: 2 }
        }
      });

      setTimeout(() => {
        w._workerSaid({
          data: {
            type: 'ack',
            id: 2,
            data: { result: 3 }
          }
        });
      }, 20);
    }, 20);
  }, 20);

  const result = await j;
  t.deepEqual(result, {result: 1});
  t.ok(w.isWaiting);
  t.deepEqual(actions, [
    {id: 0, type: 'work1', data: {a:1}, toBundler: true},
    {id: 1, type: 'work2', data: {a:2}, toBundler: true}
  ]);
  t.equal(published.length, 0);

  const result2 = await j2;
  t.deepEqual(result2, {result: 2});
  t.ok(w.isWaiting);
  t.deepEqual(actions, [
    {id: 0, type: 'work1', data: {a:1}, toBundler: true},
    {id: 1, type: 'work2', data: {a:2}, toBundler: true},
    {id: 2, type: 'sw:work3', data: {a:3}}
  ]);
  t.equal(published.length, 0);

  const result3 = await j3;
  t.deepEqual(result3, {result: 3});
  t.notOk(w.isWaiting);
  t.deepEqual(actions, [
    {id: 0, type: 'work1', data: {a:1}, toBundler: true},
    {id: 1, type: 'work2', data: {a:2}, toBundler: true},
    {id: 2, type: 'sw:work3', data: {a:3}}
  ]);
  t.equal(published.length, 0);
});

test('WorkerService queues and executes actions, with failed results and unknown messages', async t => {
  clearUp();
  const w = new TestWorkerService();
  t.notOk(w.isWaiting);

  const j = w.perform({type: 'work1', data: {a:1}});
  const j2 = w.perform({type: 'work2', data: {a:2}});
  const j3 = w.perform({type: 'sw:work3', data: {a:3}});

  setTimeout(() => {
    t.ok(w.isWaiting);
    t.deepEqual(actions, [{id: 0, type: 'work1', data: {a:1}, toBundler: true}]);
    t.equal(published.length, 0);

    w._workerSaid({
      data: {
        what: 'ever'
      }
    });
    w._workerSaid({
      data: {
        type: 'ack',
        id: 0,
        data: { result: 1 }
      }
    });

    setTimeout(() => {
      w._workerSaid({
        data: {
          type: 'err',
          id: 1,
          error: 'lorem'
        }
      });

      setTimeout(() => {
        w._workerSaid({
          data: {
            type: 'ack',
            id: 2,
            data: { result: 3 }
          }
        });
      }, 20);
    }, 20);
  }, 20);

  const result = await j;
  t.deepEqual(result, {result: 1});
  t.ok(w.isWaiting);
  t.deepEqual(actions, [
    {id: 0, type: 'work1', data: {a:1}, toBundler: true},
    {id: 1, type: 'work2', data: {a:2}, toBundler: true}
  ]);
  t.equal(published.length, 0);

  try {
    await j2;
    t.fail('should not pass');
  } catch (err) {
    t.equal(err.message, 'lorem');
  }
  t.ok(w.isWaiting);
  t.deepEqual(actions, [
    {id: 0, type: 'work1', data: {a:1}, toBundler: true},
    {id: 1, type: 'work2', data: {a:2}, toBundler: true},
    {id: 2, type: 'sw:work3', data: {a:3}}
  ]);
  t.equal(published.length, 0);

  const result3 = await j3;
  t.deepEqual(result3, {result: 3});
  t.notOk(w.isWaiting);
  t.deepEqual(actions, [
    {id: 0, type: 'work1', data: {a:1}, toBundler: true},
    {id: 1, type: 'work2', data: {a:2}, toBundler: true},
    {id: 2, type: 'sw:work3', data: {a:3}}
  ]);
  t.equal(published.length, 0);
});
