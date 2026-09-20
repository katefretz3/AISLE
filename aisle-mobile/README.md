# Aisle — iOS and Android

A mobile grocery planning app with Ontario city selection. Built with React 19, TypeScript, and Capacitor 8.5.2. The iOS and Android projects and their bundled interfaces are included.

## What works

- Four-step, phone-first onboarding followed by a brief saving animation: city, household, cadence, budget, shopping priorities, travel, dietary restrictions, protected brands, at least five basket favourites, and optional learning. Revisiting setup preserves the current list unless replacement is explicitly selected.
- Interactive OpenStreetMap centred on the selected Ontario city, a radius circle, draggable search pin, tap-to-select location, zoom controls, and a keyboard-friendly “Use map centre” action. City, radius, custom search point, and multiple preferred chains persist with the profile.
- Recognizable PNG logos for 14 chains, with source attribution in `public/images/stores/provenance.json`.
- A 557-item catalogue organized the way a shop is: 14 departments → 76 aisles → items (Produce → Fruit → Blueberries), with keyword search that understands everyday synonyms (“pop” finds cola, “capsicum” finds bell peppers, “mince” finds ground meat). Items that honestly live in two places, like frozen blueberries, are cross-listed rather than filed once and lost.
- A picture for every item. `npm run photos` fetches a generic, unbranded photograph per item; `npm run art` draws a flat illustration as the fallback. Nothing ever renders without an image.
- An information-architecture study (`npm run ia`) that runs a simulated card sort and tree test over the whole catalogue and reports which placements are contested. See `docs/ia-study.md`.
- Editable grocery lists, paste import, product matching, quantities, brand locks, and sharing.
- An on-demand price collection pipeline for two public online catalogues, with CAD verification, source links, freshness, availability, and honest failure states.
- A tool-using agent that discovers nearby Ontario stores, probes which publish a readable catalogue, collects prices, matches the list and totals it — with an evidence ledger behind every figure and no estimation path. See `AGENTIC_SYSTEM.md`.
- User-confirmed retailer matches, normalized pack quantities, integer-cent basket totals, and per-shop budget checks. Unknown prices or incompatible units prevent a complete basket.
- Explicit brand and item locks constrain product matching. Dietary preferences and exclusions constrain replenishment suggestions; ingredient records remain unverified.
- Adaptive recommendations from explicit favourites, accepted/rejected swaps, and purchases confirmed through shopping checks or entered item prices. Reasons are visible. Behavioural learning is opt-in and can be cleared.
- Shopping checklists, receipt camera/photo picker integration, receipt image storage, manually entered totals, and spending history.
- Device storage for profiles, lists, receipts, and learning history. Saved lists and preferences work offline; observed prices expire after 24 hours. A separate labelled sample demo is available. It does not require a hosted webpage to render and does not contain a remote `server.url`.
- Native Android back-button handling and native share sheets. App icons, launch imagery, iOS usage descriptions, and privacy manifest are included.

## Run the project

Use Node.js 22.13 or newer, then:

```sh
npm ci
npm run check    # TypeScript across src, tests, tools and the broker
npm test         # 36 tests covering the agent and the catalogue
npm run art      # redraw the fallback illustrations from the taxonomy
npm run ia       # simulated card sort + tree test over the catalogue
npm run photos   # fetch real generic photos (needs outbound network)
npm run build
npx cap sync
```

### iPhone / iPad

On a Mac with an Xcode version supported by Capacitor 8:

```sh
npm run ios
```

Open `ios/App/App.xcodeproj`, let Swift Package Manager resolve packages, choose your Apple development team, select a simulator or connected phone, and run. The project uses Swift Package Manager, not CocoaPods. Replace the provisional bundle ID `ca.aisle.grocery` with an identifier you own before distribution.

### Android

Install Android Studio, Android SDK 36, and the JDK required by the installed Capacitor/Gradle versions (JDK 21 for Capacitor 8). Then:

```sh
npm run android
```

Open `android/`, let Gradle sync, select an emulator or connected phone, and run. Generate your own signing key for a Play Store release. No signing keys or credentials are included.

### Local interface preview

```sh
npm run dev
```

Use the browser’s responsive mode. Capacitor supplies browser fallbacks for storage, but camera/share behaviour must be tested on the target operating systems.

## The agent

`src/lib/agent/` holds a tool-using agent that discovers Ontario grocery stores
near the household, works out which of them publish a readable price catalogue,
collects current prices, matches them to the grocery list, and totals the
result. `AGENTIC_SYSTEM.md` documents it in full.

Its governing rule: **a number that cannot be traced to a response Aisle
received is not shown.** Every price carries an evidence id pointing at the HTTP
response it was parsed from — status, byte count, SHA-256 and timestamp — and a
verification pass discards anything that fails before any arithmetic runs. There
is no estimation path.

