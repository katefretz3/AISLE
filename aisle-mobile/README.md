# Aisle — iOS and Android

A grocery planning app for Ontario households. React 19, TypeScript, Vite 8 and
Capacitor 8; the iOS and Android projects are in `ios/` and `android/`.

Its governing rule, from the first day: **the app does not make up information
to have something to show.** A price on screen came from a response Aisle
received, or the household typed it and it is labelled as theirs. Anything else
is shown as missing.

Start with [`docs/HANDOFF.md`](docs/HANDOFF.md) for the current state and what
is left to do.

## What it does

- **Setup** in four steps: city and search area on a map, household, cadence,
  budget, priorities, dietary and allergen settings, protected brands, and at
  least five usual items. "Explore first" skips it.
- **A 557-item catalogue** shaped like a shop (14 departments, 76 aisles), with
  everyday synonyms in search and dual-home items cross-listed.
- **Price checks.** A tool-using agent finds mapped grocery stores near the
  household (OpenStreetMap), works out which publish a readable public
  catalogue, collects prices, matches them to the list and totals each
  retailer's basket. Every price carries an evidence id pointing at the HTTP
  response it came from; anything that fails verification is dropped before any
  arithmetic. See [`AGENTIC_SYSTEM.md`](AGENTIC_SYSTEM.md).
- **The last check is kept for 24 hours** on the device and reused on the next
  launch, for the same search area only. Each price stops being shown when it
  expires (24 hours after it was read), and the summary says when prices were
  checked.
- **Compare baskets**: a complete basket always outranks a partial one, and a
  basket with gaps is never called the cheapest.
- **In the shop**: a checklist in walking order with a live running total that
  counts only what is ticked, and **shelf prices** the household reads off a
  label (optionally with a photo). Those are stored as the household's own
  readings, never presented as verified, and deleted after a year.
- **Spending**: record what you paid per shop, optionally per item, with a
  receipt photo. That record becomes price history ("paid $3.49 at Metro") and
  repurchase timing. Estimates are only scored against the till when the whole
  list was priced.
- **Account and legal**: one settings screen; Terms, Privacy and Data sources
  written to describe what the app does. Erase everything resets the saved
  household and deletes receipt and label photos, the saved check and the
  directory cache.

Coverage is honest about its ceiling: the big Ontario chains publish no public
machine-readable price feed, so they appear near you without prices. Online
catalogue prices are not branch prices. Ingredients are not verified, so this is
not an allergy-safety tool. Distances are straight-line.

## Run it

Node.js 22.13 or newer.

```sh
npm ci
npm ci --prefix ../server   # the reasoning broker's SDK; the typecheck includes it
npm run verify              # typecheck, lint, format, unit tests, build
npm run test:e2e            # browser tests against the production build
npm run dev                 # local preview
```

| Script                  | What it does                                                            |
| ----------------------- | ----------------------------------------------------------------------- |
| `npm run check`         | TypeScript across `src`, `tests`, `tools` and `../server`               |
| `npm run lint`          | ESLint (CI runs it with `--max-warnings 0`)                             |
| `npm run format:check`  | Prettier                                                                |
| `npm test`              | 149 unit tests on Node's runner (`tests/*.test.ts`)                     |
| `npm run test:e2e`      | 11 Playwright tests (`tests/e2e`), 13 runs across phone and desktop     |
| `npm run release:check` | Refuses a release with placeholder legal details or mismatched versions |
| `npm run release`       | verify, release check, then `cap sync`                                  |
| `npm run art`           | Redraw the fallback product illustrations                               |
| `npm run photos`        | Fetch generic product photos (needs network; see below)                 |
| `npm run ia`            | Simulated card sort and tree test over the catalogue                    |

The unit tests are written mostly as attempts to get a fabricated price through:
absent or forged evidence, stale and non-CAD prices, invented figures in
generated text, offer ids never collected, a saved check edited on disk,
matches that break a household lock. Each has to fail closed. The browser tests
answer every outside request with a synthetic fixture or refuse it.

CI (`.github/workflows/ci.yml`) runs verify, a dependency audit and the browser
tests on every push; the release check runs on `v*` tags.

### iPhone / iPad

On a Mac with Xcode: `npm run release` (or `npm run build && npx cap sync`), then
`npm run ios`. The project uses Swift Package Manager. Replace the bundle id
`ca.aisle.grocery` with one you own before distribution.

### Android

Android Studio, SDK 36 and JDK 21, then `npm run android`. Generate your own
signing key; none is included.

Neither native app has been compiled in this repository's CI or build
environment (no Xcode, no Android SDK). See the handoff.

## The reasoning service (optional)

The app bundles no API key. When `VITE_AISLE_AGENT_ENDPOINT` points at a broker
you run ([`../server`](../server/README.md)), a model helps match catalogue
titles to list items and explains the result; it is given no way to produce a
price, a distance or a total, and generated text is checked afterwards for
figures that no tool produced. Without a broker, or when the broker fails,
refuses or runs out of room, the rule-based planner does the matching and the
prices are identical. The privacy policy lists every field the model receives,
and a test fails if that list changes without the policy changing.

## Where data goes

- **Stays on the device**: the household, lists, trips, receipt and label
  photos, the saved price check, the directory cache. No account, no cloud copy.
