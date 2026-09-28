// The reasoning broker sits in front of a paid key, and the app's tool loop has
// to treat a refused or cut-off answer as a failure. These tests pin both.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Anthropic,
  handleAgentRequest,
  MemoryStore,
  type BrokerEnv,
  type MessagesClient,
} from '../../server/agent-broker';
import {runToolLoop, type BrokerConfig, type LoopEvent} from '@/lib/agent/model';
import {buildShopperModel} from '@/lib/agent/memory';
import {EvidenceLedger} from '@/lib/agent/provenance';
import {OriginGuard} from '@/lib/agent/net';
import type {ToolContext} from '@/lib/agent/tools';
import {fixturePlaces, fixtureReader, fixtureState} from './fixtures';

const APP = 'capacitor://localhost';
const ENV: BrokerEnv = {
  ANTHROPIC_API_KEY: 'test-key',
  ALLOWED_ORIGINS: `${APP}, https://localhost`,
};
const NOW = Date.UTC(2026, 8, 28, 12, 0, 30);

type CreateArgs = Record<string, unknown>;

function fakeClient(reply: () => unknown | Promise<unknown>) {
  const calls: CreateArgs[] = [];
  const client = {
    beta: {
      messages: {
        create: async (args: CreateArgs) => {
          calls.push(args);
          return reply();
        },
      },
    },
  } as unknown as MessagesClient;
  return {client, calls};
}

const okReply = (overrides: Record<string, unknown> = {}) => ({
  model: 'claude-opus-5-5',
  content: [
    {type: 'thinking', thinking: 'Plan the basket.', signature: 'sig-abc'},
    {type: 'text', text: 'Done.'},
  ],
  stop_reason: 'end_turn',
  stop_details: null,
  usage: {input_tokens: 100, output_tokens: 50},
  ...overrides,
});

const body = (extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    model: 'claude-opus-5-5',
    max_tokens: 16000,
    system: 'You plan groceries.',
    tools: [{name: 'get_grocery_list', description: 'List', input_schema: {type: 'object'}}],
    messages: [{role: 'user', content: 'Plan my shop'}],
    ...extra,
  });

const post = (payload = body(), origin: string | null = APP, method = 'POST') =>
  new Request('https://broker.example/agent', {
    method,
    headers: {'Content-Type': 'application/json', ...(origin ? {Origin: origin} : {})},
    body: method === 'POST' ? payload : undefined,
  });

const deps = (client: MessagesClient, store = new MemoryStore(() => NOW)) => ({
  client,
  store,
  now: () => NOW,
  clientKey: () => 'device-1',
});

const errorOf = async (response: Response) =>
  ((await response.json()) as {error: {message: string}}).error.message;

test('broker refuses to run when no origins are configured', async () => {
  for (const ALLOWED_ORIGINS of [undefined, '', '*']) {
    const {client, calls} = fakeClient(() => okReply());
    const response = await handleAgentRequest(
      post(),
      {ANTHROPIC_API_KEY: 'k', ALLOWED_ORIGINS},
      deps(client),
    );
    assert.equal(response.status, 503);
    assert.equal(calls.length, 0);
  }
});

test('broker refuses when the key is missing', async () => {
  const {client, calls} = fakeClient(() => okReply());
  const response = await handleAgentRequest(
    post(),
    {ANTHROPIC_API_KEY: '', ALLOWED_ORIGINS: APP},
    deps(client),
  );
  assert.equal(response.status, 503);
  assert.equal(calls.length, 0);
});

test('broker rejects origins outside the allow-list and missing origins', async () => {
  for (const origin of ['https://evil.example', null]) {
    const {client, calls} = fakeClient(() => okReply());
    const response = await handleAgentRequest(post(body(), origin), ENV, deps(client));
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    assert.equal(calls.length, 0);
  }
});

test('broker answers preflight for an allowed origin and rejects other methods', async () => {
  const {client} = fakeClient(() => okReply());
  const preflight = await handleAgentRequest(post(body(), APP, 'OPTIONS'), ENV, deps(client));
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), APP);
  const get = await handleAgentRequest(post(body(), APP, 'GET'), ENV, deps(client));
  assert.equal(get.status, 405);
});

test('broker rejects models outside the allow-list', async () => {
  const {client, calls} = fakeClient(() => okReply());
  for (const model of ['claude-3-opus-20240229', 'claude-sonnet-5', '', 42]) {
    const response = await handleAgentRequest(post(body({model})), ENV, deps(client));
    assert.equal(response.status, 400);
  }
  assert.equal(calls.length, 0);
});

test('broker never forwards server tools', async () => {
  const {client, calls} = fakeClient(() => okReply());
  for (const tool of [
    {type: 'web_search_20260209', name: 'web_search'},
    {type: 'code_execution_20250825', name: 'code_execution'},
    {name: 'no schema'},
  ]) {
    const response = await handleAgentRequest(post(body({tools: [tool]})), ENV, deps(client));
    assert.equal(response.status, 400);
    assert.match(await errorOf(response), /custom tools|server tools/i);
  }
  assert.equal(calls.length, 0);
});

