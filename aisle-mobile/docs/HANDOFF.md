# Handoff

State of `claude/grocery-matching-agent-pk59q1` on 3 October 2026: the
earlier checklist (from commit `0d8690f`) is done, followed by two design passes.
The second pass replaced the visual system, the product pictures and the map
(see "Design pass 2"). Everything in "What was run" was measured on this branch,
and the method is given where it matters. The commit named beside each fix has
its history.

## What was run

| Check                                                                    | Result                                                                                        |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `npm run verify` (tsc, ESLint `--max-warnings 0`, Prettier, unit, build) | clean                                                                                         |
| `npm test`                                                               | **156 / 156** (was 152)                                                                       |
| `npm run test:e2e` (production build, phone + desktop)                   | **29 / 29 runs pass** (24 tests); 3 skipped by design (phone-only checks on desktop)          |
| axe-core WCAG 2.2 A/AA, 7 views × 2 widths × light and dark, populated   | **0 violations**                                                                              |
| Text under 12 px, 7 views × 2 widths                                     | none                                                                                          |
| 48 × 48 tap area, hit-tested, every control on 7 phone views             | **all pass** (a toast briefly covers the footer; excluded)                                    |
| Sideways scroll: 7 views × 2 widths, at 320 px wide, at 200 % text       | none                                                                                          |
| Map: zoom buttons, tap to place, drag the pin, arrow keys, pinch         | pass (against a stub tile; see R9)                                                            |
| Display typeface                                                         | bundled, and loads in the production build                                                    |
| `npm audit` (app and `../server`)                                        | 0 vulnerabilities                                                                             |
| `vite build`                                                             | main chunk 873 KB / 247 KB gzip (was 875 / 242); 558 PNGs (4.9 MB) no longer ship             |
| `npm run release:check`                                                  | **fails, as it should**: the six operator placeholders, and the bundle that carries them (R2) |
| `npx cap sync`                                                           | both platforms sync                                                                           |

Not verifiable here: native iOS/Android builds (no Xcode, no Android SDK), a
real device, VoiceOver and TalkBack, live retailer or Overpass responses,
product photos and real map tiles. This environment's network policy refuses
every third-party host involved (see R6 and R9). All retailer behaviour in the
tests runs the real agent against synthetic fixtures.

---

## Design pass 2

The brief: more colour and depth, real product photographs instead of
generated drawings, consistent spacing, plain words, a real interactive map,
and accessibility to iOS, Android and Ontario standards, with every screen
consistent. `docs/DESIGN.md` describes the resulting system and its rules.

| Change                                                                                                                                                                                                                                               | Where                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| One semantic token set: colours named for their job (canvas, surface, ink, brand, the evergreen hero, one lime accent, status, 14 department tints), each redefined by hand for dark mode; four elevation levels; one spacing, radius and type scale | `src/app/tokens.css`                                         |
| The 438 generated per-shade colours from pass 1 are now 286 aliases onto those tokens                                                                                                                                                                | `src/app/palette.css`                                        |
| Fraunces (variable, SIL OFL) for titles and key figures; the system font for everything else                                                                                                                                                         | `tokens.css`, `src/main.tsx`                                 |
| The shared stylesheet consolidated from 5,172 to 2,475 lines and loaded first, so each component's stylesheet refines it rather than fighting it                                                                                                     | `src/app/globals.css`                                        |
| Generated product drawings deleted (558 PNGs and their generator). A product shows its photograph when one exists, otherwise its department's tint and aisle symbol                                                                                  | `src/components/product-art.tsx`, `src/lib/product-glyph.ts` |
| The photo pipeline now writes 512 × 512 WebP, cropped around the subject to fill the tile                                                                                                                                                            | `tools/fetch-product-photos.mjs`                             |
| A real map: pinch or buttons to zoom, drag the pin or tap to move it, arrow keys on the pin, reset to the city centre, nearby shops marked, radius slider                                                                                            | `src/components/location-map.tsx`                            |
| Every screen rebuilt from the same parts: Home, List, Prices, Spending, Shop, Account, Legal and setup                                                                                                                                               | each screen's `.tsx` and `.css`                              |
| Copy: no em dashes, no slogans, sentence case, the same names on every screen. A test enforces the em dash and capitals rules                                                                                                                        | `tests/copy.test.ts`                                         |
| Accessibility: WCAG 2.2 AA (which covers the WCAG 2.0 AA that AODA requires), 48 px targets, reflow at 320 px and 200 % text, Reduce Motion, Reduce Transparency, Increase Contrast; an Accessibility statement in Legal                             | `globals.css`, `src/lib/legal.ts`, `tests/e2e`               |

