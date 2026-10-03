// WCAG 2.2 A/AA on every main view, with a populated household, in both
// themes. Runs on the phone and desktop projects. (Ontario's AODA asks for
// WCAG 2.0 AA; 2.2 AA includes it.)
import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Page} from '@playwright/test';
import {network, onboard, open} from './support';

const VIEWS = ['home', 'list', 'compare', 'spending', 'shop', 'account', 'legal'];

async function violations(page: Page) {
  const found: string[] = [];
  for (const view of VIEWS) {
    await open(page, view);
    await page.waitForTimeout(600);
    const {violations} = await new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    for (const v of violations)
      found.push(`${view}: ${v.id} (${v.impact}) × ${v.nodes.length}: ${v.nodes[0]?.target}`);
  }
  return found;
}

for (const colorScheme of ['light', 'dark'] as const)
  test(`no WCAG A/AA violations on any main view (${colorScheme})`, async ({page}) => {
    test.setTimeout(120_000);
    // "System" appearance follows the device, so this is what a phone in that
    // mode would show.
    await page.emulateMedia({colorScheme});
    await network(page, {retail: true});
    await onboard(page, 6);
    await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    expect(await violations(page)).toEqual([]);
  });

test('the appearance setting overrides the system and is remembered', async ({page}) => {
  await page.emulateMedia({colorScheme: 'light'});
  await network(page);
  await onboard(page, 6);
  await open(page, 'account');
  await page.getByRole('button', {name: 'Dark', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  // Applied before first paint, not after the app loads.
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await open(page, 'account');
  await page.getByRole('button', {name: 'System', exact: true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
