import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('Phase 1 table does not claim unimplemented OpenAPI/Swagger endpoint parsing', () => {
  const skill = fs.readFileSync(path.join(__dirname, 'SKILL.md'), 'utf-8');
  assert.ok(
    !/parse endpoints\/models directly/i.test(skill),
    'SKILL.md must not claim endpoint/model parsing that parsers/json-parser.js does not implement'
  );
});

test('Phase 1 table does not claim unimplemented SQL DDL table/column parsing', () => {
  const skill = fs.readFileSync(path.join(__dirname, 'SKILL.md'), 'utf-8');
  assert.ok(
    !/parse tables\/columns\/entities directly/i.test(skill),
    'SKILL.md must not claim SQL DDL parsing — no parsers/sql-parser.js exists'
  );
});

test('no sql-parser.js is referenced without existing on disk', () => {
  const skill = fs.readFileSync(path.join(__dirname, 'SKILL.md'), 'utf-8');
  const referencesSqlParser = /parsers\/sql-parser\.js/.test(skill);
  const sqlParserExists = fs.existsSync(path.join(__dirname, 'parsers', 'sql-parser.js'));
  assert.equal(referencesSqlParser, sqlParserExists, 'SKILL.md must only reference parsers/sql-parser.js if that file exists');
});
