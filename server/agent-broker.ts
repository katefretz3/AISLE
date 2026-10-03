// Reasoning broker for the Aisle agent.
//
// The mobile app holds no API key. It posts the agent's conversation here, and
// this handler calls the Anthropic Messages API with a key that never leaves
// the server. Deploy it on any Fetch-API runtime (Cloudflare Workers, Deno
// Deploy, Node 22) and set VITE_AISLE_AGENT_ENDPOINT in the app build to its URL.
//
// It sits in front of a paid key on the open internet, so it forwards as little
// as it can and refuses anything else:
//
//   - It will not start answering until ALLOWED_ORIGINS is set. There is no
//     "allow everything" default.
//   - Requests must come from one of those origins. This is NOT authentication
//     (any non-browser client can send whatever Origin header it likes), but it
//     stops the key being spent from someone else's web page.
//   - The real guards are a per-client request rate and a daily token budget
//     for the whole deployment. When the budget is spent the broker answers 503
//     until the next UTC day, and the app falls back to its rule-based planner.
//   - Only the app's own custom tools are forwarded. Anthropic's server tools
//     (web search, code execution, ...) would run on this key's bill, so any
//     tool with a `type` is refused.
//   - The model comes from an allow-list, max_tokens is capped, and the
//     upstream error body is never echoed back (it can contain request content).
//
// It never adds data of its own to the conversation: the app's policy layer
// assumes everything factual came from the app's own tools.
import Anthropic from '@anthropic-ai/sdk';

// Re-exported so the app's tests can build SDK errors without the app itself
// depending on the SDK.
export {Anthropic};

/**
 * Per-model request settings. Thinking is always on for Claude Opus 5.5 and
 * counts towards max_tokens, so effort is the control for cost and latency;
 * `medium` is where Anthropic recommends starting an agentic tool loop.
 * Refusal fallbacks are opted into on the models that support the `"default"`
 * form, so a classifier false positive becomes a retry on another model rather
 * than a dead end.
 */
const MODELS: Record<string, {effort: 'low' | 'medium' | 'high' | null; fallbacks: boolean}> = {
  'claude-opus-5-5': {effort: 'medium', fallbacks: true},
  'claude-sonnet-5-5': {effort: 'medium', fallbacks: true},
  'claude-haiku-4-5': {effort: null, fallbacks: false},
};
export const DEFAULT_MODEL = 'claude-opus-5-5';

/** Thinking counts towards this, so it is sized for thinking plus the reply. */
const MAX_TOKENS = 16_000;
const MAX_BODY_BYTES = 400_000;
const MAX_TOOLS = 32;
const DEFAULT_RATE_PER_MINUTE = 12;
const DEFAULT_DAILY_TOKENS = 2_000_000;

export type BrokerEnv = {
  ANTHROPIC_API_KEY: string;
  /** Comma-separated origins the app is served from. For Capacitor these are
   *  `capacitor://localhost` (iOS) and `https://localhost` (Android). Required. */
  ALLOWED_ORIGINS?: string;
  /** Older single-origin name, still honoured. */
  ALLOWED_ORIGIN?: string;
  RATE_LIMIT_PER_MINUTE?: string;
  DAILY_TOKEN_BUDGET?: string;
};

/**
 * Where counters live. The in-memory store below is per instance: fine for one
 * Node process, but serverless platforms run many isolates, each with its own
 * memory, so a real deployment should back this with a shared store (Workers
 * KV or a Durable Object, Deno KV, Redis).
 */
export interface BrokerStore {
  /** Add `by` to a counter that expires `ttlSeconds` after it was created. */
  increment(key: string, by: number, ttlSeconds: number): Promise<number>;
  get(key: string): Promise<number>;
}

export class MemoryStore implements BrokerStore {
  private rows = new Map<string, {value: number; expires: number}>();
  constructor(private now: () => number = Date.now) {}
  async increment(key: string, by: number, ttlSeconds: number) {
    const now = this.now();
    const row = this.rows.get(key);
    const live = row && row.expires > now ? row : {value: 0, expires: now + ttlSeconds * 1000};
    live.value += by;
    this.rows.set(key, live);
    return live.value;
  }
  async get(key: string) {
    const row = this.rows.get(key);
    return row && row.expires > this.now() ? row.value : 0;
  }
}

