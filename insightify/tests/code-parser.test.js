const { describe, test } = require('node:test');
const assert = require('assert');
const { parseCode } = require('../skills/planner/parsers/code-parser.js');

test('injects ast-dependencies block', () => {
    const code = `import { a } from 'b';`;
    const result = parseCode(code, 'ts');
    assert.ok(result.includes('<ast-dependencies>'));
});