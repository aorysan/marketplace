#!/usr/bin/env node
/**
 * Version-drift guard for aorysan-marketplace.
 *
 * The marketplace ships a vendored copy of each plugin, so a plugin version is
 * declared in four places: the plugin's own `.claude-plugin/plugin.json`, the
 * marketplace entry, `plugins.json`, and the README table. They have drifted
 * apart before (sitegen was listed as 1.1.0 while the shipped manifest said
 * 1.0.0), and a stale `version` pins every install to a version that does not
 * exist. This script fails when any of them disagree.
 *
 * Usage: node scripts/check-versions.mjs
 * Exit code 0 = all sources agree, 1 = drift found.
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const readJson = (relPath) => {
  const fullPath = join(root, relPath);
  if (!existsSync(fullPath)) {
    throw new Error(`${relPath} is missing`);
  }
  return JSON.parse(readFileSync(fullPath, 'utf8'));
};

const failures = [];
const fail = (message) => failures.push(message);

let marketplace;
let index;
let readme;
try {
  marketplace = readJson('.claude-plugin/marketplace.json');
  index = readJson('plugins.json');
  readme = readFileSync(join(root, 'README.md'), 'utf8');
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exit(1);
}

// README table row: | [name](./name) | description | version |
const readmeVersion = (name) => {
  const pattern = new RegExp(
    `^\\|\\s*\\[${name}\\]\\([^)]*\\)\\s*\\|.*\\|\\s*([^\\s|]+)\\s*\\|\\s*$`,
    'm'
  );
  const match = readme.match(pattern);
  return match ? match[1] : null;
};

console.log('=== Marketplace version check ===\n');

for (const entry of marketplace.plugins ?? []) {
  const name = entry.name;
  const dir = (entry.source ?? '').replace(/^\.\//, '');

  if (!dir) {
    fail(`${name}: marketplace entry has no "source" path`);
    continue;
  }
  if (!existsSync(join(root, dir))) {
    fail(`${name}: vendored directory "${dir}" does not exist`);
    continue;
  }

  const manifestPath = join(dir, '.claude-plugin/plugin.json');
  if (!existsSync(join(root, manifestPath))) {
    fail(`${name}: ${manifestPath} is missing`);
    continue;
  }

  const manifest = JSON.parse(readFileSync(join(root, manifestPath), 'utf8'));

  if (manifest.name !== name) {
    fail(`${name}: manifest name is "${manifest.name}"`);
  }
  if (entry.version !== manifest.version) {
    fail(
      `${name}: marketplace.json says ${entry.version} but ${manifestPath} says ${manifest.version}`
    );
  }

  const indexEntry = (index.plugins ?? []).find((plugin) => plugin.name === name);
  if (!indexEntry) {
    fail(`${name}: missing from plugins.json`);
  } else if (indexEntry.version !== manifest.version) {
    fail(
      `${name}: plugins.json says ${indexEntry.version} but ${manifestPath} says ${manifest.version}`
    );
  }
  if (indexEntry && indexEntry.path !== dir) {
    fail(`${name}: plugins.json path is "${indexEntry.path}", expected "${dir}"`);
  }

  const readmeEntry = readmeVersion(name);
  if (readmeEntry === null) {
    fail(`${name}: no README.md table row found`);
  } else if (readmeEntry !== manifest.version) {
    fail(
      `${name}: README.md says ${readmeEntry} but ${manifestPath} says ${manifest.version}`
    );
  }

  if (!failures.some((message) => message.startsWith(`${name}:`))) {
    console.log(`PASS: ${name} ${manifest.version} (${dir})`);
  }
}

// Every vendored directory must be listed in the marketplace, otherwise a plugin
// can rot in the repo without anyone noticing.
const listed = new Set(
  (marketplace.plugins ?? []).map((entry) => (entry.source ?? '').replace(/^\.\//, ''))
);
for (const entry of index.plugins ?? []) {
  if (entry.path && !listed.has(entry.path)) {
    fail(`${entry.name}: listed in plugins.json but not in marketplace.json`);
  }
}

console.log();
if (failures.length > 0) {
  console.error(`FAIL: ${failures.length} version-drift problem(s):`);
  for (const message of failures) {
    console.error(`  - ${message}`);
  }
  process.exit(1);
}

console.log(
  `PASS: ${(marketplace.plugins ?? []).length} plugins agree across marketplace.json, plugins.json, README.md, and their manifests`
);
