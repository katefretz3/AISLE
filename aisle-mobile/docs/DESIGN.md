# Aisle design system

How Aisle looks, reads and behaves, and the rules that keep every screen
consistent. The values live in code: `src/app/tokens.css` (colour, type, space,
shape, depth), `src/app/globals.css` (shared components) and one stylesheet per
screen or component beside its `.tsx`. This page explains how to use them.

## Principles

1. **The answer first.** Each screen leads with what a person came for: the
   price of the list, the list itself, what is probably due, what they spent.
   Detail and evidence come after, never before.
2. **Honest by construction.** Nothing is drawn to look more finished than it
   is. An incomplete basket shows a coverage meter and says how many items have
   no price. A product without a photograph shows a symbol, not a drawing that
   pretends to be the product.
3. **Calm surfaces, one signature.** A warm oat page, white cards that sit on it
   with a soft shadow, and one deep evergreen panel where it matters (the home
   summary, the shop in progress, the setup side panel) with a single lime
   action on it.
4. **Colour carries meaning.** Departments have colours; status has colours.
   Neither is ever the only signal: there is always a word or an icon too.
5. **Made for one hand.** 48px targets, a floating tab bar, task sheets that
   rise from the bottom, and the next action in reach of a thumb.

## Colour

Every colour is a token named for its job. Dark mode redefines the same names,
so a rule written once works in both. Never hard-code a hex value in a
stylesheet.

| Token                                      | Job                                               | Light     | Dark      |
| ------------------------------------------ | ------------------------------------------------- | --------- | --------- |
| `--canvas`                                 | the page                                          | `#f4f1ea` | `#0b110f` |
| `--surface`                                | cards, sheets, the tab bar                        | `#ffffff` | `#131b18` |
| `--surface-2`                              | quiet fills inside a card                         | `#f7f5f0` | `#19231f` |
| `--surface-3`                              | tracks, pressed states, segmented controls        | `#ede9e0` | `#222d28` |
| `--line` / `--line-strong`                 | hairlines / control outlines                      | `#e7e2d8` | `#26312c` |
| `--field-line`                             | inputs and checkboxes (3:1 against white)         | `#8b8579` | `#75837c` |
| `--ink` / `--ink-2` / `--ink-3`            | text: primary / supporting / meta                 | `#16201b` | `#edf2ee` |
| `--brand`                                  | primary actions, links, selection                 | `#0f5a44` | `#86d3ac` |
| `--brand-tint`                             | tonal buttons, selected chips                     | `#e2eee5` | `#16302a` |
| `--hero` / `--hero-2`                      | the evergreen signature surface (both themes)     | `#0b3b2e` | `#0f3a2d` |
| `--lime`                                   | the one bright action on a hero; meters on a hero | `#c9ec70` | `#c9ec70` |
| `--warn`, `--danger`, `--info` (+ `-tint`) | status text and its background                    |           |           |
| `--dept-<id>` / `--dept-<id>-ink`          | a department's tint and the ink drawn on it       |           |           |

Pairs are chosen to pass WCAG 2.2 AA everywhere they are used: `--ink-3` is
at least 4.7:1 on every light surface, `--brand` is 6.8:1 on its own tint, and
every department ink is at least 5.6:1 on its tint. People who ask their phone
for more contrast get firmer text and edges automatically
(`prefers-contrast: more`).

`src/app/palette.css` holds the colour names the older stylesheets used (one
per shade they hard-coded), each now pointing at the semantic token that does
its job. Use the semantic names in anything new.

### Departments

Fourteen departments, fourteen tints: produce green, dairy blue, meat rose,
deli orange, bakery wheat, pantry clay, breakfast honey, snacks pink, frozen
ice, beverages violet, household slate, personal care orchid, baby peach, pet
tan. Add `dept-<id>` to an element and use `var(--dept-bg)` and
`var(--dept-ink)` inside it. They colour the department grid in Add groceries,
the aisle symbols, product tiles and the section marks on the list.

## Type

- **Fraunces** (variable, optical sizing, bundled; SIL OFL) for page titles,
  section titles and the figures that matter: the home summary, basket totals,
  the running total, metrics.
- **The system font** (San Francisco on Apple devices, Roboto on Android) for
  everything people read and tap.

| Token          | Size (phone) | Use                        |
| -------------- | ------------ | -------------------------- |
| `--t-hero`     | 2.75rem      | the home summary figure    |
| `--t-display`  | 2.125rem     | page titles (`h1`)         |
| `--t-title`    | 1.375rem     | section titles (`h2`)      |
| `--t-headline` | 1.0625rem    | card titles, row names     |
| `--t-body`     | 1rem         | body text                  |
| `--t-callout`  | 0.9375rem    | buttons, supporting text   |
| `--t-footnote` | 0.8125rem    | meta: sizes, times, counts |
| `--t-caption`  | 0.75rem      | badges only                |

Every size is in rem, so the whole app follows the phone's text-size setting.
Nothing goes under 12px. Money and counts use tabular figures so they do not
jump as they change. Titles and labels are in sentence case; there are no
all-caps labels.

