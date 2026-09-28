import {expect, test} from '@playwright/test';
import {network, onboard, open} from './support';

test.beforeEach(async ({page}) => {
  await network(page);
});

test('first run asks for at least five staples before finishing', async ({page}) => {
  await page.goto('/');
  const setup = page.getByRole('dialog');
  await expect(setup.getByRole('progressbar', {name: 'Setup progress'})).toHaveAttribute(
    'aria-valuetext',
    'Step 1 of 4',
  );
  await setup.locator('#setup-name').fill('Sam');
  for (let i = 0; i < 3; i++)
    await setup
      .getByRole('button', {name: /^Continue/})
      .last()
      .click();
  await setup.locator('.setup-footer .button.primary').click();
  await expect(setup.getByRole('alert')).toContainText(/more staple/);
  await expect(setup).toBeVisible();
});

test('setup is saved: a reload lands in the app with the chosen list', async ({page}) => {
  await onboard(page, 6);
  await page.reload();
  await expect(page.getByText(/STEP \d OF 4/)).toHaveCount(0);
  await open(page, 'list');
  await expect(page.locator('.full-list .item-row')).toHaveCount(6);
});
