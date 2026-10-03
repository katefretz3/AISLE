// What the system draws around the app (the status bar, the browser's theme
// colour, the native view behind the page) must be the page's own colour in
// both themes, or a band of a different colour shows above the top bar.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';

const read = (...path: string[]) => readFileSync(join(process.cwd(), ...path), 'utf8');
const canvasIn = (css: string) => css.match(/--canvas:\s*(#[0-9a-f]{6})/i)?.[1].toLowerCase();

test('the status bar and browser chrome match the page in both themes', () => {
  const tokens = read('src', 'app', 'tokens.css');
  const darkBlock = tokens.indexOf(":root[data-theme='dark']");
  const light = canvasIn(tokens.slice(0, darkBlock));
  const dark = canvasIn(tokens.slice(darkBlock));
  assert.ok(light && dark, 'tokens.css defines --canvas for both themes');

  assert.match(
    read('src', 'lib', 'appearance.ts'),
    new RegExp(`light: '${light}', dark: '${dark}'`),
  );
  const html = read('index.html');
  assert.match(html, new RegExp(`name="theme-color" content="${light}"`));
  assert.match(html, new RegExp(`'content', '${dark}'`));
  const native = [...read('capacitor.config.ts').matchAll(/backgroundColor: '(#[0-9a-f]{6})'/gi)];
  assert.ok(native.length > 0);
  for (const [, colour] of native) assert.equal(colour.toLowerCase(), light);
});
