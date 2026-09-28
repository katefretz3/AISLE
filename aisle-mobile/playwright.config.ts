// Browser tests: `npm run test:e2e`.
//
// They run against the production build (`vite preview`), with every request
// that leaves localhost either answered by a fixture in tests/e2e/support.ts
// or refused, so a run never touches a real retailer or map service and never
// depends on one being up.
import {defineConfig, devices} from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: {timeout: 15_000},
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', {open: 'never'}]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'phone',
      use: {...devices['Pixel 7'], viewport: {width: 390, height: 844}},
    },
    {
      name: 'desktop',
      use: {...devices['Desktop Chrome'], viewport: {width: 1280, height: 900}},
      // The flows are the same; the layout checks are what differ.
      testMatch: /(a11y|layout)\.spec\.ts/,
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
