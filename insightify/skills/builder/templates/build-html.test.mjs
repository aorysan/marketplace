import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { buildArtifact, render } from './build-html.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('parsePlanPages is no longer exported or present as dead code', () => {
  const source = fs.readFileSync(path.join(__dirname, 'build-html.mjs'), 'utf-8');
  assert.ok(!source.includes('parsePlanPages'), 'parsePlanPages must be removed as dead code');
});

test('buildArtifact() does not read an unused plan.md into an unused variable', () => {
  const source = fs.readFileSync(path.join(__dirname, 'build-html.mjs'), 'utf-8');
  assert.ok(!/const plan = options\.plan/.test(source), 'unused plan variable must be removed');
});

test('buildArtifact() runs against an empty OUT_DIR without throwing', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'insightify-empty-'));
  const result = buildArtifact({ outDir: tmpDir });
  assert.ok(result.html.includes('<html'));
  assert.ok(fs.existsSync(path.join(tmpDir, 'index.html')));
  assert.ok(fs.existsSync(path.join(tmpDir, 'Product-Knowledge-Base.md')));
});

test('render() leaves no unresolved {{PLACEHOLDER}} tokens for the real base.html template set', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'insightify-render-'));
  const result = buildArtifact({ outDir: tmpDir });
  const unresolved = result.html.match(/\{\{[A-Z_]+\}\}/g);
  assert.equal(unresolved, null, `unresolved placeholders found: ${unresolved}`);
});

test('buildArtifact() does not pass unused VERSION, GENERATED_AT, or INSIGHTIFY_VERSION to render', () => {
  const source = fs.readFileSync(path.join(__dirname, 'build-html.mjs'), 'utf-8');
  const renderMatch = source.match(/renderedHtml = render\(htmlTemplate,\s*\{([\s\S]*?)\}\);/);
  assert.ok(renderMatch, 'render call must exist');
  const args = renderMatch[1];
  assert.ok(!args.includes('VERSION:'), 'VERSION must not be passed to render');
  assert.ok(!args.includes('GENERATED_AT:'), 'GENERATED_AT must not be passed to render');
  assert.ok(!args.includes('INSIGHTIFY_VERSION:'), 'INSIGHTIFY_VERSION must not be passed to render');
});

test('buildArtifact() throws when layouts/base.html cannot be read', () => {
  const source = fs.readFileSync(path.join(__dirname, 'build-html.mjs'), 'utf-8');
  assert.ok(
    source.includes("throw new Error('builder templates/layouts/base.html not found — cannot render artifact HTML');"),
    'must throw descriptive error when base.html missing'
  );
});

test('builder SKILL.md aligns index.html structure with base.html + components and drops legacy sidebar', () => {
  const skillContent = fs.readFileSync(path.join(__dirname, '../SKILL.md'), 'utf-8');
  assert.ok(!skillContent.includes('<aside class="sidebar"'), 'legacy sidebar must be removed from SKILL.md');
  assert.ok(skillContent.includes('{{> site-header}}'), 'SKILL.md must document site-header component');
  assert.ok(skillContent.includes('{{> section-indicators}}'), 'SKILL.md must document section-indicators component');
  assert.ok(skillContent.includes('buildArtifact()'), 'SKILL.md must reference buildArtifact()');
});
