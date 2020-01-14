import test from 'tape-promise/tape';
import {SessionId} from '../../src/session-id';

test('SessionId reuses sessionId from search param', t => {
  const s = new SessionId({sessionId: 'abc'});
  t.equal(s.id, 'abc');
  t.end();
});

test('SessionId generates sessionId', t => {
  const s = new SessionId({});
  t.equal(s.id, 'app');
  t.end();
});
