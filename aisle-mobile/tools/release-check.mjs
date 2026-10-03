// Release gate: `npm run release:check`.
//
// CI stays green while the operator's details are still unfilled, because the
// app is fine to build and test without them. A build that goes to a store is
// different, so this refuses one. It never fills anything in: every failure
// names the file to edit and leaves the value to a person.
//
// Checks:
//   1. No OPERATOR field in src/lib/legal.ts still reads PLACEHOLDER.
//   2. The built bundle (dist/) contains no PLACEHOLDER text and no Anthropic
//      API key.
//   3. capacitor.config.ts sets no remote server.url.
//   4. The iOS and Android version numbers match package.json.
//   5. If a reasoning broker is configured, it is https.
//
// Run after `npm run build`, with the same environment the release uses.
import {readFileSync, readdirSync, statSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const read = path => readFileSync(join(root, path), 'utf8');
const failures = [];
const fail = (message, fix) => failures.push({message, fix});

// 1. Operator details.
const legal = read('src/lib/legal.ts');
const operator = legal.slice(legal.indexOf('export const OPERATOR'), legal.indexOf('} as const;'));
for (const [, field] of operator.matchAll(/^\s*(\w+):\s*'PLACEHOLDER/gm))
  fail(`OPERATOR.${field} is still a placeholder`, 'src/lib/legal.ts');

// 2. The bundle.
const dist = join(root, 'dist');
if (!existsSync(dist)) fail('There is no dist/ to check', 'run `npm run build` first');
else {
  const files = [];
  const walk = dir => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.(js|html|css|json|txt)$/.test(name)) files.push(path);
    }
  };
  walk(dist);
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const rel = file.slice(root.length);
    // The form every unfinished OPERATOR value takes (tests/pages.test.ts holds
    // them to it); the bare word also appears in the app's own check.
    if (text.includes('PLACEHOLDER:'))
      fail(`${rel} ships placeholder legal text`, 'src/lib/legal.ts, then rebuild');
    if (/sk-ant-[A-Za-z0-9_-]{8,}/.test(text))
      fail(
        `${rel} contains what looks like an Anthropic API key`,
        'remove it from the app environment; the key belongs on the broker only',
      );
  }
}

// 3. No remote server.url.
const cap = read('capacitor.config.ts');
if (/server\s*:\s*\{[^}]*url\s*:/s.test(cap))
  fail('capacitor.config.ts sets server.url', 'remove it; the app must load its own bundle');

// 4. Versions.
const version = JSON.parse(read('package.json')).version;
const padded = v => (v.split('.').length === 2 ? `${v}.0` : v);
const pbx = existsSync(join(root, 'ios/App/App.xcodeproj/project.pbxproj'))
  ? read('ios/App/App.xcodeproj/project.pbxproj')
  : '';
for (const [, v] of pbx.matchAll(/MARKETING_VERSION = ([\d.]+);/g))
  if (padded(v) !== version)
    fail(`iOS MARKETING_VERSION is ${v}, package.json is ${version}`, 'ios/App/App.xcodeproj');
const gradle = existsSync(join(root, 'android/app/build.gradle'))
  ? read('android/app/build.gradle')
  : '';
const versionName = gradle.match(/versionName\s+"([\d.]+)"/)?.[1];
if (versionName && padded(versionName) !== version)
  fail(
    `Android versionName is ${versionName}, package.json is ${version}`,
    'android/app/build.gradle',
  );

// 5. Broker endpoint.
const endpoint = process.env.VITE_AISLE_AGENT_ENDPOINT ?? envFile('VITE_AISLE_AGENT_ENDPOINT');
if (endpoint && !/^https:\/\//.test(endpoint))
  fail('VITE_AISLE_AGENT_ENDPOINT is not https', '.env or the release environment');

function envFile(key) {
  for (const name of ['.env.production.local', '.env.production', '.env.local', '.env']) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    const line = readFileSync(path, 'utf8')
      .split('\n')
      .find(l => l.startsWith(`${key}=`));
    if (line) return line.slice(key.length + 1).trim();
  }
  return '';
}

if (failures.length) {
  console.error(`Release check failed (${failures.length}):`);
  for (const {message, fix} of failures) console.error(`  ✗ ${message}\n      → ${fix}`);
  process.exit(1);
}
console.log('Release check passed.');
