// Bundles the unit tests with Vite, then runs them on Node's test runner.
// Vite is already a dependency, so this needs no extra tooling.
//
// Every `tests/*.test.ts` is picked up automatically. Browser tests live in
// tests/e2e and run separately (`npm run test:e2e`).
import {build} from 'vite';
import {fileURLToPath, URL} from 'node:url';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readdirSync, rmSync} from 'node:fs';
import {join} from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const here = fileURLToPath(new URL('.', import.meta.url));
// Emitted inside the project so bare imports (zod) still resolve at run time.
const out = mkdtempSync(join(root, 'node_modules', '.aisle-test-'));

const suites = readdirSync(here)
  .filter(f => f.endsWith('.test.ts'))
  .sort();
const input = Object.fromEntries(suites.map(f => [f.replace(/\.test\.ts$/, ''), join(here, f)]));

await build({
  root,
  logLevel: 'error',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('../src', import.meta.url)),
      '@capacitor/core': fileURLToPath(new URL('./stubs/capacitor.ts', import.meta.url)),
      '@capacitor/filesystem': fileURLToPath(new URL('./stubs/filesystem.ts', import.meta.url)),
      '@capacitor/camera': fileURLToPath(new URL('./stubs/device-plugins.ts', import.meta.url)),
      '@capacitor/share': fileURLToPath(new URL('./stubs/device-plugins.ts', import.meta.url)),
      '@capacitor/haptics': fileURLToPath(new URL('./stubs/device-plugins.ts', import.meta.url)),
    },
  },
  // The broker's SDK is installed in ../server, not here, so it is bundled
  // into the test output rather than resolved from this package at run time.
  ssr: {noExternal: ['@anthropic-ai/sdk']},
  build: {
    outDir: out,
    emptyOutDir: true,
    ssr: true,
    target: 'node22',
    minify: false,
    rollupOptions: {
      input,
      output: {entryFileNames: '[name].test.mjs', format: 'es'},
    },
  },
});

const result = spawnSync(
  process.execPath,
  ['--test', ...Object.keys(input).map(name => join(out, `${name}.test.mjs`))],
  {stdio: 'inherit', cwd: root},
);
rmSync(out, {recursive: true, force: true});
process.exit(result.status ?? 1);