/** The part of the SDK client the broker uses, so tests can supply a fake. */
export type MessagesClient = Pick<Anthropic, 'beta'>;

export type BrokerDeps = {
  client?: MessagesClient;
  store?: BrokerStore;
  now?: () => number;
  /** How a caller is identified for rate limiting. */
  clientKey?: (request: Request) => string;
};

const sharedStore = new MemoryStore();

const defaultClientKey = (request: Request) =>
  request.headers.get('cf-connecting-ip') ??
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  'unknown';

const corsHeaders = (origin: string | null): Record<string, string> =>
  origin
    ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST,OPTIONS',
        Vary: 'Origin',
      }
    : {Vary: 'Origin'};

const json = (
  body: unknown,
  status: number,
  origin: string | null,
  extra: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders(origin),
      ...extra,
    },
  });

const fail = (
  message: string,
  status: number,
  origin: string | null,
  extra?: Record<string, string>,
) => json({error: {message}}, status, origin, extra);

function allowedOrigins(env: BrokerEnv): Set<string> {
  const raw = env.ALLOWED_ORIGINS ?? env.ALLOWED_ORIGIN ?? '';
  return new Set(
    raw
      .split(',')
      .map(s => s.trim())
      .filter(s => s && s !== '*'),
  );
}

const positive = (value: string | undefined, fallback: number) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

/** A tool the app defined itself: a name, a description and a JSON schema. */
function isCustomTool(tool: unknown): tool is Anthropic.Beta.BetaTool {
  if (!tool || typeof tool !== 'object') return false;
  const t = tool as Record<string, unknown>;
  return (
    (t.type === undefined || t.type === 'custom') &&
    typeof t.name === 'string' &&
    /^[a-zA-Z0-9_-]{1,64}$/.test(t.name) &&
    typeof t.input_schema === 'object' &&
    t.input_schema !== null
  );
}

/** Tokens a response consumed, across every attempt a fallback chain made. */
function tokensUsed(usage: Anthropic.Beta.BetaUsage | undefined): number {
  if (!usage) return 0;
  const iterations = (usage as {iterations?: {input_tokens?: number; output_tokens?: number}[]})
    .iterations;
  if (iterations?.length)
    return iterations.reduce((sum, i) => sum + (i.input_tokens ?? 0) + (i.output_tokens ?? 0), 0);
  return (
    (usage.input_tokens ?? 0) +
    (usage.output_tokens ?? 0) +
    (usage.cache_creation_input_tokens ?? 0)
  );
}

const utcDay = (now: number) => new Date(now).toISOString().slice(0, 10);

