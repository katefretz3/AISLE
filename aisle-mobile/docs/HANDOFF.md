# Handoff

State of `claude/grocery-matching-agent-pk59q1` on 3 October 2026: the
previous checklist (commit `0d8690f`) worked through, then a design pass
(tokens and dark mode, type scale, phone layout, home, sheets, list; see
"Design pass" below).
Everything in "What was run" was measured on this branch; the method is noted
where it matters. The history of each fix is in the commit named beside it.

## What was run

| Check                                                                    | Result                                                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `npm run verify` (tsc, ESLint `--max-warnings 0`, Prettier, unit, build) | clean                                                                                |
| `npm test`                                                               | **152 / 152** (was 105)                                                              |
| `npm run test:e2e` (production build, phone + desktop)                   | **20 / 20 runs pass** (16 tests), 1 skipped by design (touch targets are phone-only) |
| axe-core WCAG 2.1 A/AA, 7 views × 2 widths, populated household          | **0 violations** (was 418 failing nodes)                                             |
| Text under 12 px, 6 mobile views                                         | **0 of 520** text runs (was 32 %)                                                    |
| 44 × 44 tap area, hit-tested, every control on 7 mobile views            | **all pass** (a toast briefly covers the footer; excluded)                           |
| Sideways scroll, 7 views × 2 widths                                      | none                                                                                 |
| `npm audit` (app and `../server`)                                        | 0 vulnerabilities                                                                    |
| `vite build`                                                             | main chunk 875 KB / 242 KB gzip (was 928 / 258); Leaflet, Account, Legal split       |
| `npm run release:check`                                                  | **fails, as it should**: the six operator placeholders (see R2)                      |
| `npx cap sync`                                                           | both platforms sync                                                                  |

Not verifiable here: native iOS/Android builds (no Xcode, no Android SDK), a
real device, live retailer or Overpass responses, and product photos. Every
third-party host is refused by this environment's network policy; see R6.
All retailer behaviour in the tests runs the real agent against synthetic
fixtures.

## What changed since the last handoff

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
| F6 "Find my best shop"                                 | Now "Save and check prices".                                                                                                                                                                                                                                                                                                                                                                                    | `9a3971b`            |
| F7 dark mode                                           | Not built (see F7 below). Dark-mode phones no longer get a half-dark UI.                                                                                                                                                                                                                                                                                                                                        | `9a3971b`            |
| A1–A4                                                  | See the table above.                                                                                                                                                                                                                                                                                                                                                                                            | `b059f21`            |
| —                                                      | **Found by the new browser tests:** on a phone, in a production build, the setup dialog and the Add groceries sheet rendered half off-screen. The CSS minifier merged away the override Tailwind v4's centring needed. Fixed; the e2e suite runs against the production build for this reason.                                                                                                                  | `214a873`            |
| H1 monolith                                            | Nested components hoisted out (they re-mounted on every render, so keyboard focus was lost after one key press; a test now covers it). Save/load in `use-household.ts`; spending view and help dialog in their own files. 2,307 → 1,714 lines. **Found:** onboarding's save-conflict recovery could never run; fixed. Stale copy corrected (help dialog claimed a sample demo, accounts, and no model service). | `d696731`, `f8c6176` |
| H2 lint, format, CI                                    | ESLint 9, Prettier, editorconfig, `.nvmrc`, `engines`, CI with two jobs.                                                                                                                                                                                                                                                                                                                                        | `2afac4b`…`711331a`  |
| H3 browser tests outside the repo                      | `tests/e2e` (Playwright) and `tests/persistence.test.ts` (in-memory Filesystem).                                                                                                                                                                                                                                                                                                                                | `91cb2ec`            |
| H4 documentation drift                                 | README rewritten, `AGENT_SYSTEM.md` deleted, `AGENTIC_SYSTEM.md` and `server/README.md` current.                                                                                                                                                                                                                                                                                                                | this commit          |
| H5 dead code / H7 updates                              | Done.                                                                                                                                                                                                                                                                                                                                                                                                           | `5a8be56`            |
| H6 bundle and assets                                   | Account and Legal lazy; the 2.2 MB onboarding PNG is a 55 KB WebP.                                                                                                                                                                                                                                                                                                                                              | `9a3971b`            |

---

## Design pass

Applied on top of the checklist, modelled on platform guidance (Apple HIG,
Material 3) and on reference apps for each flow, borrowing patterns, not
anyone's look.

