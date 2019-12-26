import test from 'ava';
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
  }
}

class TestWorkerService extends WorkerService {
  _bootUpWorker() {
    this._workerUp = Promise.resolve();
    this.iframe = {
      contentWindow: {
        postMessage: action => {
          actions.push(action);
        }
      }
    }
  }
}

test.serial.beforeEach(clearUp);

test.serial('WorkerService queues and executes action', async t => {
  const w = new TestWorkerService(ea);
  t.falsy(w.isWaiting);

  const j = w.queueJob({type: 'work1', data: {a:1}});

  setTimeout(() => {
    t.truthy(w.isWaiting);
    t.deepEqual(actions, [{type: 'work1', data: {a:1}}]);
    t.is(published.length, 0);

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
  t.falsy(w.isWaiting);
  t.is(actions.length, 1);
  t.is(published.length, 0);
});

test.serial('WorkerService queues and executes action with failure', async t => {
  const w = new TestWorkerService(ea);
  t.falsy(w.isWaiting);

  const j = w.queueJob({type: 'work1', data: {a:1}});

  setTimeout(() => {
    t.truthy(w.isWaiting);
    t.deepEqual(actions, [{type: 'work1', data: {a:1}}]);
    t.is(published.length, 0);

    w._workerSaid({
      data: {
        type: 'err',
        id: 0,
        error: 'lorem'
      }
    });
  });

  await t.throwsAsync(async () => await j, {message: 'lorem'});
  t.is(published.length, 0);
});

test.serial('WorkerService queues and executes action with unknown failure, ignores unknown message', async t => {
  const w = new TestWorkerService(ea);
  t.falsy(w.isWaiting);

  const j = w.queueJob({type: 'work1', data: {a:1}});


  setTimeout(() => {
    t.truthy(w.isWaiting);
    t.deepEqual(actions, [{type: 'work1', data: {a:1}}]);
    t.is(published.length, 0);

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

  await t.throwsAsync(async () => await j, {message: 'unknown error'});
  t.deepEqual(published, [
    ['warning', 'While waiting for acknowledgement id:0 from service worker, received unexpected result {"type":"a"}.']
  ]);
});

test.serial('WorkerService queues and executes actions', async t => {
  const w = new TestWorkerService(ea);
  t.falsy(w.isWaiting);

  const j = w.queueJob({type: 'work1', data: {a:1}});
  const j2 = w.queueJob({type: 'work2', data: {a:2}});
  const j3 = w.queueJob({type: 'work3', data: {a:3}});

  setTimeout(() => {
    t.truthy(w.isWaiting);
    t.deepEqual(actions, [{type: 'work1', data: {a:1}}]);
    t.is(published.length, 0);

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
  t.truthy(w.isWaiting);
  t.deepEqual(actions, [
    {type: 'work1', data: {a:1}},
    {type: 'work2', data: {a:2}}
  ]);
  t.is(published.length, 0);

  const result2 = await j2;
  t.deepEqual(result2, {result: 2});
  t.truthy(w.isWaiting);
  t.deepEqual(actions, [
    {type: 'work1', data: {a:1}},
    {type: 'work2', data: {a:2}},
    {type: 'work3', data: {a:3}}
  ]);
  t.is(published.length, 0);

  const result3 = await j3;
  t.deepEqual(result3, {result: 3});
  t.falsy(w.isWaiting);
  t.deepEqual(actions, [
    {type: 'work1', data: {a:1}},
    {type: 'work2', data: {a:2}},
    {type: 'work3', data: {a:3}}
  ]);
  t.is(published.length, 0);
});

test.serial('WorkerService queues and executes actions, with failed results and unknown messages', async t => {
  const w = new TestWorkerService(ea);
  t.falsy(w.isWaiting);

  const j = w.queueJob({type: 'work1', data: {a:1}});
  const j2 = w.queueJob({type: 'work2', data: {a:2}});
  const j3 = w.queueJob({type: 'work3', data: {a:3}});

  setTimeout(() => {
    t.truthy(w.isWaiting);
    t.deepEqual(actions, [{type: 'work1', data: {a:1}}]);
    t.is(published.length, 0);

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
  t.truthy(w.isWaiting);
  t.deepEqual(actions, [
    {type: 'work1', data: {a:1}},
    {type: 'work2', data: {a:2}}
  ]);
  t.is(published.length, 0);

  await t.throwsAsync(async() => await j2, {message: 'lorem'});
  t.truthy(w.isWaiting);
  t.deepEqual(actions, [
    {type: 'work1', data: {a:1}},
    {type: 'work2', data: {a:2}},
    {type: 'work3', data: {a:3}}
  ]);
  t.is(published.length, 0);

  const result3 = await j3;
  t.deepEqual(result3, {result: 3});
  t.falsy(w.isWaiting);
  t.deepEqual(actions, [
    {type: 'work1', data: {a:1}},
    {type: 'work2', data: {a:2}},
    {type: 'work3', data: {a:3}}
  ]);
  t.is(published.length, 0);
});

