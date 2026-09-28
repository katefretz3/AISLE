// Shared browser-test setup.
//
// The fixture retailer and its catalogue are synthetic (the same shapes as
// tests/fixtures.ts). Nothing here is a real offer, and nothing in the app
// loads this file.
import {expect, type Page, type Route} from '@playwright/test';

export const FIXTURE_ORIGIN = 'https://fixture-grocer.example.ca';

const CATALOGUE = {
  products: [
    {
      title: 'Gala Apples',
      handle: 'gala-apples',
      vendor: 'Fresh produce',
      product_type: 'Produce',
      tags: ['produce'],
      variants: [{id: 1003, title: '3 lb bag', price: '4.49', available: true}],
    },
    {
      title: 'Whole Wheat Bread',
      handle: 'whole-wheat-bread',
      vendor: 'Dempster’s',
      product_type: 'Bakery',
      tags: ['bakery'],
      variants: [{id: 1001, title: '675 g', price: '3.99', available: true}],
    },
  ],
};

/** One mapped shop, in Burlington, whose website is the fixture retailer. */
const OVERPASS = {
  elements: [
    {
      type: 'node',
      id: 1,
      lat: 43.3862,
      lon: -79.8371,
      tags: {
        name: 'Fixture Grocer',
        shop: 'supermarket',
        website: FIXTURE_ORIGIN,
        'addr:housenumber': '1',
        'addr:street': 'Test Street',
        'addr:city': 'Burlington',
      },
    },
  ],
};

export type Network = {
  /** Hosts the app tried to reach that were refused. */
  refused: Set<string>;
  /** Requests answered by the fixture retailer. */
  retailerHits: string[];
  directoryHits: number;
};

const cors = {'Access-Control-Allow-Origin': '*'};

/**
 * Refuse everything that leaves localhost. With `retail`, answer the store
 * directory and the fixture retailer instead.
 */
export async function network(page: Page, {retail = false} = {}): Promise<Network> {
  const net: Network = {refused: new Set(), retailerHits: [], directoryHits: 0};
  await page.route('**/*', async (route: Route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'localhost') return route.continue();
    if (retail && /overpass/.test(url.hostname)) {
      net.directoryHits++;
      return route.fulfill({status: 200, headers: cors, json: OVERPASS});
    }
    if (retail && url.origin === FIXTURE_ORIGIN) {
      net.retailerHits.push(url.pathname + url.search);
      if (url.pathname === '/robots.txt')
        return route.fulfill({
          status: 200,
          headers: cors,
          body: 'User-agent: *\nDisallow: /checkout\n',
        });
      if (url.pathname === '/')
        return route.fulfill({
          status: 200,
          headers: {...cors, 'Content-Type': 'text/html'},
          body: '<html><script>Shopify.currency = {"active":"CAD","rate":"1.0"};</script></html>',
        });
      if (url.pathname === '/products.json')
        return route.fulfill({status: 200, headers: cors, json: CATALOGUE});
      return route.fulfill({status: 404, headers: cors, body: ''});
    }
    net.refused.add(url.hostname);
    return route.abort();
  });
  return net;
}

/** Complete first-run setup through the real interface, choosing fruit staples. */
export async function onboard(page: Page, staples = 6) {
  await page.goto('/');
  const setup = page.getByRole('dialog');
  await expect(setup).toBeVisible();
  const next = () =>
    setup
      .getByRole('button', {name: /^Continue/})
      .last()
      .click();
  await setup.locator('#setup-name').fill('Sam');
  await next();
  await next();
  await next();
  await setup
    .getByRole('button', {name: /Produce/})
    .first()
    .click();
  await setup.getByRole('button', {name: /Fruit/}).first().click();
  const add = setup.getByRole('button', {name: /^Add /});
  for (let i = 0; i < staples; i++) await add.nth(i).click();
  await setup.locator('.setup-footer .button.primary').click();
  // Setup shows a saving screen before it closes.
  await expect(page.getByRole('dialog')).toHaveCount(0, {timeout: 20_000});
}

/** Go to a view the way a deep link would. */
export async function open(page: Page, view: string) {
  await page.evaluate(v => {
    location.hash = `#${v}`;
  }, view);
}

/**
 * Files the app has stored under `folder` (relative to its data directory).
 * In a browser, @capacitor/filesystem keeps files in the IndexedDB database
 * "Disc", store "FileStorage", keyed by "/DATA/<path>".
 */
export async function storedFiles(page: Page, folder = 'aisle'): Promise<string[]> {
  return page.evaluate(
    folder =>
      new Promise<string[]>(resolve => {
        const open = indexedDB.open('Disc');
        open.onerror = () => resolve([]);
        open.onsuccess = () => {
          const db = open.result;
          if (!db.objectStoreNames.contains('FileStorage')) return resolve([]);
          const all = db.transaction('FileStorage').objectStore('FileStorage').getAll();
          all.onsuccess = () => {
            const prefix = `/DATA/${folder}/`;
            resolve(
              (all.result as {path: string; type: string}[])
                .filter(r => r.type === 'file' && r.path.startsWith(prefix))
                .map(r => r.path.slice(prefix.length))
                .sort(),
            );
          };
          all.onerror = () => resolve([]);
        };
      }),
    folder,
  );
}

/** Write a file the way the app would, for setting up a test. */
export async function storeFile(page: Page, path: string, content: string) {
  await page.evaluate(
    ({path, content}) =>
      new Promise<void>((resolve, reject) => {
        const open = indexedDB.open('Disc');
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const tx = open.result.transaction('FileStorage', 'readwrite');
          const now = Date.now();
          tx.objectStore('FileStorage').put({
            path: `/DATA/${path}`,
            folder: `/DATA/${path.split('/').slice(0, -1).join('/')}`,
            type: 'file',
            size: content.length,
            ctime: now,
            mtime: now,
            content,
          });
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
      }),
    {path, content},
  );
}
