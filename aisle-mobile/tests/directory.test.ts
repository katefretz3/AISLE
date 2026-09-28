// Store directory and store registry.
import test from 'node:test';
import assert from 'node:assert/strict';
import {collectPlaces, overpassReader, OVERPASS_ENDPOINTS} from '@/lib/agent/places';
import {userAgent, USER_AGENT} from '@/lib/agent/net';
import {CHAINS} from '@/lib/agent/registry';
import {stores} from '@/lib/catalog';

const OK = JSON.stringify({
  elements: [
    {
      type: 'node',
      id: 1,
      lat: 43.33,
      lon: -79.8,
      tags: {name: 'Goodness Me!', 'addr:city': 'Burlington'},
    },
    {type: 'node', id: 2, lat: 43.34, lon: -79.81, tags: {name: 'Sobeys Burlington'}},
  ],
});

function scripted(replies: ({status: number; text: string} | Error)[]) {
  const calls: string[] = [];
  const post = async (url: string) => {
    calls.push(url);
    const reply = replies[calls.length - 1] ?? new Error('no more replies');
    if (reply instanceof Error) throw reply;
    return reply;
  };
  return {post, calls};
}

test('the directory falls through to the next mirror on failure', async () => {
  const {post, calls} = scripted([
    new Error('connect ECONNREFUSED'),
    {status: 429, text: 'rate limited'},
    {status: 200, text: OK},
  ]);
  const body = (await overpassReader(post)('q')) as {elements: unknown[]};
  assert.equal(body.elements.length, 2);
  assert.deepEqual(calls, OVERPASS_ENDPOINTS);
});

test('a server-side timeout (200 with a remark) moves to the next mirror', async () => {
  const {post, calls} = scripted([
    {status: 200, text: JSON.stringify({remark: 'runtime error: timeout', elements: []})},
    {status: 200, text: OK},
  ]);
  await overpassReader(post)('q');
  assert.equal(calls.length, 2);
});

test('a rejected query is not retried on every mirror', async () => {
  const {post, calls} = scripted([{status: 400, text: 'parse error'}]);
  await assert.rejects(overpassReader(post)('q'), /rejected the query/);
  assert.equal(calls.length, 1);
});

test('when every mirror fails the directory reports it, and lists no shops', async () => {
  const {post} = scripted([
    {status: 504, text: ''},
    {status: 503, text: ''},
    {status: 200, text: 'x'.repeat(2_000_001)},
  ]);
  const result = await collectPlaces({lat: 43.35, lng: -79.8}, overpassReader(post));
  assert.equal(result.status, 'unavailable');
  assert.equal(result.places.length, 0);
});

test('mapped shops are matched to chains through the registry', async () => {
  const {post} = scripted([{status: 200, text: OK}]);
  const result = await collectPlaces({lat: 43.35, lng: -79.8}, overpassReader(post));
  assert.deepEqual(
    result.places.map(p => p.chainId),
    ['goodnessme', 'sobeys'],
  );
});

test('the User-Agent never carries a made-up contact', () => {
  assert.equal(userAgent(undefined), 'AisleOntario/1.0 (grocery price research)');
  assert.equal(userAgent(''), 'AisleOntario/1.0 (grocery price research)');
  assert.equal(userAgent('http://insecure.example'), 'AisleOntario/1.0 (grocery price research)');
  assert.equal(userAgent('https://x.example/a b'), 'AisleOntario/1.0 (grocery price research)');
  assert.equal(
    userAgent('https://aisle.example/contact'),
    'AisleOntario/1.0 (grocery price research; +https://aisle.example/contact)',
  );
  assert.doesNotMatch(USER_AGENT, /chatgpt\.site|github\.com/);
});

test('every chain in the registry is a store the app can show, and the reverse', () => {
  const registry = new Map(CHAINS.map(c => [c.id, c.name]));
  const catalog = new Map(stores.map(s => [s.id, s.name]));
  assert.deepEqual([...catalog.keys()].sort(), [...registry.keys()].sort());
  for (const [id, name] of registry) assert.equal(catalog.get(id), name, id);
});
