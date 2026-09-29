import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractAst } from './ast-extractor.js';

const sampleJs = `import React from 'react';\nexport const x = 1;\n`;

test('extractAst succeeds with short alias "js"', () => {
  const result = extractAst(sampleJs, 'js');
  assert.equal(result.status, 'success');
  assert.deepEqual(result.imports, ['react']);
});

test('extractAst succeeds with long alias "javascript"', () => {
  const result = extractAst(sampleJs, 'javascript');
  assert.equal(result.status, 'success');
  assert.deepEqual(result.imports, ['react']);
});

test('extractAst succeeds with tsx and extracts exports containing JSX', () => {
  const sampleTsx = `import React from 'react';\nexport const App = () => <div>Hello</div>;\n`;
  const result = extractAst(sampleTsx, 'tsx');
  assert.equal(result.status, 'success');
  assert.deepEqual(result.imports, ['react']);
  assert.deepEqual(result.exports, ['App']);
});

test('extractAst succeeds with long alias "typescript"', () => {
  const sampleTs = `import { z } from 'zod';\nexport const y: number = 2;\n`;
  const result = extractAst(sampleTs, 'typescript');
  assert.equal(result.status, 'success');
  assert.deepEqual(result.imports, ['zod']);
});

test('extractAst succeeds with long alias "python"', () => {
  const samplePy = `import os\n`;
  const result = extractAst(samplePy, 'python');
  assert.equal(result.status, 'success');
});

test('extractAst still fails gracefully for a genuinely unsupported language', () => {
  const result = extractAst('package main\n', 'go');
  assert.equal(result.status, 'failed');
});
