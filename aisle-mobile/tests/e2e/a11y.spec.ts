// WCAG 2.1 A/AA on every main view, with a populated household. Runs on the
// phone and desktop projects.
import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';
import {network, onboard, open} from './support';

const VIEWS = ['home', 'list', 'compare', 'spending', 'shop', 'account', 'legal'];

test('no WCAG A/AA violations on any main view', async ({page}) => {
  test.setTimeout(120_000);
  await network(page, {retail: true});
  await onboard(page, 6);
  const found: string[] = [];
  for (const view of VIEWS) {
    await open(page, view);
    await page.waitForTimeout(600);
    const {violations} = await new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    for (const v of violations)
      found.push(`${view}: ${v.id} (${v.impact}) × ${v.nodes.length} — ${v.nodes[0]?.target}`);
  }
  expect(found).toEqual([]);
});
