# Handoff checklist

State of the codebase at commit `f4d834a`, from a full diagnostic pass on 28 Sept 2026.
Everything below was measured, not assumed; the method is noted where it matters.

## What was run

| Check | Result |
|---|---|
| `tsc --noEmit` (src, tests, tools, `../server`) | clean |
| `npm test` | 105 / 105 pass |
| `vite build` | clean; one 890 KB chunk (247 KB gzip) |
| `npm audit --omit=dev` | 0 vulnerabilities |
| First-run onboarding through the real UI (name → city → prefs → 5 staples → finish) | passes; the 5-staple gate refuses with a message |
| Reload after onboarding | state persists, onboarding does not reappear |
| Corrupt `household.json` | shows "couldn't load your saved list"; the file is **not** overwritten |
| Console / page errors, 6 views × 2 widths | none (the only noise is blocked third-party requests in this sandbox) |
| Horizontal overflow, 6 views × 2 widths | none |
| axe-core (serious + critical), 6 views × 2 widths | **12 of 12 fail** — see A1–A3 |
| Touch targets ≥ 44 px, 6 mobile views | **6 of 6 fail** — see A4 |

Not verifiable in the cloud environment: native iOS/Android builds, real-device camera, live retailer/Overpass responses (every third-party host is blocked here), App Store submission. All retailer behaviour in tests and screenshots comes from stubbed responses running the real agent code.

---

## P0 — blocks any public release

### R1. Broker is open to the internet
`server/agent-broker.ts` sets `Access-Control-Allow-Origin` to `*` when `ALLOWED_ORIGIN` is unset, has no authentication and no rate limit, and sits in front of a paid API key. Anyone who finds the URL can spend the key. Only matters once `VITE_AISLE_AGENT_ENDPOINT` is set, but it must be fixed before that happens.
- Refuse to start (or answer 503) when `ALLOWED_ORIGIN` is unset instead of defaulting to `*`.
- Add per-IP rate limiting and a daily spend cap.
- Add tests: the file has none.

### R2. Legal placeholders
`src/lib/legal.ts` `OPERATOR` has six fields still starting `PLACEHOLDER`: legal name, contact email, privacy email, postal address, website, effective date. The Terms and Privacy screens already print a warning while any remain. Nothing else about the legal text needs to change — it was written to describe what the app does — but it needs review by someone qualified before publishing.

### R3. Privacy policy describes data that does not exist
It lists "cached retailer prices, which expire after 24 hours". There is no cache: `use-agent-run.ts` keeps the last run in memory only, so prices are re-collected every session. Either build the cache (see F1) or delete the sentence. The README repeats the claim.

### R4. Native permission strings
`ios/App/App/Info.plist` `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` mention only receipts. The camera is now also used for shelf-label photos. App Store review compares the string to actual use. Update both, and re-read `PrivacyInfo.xcprivacy` against the shelf-price and photo storage added since it was written.

### R5. Native builds have never been run
`npx cap copy` succeeds, but neither project has been built or launched. Version is `1.0` / versionCode `1`. Do a clean device build on both platforms before anything else in this list is trusted on native.

---

## A — Accessibility (measured with axe-core 4.x and computed styles)

### A1. Colour contrast fails on every screen
128 failing text nodes across 27 distinct colour pairs. Worst: `#9ba690` on `#f6f8f4` at **2.38 : 1** (30 nodes, 10 px), `#9aaa8c` on white at 2.46 : 1, `#75816a` on white at 4.11 : 1. The cause is one design decision: muted green-grey text throughout `globals.css`. Fix by darkening the muted-text token(s) to ≥ 4.5 : 1 and replacing the ~20 hard-coded hexes with tokens. Re-run `node` + axe to confirm.

### A2. Text is too small
Of 508 text runs on mobile, 32 % are under 12 px and only 15 % reach 14 px. The list screen is half 10–11 px. Set a floor (12 px for secondary, 14–16 px for body), and check it survives iOS Dynamic Type.

### A3. Unnamed controls
- The icon-only **Export list** button on the list screen has no accessible name (its label is hidden by `.heading-actions .secondary>span{display:none}` on mobile). Add `aria-label`.
- The list-screen `Progress` has no accessible name. Give the component a required `aria-label` prop.

### A4. Touch targets
Correction to an earlier statement: touch targets were reported as handled, and they are for the checklist, toasts and map controls, but **not** elsewhere. Measured on mobile: the header location button (89 × 16) and the "Observed prices" badge (83 × 24) on every screen; on the list screen the lock (31 × 30), quantity −/+ (25 × 29) and remove buttons on every row, and clear-list (24 × 44). About 50 controls on that one screen. Extend the pseudo-element hit-area pattern already used in `globals.css`.

---

## F — Functional gaps

### F1. Prices are not remembered between sessions
The last agent run lives in memory only. Reopening the app shows nothing until the user runs a check again, and offline shows nothing at all. Persist the last `AgentRun` (offers and their evidence rows) with its existing `expiresAt`, drop expired offers on load, and re-verify with `faultsOf` after reading — a stored price must clear the same gate as a fresh one. This also resolves R3.