A language model does the judgement work in the middle: reading the list, and
deciding whether a catalogue title really is the product that was asked for. It
is given no way to produce a price, a distance or a total — those come from
tools — and generated prose is scrubbed afterwards, with any unsupported figure
removed and recorded as a violation. Hard constraints (locked items, excluded
products, protected brands, category locks) are enforced inside the tool
handlers, so a model cannot argue past them. The agent proposes; the household
confirms.

The app bundles no API key. Model requests go through a broker you run
(`../server/agent-broker.ts`); copy `.env.example` to `.env` to point at it. With
no broker configured the agent runs a rule-based planner instead and reports
`mode: 'deterministic'` — prices and totals are identical either way, only the
explanation quality changes.

Personalization is derived from the household's own actions: recency-weighted
brand acceptance, median repurchase intervals, retailer affinity, and a
confidence level. Allergies and dietary restrictions are explicit only, never
inferred and never relaxed; with learning off, nothing behavioural is derived at
all.

The agent is what the main screen shows. `AgentWorkspace` calls `runAgent()` and
renders the result: a live phase trace, which retailers were readable, each list
item with its proposed match (or an honest gap and the reason), per-retailer
baskets, nearby stores with their feed status, and an expandable evidence table
listing every HTTP response behind the figures — status, size, SHA-256 and time.
Confirming or withdrawing a match re-totals instantly from the run snapshot,
without re-collecting.

```ts
import {runAgent} from '@/lib/agent';
const run = await runAgent({state});
// run.baskets, run.unmatched, run.evidence, run.trace, run.warnings, run.violations
```

## Personalization model

`src/lib/agent/` contains the bounded collect → validate → match → learn → compare workflow. The model uses explicit preferences, recency-weighted brand acceptance, and purchase intervals for replenishment. Quantity calculations normalize mass, volume and count, rounding up retailer packs to cover the requested amount. Unverified sizes cannot complete a basket. See `AGENT_SYSTEM.md` for interfaces and limitations.

This is a small adaptive recommender, and it remains deterministic. No language model is trained here, and none is called on this path. The agent layer above may call one for matching and explanations when a broker is configured, but exact money calculations and hard constraints stay in this deterministic code either way. There is no background loop, purchased-data profiling, or automatic ordering.

Behavioural learning is off by default. Turning it off stops collecting and using behavioural events; the separate Forget control erases those events and learned category preferences. Explicit food preferences remain editable. Allergy information is never inferred.

## Data and integration boundaries

- The default uses limited public online catalogue observations from Goodness Me! and Denninger’s. These are not branch prices, branch stock, full inventories, or checkout totals. Major-chain price feeds are not connected. No in-store destination is inferred from online prices.
- Nearby-store lookup uses OpenStreetMap through Private.coffee, sending a coarse search area. Failures are visible; map coverage may be incomplete. User radius and preferred chains filter and order returned locations. Routes and travel costs are not connected.
- Retailer and directory requests use native Capacitor HTTP on iOS/Android. Browser fallback can be limited by CORS. Successful retailer checks are cached for an hour, prices expire after 24 hours, and directory results cache for 24 hours (five minutes after a failure).
- The separate sample demo retains six illustrative catalogues and travel estimates; they do not enter the observed-price engine.
- Maps use real geography and require internet access. Map tiles are requested from OpenStreetMap; the viewed map area is therefore visible to the tile provider. Tile attribution remains displayed and offline tile downloading is not implemented. The rest of the sample grocery planner can work offline.
- Product ingredient and allergen records are not verified. With ingredient restrictions selected, automatic food suggestions and swaps pause. With dietary preferences selected, new suggestions are limited to plain produce and swaps pause. This is not a medical or allergy-safety tool; users still inspect labels.
- Receipt capture and storage work in the native code; automatic OCR is not connected. Enter totals manually.
- Native data remains inside the app’s device storage. Cloud synchronization and cross-device sign-in are not connected. The separately hosted web preview uses its own account/guest database. The two data stores do not synchronize.
- Receipt totals record spending. Real savings cannot be verified until reliable comparison prices exist for the same items, date, and store location.
- No analytics or external AI services receive personal data from the native build. Retailer servers receive catalogue requests; the directory receives the coarse search area. Adding services requires updating privacy disclosures and consent.

## Validation completed

TypeScript checks across `src`, `tests` and the broker, the 28-test agent suite, and production web bundling all passed in this environment. TypeScript checks and production web bundling passed. Capacitor generated and synchronized both native projects with their plugins. Browser checks covered onboarding, persisted profiles, matching, list edits, basket rankings, dietary restrictions, mobile layouts, shopping checklists, receipt image upload in the hosted implementation, and recorded spending. Pure-logic checks covered quantities, missing prices, brand locks, opt-in learning, constraints, and ranking priorities. The compiled mobile interface also passed a browser-fallback storage check: new list items survived a reload.

