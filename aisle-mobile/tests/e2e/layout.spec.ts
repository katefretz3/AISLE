// Layout guards: no sideways scrolling, no text under 12px, and on phones,
// every control has a 44 × 44 area that a tap actually reaches.
import {expect, test, type Page} from '@playwright/test';
import {network, onboard, open} from './support';

const VIEWS = ['home', 'list', 'compare', 'spending', 'shop', 'account', 'legal'];

async function smallText(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      const node = walk.currentNode;
      const el = node.parentElement;
      if (!el || !node.textContent?.trim()) continue;
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      if (
        !box.width ||
        style.visibility === 'hidden' ||
        el.closest('.sr-only, .leaflet-control-attribution')
      )
        continue;
      if (parseFloat(style.fontSize) < 12)
        out.push(
          `${el.tagName.toLowerCase()} ${style.fontSize} "${node.textContent.trim().slice(0, 30)}"`,
        );
    }
    return out;
  });
}

/** Controls where the centre or an edge midpoint of a 44 × 44 box misses. */
async function shortTargets(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const controls = document.querySelectorAll(
      'button, a[href], [role="button"], [role="checkbox"], [role="switch"], [role="tab"], input:not([type="hidden"]), select',
    );
    for (const el of controls) {
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height || style.visibility === 'hidden') continue;
      if (el.closest('.leaflet-control-attribution, [data-sonner-toaster]')) continue;
      el.scrollIntoView({block: 'center', inline: 'center', behavior: 'instant'});
      const r = el.getBoundingClientRect();
      const [cx, cy] = [r.left + r.width / 2, r.top + r.height / 2];
      const misses = [
        [cx, cy],
        [cx - 21, cy],
        [cx + 21, cy],
        [cx, cy - 21],
        [cx, cy + 21],
      ].filter(([x, y]) => {
        const hit = document.elementFromPoint(x, y);
        if (!hit) return true;
        // A toast can sit over anything for a few seconds; that is not the layout.
        if (hit.closest('[data-sonner-toaster]')) return false;
        return !(hit === el || el.contains(hit));
      });
      if (misses.length)
        out.push(
          `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`,
        );
    }
    return out;
  });
}

test('no sideways scroll and no text under 12px', async ({page}) => {
  await network(page, {retail: true});
  await onboard(page, 6);
  for (const view of VIEWS) {
    await open(page, view);
    await page.waitForTimeout(500);
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width, `${view} scrolls sideways`).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(await smallText(page), `${view} has text under 12px`).toEqual([]);
  }
});

test('every control on a phone has a 44 × 44 tap area', async ({page}, info) => {
  test.skip(info.project.name !== 'phone', 'touch targets are a phone concern');
  test.setTimeout(120_000);
  await network(page, {retail: true});
  await onboard(page, 6);
  // Let the setup toasts clear.
  await page.waitForTimeout(4500);
  const found: string[] = [];
  for (const view of VIEWS) {
    await open(page, view);
    await page.waitForTimeout(500);
    for (const miss of await shortTargets(page)) found.push(`${view}: ${miss}`);
  }
  expect(found).toEqual([]);
});