### F2. Two store registries
`catalog.ts` `stores` (14, branding for receipts) and `agent/registry.ts` `CHAINS` (19, feed policy) are separate lists. Five chains are only in `CHAINS`: `goodnessme`, `independent`, `sobeys`, `giant-tiger`, `tnt`. **Goodness Me! — one of only two readable chains — has no logo and is missing from the receipt store picker.** Derive one from the other, or merge them.

### F3. Overpass depends on one volunteer mirror
`places.ts` calls only `overpass.private.coffee`. Add fallback endpoints and a shorter timeout. The store directory already degrades honestly when it fails, but every failure loses the nearby-store list.

### F4. Third-party identity strings
Three different `User-Agent`s are sent (`Aisle/1.0`, `AislePriceResearch/1.0`, `AisleOntario/1.0`); two of them carry `aisle-burlington.katefretz.chatgpt.site`, a domain inherited from the original project. Overpass's usage policy expects a working contact. Replace with one exported constant in `net.ts` and use it everywhere.

### F5. Product images are still illustrations
See "Photo pipeline" below.

### F6. Onboarding copy
The final step's button reads **"Find my best shop"**. Given that only 2 of 19 chains can be priced, that overpromises; the rest of the app is careful not to. Also reconsider the hard gate of five staples before a user can enter.

### F7. No dark mode.

---

## H — Codebase health for the next editor

### H1. `src/app/aisle-app.tsx` is a monolith
465 lines but 27 of them are over 400 characters, the longest 2,419. Diffs are unreadable and merges will conflict. Split into per-view components and hooks (`useListActions`, `useReceipt`, `useShop`), then run a formatter over the whole tree.

### H2. No lint, formatter or CI
None of `.eslintrc`, Prettier, `.editorconfig`, `.github/`, `.nvmrc` exist. `package.json` has no `engines` field though the README requires Node ≥ 22.13. Add ESLint (react-hooks rules — the app already carries five `eslint-disable` comments for exhaustive-deps that nothing checks), Prettier, and a workflow running `check`, `test` and `build`.

### H3. The browser verification lives outside the repo
The Playwright drivers used to verify this work (onboarding, persistence, corrupt-state recovery, receipt → due-this-week, shelf capture, photo round-trip) were run from scratch space and are not committed. Port them to `tests/e2e/` with the stubbed retailer/Overpass fixtures they use, so regressions in UI behaviour are caught. Also unit-test `persistence.ts` (revision conflicts, the atomic rename) by injecting a fake Filesystem; today only the browser runs exercise it.

### H4. Documentation drift
- `README.md`: says "36 tests" (now 105), still describes "a separate labelled sample demo" (line 132) that was retired, repeats the 24 h expiry claim.
- `AGENT_SYSTEM.md` (59 lines) and `AGENTIC_SYSTEM.md` (184) cover overlapping ground and disagree. `AGENT_SYSTEM.md` line 9 still refers to hash-generated demo prices. Keep `AGENTIC_SYSTEM.md`, delete the other.
- Add a short section on shelf prices and receipt-derived history — neither is documented.

### H5. Dead code and dependencies
- `@base-ui/react`, `@shadcn/react` — unused; remove.
- `@capacitor/haptics` — installed natively, never called; use it or remove it.
- `sync-shared.mjs` — a one-off migration script from the original zip; delete.
- `swapConfidence` in `catalog.ts` — unused since the demo was retired.
- Unused exports in the shadcn `ui/` files are normal for that library and can stay.

### H6. Bundle and assets
One 890 KB chunk (247 KB gzip). Lazy-load Account, Legal and the catalogue browser; the taxonomy (168 KB source) is needed at onboarding, so split by route rather than by data. `public/images/grocery-bag.png` is 2.2 MB and ships in both native bundles — recompress it.

### H7. Dependency updates
Patch/minor: React 19.3, Vite 8.3, Tailwind 4.3, sharp 0.35.5, lucide 1.48. Hold TypeScript 7 (major).

---

## Photo pipeline

`tools/fetch-product-photos.mjs` was rewritten to the brief: PNG, every file exactly 512 × 512, fitted with `contain` so nothing is cropped, transparent surround, `--verify` re-checking format, size and non-blank, exiting non-zero on failure. It was proven over all 557 items against a local mirror. **No real photographs are in the repo**: every image host returned HTTP 403 from this environment's network policy. The manifest is empty, so every item shows its illustration.

To finish: allow `api.openverse.org`, `api.pexels.com` and `api.unsplash.com` (or run from a machine that can reach them), then `npm run photos`. Read a sample of the results before accepting them — the pipeline rejects branded titles but cannot judge whether a photograph is actually of the right food. Credits are written to `public/images/photos/credits.json` and must be surfaced in the Data sources screen before release.

---

## Suggested order

1. R1, R2, R3, R4 — small and independent, and gate everything public.
2. H2 — CI first, so the rest of the work is checked.
3. H1 + H3 — split the monolith with the e2e suite in place to catch regressions.
4. A1–A4 — one design pass over `globals.css`.
5. F1, F2, F4 — user-visible correctness.
6. R5 — native device builds once the above is stable.
7. Photos, dark mode, bundle splitting.