## Space and shape

A 4px grid: `--sp-1` (4) to `--sp-12` (48). The page gutter is `--gutter`
(20px on a phone, 16px under 360px, 32px on a wide screen), sections are
`--section` apart, and cards pad by `--card-pad`. Radii: `--r-xs` 8, `--r-sm`
12 (fields), `--r-md` 16 (tiles, notes), `--r-lg` 22 (cards), `--r-xl` 28
(sheets, the hero), and `--r-pill` for buttons and chips.

## Depth

Four levels, each a stacked shadow rather than one flat drop:

- `--e-1`: cards and controls at rest.
- `--e-2`: map controls, a highlighted card.
- `--e-3`: things that float: the tab bar, sheets, dialogs, toasts.
- `--e-hero`: the evergreen panels.

In dark mode surfaces get lighter as they rise and keep a faint edge
(`--card-edge`) instead of relying on shadows. The top bar and tab bar are
frosted; with Reduce Transparency they become solid.

## Components

- **Page heading.** `h1` plus at most one line of supporting text, and the
  page's actions. No eyebrow label above the title.
- **Section head.** `.section-head` with an `h2` and, if needed, one text
  button on the right. A lede (`.section-lede`) of one or two sentences, only
  where it adds something.
- **Buttons.** `.button.primary` (evergreen), `.button.secondary` (white with an
  outline), `.button.tonal` (tinted), `.button.lime` (the action on a hero),
  `.button.on-hero` (the quiet action on a hero), `.text-button`. All are pills
  at least `--tap` tall.
- **Cards.** `.card`: white, `--r-lg`, `--e-1`. One hero per screen at most.
- **Rows.** Lists are rows separated by hairlines inside a card, not a stack
  of boxed cards. A row is: picture, name and meta, then its value and
  controls.
- **Product pictures.** `ProductArt` (`src/components/product-art.tsx`): the
  photograph when one exists, otherwise the department tint and the aisle's
  symbol (`src/lib/product-glyph.ts`).
- **Quantity.** A stepper whose minus becomes a bin at one, so a row needs one
  control fewer.
- **Chips and segmented controls.** Pills; the selected one is evergreen or
  raised on a track.
- **Notes.** `.inline-warning` (warn), `.transparency-note` (neutral),
  `.agent-warning`. One idea each, short.
- **Sheets.** On a phone every task dialog is a bottom sheet with a grab handle,
  a close button that is always visible, and swipe-down to close.
  Confirmations stay centred.
- **Tab bar.** Floating and frosted: Home, List, Prices, Spending, Account. The
  same five names are used by the sidebar on a wide screen.
- **Map.** `LocationMap`: a full-bleed card with floating zoom and reset
  controls, the pin in evergreen and lime, the radius as a tinted circle, nearby
  shops as small marks, and the radius slider underneath.

## Imagery

Product pictures are photographs or nothing. `npm run photos` fetches licensed,
unbranded photographs (see the README); until an item has one it shows its
department's symbol. Generated product drawings and any image without a known
source and licence are not used. Store logos are the retailers' own marks on a
white plate, in both themes.

## Words

Write the way a helpful person at the shop would talk: short, specific, plain.

- Say what is true and what to do next. "4 items have no price at this shop
  yet", not "Your basket is almost there!".
- No slogans, taglines or pep talk ("Your food, your rules", "You've got this").
- No em dashes. Use a full stop, a comma, a colon or brackets.
- Sentence case everywhere; no all-caps labels.
- Name things the same way on every screen: Home, List, Prices, Spending,
  Account; "shop" for a store; "price check" for what Aisle does.
- Canadian spelling (favourite, colour) and Canadian dollars.

`tests/copy.test.ts` fails on an em dash or an all-caps label in anything the
app shows.

## Accessibility

Aisle is built to WCAG 2.2 AA, which includes the WCAG 2.0 AA that Ontario's
AODA requires, and to Apple's and Google's platform guidance:

- 48 × 48px touch targets (Android's minimum, over iOS's 44pt). Small visual
  controls get an invisible larger hit area.
- One focus ring everywhere, 2px in the brand colour; nothing focused can sit
  under the sticky top bar or the tab bar (`scroll-padding`).
- Text follows the phone's text size; layouts reflow at 320px wide and at
  double text size without sideways scrolling.
- Reduce Motion stops animation; Reduce Transparency makes the frosted bars
  solid; Increase Contrast strengthens text and edges.
- Every control has an accessible name; status never relies on colour alone.
- Anything done by dragging (the map pin, closing a sheet) also has a tap or
  key alternative.

Legal › Accessibility tells people the same in plain words, lists the known
gaps and says how to ask for another format.

## Checking your work

```sh
npm run verify     # typecheck, lint, format, unit tests (incl. copy rules), build
npm run test:e2e   # axe WCAG 2.2 AA in light and dark, 48px targets, reflow at
                   # 320px, double text size, and the map's gestures
```

The browser tests cannot judge taste. Look at the screen on a real phone in
both themes and at the largest text size before shipping a visual change.