test('broker rejects malformed, oversized and incomplete bodies', async () => {
  const {client, calls} = fakeClient(() => okReply());
  const cases: [string, number][] = [
    ['{not json', 400],
    [body({messages: []}), 400],
    [body({system: ['blocks']}), 400],
    [body({tools: {}}), 400],
    [body({padding: 'x'.repeat(400_001)}), 413],
  ];
  for (const [payload, status] of cases) {
    const response = await handleAgentRequest(post(payload), ENV, deps(client));
    assert.equal(response.status, status);
  }
  assert.equal(calls.length, 0);
});

test('broker forwards effort and refusal fallbacks and returns content unchanged', async () => {
  const {client, calls} = fakeClient(() => okReply());
  const response = await handleAgentRequest(post(), ENV, deps(client));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), APP);
  const sent = calls[0];
  assert.equal(sent.model, 'claude-opus-5-5');
  assert.deepEqual(sent.output_config, {effort: 'medium'});
  assert.deepEqual(sent.betas, ['server-side-fallback-2026-07-01']);
  assert.equal(sent.fallbacks, 'default');
  assert.equal(sent.system, 'You plan groceries.');
  const reply = (await response.json()) as {content: unknown[]; stop_reason: string};
  assert.deepEqual(reply.content, okReply().content);
  assert.equal(reply.stop_reason, 'end_turn');
});

test('broker sends Haiku without effort or fallbacks', async () => {
  const {client, calls} = fakeClient(() => okReply({model: 'claude-haiku-4-5'}));
  const response = await handleAgentRequest(
    post(body({model: 'claude-haiku-4-5'})),
    ENV,
    deps(client),
  );
  assert.equal(response.status, 200);
  assert.equal(calls[0].output_config, undefined);
  assert.equal(calls[0].fallbacks, undefined);
  assert.equal(calls[0].betas, undefined);
});

test('broker clamps max_tokens into its own range', async () => {
  const {client, calls} = fakeClient(() => okReply());
  for (const [asked, sent] of [
    [1_000_000, 16_000],
    [10, 1024],
    ['lots', 16_000],
    [4096, 4096],
  ] as const) {
    await handleAgentRequest(post(body({max_tokens: asked})), ENV, {
      ...deps(client),
      clientKey: () => `k-${asked}`,
    });
    assert.equal(calls.at(-1)!.max_tokens, sent);
  }
});

test('broker rate-limits each client per minute', async () => {
  const {client, calls} = fakeClient(() => okReply());
  const d = deps(client);
  for (let i = 0; i < 12; i++) assert.equal((await handleAgentRequest(post(), ENV, d)).status, 200);
  const limited = await handleAgentRequest(post(), ENV, d);
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('retry-after'), '30');
  assert.equal(calls.length, 12);
  // Another client is unaffected.
  const other = await handleAgentRequest(post(), ENV, {...d, clientKey: () => 'device-2'});
  assert.equal(other.status, 200);
});

test('broker stops spending once the daily budget is used', async () => {
  const {client, calls} = fakeClient(() => okReply());
  const d = deps(client);
  const env = {...ENV, DAILY_TOKEN_BUDGET: '200'};
  assert.equal((await handleAgentRequest(post(), env, d)).status, 200); // 150 tokens
  assert.equal((await handleAgentRequest(post(), env, d)).status, 200); // 300 tokens
  const spent = await handleAgentRequest(post(), env, d);
  assert.equal(spent.status, 503);
  assert.match(await errorOf(spent), /budget/i);
  assert.equal(calls.length, 2);
});

test('broker counts every attempt of a fallback chain against the budget', async () => {
  const {client} = fakeClient(() =>
    okReply({
      usage: {
        input_tokens: 10,
        output_tokens: 10,
        iterations: [
          {input_tokens: 400, output_tokens: 0},
          {input_tokens: 100, output_tokens: 50},
        ],
      },
    }),
  );
  const store = new MemoryStore(() => NOW);
  await handleAgentRequest(post(), ENV, deps(client, store));
  assert.equal(await store.get('spend:2026-09-28'), 550);
});

test('broker maps upstream errors without echoing their bodies', async () => {
  const secret = 'request content that must not leak';
  const cases: [Error, number, string | null][] = [
    [
      new Anthropic.RateLimitError(
        429,
        {error: {message: secret}},
        secret,
        new Headers({'retry-after': '7'}),
      ),
      429,
      '7',
    ],
    [
      new Anthropic.InternalServerError(529, {error: {message: secret}}, secret, new Headers()),
      503,
      null,
    ],
    [
      new Anthropic.AuthenticationError(401, {error: {message: secret}}, secret, new Headers()),
      503,
      null,
    ],
    [
      new Anthropic.NotFoundError(404, {error: {message: secret}}, secret, new Headers()),
      502,
      null,
    ],
    [
      new Anthropic.BadRequestError(400, {error: {message: secret}}, secret, new Headers()),
      502,
      null,
    ],
    [new Anthropic.APIConnectionError({message: secret}), 502, null],
    [new Error(secret), 502, null],
  ];
  for (const [error, status, retryAfter] of cases) {
    const {client} = fakeClient(() => {
      throw error;
    });
    const response = await handleAgentRequest(post(), ENV, deps(client));
    assert.equal(response.status, status, error.constructor.name);
    assert.equal(response.headers.get('retry-after'), retryAfter);
    const text = await response.text();
    assert.ok(!text.includes(secret), `${error.constructor.name} leaked the upstream body`);
  }
});

