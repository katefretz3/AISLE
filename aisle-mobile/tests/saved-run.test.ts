// The last price check is kept on the device for up to 24 hours. Reading it
// back must never let through a price the live gate would refuse.
import test from 'node:test';
import assert from 'node:assert/strict';
import {runAgent, type AgentRun} from '@/lib/agent';
import {
  RUN_LIFETIME_MS,
  STALE_NARRATIVE,
  nextExpiry,
  regateRun,
  restoreRun,
  runAreaKey,
  serializeRun,
} from '@/lib/agent/saved-run';
import {basketsFrom} from '@/lib/agent/tools';
import {fixturePlaces, fixtureReader, fixtureState} from './fixtures';

const NOW = Date.parse('2026-09-20T12:00:00.000Z');

let cached: AgentRun | null = null;
async function fixtureRun(): Promise<AgentRun> {
  cached ??= await runAgent({
    state: fixtureState(),
    now: NOW,
    forceDeterministic: true,
    fetchPlaces: async () => fixturePlaces(),
    reader: fixtureReader(),
  });
  return structuredClone(cached);
}

const area = runAreaKey(fixtureState().prefs);
const finished = (run: AgentRun) => Date.parse(run.finishedAt);
const firstExpiry = (run: AgentRun) => Math.min(...run.offers.map(o => Date.parse(o.expiresAt)));

test('a saved run reads back whole within its lifetime', async () => {
  const run = await fixtureRun();
  assert.ok(run.offers.length > 0, 'the fixture run collected offers');
  const back = restoreRun(serializeRun(run, area), area, finished(run) + 1000);
  assert.ok(back);
  assert.equal(back.offers.length, run.offers.length);
  assert.deepEqual(back.proposals, run.proposals);
});

test('a saved run is refused after 24 hours, for another area, or when unreadable', async () => {
  const run = await fixtureRun();
  const raw = serializeRun(run, area);
  assert.equal(restoreRun(raw, area, finished(run) + RUN_LIFETIME_MS + 1), null);
  const moved = runAreaKey({...fixtureState().prefs, radius: fixtureState().prefs.radius + 5});
  assert.notEqual(moved, area);
  assert.equal(restoreRun(raw, moved, finished(run) + 1000), null);
  assert.equal(restoreRun(null, area, finished(run)), null);
  assert.equal(restoreRun('{not json', area, finished(run)), null);
  assert.equal(restoreRun(JSON.stringify({version: 99, area, run}), area, finished(run)), null);
  assert.equal(
    restoreRun(JSON.stringify({version: 1, area, run: {...run, offers: 'x'}}), area, finished(run)),
    null,
  );
});

test('a run that claims to have finished in the future is refused', async () => {
  const run = await fixtureRun();
  const future = {...run, finishedAt: new Date(finished(run) + 3_600_000).toISOString()};
  assert.equal(restoreRun(serializeRun(future, area), area, finished(run)), null);
});

test('offers that expired since the run are dropped on the way back', async () => {
  const run = await fixtureRun();
  // Pin the run's own finish a little later so it is still inside its 24
  // hours when the first offer expires, whatever the fixture run took.
  const pinned = {...run, finishedAt: new Date(firstExpiry(run) - 3_600_000).toISOString()};
  const at = firstExpiry(run) + 1;
  const back = restoreRun(serializeRun(pinned, area), area, at);
  assert.ok(back);
  assert.ok(back.offers.every(o => Date.parse(o.expiresAt) > at));
  assert.ok(back.rejectedOffers.some(r => r.faults.includes('expired')));
  assert.equal(back.narrative, STALE_NARRATIVE, 'a summary quoting a dropped price is withdrawn');
});

test('an offer whose evidence row was altered or removed is dropped', async () => {
  const run = await fixtureRun();
  const target = run.offers[0];
  const tampered = {
    ...run,
    evidence: run.evidence.map(e =>
      e.id === target.evidenceId ? {...e, status: 'ok' as unknown as number} : e,
    ),
  };
  const back = restoreRun(serializeRun(tampered, area), area, finished(run) + 1000)!;
  assert.ok(!back.offers.some(o => o.evidenceId === target.evidenceId));
  assert.ok(
    back.rejectedOffers.some(r => r.offerId === target.id && r.faults.includes('unknown-evidence')),
  );
  const stripped = {...run, evidence: []};
  const none = restoreRun(serializeRun(stripped, area), area, finished(run) + 1000)!;
  assert.equal(none.offers.length, 0);
});

test('a price edited in storage cannot pass as collected', async () => {
  const run = await fixtureRun();
  const edited = {...run, offers: run.offers.map(o => ({...o, price: -1}))};
  const back = restoreRun(serializeRun(edited, area), area, finished(run) + 1000)!;
  assert.equal(back.offers.length, 0);
});

test('regating keeps identity when nothing changed', async () => {
  const run = await fixtureRun();
  assert.equal(regateRun(run, finished(run)), run);
});

test('a basket line whose offer expired says so instead of "no record"', async () => {
  const run = await fixtureRun();
  const state = fixtureState();
  const at = firstExpiry(run) + 1;
  const gated = regateRun(run, at);
  const baskets = basketsFrom({
    state,
    perShopBudget: 100_00,
    sources: gated.sources.map(s => ({...s})),
    offers: gated.offers,
    proposals: new Map(gated.proposals.map(p => [`${p.itemId}::${p.sourceId}`, p])),
    unmatched: new Map(gated.unmatched.map(u => [u.itemId, {kind: u.kind, detail: u.reason}])),
  });
  const lines = baskets.flatMap(b => b.lines).filter(l => !l.offer);
  assert.ok(lines.length > 0);
  assert.ok(
    lines.some(l => /expired/.test(l.reason)),
    'at least one previously matched line reports expiry',
  );
  assert.ok(
    baskets.every(b => b.subtotal === 0),
    'nothing expired is summed',
  );
});

test('the expiry timer only ever points forward', async () => {
  const run = await fixtureRun();
  const first = firstExpiry(run);
  assert.equal(nextExpiry(run, finished(run)), Math.min(first, finished(run) + RUN_LIFETIME_MS));
  const later = nextExpiry(run, first);
  assert.ok(later > first);
  assert.equal(nextExpiry(run, finished(run) + RUN_LIFETIME_MS + first), Infinity);
});
