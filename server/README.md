# Aisle reasoning broker

The mobile app has no API key. When a broker is configured, the agent posts
its conversation to this handler. The handler calls the Anthropic Messages API
through the official TypeScript SDK, using a key that stays on the server. With
no broker, the app uses its rule-based planner and says so in the interface.

`agent-broker.ts` exports `handleAgentRequest(request, env, deps?)`, a
Fetch-API handler, and a `default` export in the `{fetch}` shape that
Cloudflare Workers and Deno Deploy expect. On plain Node 22, wrap it in any
server that hands it a `Request` and sends back the `Response`.

## Configuration

| Variable | Required | Meaning |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | yes | Only ever set as a server secret. Never put it in the app's `.env`. |
| `ALLOWED_ORIGINS` | yes | Comma-separated origins the app runs on. For the Capacitor shells these are `capacitor://localhost` (iOS) and `https://localhost` (Android). Add the web origin if you host the web build. `*` is ignored. With no origins set, every request gets a 503. |
| `RATE_LIMIT_PER_MINUTE` | no | Requests per client per minute. Default 12. |
| `DAILY_TOKEN_BUDGET` | no | Input plus output tokens the whole deployment may spend per UTC day. Default 2,000,000. After that the broker answers 503 until midnight UTC, and the app falls back to its planner. |

`ALLOWED_ORIGIN` (singular) is still read as an older name for the same thing.

In the app build, set `VITE_AISLE_AGENT_ENDPOINT` to the broker's `https://`
URL (see `aisle-mobile/.env.example`).

## What it refuses

The broker is on the open internet in front of a paid key, so it forwards as
little as it can:

- **Origin check.** This check is not authentication. A script can send any
  `Origin` it likes. The check only stops the key being spent from another
  website. The real guards are the rate limit and the daily budget.
- **Models.** Only `claude-opus-5-5` (the app's default), `claude-sonnet-5-5`
  and `claude-haiku-4-5` are forwarded. Any other model gets a 400.
- **Tools.** Only the app's own custom tools are forwarded: a name, a
  description and an input schema, with no `type`. Anthropic's server tools
  (web search, code execution and so on) would run on this key's bill, so the
  broker rejects them.
- **Size.** Bodies over 400 KB get a 413. More than 32 tools gets a 400.
  `max_tokens` is clamped to 1,024–16,000.
- **Errors.** Upstream error bodies are never echoed back, because they can
  contain request content. Rate limits (429) keep the upstream
  `Retry-After`. Overload (529) becomes a 503. Key and permission problems
  become a 503 that says the service is misconfigured.

## Request settings

- **Effort.** Opus 5.5 and Sonnet 5.5 are sent `output_config.effort:
  "medium"`. Thinking is always on for these models and counts towards
  `max_tokens`, so effort is the control for cost and latency. Haiku 4.5 is
  sent no effort.
- **Refusal fallbacks.** Opus 5.5 and Sonnet 5.5 requests opt in to
  server-side refusal fallbacks (`fallbacks: "default"` under the
  `server-side-fallback-2026-07-01` beta). If the safety classifier declines a
  request by mistake, the API retries it on another model instead of
  returning a refusal. To turn this off, set `fallbacks: false` for the model
  in `MODELS`. Fallback attempts are billed. The budget counts every attempt
  in `usage.iterations`.
- **Content.** Replies are returned whole, thinking blocks included. The app
  sends them back unchanged on the next turn, as the API requires.
- **Refusals.** A refusal is passed through as `stop_reason: "refusal"`. The
  app treats it, and a `max_tokens` cut-off, as a failed run and falls back to
  its planner. It never shows a declined or truncated reply as an answer.

## Counters

`MemoryStore` keeps the rate and budget counters in process memory. That is
fine for a single Node process. Serverless platforms run many isolates, each
with its own memory, so a production deployment should pass a shared
`BrokerStore` (Workers KV or a Durable Object, Deno KV, Redis) in `deps.store`.
It only needs `increment(key, by, ttlSeconds)` and `get(key)`.

## Tests

`aisle-mobile/tests/broker.test.ts` covers all of the above with a fake SDK
client, plus the app-side loop's handling of refusals, cut-offs and thinking
blocks. Install this package first (`npm ci` here), then run `npm test` in
`aisle-mobile`.