test('broker passes a refusal through for the app to handle', async () => {
  const {client} = fakeClient(() =>
    okReply({content: [], stop_reason: 'refusal', stop_details: {category: 'cyber'}}),
  );
  const response = await handleAgentRequest(post(), ENV, deps(client));
  const reply = (await response.json()) as {stop_reason: string; stop_details: unknown};
  assert.equal(reply.stop_reason, 'refusal');
  assert.deepEqual(reply.stop_details, {category: 'cyber'});
});

// ---- the app's tool loop ---------------------------------------------------

const CONFIG: BrokerConfig = {
  endpoint: 'https://broker.example/agent',
  model: 'claude-opus-5-5',
  maxTokens: 16000,
  headers: {'Content-Type': 'application/json'},
};

function loopContext(): ToolContext {
  const state = fixtureState();
  return {
    state,
    shopper: buildShopperModel(state, NOW),
    ledger: new EvidenceLedger(),
    guard: new OriginGuard(),
    read: fixtureReader(),
    fetchPlaces: async () => fixturePlaces(),
    now: NOW,
    budget: {maxToolCalls: 30, maxProbes: 5, maxCollects: 4, deadline: Date.now() + 60000},
    stores: [],
    probes: [],
    sources: [],
    offers: [],
    proposals: new Map(),
    unmatched: new Map(),
    counters: {toolCalls: 0, probes: 0, collects: 0},
    log: () => {},
  };
}

/** Replace fetch with a scripted broker for the length of one test. */
async function withBroker(replies: unknown[], run: (bodies: unknown[]) => Promise<void>) {
  const original = globalThis.fetch;
  const bodies: unknown[] = [];
  let i = 0;
  globalThis.fetch = (async (_url: unknown, init?: {body?: string}) => {
    bodies.push(JSON.parse(init?.body ?? '{}'));
    const reply = replies[Math.min(i++, replies.length - 1)];
    return new Response(JSON.stringify(reply), {status: 200});
  }) as typeof fetch;
  try {
    await run(bodies);
  } finally {
    globalThis.fetch = original;
  }
}

const loop = (events: LoopEvent[]) =>
  runToolLoop({
    config: CONFIG,
    system: 'sys',
    goal: 'Plan my shop',
    ctx: loopContext(),
    maxSteps: 4,
    onEvent: e => events.push(e),
  });

test('tool loop treats a refusal as an error, not an answer', async () => {
  await withBroker(
    [{content: [{type: 'text', text: 'Partial answer'}], stop_reason: 'refusal'}],
    async () => {
      const events: LoopEvent[] = [];
      const outcome = await loop(events);
      assert.equal(outcome.stopped, 'error');
      assert.match(outcome.error!, /declined/);
      assert.equal(outcome.narrative, '');
      assert.ok(events.some(e => e.type === 'error'));
    },
  );
});

test('tool loop treats a cut-off answer as an error', async () => {
  await withBroker(
    [{content: [{type: 'text', text: 'The cheapest'}], stop_reason: 'max_tokens'}],
    async () => {
      const outcome = await loop([]);
      assert.equal(outcome.stopped, 'error');
      assert.match(outcome.error!, /ran out of room/);
    },
  );
});

test('tool loop reports the broker message on HTTP errors', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({error: {message: "Today's reasoning budget is used up."}}), {
      status: 503,
    })) as typeof fetch;
  try {
    const outcome = await loop([]);
    assert.equal(outcome.stopped, 'error');
    assert.match(outcome.error!, /budget is used up/);
  } finally {
    globalThis.fetch = original;
  }
});

test('tool loop echoes thinking blocks back unchanged', async () => {
  const first = {
    content: [
      {type: 'thinking', thinking: 'Look at the list first.', signature: 'sig-1'},
      {type: 'tool_use', id: 'toolu_1', name: 'get_grocery_list', input: {}},
    ],
    stop_reason: 'tool_use',
  };
  const second = {content: [{type: 'text', text: 'Here is the plan.'}], stop_reason: 'end_turn'};
  await withBroker([first, second], async bodies => {
    const outcome = await loop([]);
    assert.equal(outcome.stopped, 'complete');
    assert.equal(outcome.toolCalls, 1);
    const sent = bodies[1] as {messages: {role: string; content: unknown}[]};
    assert.deepEqual(sent.messages[1], {role: 'assistant', content: first.content});
    const results = sent.messages[2].content as {type: string; tool_use_id: string}[];
    assert.equal(results[0].type, 'tool_result');
    assert.equal(results[0].tool_use_id, 'toolu_1');
  });
});