Bugs found during the pass, all fixed:

- **The display typeface never loaded.** Its `@import` was inlined into
  `globals.css`, so the font file URLs pointed nowhere and every title fell back
  to Georgia. It is now imported from `main.tsx`; an e2e test checks that it
  loads in the production build.
- **The release check could miss placeholder text in the bundle.** It looked
  for "PLACEHOLDER —"; the placeholders now read "PLACEHOLDER:". The source
  check still failed the release, but the bundle check had gone quiet. Fixed,
  and a unit test holds the placeholders to the form the check looks for.
- **The status bar, browser theme colour and native background still used the
  old palette**, which would leave a band of a different colour above the top
  bar. They now match `--canvas` in both themes, and a test keeps them in step.
- The browser tab title was "Aisle — Your grocery companion"; it is "Aisle".
- Account scrolled sideways on a phone (a grid of chain names), pack sizes read
  "1360.777 g", the search field drew a second border inside itself, and Skip
  took focus (and a focus ring) as soon as setup opened.

## Earlier checklist

| Item                                                   | Outcome                                                                                                                                                                                                                                                                                                                                                                                                         | Commit               |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| R1 broker open to the internet                         | Rebuilt on the Anthropic SDK. Refuses to run without `ALLOWED_ORIGINS`, per-client rate limit, daily token budget, custom tools only (server tools would bill the key), upstream error bodies never echoed, current model allow-list. App loop now treats `refusal` and `max_tokens` as failures and falls back to the planner. 19 tests.                                                                       | `286dd8b`            |
| R2 legal placeholders                                  | `npm run release:check` / `npm run release` refuse a build while any remain, while the bundle carries placeholder text or anything key-shaped, or when native versions disagree with `package.json`. Runs in CI on `v*` tags. **The values themselves are still for you to fill in.**                                                                                                                           | `dc35203`            |
| R3 privacy policy described a cache that did not exist | The cache now exists (F1) and the policy describes it exactly.                                                                                                                                                                                                                                                                                                                                                  | `f2a8f44`            |
| R4 permission strings                                  | iOS strings cover shelf labels; Android gets the backported photo picker. **Found while checking:** the privacy policy said the model never receives location, health information or history. It receives allergies, dietary needs, city, radius, budget, repurchase timing and nearby addresses. Sections 4 and 13 now list every field, and a test fails if the fields change without the policy changing.    | `b449f6d`            |
| F1 prices not remembered                               | Last check saved on device, reused for the same area only, deleted 24 h after the check; every offer re-gated through `faultsOf` on load and as it expires; an expired line says so; a summary that may quote a dropped price is withdrawn; the summary shows when prices were checked. **Found while doing it:** receipt images were never deleted (not with their trip, not by Erase everything). Fixed.      | `f2a8f44`            |
| F2 two store lists                                     | Five chains added to `catalog.stores`; a test holds both lists to the same ids and names; the directory matches shops through `chainFor`.                                                                                                                                                                                                                                                                       | `5eb0b5c`            |
| F3 one Overpass mirror                                 | Three mirrors, tried in order.                                                                                                                                                                                                                                                                                                                                                                                  | `5eb0b5c`            |
| F4 identity strings                                    | One `USER_AGENT`; a contact URL only if `VITE_AISLE_CONTACT_URL` is set. ~260 lines of unused sample-market code removed with it.                                                                                                                                                                                                                                                                               | `5eb0b5c`            |
| F6 "Find my best shop"                                 | Now "Check prices".                                                                                                                                                                                                                                                                                                                                                                                             | `9a3971b`            |
| F7 dark mode                                           | Built in design pass 1 and redrawn by hand in pass 2 (see F7 below).                                                                                                                                                                                                                                                                                                                                            | `9a3971b`            |
| A1–A4                                                  | Contrast, text size, accessible names and touch targets; now held by the e2e suite.                                                                                                                                                                                                                                                                                                                             | `b059f21`            |
| Production-only dialog bug                             | **Found by the new browser tests:** on a phone, in a production build, the setup dialog and the Add groceries sheet rendered half off-screen. The CSS minifier merged away the override Tailwind v4's centring needed. Fixed; the e2e suite runs against the production build for this reason.                                                                                                                  | `214a873`            |
| H1 monolith                                            | Nested components hoisted out (they re-mounted on every render, so keyboard focus was lost after one key press; a test now covers it). Save/load in `use-household.ts`; spending view and help dialog in their own files. 2,307 → 1,714 lines. **Found:** onboarding's save-conflict recovery could never run; fixed. Stale copy corrected (help dialog claimed a sample demo, accounts, and no model service). | `d696731`, `f8c6176` |
| H2 lint, format, CI                                    | ESLint 9, Prettier, editorconfig, `.nvmrc`, `engines`, CI with two jobs.                                                                                                                                                                                                                                                                                                                                        | `2afac4b`…`711331a`  |
| H3 browser tests outside the repo                      | `tests/e2e` (Playwright) and `tests/persistence.test.ts` (in-memory Filesystem).                                                                                                                                                                                                                                                                                                                                | `91cb2ec`            |
| H4 documentation drift                                 | README rewritten, `AGENT_SYSTEM.md` deleted, `AGENTIC_SYSTEM.md` and `server/README.md` current.                                                                                                                                                                                                                                                                                                                | `2391fd0`            |
| H5 dead code / H7 updates                              | Done.                                                                                                                                                                                                                                                                                                                                                                                                           | `5a8be56`            |
| H6 bundle and assets                                   | Account and Legal lazy; the 2.2 MB onboarding PNG became a 55 KB WebP (since removed with the rest of the generated art).                                                                                                                                                                                                                                                                                       | `9a3971b`            |

