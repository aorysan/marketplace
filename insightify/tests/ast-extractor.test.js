const { describe, test } = require('node:test');
const assert = require('assert');
const { extractAst } = require('../skills/planner/parsers/ast-extractor.js');

test('extracts imports from typescript', () => {
    const code = `import { foo } from 'bar'; export const baz = 1;`;
    const result = extractAst(code, 'ts');
    assert.strictEqual(result.status, 'success');
    assert.ok(result.imports.includes('bar'));
    assert.ok(result.exports.includes('baz'));
});