- **Store directory** (Overpass, three public mirrors in turn): a coarse search
  area, rounded to about 5 km.
- **Retailer sites**: ordinary requests for public catalogue pages.
- **Map tiles** (OpenStreetMap): the area being viewed.
- **Reasoning broker, only if configured**: the list, collected offers, nearby
  shops and the household profile, including allergies and dietary needs.
  Section 4 of the privacy policy has the full list.

On a native build, retailer and directory requests go through Capacitor HTTP
with the `USER_AGENT` in `src/lib/agent/net.ts`; set `VITE_AISLE_CONTACT_URL` to
add a contact page to it. In a browser, CORS limits which retailers can be read.

## Product photographs

`npm run photos` fetches one generic, unbranded photograph per catalogue item
and writes `public/images/photos/<id>.png` (exactly 512 × 512, fitted without
cropping on a transparent surround), a credits file, and a manifest the app
reads. `--verify` re-checks every file. Each item's `photo` field in the taxonomy is a
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

**This has not been run against the live APIs.** The environment this was built
in blocks outbound requests to image hosts at the egress proxy (HTTP 403 for
Openverse, Wikimedia and Open Food Facts alike; rechecked 28 September 2026), so the pipeline is verified up
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
to _concepts_ and never to departments, which is what keeps the study from
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

## Account settings and legal screens

`src/app/account.tsx` is the single place a household changes anything about
itself: profile, household size and cadence, budget and shopping priority,
location and preferred chains, dietary and allergen settings, and what the app
is allowed to remember. It replaced the older scattered preferences view rather
than sitting beside it, so there is one settings screen rather than two
competing ones. `#preferences` still resolves there.

Each section is a card with the same header shape, so the page scans as a list
of decisions. Derived figures — days per shop, budget per shop, per person —
are shown next to the inputs that produce them. The destructive controls sit at
the bottom, visually separated, behind a confirmation that names exactly what
will be lost: there is no account and no server copy, so an accidental erase is
not recoverable.

`src/app/legal.tsx` renders three documents from `src/lib/legal.ts`: Terms of
Use, Privacy Policy, and Data sources & attribution. Keeping them as structured
data rather than prose blobs means the contents list cannot drift from the body
and a diff shows exactly which clause changed.

**The documents are drafts, and they are not legal advice.** They were written
to describe what this application actually does — device-local storage, no
accounts, coarse location only, unverified ingredient data, Ontario-only
coverage — so that a lawyer has something accurate to review instead of a
generic template. Operator details (legal name, contact addresses, effective
date) are `PLACEHOLDER` values in `src/lib/legal.ts`, and while any remain the
legal screens show a blocking notice naming the unfilled fields. Fill them in
and get the wording reviewed before release.

The Privacy Policy is reachable from five places, because the question comes up
in more than one moment: during onboarding next to "No account needed", from the
"How Aisle works" dialog, from Account settings, from the sidebar, and from the
workspace footer.

The Data sources page is not optional decoration: OpenStreetMap's ODbL requires
visible attribution, and a test asserts that the credit and the licence are
both present.

## One run, shared by every screen

`src/lib/use-agent-run.ts` owns the agent run and `aisle-app` passes it down.
Before, the run lived inside the home screen, which meant only the home screen
had verified prices: "Compare stores" fell back to rendering the same component,
the shopping checklist could never be started because nothing could set an
active basket, and the budget card showed a dash. Those were three symptoms of
one cause.

Now the home screen, Compare baskets, the checklist and the budget card all read
the same run. Confirming a match re-totals every one of them at once through
`basketsFrom()`, with no re-collection, so a figure cannot drift between screens.

Two rules hold throughout. A complete basket always outranks a partial one, and
an incomplete basket is never labelled cheapest — only best-covered, with a
coverage meter so a cheap-looking half-priced basket cannot mislead. And every
line total is the cost of that whole list line, packs included: the screens
render it directly rather than multiplying by quantity again, which a test
guards because doing it twice would silently double every multi-unit row.

## In the shop

Two details on the checklist matter more than they look.

**It is ordered by the walk, not by the list.** `src/lib/shopping-order.ts` holds
a walk order that is deliberately different from the catalogue's browse order:
browsing is a lookup problem, walking is a route problem. Perimeter departments
come first and frozen comes last, because picking frozen up first means carrying
thawing food around the shop. Items somebody typed themselves have no department
and collect in one group at the end rather than being scattered. A toggle returns
to list order and the choice is remembered.

**The total is live, pinned, and honest.** It counts only what has actually been
ticked. An item that was picked up but that nothing could price is reported
separately rather than counted as zero — counting it as zero would make the
running total read lower than the shop really is, and that is the one number a
shopper has to be able to trust. A test guards it.

## Starting from a previous list

Most shops are mostly the same list, so retyping it is the largest piece of
avoidable work in the app. Finishing a shop snapshots that list automatically,
which means "start from last shop" always exists without anyone deciding to save
anything. Lists can also be named and kept, and automatic snapshots are pruned
without ever crowding out a named one.

"Your usuals" combines the staples chosen during setup with whatever the shopper
model says is due again. Adding something already on the list raises its quantity
instead of creating a second line to tick twice in the shop.
