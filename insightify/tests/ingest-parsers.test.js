const { describe, test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { parseHtml } = require('../skills/planner/parsers/html-parser');
const { parseCode } = require('../skills/planner/parsers/code-parser');
const { parseJson } = require('../skills/planner/parsers/json-parser');
const { parsePdf } = require('../skills/planner/parsers/pdf-parser');

describe('Ingest Parsers', () => {
  // --- HTML Parser Tests ---
  test('html-parser extracts main content and ignores nav/footer', () => {
    const html = `<html><body><nav>Menu</nav><main><h1>Title</h1><p>Hello world</p></main><footer>Footer</footer></body></html>`;
    const md = parseHtml(html);
    assert.strictEqual(md.includes('Title'), true);
    assert.strictEqual(md.includes('Hello world'), true);
    assert.strictEqual(md.includes('Menu'), false);
  });

  test('html-parser preserves heading hierarchy', () => {
    const html = '<html><body><main><h1>Title</h1><h2>Section</h2><p>Content</p><h3>Subsection</h3><p>More</p></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('# Title'));
    assert.ok(md.includes('## Section'));
    assert.ok(md.includes('### Subsection'));
    assert.ok(md.includes('Content'));
    assert.ok(md.includes('More'));
  });

  test('html-parser converts unordered lists', () => {
    const html = '<html><body><main><ul><li>First</li><li>Second</li><li>Third</li></ul></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('- First'));
    assert.ok(md.includes('- Second'));
    assert.ok(md.includes('- Third'));
  });

  test('html-parser converts ordered lists', () => {
    const html = '<html><body><main><ol><li>Step one</li><li>Step two</li></ol></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('1. Step one'));
    assert.ok(md.includes('2. Step two'));
  });

  test('html-parser converts nested lists', () => {
    const html = '<html><body><main><ul><li>Parent<ul><li>Child</li></ul></li></ul></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('- Parent'));
    assert.ok(md.includes('  - Child'));
  });

  test('html-parser converts fenced code blocks with language', () => {
    const html = '<html><body><main><pre><code class="language-js">const x = 1;</code></pre></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('```js'));
    assert.ok(md.includes('const x = 1;'));
    assert.ok(md.includes('```'));
  });

  test('html-parser converts inline code', () => {
    const html = '<html><body><main><p>Use the <code>npm install</code> command</p></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('`npm install`'));
  });

  test('html-parser converts links', () => {
    const html = '<html><body><main><p>Visit <a href="https://example.com">Example</a> for more.</p></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('[Example](https://example.com)'));
  });

  test('html-parser converts bold and italic', () => {
    const html = '<html><body><main><p>This is <strong>bold</strong> and <em>italic</em> text.</p></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('**bold**'));
    assert.ok(md.includes('*italic*'));
  });

  test('html-parser converts images', () => {
    const html = '<html><body><main><img src="photo.jpg" alt="A photo" /></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('![A photo](photo.jpg)'));
  });

  test('html-parser converts tables', () => {
    const html = '<html><body><main><table><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody><tr><td>A</td><td>1</td></tr></tbody></table></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('| Name | Value |'));
    assert.ok(md.includes('| --- | --- |'));
    assert.ok(md.includes('| A | 1 |'));
  });

  test('html-parser escapes pipe characters in table cells', () => {
    const html = '<html><body><main><table><thead><tr><th>Header | Sub</th><th>Type</th></tr></thead><tbody><tr><td>a | b</td><td>string | number</td></tr></tbody></table></main></body></html>';
    const md = parseHtml(html);
    assert.ok(md.includes('| Header \\| Sub | Type |'));
    assert.ok(md.includes('| a \\| b | string \\| number |'));
  });

  test('html-parser handles empty elements gracefully', () => {
    const html = '<html><body><main><p></p><h2></h2><ul></ul></main></body></html>';
    const md = parseHtml(html);
    assert.strictEqual(typeof md, 'string');
  });

  test('html-parser handles mixed content', () => {
    const html = `<html><body><main>
      <h1>API Guide</h1>
      <p>Welcome to the <strong>API</strong>.</p>
      <h2>Installation</h2>
      <pre><code class="language-bash">npm install sdk</code></pre>
      <ul><li>Fast</li><li>Reliable</li></ul>
    </main></body></html>`;
    const md = parseHtml(html);
    assert.ok(md.includes('# API Guide'));
    assert.ok(md.includes('**API**'));
    assert.ok(md.includes('## Installation'));
    assert.ok(md.includes('```bash'));
    assert.ok(md.includes('npm install sdk'));
    assert.ok(md.includes('- Fast'));
    assert.ok(md.includes('- Reliable'));
  });

  // --- Code Parser Tests ---
  test('code-parser extracts docstrings and JSDoc', () => {
    const code = `
      /**
       * Calculate total price
       * @param {number} amount
       */
      function calc(amount) { return amount; }
    `;
    const extracted = parseCode(code, 'js');
    assert.strictEqual(extracted.includes('Calculate total price'), true);
  });

  test('code-parser extracts python docstrings', () => {
    const code = `
def add(a, b):
    """Add two numbers together."""
    return a + b

def sub(a, b):
    '''Subtract b from a.'''
    return a - b
`;
    const extracted = parseCode(code, 'py');
    assert.strictEqual(extracted.includes('Add two numbers together.'), true);
    assert.strictEqual(extracted.includes('Subtract b from a.'), true);
  });

  test('code-parser extracts typescript interfaces preserving generics and inheritance signatures', () => {
    const tsCode = `
      export interface User {
        id: string;
        name: string;
      }
      export interface Admin<T = string> extends User, Permissions {
        permissions: string[];
        config: {
          level: number;
          metadata: T;
        };
      }
      export type Role = 'admin' | 'user' | 'guest';
      export type ApiResponse<T> = { data: T; status: number };
      export enum Status {
        ACTIVE = 'active',
        INACTIVE = 'inactive'
      }
      export const enum Priority {
        LOW = 0,
        HIGH = 1
      }
    `;
    const extracted = parseCode(tsCode, 'ts');
    assert.ok(extracted.includes('## Interfaces'));
    assert.ok(extracted.includes('### User'));
    assert.ok(extracted.includes('interface User {'));
    assert.ok(extracted.includes('### Admin'));
    assert.ok(extracted.includes('interface Admin<T = string> extends User, Permissions {'));
    assert.ok(extracted.includes('metadata: T;'));
    assert.ok(extracted.includes('## Types'));
    assert.ok(extracted.includes('### Role'));
    assert.ok(extracted.includes("type Role = 'admin' | 'user' | 'guest';"));
    assert.ok(extracted.includes('### ApiResponse'));
    assert.ok(extracted.includes('type ApiResponse<T> = { data: T; status: number };'));
    assert.ok(extracted.includes('## Enums'));
    assert.ok(extracted.includes('### Status'));
    assert.ok(extracted.includes('enum Status {'));
    assert.ok(extracted.includes('### Priority'));
    assert.ok(extracted.includes('enum Priority {'));
  });

  test('code-parser handles regex literals with braces inside interfaces and advances lastIndex', () => {
    const tsCode = `
      export interface PatternConfig {
        pattern: RegExp;
        format: {
          test: /\\{[a-z]+\\}/;
        };
      }
      export interface NextInterface {
        id: string;
      }
    `;
    const extracted = parseCode(tsCode, 'ts');
    assert.ok(extracted.includes('### PatternConfig'));
    assert.ok(extracted.includes('interface PatternConfig {'));
    assert.ok(extracted.includes('### NextInterface'));
    assert.ok(extracted.includes('interface NextInterface {'));
  });

  test('code-parser extracts react components and custom hooks', () => {
    const tsxCode = `
      import React from 'react';
      export function useUser(id: string) { return { id }; }
      export const useAuth = () => { return { user: null }; };
      export const UserCard = () => <div>User</div>;
      export const Button: React.FC<ButtonProps> = ({ label }) => <button>{label}</button>;
      export const Modal = React.memo(({ isOpen }) => <div>Modal</div>);
      export const Input = React.forwardRef((props, ref) => <input ref={ref} />);
      export function Header(props: HeaderProps) { return <header />; }
    `;
    const extracted = parseCode(tsxCode, 'tsx');
    assert.ok(extracted.includes('## Hooks'));
    assert.ok(extracted.includes('useUser'));
    assert.ok(extracted.includes('useAuth'));
    assert.ok(extracted.includes('## React Components'));
    assert.ok(extracted.includes('UserCard'));
    assert.ok(extracted.includes('Button'));
    assert.ok(extracted.includes('Modal'));
    assert.ok(extracted.includes('Input'));
    assert.ok(extracted.includes('Header'));
  });

  test('code-parser extracts imports across multiple patterns', () => {
    const code = `
      import React, { useState, useEffect } from 'react';
      import type { User, Role } from './types';
      import * as LucideIcons from 'lucide-react';
      import './globals.css';
    `;
    const extracted = parseCode(code, 'ts');
    assert.ok(extracted.includes('## Imports'));
    assert.ok(extracted.includes('From `react`: React { useState, useEffect }'));
    assert.ok(extracted.includes('From `./types`: type { User, Role }'));
    assert.ok(extracted.includes('From `lucide-react`: * as LucideIcons'));
    assert.ok(extracted.includes('From `./globals.css`'));
  });

  test('code-parser does not duplicate raw code when definitions exist without comments', () => {
    const code = `
      export interface Config {
        port: number;
      }
    `;
    const extracted = parseCode(code, 'ts');
    assert.ok(extracted.includes('## Interfaces'));
    assert.ok(extracted.includes('### Config'));
    assert.strictEqual(extracted.startsWith('\n\n## Interfaces'), true);
  });

  test('code-parser returns raw code string when no comments and no definitions exist', () => {
    const code = `const a = 1;\nconst b = 2;\nconsole.log(a + b);`;
    const extracted = parseCode(code, 'js');
    assert.strictEqual(extracted, code);
  });

  // --- JSON Parser Tests ---
  test('json-parser extracts package.json dependencies, devDependencies, peerDependencies, and scripts', () => {
    const pkgJson = JSON.stringify({
      name: 'my-app',
      version: '1.0.0',
      description: 'A test app',
      license: 'MIT',
      dependencies: { react: '^18.2.0', zustand: '^4.4.0' },
      devDependencies: { typescript: '^5.0.0', vite: '^4.0.0' },
      peerDependencies: { react: '>=18.0.0' },
      scripts: { build: 'vite build', test: 'vitest' }
    });
    const parsed = parseJson(pkgJson, 'json');
    assert.ok(parsed.includes('## Dependencies'));
    assert.ok(parsed.includes('react: ^18.2.0'));
    assert.ok(parsed.includes('zustand: ^4.4.0'));
    assert.ok(parsed.includes('## Dev Dependencies'));
    assert.ok(parsed.includes('typescript: ^5.0.0'));
    assert.ok(parsed.includes('## Peer Dependencies'));
    assert.ok(parsed.includes('react: >=18.0.0'));
    assert.ok(parsed.includes('## Scripts'));
    assert.ok(parsed.includes('build: vite build'));
    // Ensure extraneous metadata is NOT present
    assert.strictEqual(parsed.includes('**License:**'), false);
    assert.strictEqual(parsed.includes('**Version:**'), false);
  });

  test('json-parser extracts tsconfig.json compiler options', () => {
    const tsconfigJson = JSON.stringify({
      extends: './tsconfig.base.json',
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        paths: {
          '@/*': ['./src/*'],
          '@components/*': ['./src/components/*']
        }
      },
      include: ['src/**/*', 'tests/**/*'],
      exclude: ['node_modules', 'dist']
    });
    const parsed = parseJson(tsconfigJson, 'json');
    assert.ok(parsed.includes('## TypeScript Compiler Options'));
    assert.ok(parsed.includes('"target": "ES2022"'));
    assert.ok(parsed.includes('"module": "ESNext"'));
    assert.ok(parsed.includes('@/*'));
    // Ensure extraneous tsconfig fields are NOT present
    assert.strictEqual(parsed.includes('**Extends:**'), false);
    assert.strictEqual(parsed.includes('## Include'), false);
  });

  test('json-parser handles JSON with comments (JSONC) and trailing commas', () => {
    const jsonc = `{
      // Project comments
      "dependencies": {
        "react": "^18.0.0",
      },
      /* Scripts block */
      "scripts": {
        "dev": "vite",
      },
    }`;
    const parsed = parseJson(jsonc, 'json');
    assert.ok(parsed.includes('## Dependencies'));
    assert.ok(parsed.includes('react: ^18.0.0'));
    assert.ok(parsed.includes('## Scripts'));
    assert.ok(parsed.includes('dev: vite'));
  });

  test('json-parser handles invalid JSON gracefully with error block', () => {
    const invalidJson = `{ invalid json syntax: true, `;
    const parsed = parseJson(invalidJson, 'json');
    assert.ok(parsed.includes('# JSON Parse Error'));
    assert.ok(parsed.includes('Error:'));
  });

  test('json-parser falls back to JSON data block for arbitrary JSON without special fields', () => {
    const customJson = JSON.stringify({
      appName: 'CustomService',
      port: 8080,
      features: ['auth', 'logging']
    }, null, 2);
    const parsed = parseJson(customJson, 'json');
    assert.ok(parsed.includes('## JSON Data'));
    assert.ok(parsed.includes('```json'));
    assert.ok(parsed.includes('"appName": "CustomService"'));
  });

  test('json-parser parses arbitrary JSON and outputs JSON Data section', () => {
    const json = JSON.stringify({ foo: 'bar' });
    const parsed = parseJson(json, 'json');
    assert.ok(parsed.includes('## JSON Data'));
    assert.ok(parsed.includes('"foo": "bar"'));
  });

  // --- PDF Parser Tests ---
  test('pdf-parser exports parsePdf function', () => {
    assert.strictEqual(typeof parsePdf, 'function');
  });

  test('pdf-parser extracts text from PDF buffer fixture', async () => {
    const pdfPath = path.join(__dirname, 'fixtures', 'sample.pdf');
    const buffer = fs.readFileSync(pdfPath);
    const text = await parsePdf(buffer);
    assert.strictEqual(typeof text, 'string');
    assert.ok(text.includes('Sample PDF Document'));
  });

  test('pdf-parser returns error markdown on invalid input instead of throwing', async () => {
    const { parsePdf } = require('../skills/planner/parsers/pdf-parser');
    const invalidBuffer = Buffer.from('not a valid pdf content');
    const result = await parsePdf(invalidBuffer);
    assert.ok(typeof result === 'string', 'Must return string, not throw');
    assert.ok(result.includes('PDF Parse Error'), 'Must contain error heading');
    assert.ok(result.includes('Error:'), 'Must contain error message');
  });

  test('html-parser preserves content-level headers inside article but strips body-level header', () => {
    const { parseHtml } = require('../skills/planner/parsers/html-parser');
    const html = `<html><body>
      <header><nav>Site Nav</nav><span>Logo</span></header>
      <article>
        <header><h2>Article Header</h2><p>By Author</p></header>
        <p>Article content here.</p>
      </article>
    </body></html>`;
    const result = parseHtml(html);
    assert.ok(!result.includes('Site Nav'), 'Body-level header content stripped');
    assert.ok(!result.includes('Logo'), 'Body-level header content stripped');
    assert.ok(result.includes('Article Header'), 'Content-level header preserved');
    assert.ok(result.includes('By Author'), 'Content-level header content preserved');
    assert.ok(result.includes('Article content'), 'Article body preserved');
  });
});
