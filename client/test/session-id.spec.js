import test from 'tape';
import {SessionId} from '../src/session-id';

test('SessionId generates random sessionId', t => {
  const s = new SessionId({});
  t.ok(s.id.match(/^[0-9a-f]{32}$/));
  t.end();
});
