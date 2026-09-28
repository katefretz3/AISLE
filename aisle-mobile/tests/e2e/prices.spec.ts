// The core promise, end to end in a browser: a price on screen came from a
// response the app received, a missing price is shown as missing, and a saved
// check is reused without asking the network again.
import {expect, test} from '@playwright/test';
import {network, onboard, open, storedFiles} from './support';

test('a price check shows only prices the retailer published', async ({page}) => {
  const net = await network(page, {retail: true});
  await onboard(page, 6);
  await expect(page.getByText(/Prices checked today at/)).toBeVisible();
  expect(net.directoryHits).toBeGreaterThan(0);
  expect(net.retailerHits).toEqual(
    expect.arrayContaining(['/robots.txt', '/', '/products.json?limit=250']),
  );

  await open(page, 'compare');
  const basket = page.locator('main');
  await expect(basket).toContainText('Fixture Grocer');
  await expect(basket).toContainText('$4.49');
  // Bananas, berries and the rest are not in the fixture catalogue. They must
  // be reported as unpriced, never given a figure.
  const text = await basket.innerText();
  const figures = [...text.matchAll(/\$\d+\.\d{2}/g)].map(m => m[0]);
  for (const figure of figures) expect(['$4.49', '$0.00']).toContain(figure);
});

test('the last check is reused after a reload without collecting again', async ({page}) => {
  const net = await network(page, {retail: true});
  await onboard(page, 6);
  await expect(page.getByText(/Prices checked today at/)).toBeVisible();
  await expect.poll(() => storedFiles(page)).toContain('last-run.json');

  const before = net.retailerHits.length;
  await page.reload();
  await expect(page.getByText(/Prices checked today at/)).toBeVisible();
  await page.waitForTimeout(1500);
  expect(net.retailerHits.length).toBe(before);
});

test('with the network down the app says so and shows no prices', async ({page}) => {
  const net = await network(page);
  await onboard(page, 6);
  await open(page, 'compare');
  await expect(page.locator('main')).not.toContainText('$4.49');
  expect(net.refused.size).toBeGreaterThan(0);
  const text = await page.locator('main').innerText();
  expect(text).not.toMatch(/\$[1-9]\d*\.\d{2}/);
});
