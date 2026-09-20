# The Aisle agent

Aisle matches a household's grocery list against prices that real Ontario
retailers are publishing right now, and it personalizes that matching to the
household. This document describes how that is built and, just as importantly,
what the system refuses to do.

## The one rule everything else serves

**A number Aisle cannot trace to a response it received is not shown.**

There is no estimation path, no "typical price", no national average, no model
recalling what bread costs. When Aisle does not know a price, the interface says
so and the item stays visibly unpriced. An honest gap is a correct answer; a
plausible number is not.

This matters most because the system uses a language model. Models are good at
the judgement call in the middle of this problem — is *"Dempster's 100% Whole
Wheat, 675 g"* in a catalogue the same thing as *"whole wheat bread"* on
someone's list? — and they are also perfectly capable of producing a confident
price that nobody charges. The architecture below gives the model the first job
and structurally denies it the second.

## Where AI is used, and where it is not

| Step | Who does it |
|---|---|
| Finding stores near the household | OpenStreetMap directory query |
| Deciding which retailers can be read | robots.txt, storefront currency, payload probe |
| Collecting prices | Retailer adapters over HTTPS |
| Deciding *which* catalogue product is the requested item | **Language model**, or rule-based matching when none is configured |
| Ranking, quantities, totals, budgets | Integer-cent arithmetic in `tools.ts` |
| Enforcing locks, exclusions, protected brands | Deterministic guards inside the tool handlers |
| Writing the explanation | **Language model**, then scrubbed by `policy.ts` |
| Confirming a match | The household, in the app |

The model never returns a price, a distance, a store or a total. It selects
among records the collect phase already fetched.

## The loop

`runAgent()` in `src/lib/agent/orchestrator.ts` runs five phases.

1. **Discover.** Query the OpenStreetMap directory for a coarse cell around the
   household's saved pin, keep the results inside Ontario, and filter to their
   exact radius. Mapped `website` tags become feed candidates — Aisle does not
   guess retailer domains from chain names.
2. **Collect.** Probe candidates: robots.txt must permit the path, the
   storefront must declare an active CAD currency, and the catalogue must parse.
   Only then are prices read. Every response is written to an evidence ledger
   with its status, byte count, SHA-256 and timestamp, and every offer parsed
   out of it carries that row's id.
3. **Match.** The model works through the list with the tools below, or the
   rule-based planner does when no model is configured.
4. **Verify.** Every offer still referenced is re-checked against the ledger:
   the evidence row must exist and be a 200, the price must be positive integer
   cents in CAD, the observation must not be stale or in the future, and the
   product must be available. Anything failing is discarded *before* arithmetic.
5. **Compose.** Totals are computed in integer cents. The explanation then goes
   through the policy scrubber, which removes any money figure, distance or
   offer id the run cannot support and records it as a violation.

Each phase appends to a trace with timings, so the whole run is inspectable.

## Tools

The model's entire surface. Each is plain TypeScript with zod-validated
arguments; a malformed or over-reaching call is refused with a message the model
can read and correct.

| Tool | Returns |
|---|---|
| `get_shopper_profile` | Explicit preferences plus learned brand rates and repurchase timing |
| `get_grocery_list` | The list, with quantities and locks |
| `find_stores_nearby` | Mapped Ontario stores, distances, and chains with no price feed |
| `discover_price_feeds` | Per-retailer verdict on whether a catalogue is readable |
| `collect_prices` | Fresh price records with evidence ids |
| `search_offers` | Collected records only |
| `propose_match` | Records a proposal — refused if it breaks a household rule |
| `flag_unavailable` | Records an honest gap |
| `compute_basket` | Integer-cent totals against the per-shop budget |

Three things the tools structurally prevent:

- **No inventing offers.** `propose_match` refuses any offer id that is not in
  the collected pool, and any offer whose evidence row is missing.
- **No overriding the household.** Excluded products, locked items, protected
  brands and category locks are enforced in the handler. A model that argues a
  cheaper substitute is better gets a refusal, not a match.
- **No self-confirmation.** The agent produces proposals. `offerSelections` —
  the household's own confirmations — is what makes a line count toward a
  total. Proposals are reported as `awaitingConfirmation`.

## Personalization

`memory.ts` derives a shopper model from what the household actually did:

- **Brand acceptance** per category, as a recency-weighted Beta-Bernoulli rate
  with a 60-day half-life and a uniform prior, so one observation nudges and
  never concludes. It is bounded to ±0.5 in ranking: a learned preference can
  reorder near-ties and can never outrank a hard constraint or a price.
- **Repurchase timing** from the median gap between recorded purchase days,
  falling back to the chosen shopping cadence until there are enough days.
- **Retailer affinity** from confirmed matches and recorded trips.
- **Confidence**, so the interface can say how much evidence is behind a
  suggestion rather than implying certainty.

Two rules hold without exception:

1. **Allergies and dietary restrictions are explicit only.** They are never
   inferred from behaviour and never relaxed. Because these catalogues carry no
   verified ingredient data, listing an allergen pauses automatic food
   suggestions rather than filtering them, and the policy layer deletes any
   allergen-safety wording from generated text.
2. **Learning off means nothing derived.** Every behavioural field is empty, and
   the existing Forget control clears the events permanently.

## Keys and the broker

The app holds no API key. Model requests go to a broker you run
(`server/agent-broker.ts`, a plain `(Request) => Response` handler for
Cloudflare Workers, Deno Deploy or Node behind your own TLS) which attaches the
key server-side, pins the model to an allow-list and caps tokens.

```sh
VITE_AISLE_AGENT_ENDPOINT=https://your-broker.example.com/agent
VITE_AISLE_AGENT_MODEL=claude-sonnet-5
```

With no endpoint set, `runAgent` runs the rule-based planner and reports
`mode: 'deterministic'`. If the broker fails mid-run it degrades to the same
planner and records a warning. **Accuracy does not depend on the model being
available** — only the quality of matching and explanation does.

## Network safety

Tool arguments are model-chosen, so no URL is trusted. `net.ts` enforces: HTTPS
only, no credentials in the URL, no non-standard port, no loopback / private /
literal-IP host, host must already be in the run's allow-list from registry or
map discovery, and no account, cart or checkout path. Responses are capped at
4 MB and the evidence ledger at 12 MB per run. Reads are bounded: no recursive
crawling, no authenticated endpoints, no checkout.

## What this still does not do

Being direct about the ceiling, because the honest-data rule cuts both ways:

- **Major chains are not priced.** Loblaws, Metro, Sobeys, Walmart, Costco and
  their banners publish no public machine-readable price feed. `registry.ts`
  records that, the agent reports those stores near you *without* prices, and it
  never estimates them. Real coverage needs licensed retailer feeds.
- **These are online catalogue prices, not branch prices.** Aisle will not send
  someone to a shop because of an online price, and says so.
- **Ingredients are unverified.** This is not an allergy-safety tool.
- **Distances are straight-line.** No routing, travel cost or transit data.
- **No background activity.** The agent runs when asked, within a step, time and
  byte budget, and stops.

## Running the tests

```sh
npm run check   # TypeScript across src, tests and the broker
npm test        # 28 tests covering the agent
```

The suite is written mostly as attempts to smuggle a fabricated price through
the pipeline — offers with no evidence, forged evidence ids, stale and non-CAD
prices, invented figures in generated prose, offer ids that were never
collected, matches that break a lock — and confirms each one fails. Fixtures are
clearly synthetic and never loaded by the application.
