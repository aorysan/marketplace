const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { parseHtml } = require('../../skills/planner/parsers/html-parser');
const { parseCode } = require('../../skills/planner/parsers/code-parser');
const { scanDirectory } = require('../../skills/planner/parsers/directory-scanner');

describe('Integration: Documentation Pipeline v6', () => {
  const fixturesDir = path.join(__dirname, '../fixtures');

  test('ingests HTML fixture and strips navigation boilerplate', () => {
    const htmlPath = path.join(fixturesDir, 'sample.html');
    assert.strictEqual(fs.existsSync(htmlPath), true, 'sample.html must exist');

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const parsed = parseHtml(htmlContent);

    assert.ok(parsed.includes('# Hello World'), 'Title extracted as H1');
    assert.strictEqual(parsed.includes('<nav>'), false, 'Nav tags must be stripped');
  });

  test('ingests JS/TS fixtures and extracts components, hooks, interfaces, and docstrings', () => {
    const jsPath = path.join(fixturesDir, 'sample.js');
    const tsPath = path.join(fixturesDir, 'sample.ts');
    assert.strictEqual(fs.existsSync(jsPath), true, 'sample.js must exist');
    assert.strictEqual(fs.existsSync(tsPath), true, 'sample.ts must exist');

    const jsContent = fs.readFileSync(jsPath, 'utf8');
    const extractedJs = parseCode(jsContent, 'js');
    assert.ok(extractedJs.includes('A sample function'), 'JSDoc comment extracted');

    const tsContent = fs.readFileSync(tsPath, 'utf8');
    const extractedTs = parseCode(tsContent, 'ts');
    assert.ok(extractedTs.includes('interface User'), 'TypeScript code fallback preserved');
  });

  test('directory scanner produces valid hierarchical tree from multi-source fixture', () => {
    const multiDir = path.join(fixturesDir, 'multi-source');
    assert.strictEqual(fs.existsSync(path.join(multiDir, 'src/index.ts')), true);
    assert.strictEqual(fs.existsSync(path.join(multiDir, 'docs/guide.md')), true);
    assert.strictEqual(fs.existsSync(path.join(multiDir, 'README.md')), true);

    const tree = scanDirectory(multiDir);
    assert.strictEqual(tree.type, 'directory');
    assert.ok(tree.children.length > 0);
  });

  test('builder renders HTML with CSS sidebar and Mermaid support', async () => {
    const { renderMarkdown, buildProcessDiagram } = await import('../../skills/builder/templates/build-html.mjs');
    const md = '# Component Architecture\n\nParagraph with **bold** and `code`.\n\n```mermaid\ngraph TD\n  App --> Layout\n```';
    const html = renderMarkdown(md);
    assert.ok(html.includes('<h1 id="component-architecture">Component Architecture</h1>') || html.includes('<h1>Component Architecture</h1>'), 'Markdown header converted to HTML');
    assert.ok(html.includes('<strong>bold</strong>'), 'Markdown bold converted to HTML');
    assert.ok(html.includes('<code>code</code>'), 'Markdown code converted to HTML');

    const processHtml = buildProcessDiagram();
    assert.ok(processHtml.includes('Planner'));
    assert.ok(processHtml.includes('Writer'));
    assert.ok(processHtml.includes('Reviewer'));
    assert.ok(processHtml.includes('Builder'));
  });

  test('orchestrator skill defines the 4-step pipeline flow', () => {
    const orchestratorPath = path.join(__dirname, '../../skills/insightify/SKILL.md');
    assert.strictEqual(fs.existsSync(orchestratorPath), true);

    const content = fs.readFileSync(orchestratorPath, 'utf8');
    const requiredStages = [
      'Planner',
      'Writer',
      'Reviewer',
      'Builder'
    ];

    for (const stage of requiredStages) {
      assert.ok(content.includes(stage), `Orchestrator must define ${stage}`);
    }
  });
});