---

## Still open: release blockers

### R2. Operator details and legal review

Fill in the six `OPERATOR` fields in `src/lib/legal.ts` (legal name, contact
email, privacy email, postal address, website, effective date), then have the
Terms, the Privacy Policy and the Accessibility statement reviewed by someone
qualified. The release check will pass once they are real. Nothing was invented
for them.

### R5. Native builds and a device pass

Neither app has been compiled. This environment has no Xcode and no Android
SDK (Java and Gradle are present). On a Mac and with Android Studio:

- `npm run release`, then build and launch both projects.
- On a device: camera and photo prompts show the new strings; the Android 11–12
  photo picker; haptics on ticking an item; the Android back button; saved
  state, the saved price check and photos surviving an app restart and an OS
  kill; a price check over native HTTP (no CORS there) with the new User-Agent.
- The map by touch: pinch, dragging the pin, and whether the page still
  scrolls comfortably when one-finger drags on the map move the map.
- VoiceOver and TalkBack over setup, the list, the map and the checklist. axe
  cannot judge reading order or announcements.
- The largest text sizes (iOS accessibility sizes go past the 200 % tested
  here).

### R6. Network access for the photo pipeline

`api.openverse.org`, `commons.wikimedia.org`, `upload.wikimedia.org`,
`world.openfoodfacts.org`, `api.pexels.com` and `api.unsplash.com` are refused
(HTTP 403) by this environment's network policy, rechecked on 3 October 2026.
Allow them under Network access in the environment's settings, or run
`npm run photos` on a machine that can reach them (Pexels and Unsplash need
keys). Read a sample of the results: the pipeline rejects branded titles but
cannot tell whether a photo shows the right food. Until then every product shows
its department symbol, and nothing else depends on the photos. Credits go to
`public/images/photos/credits.json` and must be shown on the Data sources screen
before photos ship; that screen does not list them yet.

### R7. Store privacy labels

`PrivacyInfo.xcprivacy` declares no collected data. That is accurate while no
broker is configured. With a broker, list items and the household profile
(including allergies) go to your server and on to Anthropic. Whether that is
"collected" for Apple's and Google's labels depends on retention you control.
Decide it and update the manifest and the Play data-safety form to match.

### R8. Deploying the broker

- Set `ALLOWED_ORIGINS` (`capacitor://localhost`, `https://localhost`, plus any
  web origin), `ANTHROPIC_API_KEY`, and optionally `RATE_LIMIT_PER_MINUTE` and
  `DAILY_TOKEN_BUDGET`.
- Replace `MemoryStore` with a shared store (Workers KV, a Durable Object,
  Redis). In-memory counters are per instance, so serverless limits are
  per-isolate, not global.
- Two defaults changed with the move to the SDK. The default model is now
  `claude-opus-5-5` (was `claude-sonnet-5`); `VITE_AISLE_AGENT_MODEL` overrides
  it. **Server-side refusal fallbacks are on** for Opus and Sonnet
  (`fallbacks: 'default'`), so a request the safety classifier declines by
  mistake is retried on another model and billed. Set `fallbacks: false` in
  `MODELS` to turn that off.