export async function handleAgentRequest(
  request: Request,
  env: BrokerEnv,
  deps: BrokerDeps = {},
): Promise<Response> {
  const origins = allowedOrigins(env);
  const requestOrigin = request.headers.get('origin');
  const origin = requestOrigin && origins.has(requestOrigin) ? requestOrigin : null;

  // Refuse to run open. An unset allow-list used to mean "*".
  if (!origins.size)
    return fail('The reasoning service is not configured: ALLOWED_ORIGINS is unset', 503, null);
  if (!env.ANTHROPIC_API_KEY) return fail('The reasoning service is not configured', 503, null);
  if (!origin) return fail('Origin not allowed', 403, null);

  if (request.method === 'OPTIONS')
    return new Response(null, {status: 204, headers: corsHeaders(origin)});
  if (request.method !== 'POST') return fail('Use POST', 405, origin);

  const now = (deps.now ?? Date.now)();
  const store = deps.store ?? sharedStore;

  const perMinute = positive(env.RATE_LIMIT_PER_MINUTE, DEFAULT_RATE_PER_MINUTE);
  const who = (deps.clientKey ?? defaultClientKey)(request);
  const minute = Math.floor(now / 60_000);
  const count = await store.increment(`rate:${who}:${minute}`, 1, 60);
  if (count > perMinute) {
    const retry = String(60 - Math.floor((now % 60_000) / 1000));
    return fail('Too many requests. Try again shortly.', 429, origin, {'Retry-After': retry});
  }

  const budget = positive(env.DAILY_TOKEN_BUDGET, DEFAULT_DAILY_TOKENS);
  const spendKey = `spend:${utcDay(now)}`;
  if ((await store.get(spendKey)) >= budget)
    return fail("Today's reasoning budget is used up. It resets at midnight UTC.", 503, origin);

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return fail('Request too large', 413, origin);

  let payload: {
    model?: unknown;
    max_tokens?: unknown;
    system?: unknown;
    tools?: unknown;
    messages?: unknown;
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return fail('Malformed request body', 400, origin);
  }

  const model = typeof payload.model === 'string' ? payload.model : '';
  const settings = MODELS[model];
  if (!settings) return fail('Unsupported model', 400, origin);
  if (!Array.isArray(payload.messages) || !payload.messages.length)
    return fail('messages is required', 400, origin);
  if (payload.system !== undefined && typeof payload.system !== 'string')
    return fail('system must be a string', 400, origin);
  const tools = payload.tools ?? [];
  if (!Array.isArray(tools)) return fail('tools must be an array', 400, origin);
  if (tools.length > MAX_TOOLS) return fail('Too many tools', 400, origin);
  if (!tools.every(isCustomTool))
    return fail('Only custom tools are accepted; server tools are not forwarded', 400, origin);

  const maxTokens = Math.min(MAX_TOKENS, Math.max(1024, Number(payload.max_tokens) || MAX_TOKENS));
  const client =
    deps.client ?? new Anthropic({apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 90_000});

  try {
    const reply = await client.beta.messages.create({
      model,
      max_tokens: maxTokens,
      ...(payload.system ? {system: payload.system as string} : {}),
      ...(tools.length ? {tools: tools as Anthropic.Beta.BetaTool[]} : {}),
      messages: payload.messages as Anthropic.Beta.BetaMessageParam[],
      ...(settings.effort ? {output_config: {effort: settings.effort}} : {}),
      ...(settings.fallbacks
        ? {betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const}
        : {}),
    });
    await store.increment(spendKey, tokensUsed(reply.usage), 60 * 60 * 26);
    // Content is returned whole, thinking blocks included, because the app
    // must pass them back unchanged on the next turn.
    return json(
      {
        content: reply.content,
        stop_reason: reply.stop_reason ?? 'end_turn',
        stop_details: reply.stop_details ?? null,
        model: reply.model,
      },
      200,
      origin,
    );
  } catch (error) {
    // Most specific first. APIConnectionError is a subclass of APIError in the
    // TypeScript SDK, so it has to be checked before the base class.
    const retryAfter =
      error instanceof Anthropic.APIError ? (error.headers?.get?.('retry-after') ?? null) : null;
    const retryHeader: Record<string, string> = retryAfter ? {'Retry-After': retryAfter} : {};
    if (error instanceof Anthropic.RateLimitError)
      return fail('The reasoning service is busy. Try again shortly.', 429, origin, retryHeader);
    if (error instanceof Anthropic.InternalServerError && error.status === 529)
      return fail(
        'The reasoning service is overloaded. Try again shortly.',
        503,
        origin,
        retryHeader,
      );
    if (
      error instanceof Anthropic.AuthenticationError ||
      error instanceof Anthropic.PermissionDeniedError
    )
      return fail('The reasoning service is not configured correctly', 503, origin);
    if (error instanceof Anthropic.NotFoundError)
      return fail('The configured model is not available', 502, origin);
    if (error instanceof Anthropic.APIConnectionError)
      return fail('The reasoning service could not be reached', 502, origin);
    if (error instanceof Anthropic.APIError)
      // Surface the status, never the upstream body: it can echo request content.
      return fail(`Reasoning service returned HTTP ${error.status ?? 'error'}`, 502, origin);
    return fail('The reasoning service failed', 502, origin);
  }
}

// Cloudflare Workers / Deno Deploy entry point.
export default {
  fetch: (request: Request, env: BrokerEnv) => handleAgentRequest(request, env),
};