The archive is source plus bundled UI assets, not a signed IPA or APK. Native compilation, camera permission behaviour, hardware back-button behaviour, accessibility on real devices, and offline storage across OS restarts still need testing in Xcode/Android Studio and on physical devices. This Linux environment has no Xcode or Android SDK; signed release builds and App Store / Play Store submission were not performed.

## Before a public pilot

1. Obtain reliable retailer/location price data and product ingredients; retain data timestamps and coverage.
2. Add a production identity/sync service if households need multiple devices. Keep native credentials in Keychain/Keystore rather than source code.
3. Test iOS and Android devices, accessibility, offline recovery, image sizes, and app lifecycle.
4. Provide user-facing privacy/support information under your business identity, verify platform disclosures, and sign release builds.

Official build guidance: https://capacitorjs.com/docs/getting-started

`sync-shared.mjs` is an optional developer helper for copying updated screens from the separately maintained Aisle web project. The source included here is self-contained and does not need that project to build.

The new engine passed 16 focused tests, including quantities across different packs, unverified currency, stale prices, brand constraints, opt-in learning and location filtering. The agent layer adds 36 tests (`npm test`), written mostly as attempts to get a fabricated price through the pipeline: offers with absent or forged evidence, stale and non-CAD prices, invented figures in generated prose, offer ids that were never collected, and matches that break a household lock. Each is confirmed to fail closed. Eight of those cover catalogue integrity: unique ids, every item's artwork present on disk, every legacy product id still resolving so saved lists survive, and dietary rules constraining food without suppressing household goods. Those tests use synthetic fixtures against a stub reader; live collection against real retailers and the assisted path against a real broker still need runtime verification on target devices.

The interface was checked in Chromium at desktop and phone widths: onboarding, the department → aisle → item browser, catalogue search, and a full agent run. This sandbox has no outbound network, so that run exercised the honest-failure path — every item reported as unpriced, with no invented figures — rather than live collection. The normalizer processed 590 real price records captured from the two public retailers on 19 September 2026. Hosted preview outbound collection and directory requests were unavailable during testing; end-to-end live collection and native networking still require target-runtime verification.

## Product photographs

`npm run photos` fetches one generic, unbranded photograph per catalogue item
and writes `public/images/photos/<id>.jpg` (square, 512px), an attribution file,
and a manifest the app reads. Each item's `photo` field in the taxonomy is a
brand-free search phrase — "hazelnut spread" rather than "Nutella", "sandwich
cookies" rather than "Oreo" — and results whose title or creator looks like
branding or packaging are rejected.

```sh
npm run photos                                    # Openverse, no key required
PEXELS_API_KEY=…   npm run photos -- --source=pexels
UNSPLASH_ACCESS_KEY=… npm run photos -- --source=unsplash
npm run photos -- --only=blueberries,milk --force # redo specific items
```

Any item without a photo keeps its generated illustration, so a partial or
interrupted run is always safe and no screen ever shows a gap.

**This has not been run against the live APIs.** The sandbox this was built in
blocks outbound requests to image hosts at the egress proxy (HTTP 403 for
Openverse, Wikimedia and Open Food Facts alike), so the pipeline is verified up
to the network boundary and no further: argument handling, brand rejection,
cropping, attribution, manifest writing and the app's photo-first fallback all
work, but no photograph has actually been downloaded. Run it on a networked
machine and check a sample of the results before trusting the whole set.

## Information architecture

The catalogue's shape is tested, not assumed. `npm run ia` runs a simulated card
sort and tree test across every item and writes `docs/ia-study.md`.

Five synthetic participants each weight a different categorisation cue —
ingredient, storage, meal occasion, processing, store layout — and navigate
using only the labels in the tree. A lexicon (`tools/ia-lexicon.mjs`) maps words
to *concepts* and never to departments, which is what keeps the study from
marking its own homework: the participant is granted knowledge of what the item
is, and the labels have to do the rest.

These are **not real users** and the percentages are not a measurement of human
performance. They are useful for comparing one revision of the tree against the
next, and for finding placements that several different mental models disagree
about. That signal drove real changes: aisles renamed where a label stole
traffic from another ("Canned vegetables & tomatoes" was out-competing fresh
tomatoes), items moved where participants were consistently right (the Asian
sauces now sit in International & Asian), and genuinely dual-home items
cross-listed instead of being filed once.

A test guards the result, so a later change that scrambles the tree fails CI
rather than shipping.
