import {expect, test} from '@playwright/test';
import {network, onboard, open, storedText} from './support';

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
  // Saving is asynchronous; reload once the change has reached storage.
  await expect
    .poll(async () => {
      const saved = JSON.parse((await storedText(page, 'aisle/household.json')) ?? '{}');
      return saved.state?.items?.find((i: {name: string}) => i.name === 'Bananas')?.locked;
    })
    .toBe(true);
  await page.reload();
  await open(page, 'list');
  await expect(page.getByRole('button', {name: 'Unlock Bananas'})).toBeVisible();
});

test('the add-groceries sheet has a visible close button that works', async ({page}, info) => {
  await network(page);
  await onboard(page, 6);
  await open(page, 'list');
  await page
    .getByRole('button', {name: /Add groceries/})
    .first()
    .click();
  const sheet = page.getByRole('dialog');
  const close = sheet.getByRole('button', {name: 'Close'});
  await expect(close).toBeInViewport();
  if (info.project.name === 'phone') {
    // On a phone it is a sheet anchored to the bottom edge.
    const box = (await sheet.boundingBox())!;
    expect(Math.round(box.y + box.height)).toBe(page.viewportSize()!.height);
  }
  await close.click();
  await expect(sheet).toHaveCount(0);
});

test('a staple taken off the list waits as a tile and goes back on with one tap', async ({
  page,
}) => {
  await network(page);
  await onboard(page, 6);
  await open(page, 'list');
  // Every staple starts on the list, so there is nothing to suggest yet.
  await expect(page.getByRole('heading', {name: 'Your usuals'})).toHaveCount(0);
  await page.getByRole('button', {name: 'Remove Bananas'}).click();
  const tile = page.getByRole('button', {name: /^Add Bananas\./});
  await expect(tile).toBeVisible();
  await tile.click();
  await expect(page.getByRole('button', {name: 'Remove Bananas'})).toBeVisible();
  await expect(tile).toHaveCount(0);
});

test('the list is grouped by store section', async ({page}) => {
  await network(page);
  await onboard(page, 6);
  await open(page, 'list');
  await expect(page.getByRole('heading', {name: /^Produce/, level: 3})).toBeVisible();
});
