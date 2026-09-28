// persistence.ts against an in-memory filesystem (tests/stubs/filesystem.ts).
//
// These pin the promises the interface and the privacy policy make about
// what is on the device: a saved list survives, a damaged one is never
// silently replaced, a stale revision cannot overwrite a newer one, and
// erasing removes every file Aisle wrote.
import test, {beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {fsStub} from './stubs/filesystem';
import {
  deleteLastRun,
  eraseStoredFiles,
  loadLastRun,
  loadState,
  saveLastRun,
  saveState,
  StaleRevisionError,
  sweepReceipts,
  sweepShelfPhotos,
} from '@/lib/persistence';
import {initialState} from '@/lib/catalog';

beforeEach(() => fsStub.reset());

const receipt = (id: string) => `aisle/receipts/${id}.json`;
const R1 = 'a'.repeat(32),
  R2 = 'b'.repeat(32),
  R3 = 'c'.repeat(32);

test('a first launch creates a fresh household at revision 0', async () => {
  const {state, revision} = await loadState();
  assert.equal(revision, 0);
  assert.equal(state.onboarded, initialState().onboarded);
  assert.ok(fsStub.has('aisle/household.json'));
});

test('a saved list reads back, and each save bumps the revision', async () => {
  const {state} = await loadState();
  const named = {...state, listName: 'Week of the 28th'};
  const {revision} = await saveState(named, 0);
  assert.equal(revision, 1);
  const back = await loadState();
  assert.equal(back.revision, 1);
  assert.equal(back.state.listName, 'Week of the 28th');
  assert.ok(!fsStub.has('aisle/household.pending.json'), 'the pending copy was renamed into place');
});

test('a save from a stale revision is refused rather than overwriting newer data', async () => {
  const {state} = await loadState();
  await saveState({...state, listName: 'Newer'}, 0);
  await assert.rejects(saveState({...state, listName: 'Older'}, 0), StaleRevisionError);
  assert.equal((await loadState()).state.listName, 'Newer');
});

test('a damaged save file is kept, not replaced with a blank household', async () => {
  fsStub.put('aisle/household.json', '{"state": {"items": [', Date.now());
  await assert.rejects(loadState(), /could not be read/);
  assert.equal(fsStub.read('aisle/household.json'), '{"state": {"items": [');
});

test('receipts no trip points at are swept, but only once they have settled', async () => {
  const now = Date.now();
  fsStub.put(receipt(R1), '{}', now - 60 * 60_000); // kept: referenced
  fsStub.put(receipt(R2), '{}', now - 60 * 60_000); // orphaned an hour ago
  fsStub.put(receipt(R3), '{}', now - 5_000); // just written; its trip may not be saved yet
  fsStub.put('aisle/receipts/notes.txt', 'not ours', now - 60 * 60_000);
  const removed = await sweepReceipts([R1]);
  assert.equal(removed, 1);
  assert.ok(fsStub.has(receipt(R1)));
  assert.ok(!fsStub.has(receipt(R2)));
  assert.ok(fsStub.has(receipt(R3)), 'the grace period protects a write in progress');
  assert.ok(fsStub.has('aisle/receipts/notes.txt'), 'files that are not ours are left alone');
});

test('shelf photos are swept the same way', async () => {
  const old = Date.now() - 60 * 60_000;
  fsStub.put('aisle/shelf/0123456789abcdef.json', '{}', old);
  fsStub.put('aisle/shelf/fedcba9876543210.json', '{}', old);
  assert.equal(await sweepShelfPhotos(['0123456789abcdef']), 1);
  assert.deepEqual(fsStub.list('aisle/shelf'), ['0123456789abcdef.json']);
});

test('the last price check saves, reads back and deletes', async () => {
  assert.equal(await loadLastRun(), null);
  await saveLastRun('{"version":1}');
  assert.equal(await loadLastRun(), '{"version":1}');
  await deleteLastRun();
  assert.equal(await loadLastRun(), null);
  await deleteLastRun(); // deleting twice is not an error
});

test('erasing removes every file Aisle wrote apart from the household itself', async () => {
  const now = Date.now();
  await loadState();
  fsStub.put(receipt(R1), '{}', now); // even one written a moment ago
  fsStub.put('aisle/shelf/0123456789abcdef.json', '{}', now);
  fsStub.put('aisle/last-run.json', '{}', now);
  fsStub.put('aisle/places.json', '{}', now);
  // Left behind by earlier versions.
  fsStub.put('aisle/market.json', '{}', now);
  fsStub.put('aisle/places-43.4--79.85.json', '{}', now);
  await eraseStoredFiles();
  assert.deepEqual(fsStub.list('aisle/receipts'), []);
  assert.deepEqual(fsStub.list('aisle/shelf'), []);
  for (const path of [
    'aisle/last-run.json',
    'aisle/places.json',
    'aisle/market.json',
    'aisle/places-43.4--79.85.json',
  ])
    assert.ok(!fsStub.has(path), `${path} survived an erase`);
  // The household file is reset by the caller saving a blank state, not deleted.
  assert.ok(fsStub.has('aisle/household.json'));
});
