import {expect, test} from '@playwright/test';
import {network, onboard, open, storeFile, storedFiles} from './support';

test('erase everything deletes the list, receipt images and the saved check', async ({page}) => {
  await network(page, {retail: true});
  await onboard(page, 6);
  await expect.poll(() => storedFiles(page)).toContain('last-run.json');
  // A receipt image no trip points at, as an older version could leave behind.
  await storeFile(page, `aisle/receipts/${'ab'.repeat(16)}.json`, '{"name":"r","data":""}');
  expect(await storedFiles(page, 'aisle/receipts')).toHaveLength(1);

  await open(page, 'account');
  await page.getByRole('button', {name: /^Erase$/}).click();
  await page.getByRole('button', {name: 'Erase everything'}).click();

  await expect.poll(() => storedFiles(page, 'aisle/receipts')).toEqual([]);
  await open(page, 'list');
  await expect(page.locator('.full-list .item-row')).toHaveCount(0);
});
