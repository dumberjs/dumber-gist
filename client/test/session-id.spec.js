import test from 'tape-promise/tape';
import {SessionId} from '../src/session-id';

test('SessionId reuses sessionId from search param', t => {
  const s = new SessionId({sessionId: 'abc'});
  t.equal(s.id, 'abc');
  t.end();
});

test('SessionId generates random sessionId', t => {
  const s = new SessionId({});
  t.ok(s.id.match(/^[0-9a-f]{32}$/));
  t.end();
});