| Change                                                                                                                                         | Where                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Every colour is a token (438 of them, by role: `--fg-*`, `--bg-*`, `--bd-*`), with a dark value for each; the core palette is set by hand      | `src/app/palette.css`, end of `globals.css`        |
| Dark mode, and Account › Profile › Appearance: System, Light, Dark. Applied before first paint; drives the native status bar                   | `src/lib/appearance.ts`, `index.html`              |
| Platform typeface (San Francisco / Roboto); every size in rem, one step larger at the small end; follows the phone's text size                 | `globals.css`                                      |
| Phone layer: compact sticky top bar, stacked headings, Material 3-style tab bar (Week, List, Prices, Spending, You), "Continue your shop" pill | end of `globals.css`, `aisle-app.tsx`              |
| Home leads with the answer ("$4.49 at Fixture Grocer, for 1 of 6 items"); facts and evidence under "How we know"                               | `components/agent-workspace.tsx`                   |
| Task dialogs are bottom sheets on phones, with swipe-down to close                                                                             | end of `globals.css`, `src/lib/sheet-gesture.ts`   |
| List: "Your usuals" tiles (only items with a household reason), sections in walking order, action chips                                        | `src/app/views/list-view.tsx`, `src/lib/usuals.ts` |

Bugs found during the pass and fixed: every dialog's close button had been
pushed out of sight (iPhone users had no visible way out of Add groceries);
checkbox outlines were under 3:1; a `.dark` button class would have clashed
with a dark-mode class, so the theme is a `data-theme` attribute.

## Still open: release blockers

### R2. Operator details and legal review

Fill in the six `OPERATOR` fields in `src/lib/legal.ts` (legal name, contact
email, privacy email, postal address, website, effective date), then have the
Terms and Privacy Policy reviewed by someone qualified. The release check will
pass once they are real. Nothing was invented for them.

### R5. Native builds and a device pass

Neither app has been compiled. This environment has no Xcode and no Android
SDK (Java and Gradle are present). On a Mac and with Android Studio:

- `npm run release`, then build and launch both projects.
- On a device: camera and photo prompts show the new strings; the Android 11–12
  photo picker; haptics on ticking an item; the Android back button; saved
  state, the saved price check and photos surviving an app restart and an OS
  kill; a price check over native HTTP (no CORS there) with the new User-Agent.
- VoiceOver and TalkBack over setup, the list and the checklist. axe cannot
  judge reading order or announcements.
- Dynamic Type / font scaling: sizes are in px and rem and have not been tried
  at large accessibility sizes.

### R6. Network access for the photo pipeline

`api.openverse.org`, `commons.wikimedia.org`, `upload.wikimedia.org` and
`world.openfoodfacts.org` are refused (HTTP 403) by this environment's network
policy, rechecked today. Allow them in the environment's network settings, or
run `npm run photos` on a machine that can reach them (Pexels and Unsplash need
keys). Read a sample of the results: the pipeline rejects branded titles but
cannot tell whether a photo shows the right food. Credits go to
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

---

## Still open: product and design

### F7. Dark mode: done, then tune by eye

Built in the design pass. The derived dark values in `src/app/palette.css`
pass axe everywhere but were generated, not designed; a designer should walk
the screens in dark mode and adjust tokens there (never the stylesheets).

### F8. Body text size: done, with one thing to check on a device

Body text is now 16px on the web and 17px on iPhone, and everything scales
with the phone's text-size setting. Nobody has yet looked at the largest
accessibility sizes on a real iPhone; expect some headings to need wrapping
rules there.

### F9. The five-staple gate

Setup still requires five usual items. "Explore first" skips setup entirely, so
nobody is locked out, but someone who wants to set a budget without choosing
staples cannot. A product decision.

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

`src/app/aisle-app.tsx` is 1,591 lines. What is left inside it, in order of
size: the receipt dialog (~170 lines), the shop view (~115), the catalogue
dialog (~60) and the swaps dialog (~60). The list view moved out in the
design pass. The pattern is
set: `views/spending-view.tsx` for a view, `ItemRowContext` in `item-row.tsx`
for passing actions, `use-household.ts` for state. Extract with
`npm run test:e2e` running; the suite caught two real bugs during this pass.

### H6. The remaining bundle

875 KB is mostly React DOM and the 557-item taxonomy, which setup needs. A
vendor chunk would help caching, not first load. Lazy-loading the catalogue
browser is the next candidate.

### H8. Test gaps

The browser suite does not yet cover recording a receipt, capturing a shelf
price, ticking through a shop to the finish, Account edits, or legal navigation.
The broker tests use a fake SDK client, so a real request to the API has not
been made from this code; do one against a staging key before launch.

### H9. Things the next editor should know

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
2. R5: native builds and the device pass.
3. R8: deploy the broker with a shared store, if the assisted mode is wanted at launch.
4. R6 and R7: photos and store labels.
5. H1 remainder and H8, with the e2e suite running.
6. A designer's review of dark mode and large text sizes on real devices (F7, F8).
