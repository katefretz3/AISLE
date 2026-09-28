import {expect, test} from '@playwright/test';
import {network, onboard, open} from './support';

test('changing a quantity from the keyboard keeps focus on the button', async ({page}) => {
  await network(page);
  await onboard(page, 6);
  await open(page, 'list');
  const more = page.getByRole('button', {name: 'Increase Gala apples quantity'});
  await more.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  const row = page.locator('.full-list .item-row', {hasText: 'Gala apples'});
  await expect(row.locator('.quantity span')).toHaveText('3');
  // A row that is re-created on every render loses focus after the first press.
  await expect(more).toBeFocused();
});

test('locking an item is remembered after a reload', async ({page}) => {
  await network(page);
  await onboard(page, 6);
  await open(page, 'list');
  await page.getByRole('button', {name: 'Lock Bananas'}).click();
  await expect(page.getByRole('button', {name: 'Unlock Bananas'})).toBeVisible();
  await page.reload();
  await open(page, 'list');
  await expect(page.getByRole('button', {name: 'Unlock Bananas'})).toBeVisible();
});