- The origin check is not authentication. If abuse appears, add app attestation
  (App Attest / Play Integrity) in front of it.

### R9. A tile provider for the map

The map loads OpenStreetMap's own tiles by default. Their usage policy is not
meant for an app's traffic, so choose a provider (or host tiles) before release
and set `VITE_MAP_TILE_URL` and `VITE_MAP_TILE_ATTRIBUTION` (README, "Map
tiles"). `tile.openstreetmap.org` is refused here as well, so the map has only
been seen with stand-in tiles: check the toned light tiles and the inverted dark
ones with real tiles before shipping.

---

## Still open: product and design

### F7. Dark mode: check by eye

The dark palette is now set by hand in `tokens.css` and passes axe on every
view. It has been reviewed in screenshots only; look at it on a real phone
(OLED and LCD) and adjust the tokens there, never the stylesheets.

### F8. Large text

Body text is 16px on the web and follows Dynamic Type on iPhone; every size is
in rem. At 200 % text no view scrolls sideways. Nobody has looked at the largest
accessibility sizes on a real device; expect some headings and the tab bar to
need wrapping rules there.

### F9. The five-staple gate

Setup still requires five usual items. "Skip" leaves setup entirely, so nobody
is locked out, but someone who wants to set a budget without choosing staples
cannot. A product decision.

### F10. Coverage

Two small retailers publish a readable catalogue; the 17 other Ontario chains in
the registry do not. The app says so everywhere and never estimates. Real
coverage needs licensed retailer feeds or partnerships. This is the product's
ceiling, not a bug.

### F11. Receipt reading

Totals and per-item prices are typed in. Automatic receipt reading is not
built, and the app says so.

---

## Still open: codebase health

### H1. The rest of the split

`src/app/aisle-app.tsx` is 1,546 lines. What is left inside it, in order of
size: the receipt dialog (~170 lines), the shop view (~115), the catalogue
dialog (~60) and the swaps dialog (~60). The pattern is set:
`views/spending-view.tsx` for a view, `ItemRowContext` in `item-row.tsx` for
passing actions, `use-household.ts` for state. Extract with `npm run test:e2e`
running; the suite has caught real bugs in every pass so far.

### H6. The remaining bundle

873 KB is mostly React DOM and the 557-item taxonomy, which setup needs. A
vendor chunk would help caching, not first load. Lazy-loading the catalogue
browser is the next candidate. The display face is 67 KB for Latin text; its
other two subsets load only for characters outside that range.

### H8. Test gaps

The browser suite does not yet cover recording a receipt, capturing a shelf
price, ticking through a shop to the finish, Account edits, or legal navigation.
The broker tests use a fake SDK client, so a real request to the API has not
been made from this code; do one against a staging key before launch.

### H9. Things the next editor should know

- Colours, spacing, radii, type and shadows come from `src/app/tokens.css`.
  Never hard-code a value in a stylesheet; `docs/DESIGN.md` has the rules.
- `globals.css` is imported first in `main.tsx`, so a component's stylesheet
  wins at equal specificity. Fonts are imported in `main.tsx` too: an `@import`
  inside the Tailwind-processed CSS does not resolve the font files.
- `@playwright/test` is pinned to 1.56.1 and `playwright-core` is overridden to
  match, so `@axe-core/playwright` does not pull in a second copy. CI installs
  the matching Chromium with `npx playwright install`.
- `uuid` is overridden to ^11 to clear an advisory in `@capacitor/cli`'s
  `xcode` dependency; `cap sync` was checked with it.
- Seven `eslint-disable` comments remain, all for `exhaustive-deps`. Three have
  a reason written beside them. The four in `aisle-app.tsx` (the memoised
  active and headline baskets, the swaps, and the receipt store list) do not;
  review them during the H1 split, since a missing dependency there would show
  a stale total.
- Phone-width dialog overrides in `globals.css` and `onboarding.css` zero
  `--tw-translate-x/y` as well as `translate`. Keep that when adding new
  full-screen dialogs, or they will render off-screen in production builds only.
- TypeScript 7 (major) was held back.

---

## Suggested order

1. R2: fill in the operator details and get the review started (it takes the longest).
2. R5: native builds and the device pass, including VoiceOver and TalkBack.
3. R6 and R9: product photos and a map tile provider, then a look at both on a phone.
4. R8: deploy the broker with a shared store, if the assisted mode is wanted at launch.
5. R7: store labels.
6. H1 remainder and H8, with the e2e suite running.
