import test from 'ava';
import {NpmHttpRegistry} from '../../../worker/registries/npm-http';

const r = new NpmHttpRegistry();

test.serial('NpmHttpRegistry fetches one package', async t => {
  const pack = await r.fetch('npm');
  t.is(pack.name, 'npm');
});

test.serial('NpmHttpRegistry complains about unknown package', async t => {
  await t.throwsAsync(async () => fetch('@'));
});

test.serial('NpmHttpRegistry fetches multiple packages', async t => {
  const r = new NpmHttpRegistry();
  const packs = await r.batchFetch(['npm', 'yarn']);
  t.deepEqual(packs.map(p => p.name), ['npm', 'yarn']);
});
