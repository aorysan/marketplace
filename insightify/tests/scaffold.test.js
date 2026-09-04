const { describe, test } = require('node:test');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

describe('Project Scaffolding', () => {
  test('plugin manifests exist and have correct structure', () => {
    const claudeManifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../.claude-plugin/plugin.json'), 'utf8'));
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
    assert.strictEqual(claudeManifest.name, 'insightify');
    assert.strictEqual(claudeManifest.version, pkg.version);
  });
});

