// House rules for the words on screen.
//
// No em dashes in anything a person reads (a comma, colon or full stop says it
// more plainly), and no shouted all-caps labels. Comments are left alone; this
// checks code that renders or returns text.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative} from 'node:path';

const SRC = join(process.cwd(), 'src');
const SKIP = [join(SRC, 'vendor'), join(SRC, 'components', 'ui')];

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (SKIP.some(skip => path.startsWith(skip))) return [];
    if (statSync(path).isDirectory()) return sources(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

/** Code with comments removed; `https://` inside strings is kept. */
const withoutComments = (code: string) =>
  code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');

test('no em dashes in anything the app shows or says', () => {
  const found: string[] = [];
  // index.html carries the document title, which screen readers announce.
  for (const file of [...sources(SRC), join(process.cwd(), 'index.html')]) {
    withoutComments(readFileSync(file, 'utf8'))
      .split('\n')
      .forEach((line, i) => {
        if (line.includes('—')) found.push(`${relative(SRC, file)}:${i + 1}`);
      });
  }
  assert.deepEqual(found, []);
});

test('no all-caps labels in the interface', () => {
  const found: string[] = [];
  for (const file of sources(SRC).filter(f => f.endsWith('.tsx'))) {
    const code = withoutComments(readFileSync(file, 'utf8'));
    for (const match of code.matchAll(/>\s*([A-Z]{2,}(?:[ ,.'’&]+[A-Z]{2,})+)\s*</g))
      found.push(`${relative(SRC, file)}: "${match[1]}"`);
    for (const match of code.matchAll(/`[^`]*\b(STEP|YOUR|MAKE|THE)\s+[A-Z$]/g))
      found.push(`${relative(SRC, file)}: ${match[0].slice(0, 30)}`);
  }
  assert.deepEqual(found, []);
});
