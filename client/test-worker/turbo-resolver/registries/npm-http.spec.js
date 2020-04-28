import test from 'tape';
import {NpmHttpRegistry} from '../../../src-worker/turbo-resolver/registries/npm-http';

const r = new NpmHttpRegistry();

test('NpmHttpRegistry fetches one package', async t => {
  const pack = await r.fetch('npm');
  t.equal(pack.name, 'npm');
});

test('NpmHttpRegistry complains about unknown package', async t => {
  try {
    await r.fetch('@no/such/thing');
    t.fail('should not pass');
  } catch (e) {
    t.pass(e.message);
  }
});

test('NpmHttpRegistry fetches multiple packages', async t => {
  const r = new NpmHttpRegistry();
  const packs = await r.batchFetch(['npm', 'yarn']);
  t.deepEqual(packs.map(p => p.name), ['npm', 'yarn']);
});
