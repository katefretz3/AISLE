// The search-area map: zoom with the buttons or a pinch, move the pin by
// tapping, dragging or with the arrow keys, and put it back with Reset.
import {expect, test, type Page} from '@playwright/test';
import {network, onboard, open} from './support';

async function mapOnAccount(page: Page) {
  await network(page);
  await onboard(page, 6);
  await open(page, 'account');
  const card = page.locator('.map-card').first();
  await card.scrollIntoViewIfNeeded();
  const stage = card.locator('.map-stage');
  await expect(card.getByRole('button', {name: 'Zoom in'})).toBeEnabled();
  return {card, stage};
}
const zoomOf = async (stage: ReturnType<Page['locator']>) =>
  Number(await stage.getAttribute('data-zoom'));

test('the zoom buttons zoom the map in and out', async ({page}) => {
  const {card, stage} = await mapOnAccount(page);
  const start = await zoomOf(stage);
  await card.getByRole('button', {name: 'Zoom in'}).click();
  await expect.poll(() => zoomOf(stage)).toBe(start + 1);
  await card.getByRole('button', {name: 'Zoom out'}).click();
  await expect.poll(() => zoomOf(stage)).toBe(start);
});

test('tapping the map moves the pin, and Reset puts it back', async ({page}) => {
  const {card} = await mapOnAccount(page);
  const place = card.locator('.map-place');
  await expect(place).toHaveText(/Burlington centre/);
  const box = (await card.locator('.location-map').boundingBox())!;
  await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.7);
  await expect(place).toHaveText(/Your pin/);
  await card.getByRole('button', {name: 'Reset to the centre of Burlington'}).click();
  await expect(place).toHaveText(/Burlington centre/);
});

test('the pin can be dragged to a new spot', async ({page}) => {
  const {card} = await mapOnAccount(page);
  const pin = card.locator('.aisle-pin');
  const box = (await pin.boundingBox())!;
  const [x, y] = [box.x + box.width / 2, box.y + box.height * 0.4];
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 30, y + 20, {steps: 4});
  await page.mouse.move(x + 70, y + 45, {steps: 6});
  await page.mouse.up();
  await expect(card.locator('.map-place')).toHaveText(/Your pin/);
  const after = (await pin.boundingBox())!;
  expect(Math.abs(after.x - box.x)).toBeGreaterThan(40);
});

test('the pin moves with the arrow keys, without a drag', async ({page}) => {
  const {card} = await mapOnAccount(page);
  const pin = card.locator('.aisle-pin');
  const before = (await pin.boundingBox())!;
  await pin.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(card.locator('.map-place')).toHaveText(/Your pin/);
  const after = (await pin.boundingBox())!;
  expect(after.x - before.x).toBeGreaterThan(30);
});

test('a two-finger pinch zooms the map', async ({page}, info) => {
  test.skip(info.project.name !== 'phone', 'pinch is a touch gesture');
  const {card, stage} = await mapOnAccount(page);
  const start = await zoomOf(stage);
  const box = (await card.locator('.location-map').boundingBox())!;
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  const cdp = await page.context().newCDPSession(page);
  const points = (spread: number) => [
    {x: cx - spread, y: cy, id: 1},
    {x: cx + spread, y: cy, id: 2},
  ];
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: points(20)});
  for (const spread of [35, 55, 80, 110])
    await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: points(spread)});
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
  await expect.poll(() => zoomOf(stage)).toBeGreaterThan(start);
});
