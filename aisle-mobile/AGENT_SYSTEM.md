# Aisle data and personalization system

> **The agent layer is documented in [`AGENTIC_SYSTEM.md`](AGENTIC_SYSTEM.md).**
> That document covers the tool-using agent added on top of this pipeline:
> store and feed discovery, the evidence ledger behind every price, the policy
> layer that scrubs unverifiable statements out of generated text, and the
> shopper model. The bounded pipeline below is unchanged and still runs.

The default application now uses observed retailer data. The old hash-generated prices are available only through the explicitly labelled sample demo. They never enter the observed-price engine.

## Runtime workflow

1. Load the household's persisted list, preferences, selections and optional learning events.
2. Read the shared retailer cache. Refresh old sources on app entry or a requested price check, with a shared one-hour cooldown and two-minute lease. This is an on-demand bounded workflow, not an unattended scheduler.
3. Collect fixed public catalogues from Goodness Me! and Denninger's. Check robots rules and the storefront's active CAD currency, cap response sizes and variants, parse decimal prices into integer cents, preserve availability and record source URLs, observation times and 24-hour expiry. A failed source produces an unavailable state, never synthetic prices.
4. Score candidate products by name overlap, brand, normalized package and, when opted in, a recency-weighted Beta-Bernoulli estimate of brand acceptance. Exact item locks, excluded foods, protected brands and substitution settings constrain candidates. All retailer product mappings require user confirmation because catalogue names are not reliable SKU identities.
5. Normalize the requested quantity into retailer packs, rounding up to cover the requested mass, volume or count. Incompatible or unknown units cannot complete known-size list items. Custom list items explicitly count the selected retailer pack. Sum confirmed pack prices in integer cents. Missing or expired lines prevent a complete basket. Like-for-like differences require the same confirmed title, brand and normalized pack. Online prices never generate an in-store destination recommendation.
6. Recommend replenishment from explicit favourites and opted-in purchases, using median recorded purchase intervals when there is enough history and the selected shopping cadence otherwise. Dietary restrictions restrict suggestions; allergens pause them because verified ingredient records are missing.
7. Recompute immediately after preference or list changes. Persist explicit retailer selections whether learning is enabled or disabled. Turning learning off ignores behavioural events; the existing Forget control clears them.

## What the profile changes

| Input | Behaviour |
|---|---|
| City, pin and radius | Coarse directory query, exact client-side distance filtering |
| Preferred stores | Prioritize mapped preferred chains unless closest-first is chosen |
| Shopping priority | Order nearby stores; online baskets stay product-price comparisons without invented travel costs |
| Transport | Explain the limits of straight-line distances for the chosen travel mode; no invented routes or costs |
| Weekly budget and cadence | Per-shop budget = weekly budget × cadence days / 7; budget warnings |
| Household size | Per-person budget context; quantities are not guessed or overwritten |
| Favourite products | Candidate replenishment suggestions |
| Protected brands, category locks and substitutions | Candidate filtering |
| Exclusions and food restrictions | Suggestion constraints and ingredient-review notices |
| Opt-in purchase/choice history | Replenishment timing and brand-acceptance score |

## Storage and interfaces

- `GET /api/market`: last cached source results.
- `POST /api/market`: household-authorized bounded price refresh.
- `POST /api/places`: household-authorized coarse-area directory lookup, cached 24 hours (5 minutes after a failure).
- `PUT /api/state`: existing optimistic-concurrency household persistence, now including retailer product selections and optional brand feedback.
- D1 `market_sources`: shared source payload, checked time and lease. Existing household data remains owner-scoped.
- Native iOS/Android: the same normalizer and recommendation engine, device-local cache and explicit selections. Retailer reads use Capacitor HTTP on device; browser fallback is subject to retailer CORS policy. Nearby discovery uses the public Overpass endpoint.

## Coverage and remaining integration work

Goodness Me! is sampled through its produce and food/drink collections (up to 250 products each); Denninger's through its public catalogue (up to 250 products). These are **online catalogue observations**, not full Ontario grocery inventory, complete retailer coverage, verified ingredients, branch stock or checkout totals. Public endpoints can change or be withdrawn. Keep source status visible; arrange supported licensed feeds before a broad commercial launch.

Nearby stores come from OpenStreetMap through Private.coffee. Only a coarse 0.05-degree cell is sent; names, medical preferences, baskets and exact pins stay in the application. Fetch radius is 29 km, maximum 400 mapped places; display filters to the user's exact radius. Distances are straight-line and directory coverage may be incomplete. This data is independent of price coverage.

The system is an explainable statistical recommender inside a bounded agent workflow. It does not call an LLM, train a language model, autonomously purchase groceries, or run in the background after the app closes. Complete local-store optimization still requires authenticated/licensed branch-level price, stock and product-identity feeds. Adding a language model does not supply that missing data.

## Validation

`tests/agent.test.ts` covers normalization, invalid prices, crawl restrictions, malformed feeds, quantity arithmetic, incomplete basket exclusion, stale observations, hard constraints, cadence budgets, opt-in learning, restriction handling, comparable packs and location filtering. These use clearly labelled test fixtures; no fixture is seeded as a live offer.

On 19 September 2026, direct public requests captured real responses from both retailers. The collector validated 350 Goodness Me! and 240 Denninger's online price records (491 available). Those real responses were loaded into the local preview cache to verify matching and persistence. They are not shipped as production seed data. Preview outbound collection failed, and the directory timed out in both the preview and direct checks. Production/runtime connectivity therefore remains unverified; fallback states are visible. Both native projects require device-level network and OS testing.

Sources: [Goodness Me!](https://goodnessme.ca), [Denninger's](https://denningers.com), [Shopify product data](https://shopify.dev/docs/api/ajax/reference/product), [Private.coffee Overpass terms](https://overpass.private.coffee/), [OSM licence](https://www.openstreetmap.org/copyright).
