import test from 'tape-promise/tape';
import {NpmHttpRegistry} from '../../../src/turbo-resolver/registries/npm-http';

const r = new NpmHttpRegistry();

test('NpmHttpRegistry fetches one package', async t => {
  const pack = await r.fetch('npm');
  t.equal(pack.name, 'npm');
});

test('NpmHttpRegistry complains about unknown package', async t => {
  await t.rejects(async () => r.fetch('@'));
});

test('NpmHttpRegistry fetches multiple packages', async t => {
  const r = new NpmHttpRegistry();
  const packs = await r.batchFetch(['npm', 'yarn']);
  t.deepEqual(packs.map(p => p.name), ['npm', 'yarn']);
});
