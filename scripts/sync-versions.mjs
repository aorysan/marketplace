#!/usr/bin/env node
/**
 * Propagate each vendored plugin version into the three places the marketplace
 * declares it: `.claude-plugin/marketplace.json`, `plugins.json`, and the README
 * table.
 *
 * The plugin's own `.claude-plugin/plugin.json` is the single source of truth.
 * Run this after refreshing the vendored copies (see README "Sync & Version
 * Guard"), then `check-versions.mjs` to confirm all four sources agree. Edits are
 * regex-based so the existing JSON/table formatting survives untouched, and the
 * script is idempotent: unchanged versions produce no diff.
 *
 * Usage: node scripts/sync-versions.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const read = (relPath) => readFileSync(join(root, relPath), 'utf8');
const write = (relPath, content) => writeFileSync(join(root, relPath), content);

const marketplace = JSON.parse(read('.claude-plugin/marketplace.json'));
const entries = (marketplace.plugins ?? []).map((entry) => ({
  name: entry.name,
  dir: (entry.source ?? '').replace(/^\.\//, ''),
}));

if (entries.length === 0) {
  console.error('FAIL: .claude-plugin/marketplace.json declares no plugins');
  process.exit(1);
}

const versions = {};
let missing = 0;
for (const { name, dir } of entries) {
  const manifestPath = join(dir, '.claude-plugin/plugin.json');
  if (!existsSync(join(root, manifestPath))) {
    console.error(`FAIL: ${name}: ${manifestPath} is missing — is the vendored copy stale?`);
    missing += 1;
    continue;
  }
  versions[name] = JSON.parse(read(manifestPath)).version;
}
if (missing > 0) {
  process.exit(1);
}

let marketplaceJson = read('.claude-plugin/marketplace.json');
let pluginsJson = read('plugins.json');
let readme = read('README.md');

for (const { name, dir } of entries) {
  const version = versions[name];

  // marketplace.json: "name" precedes the single "version" of that entry.
  marketplaceJson = marketplaceJson.replace(
    new RegExp(`("name": "${name}",[\\s\\S]*?"version": ")[^"]+(")`),
    `$1${version}$2`
  );

  // plugins.json: "path" precedes the single "version" of that entry.
  pluginsJson = pluginsJson.replace(
    new RegExp(`("path": "${dir}",\\s*"version": ")[^"]+(")`),
    `$1${version}$2`
  );

  // README table row: | [name](./dir) | description | version |
  readme = readme.replace(
    new RegExp(`(^\\| \\[${name}\\]\\([^)]*\\) \\|.*\\| )[^\\s|]+( \\|$)`, 'm'),
    `$1${version}$2`
  );
}

const updated = [];
if (marketplaceJson !== read('.claude-plugin/marketplace.json')) {
  write('.claude-plugin/marketplace.json', marketplaceJson);
  updated.push('.claude-plugin/marketplace.json');
}
if (pluginsJson !== read('plugins.json')) {
  write('plugins.json', pluginsJson);
  updated.push('plugins.json');
}
if (readme !== read('README.md')) {
  write('README.md', readme);
  updated.push('README.md');
}

for (const { name } of entries) {
  console.log(`  ${name} -> ${versions[name]}`);
}

console.log();
if (updated.length === 0) {
  console.log('PASS: all declared versions already match the plugin manifests');
} else {
  console.log(`Updated ${updated.join(', ')} from the plugin manifests`);
}
