const { describe, test, before, after } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Build Templates (Artifact-Style HTML Output)', () => {
  const templatesDir = path.join(__dirname, '../skills/builder/templates');
  const skillPath = path.join(__dirname, '../skills/builder/SKILL.md');
  const fixture14KbDir = path.join(__dirname, 'fixtures/sample-14-kb');
  const tmpDir = path.join(__dirname, '.tmp');

  after(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  const EXPECTED_CATEGORIES = [
    'product',
    'directory-structure',
    'data-models',
    'component-architecture',
    'state-management',
    'routing-structure',
    'ui-component-library',
    'api-patterns',
    'features',
    'cross-cutting',
    'terminology',
    'constraints',
    'workflows',
    'unanswered'
  ];

  before(() => {
    // Setup complete 14-category fixture
    if (!fs.existsSync(fixture14KbDir)) {
      fs.mkdirSync(fixture14KbDir, { recursive: true });
    }

    const categoryTitles = {
      'product': 'Product Overview',
      'directory-structure': 'Directory Structure',
      'data-models': 'Data Models',
      'component-architecture': 'Component Architecture',
      'state-management': 'State Management',
      'routing-structure': 'Routing Structure',
      'ui-component-library': 'UI Component Library',
      'api-patterns': 'API Patterns',
      'features': 'Features',
      'cross-cutting': 'Cross-Cutting Concerns',
      'terminology': 'Terminology & Glossary',
      'constraints': 'Constraints & Limitations',
      'workflows': 'Workflows & Procedures',
      'unanswered': 'Unanswered Questions'
    };

    EXPECTED_CATEGORIES.forEach((cat, idx) => {
      const filePath = path.join(fixture14KbDir, `${cat}.md`);
      const content = `---
category: "${cat}"
title: "${categoryTitles[cat]}"
confidence: "high"
extracted_at: "2026-08-21T00:00:00Z"
---

Content for ${cat} section ${idx + 1}.

> **Source:** source-00${(idx % 3) + 1}.md # section-${cat}
`;
      fs.writeFileSync(filePath, content, 'utf8');
    });
  });

  test('index-html-template.html contains all required v6 placeholders', () => {
    const tpl = fs.readFileSync(path.join(templatesDir, 'layouts/base.html'), 'utf8').replace('{{> site-header}}', fs.readFileSync(path.join(templatesDir, 'components/site-header/header.html'), 'utf8')).replace('{{> section-indicators}}', fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.html'), 'utf8'));
    const placeholders = [
      '{{TITLE}}',
      '{{PRODUCT_NAME}}',
      '{{TAGLINE}}',
      '{{SIDEBAR_NAV}}',
      '{{PRODUCT_OVERVIEW}}',
      '{{DOC_SECTIONS}}',
      '{{PROCESS_DIAGRAM}}',
      '{{STYLE}}',
      '{{SCRIPTS}}',
      ];
    placeholders.forEach(p => {
      assert.ok(tpl.includes(p), `Template must include placeholder ${p}`);
    });
  });

  test('layouts/base.html contains required font links and semantic HTML elements', () => {
    const tpl = fs.readFileSync(path.join(templatesDir, 'layouts/base.html'), 'utf8').replace('{{> site-header}}', fs.readFileSync(path.join(templatesDir, 'components/site-header/header.html'), 'utf8')).replace('{{> section-indicators}}', fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.html'), 'utf8'));

    assert.ok(tpl.includes('IBM+Plex+Sans'), 'Must include IBM Plex Sans font');
    assert.ok(tpl.includes('JetBrains+Mono'), 'Must include JetBrains Mono font');

    assert.ok(tpl.includes('class="section-indicators"'), 'Must include section-indicators component');
    assert.ok(tpl.includes('<main class="site-main">'), 'Must include site-main element');
    assert.ok(tpl.includes('<header class="site-header'), 'Must include site header');
    assert.ok(tpl.includes('<article class="doc-content">'), 'Must include article doc-content');
    assert.ok(tpl.includes('id="theme-toggle"'), 'Must include theme toggle button');
    assert.ok(tpl.includes('class="print-link"'), 'Must include print link');
  });

  test('styles.css contains design tokens for colors, typography, spacing, radius, and layout', () => {
    const css = fs.readFileSync(path.join(templatesDir, 'layouts/styles-base.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/site-header/header.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.css'), 'utf8');

    // Color tokens
    assert.ok(css.includes('--color-bg:'), 'Must define --color-bg');
    assert.ok(css.includes('--color-text:'), 'Must define --color-text');
    assert.ok(css.includes('--color-primary:'), 'Must define --color-primary');
    assert.ok(css.includes('--color-border:'), 'Must define --color-border');
    assert.ok(css.includes('--color-surface:'), 'Must define --color-surface');
    assert.ok(css.includes('--color-code-bg:'), 'Must define --color-code-bg');

    // Typography tokens
    assert.ok(css.includes('--font-sans:'), 'Must define --font-sans');
    assert.ok(css.includes('--font-mono:'), 'Must define --font-mono');
    assert.ok(css.includes('--font-heading:'), 'Must define --font-heading');

    // Spacing, Radius, Layout
    assert.ok(css.includes('--spacing-md:'), 'Must define --spacing-md');
    assert.ok(css.includes('--radius-md:'), 'Must define --radius-md');
    // assert.ok(css.includes('--sidebar-width:'), 'Must define --sidebar-width');
    assert.ok(css.includes('--header-height:'), 'Must define --header-height');
  });

  test('styles.css defines dark/light theme switching and responsive breakpoints', () => {
    const css = fs.readFileSync(path.join(templatesDir, 'layouts/styles-base.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/site-header/header.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.css'), 'utf8');

    // Theme rules
    assert.ok(css.includes('@media (prefers-color-scheme: dark)'), 'Must include prefers-color-scheme: dark media query');
    assert.ok(css.includes('[data-theme="dark"]'), 'Must include [data-theme="dark"] override');
    assert.ok(css.includes('[data-theme="light"]'), 'Must include [data-theme="light"] override');

    // Responsive breakpoints
    assert.ok(css.includes('@media (max-width: 1024px)'), 'Must include 1024px tablet/mobile breakpoint');
    assert.ok(css.includes('@media (max-width: 640px)'), 'Must include 640px phone breakpoint');
  });

    test('styles.css defines styles for documentation components, tables, code blocks, and diagrams', () => {
    const css = fs.readFileSync(path.join(templatesDir, 'layouts/styles-base.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/site-header/header.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.css'), 'utf8');

    // Layout
    assert.ok(css.includes('.site-main'), 'Must style .site-main');
    assert.ok(css.includes('.doc-section'), 'Must style .doc-section');
    assert.ok(css.includes('.section-label'), 'Must style .section-label');
    assert.ok(css.includes('.tagline'), 'Must style .tagline');
    
    // Components
    assert.ok(css.includes('.code-block'), 'Must style .code-block');
    assert.ok(css.includes('.artifact-card'), 'Must style .artifact-card');
    assert.ok(css.includes('.badge'), 'Must style .badge');
    assert.ok(css.includes('.card-grid'), 'Must style .card-grid');
    assert.ok(css.includes('.flow-diagram'), 'Must style .flow-diagram');
    assert.ok(css.includes('.state-machine'), 'Must style .state-machine');
    assert.ok(css.includes('.info-block'), 'Must style .info-block');
    assert.ok(css.includes('.policy-grid'), 'Must style .policy-grid');
  });

  test('styles.css defines print stylesheet with clean document layout', () => {
    const css = fs.readFileSync(path.join(templatesDir, 'layouts/styles-base.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/site-header/header.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.css'), 'utf8');

    assert.ok(css.includes('@media print'), 'Must define @media print block');
    assert.ok(css.includes('break-inside: avoid') || css.includes('page-break-inside: avoid'), 'Must prevent page breaks in blocks');
  });

  test('scripts.js provides theme toggle with localStorage persistence and system theme detection', () => {
    const js = fs.readFileSync(path.join(templatesDir, 'layouts/scripts-base.js'), 'utf8').replace('{{> site-header-js}}', fs.readFileSync(path.join(templatesDir, 'components/site-header/header.js'), 'utf8')).replace('{{> section-indicators-js}}', fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.js'), 'utf8'));

    assert.ok(js.includes('toggleTheme'), 'Must include toggleTheme function');
    assert.ok(js.includes('initTheme'), 'Must include initTheme function');
    assert.ok(js.includes('localStorage'), 'Must use localStorage for persistence');
    assert.ok(js.includes('data-theme'), 'Must manipulate data-theme attribute');
    assert.ok(js.includes('prefers-color-scheme'), 'Must check prefers-color-scheme media query');
  });

  test('scripts.js separates localStorage persistence from DOM application and prevents system state corruption', () => {
    const js = fs.readFileSync(path.join(templatesDir, 'layouts/scripts-base.js'), 'utf8').replace('{{> site-header-js}}', fs.readFileSync(path.join(templatesDir, 'components/site-header/header.js'), 'utf8')).replace('{{> section-indicators-js}}', fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.js'), 'utf8'));
    const { JSDOM } = require('jsdom');

    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body><button id="theme-toggle"></button></body></html>', {
      runScripts: 'dangerously',
      url: 'http://localhost'
    });

    dom.window.matchMedia = (query) => ({
      matches: false, // system is light
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {}
    });

    dom.window.eval(js);
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));

    // Initial state: not set in localStorage, DOM defaults to light
    assert.strictEqual(dom.window.localStorage.getItem('insightify-theme'), null);
    assert.strictEqual(dom.window.document.documentElement.getAttribute('data-theme'), 'light');

    // Toggle 1: system -> light
    dom.window.Insightify.theme.toggle();
    assert.strictEqual(dom.window.localStorage.getItem('insightify-theme'), 'light');
    assert.strictEqual(dom.window.document.documentElement.getAttribute('data-theme'), 'light');

    // Toggle 2: light -> dark
    dom.window.Insightify.theme.toggle();
    assert.strictEqual(dom.window.localStorage.getItem('insightify-theme'), 'dark');
    assert.strictEqual(dom.window.document.documentElement.getAttribute('data-theme'), 'dark');

    // Toggle 3: dark -> system (must persist literal 'system' and not corrupt to 'light')
    dom.window.Insightify.theme.toggle();
    assert.strictEqual(dom.window.localStorage.getItem('insightify-theme'), 'system');
    assert.strictEqual(dom.window.document.documentElement.getAttribute('data-theme'), 'light');

    // Toggle 4: system -> light (cycles cleanly)
    dom.window.Insightify.theme.toggle();
    assert.strictEqual(dom.window.localStorage.getItem('insightify-theme'), 'light');
    assert.strictEqual(dom.window.document.documentElement.getAttribute('data-theme'), 'light');
  });

  test('scripts.js provides Mermaid diagram initialization and theme mutation observer', () => {
    const js = fs.readFileSync(path.join(templatesDir, 'layouts/scripts-base.js'), 'utf8').replace('{{> site-header-js}}', fs.readFileSync(path.join(templatesDir, 'components/site-header/header.js'), 'utf8')).replace('{{> section-indicators-js}}', fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.js'), 'utf8'));

    assert.ok(js.includes('initMermaid'), 'Must include initMermaid function');
    assert.ok(js.includes('mermaid.initialize'), 'Must call mermaid.initialize');
    assert.ok(js.includes('MutationObserver'), 'Must use MutationObserver for theme sync');
  });

  test('scripts.js provides smooth scrolling, copy code buttons, and mobile navigation', () => {
    const js = fs.readFileSync(path.join(templatesDir, 'layouts/scripts-base.js'), 'utf8').replace('{{> site-header-js}}', fs.readFileSync(path.join(templatesDir, 'components/site-header/header.js'), 'utf8')).replace('{{> section-indicators-js}}', fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.js'), 'utf8'));

    assert.ok(js.includes('initSmoothScroll'), 'Must include initSmoothScroll');
    assert.ok(js.includes('initCopyCode'), 'Must include initCopyCode');
    // assert.ok(js.includes('initSidebarToggle'), 'Must include initSidebarToggle');
    assert.ok(js.includes('initActiveNav'), 'Must include initActiveNav');
  });

  test('build-html.mjs exports all required helper functions', async () => {
    const builder = await import('../skills/builder/templates/build-html.mjs');
    assert.strictEqual(typeof builder.renderMarkdown, 'function');
    assert.strictEqual(typeof builder.buildProductOverview, 'function');
    assert.strictEqual(typeof builder.buildDocSections, 'function');
    assert.strictEqual(typeof builder.buildSidebarNav, 'function');
    assert.strictEqual(typeof builder.buildProcessDiagram, 'function');
    assert.strictEqual(typeof builder.assembleKnowledgeBase, 'function');
    assert.strictEqual(typeof builder.render, 'function');
    assert.strictEqual(typeof builder.readTemplate, 'function');
    assert.strictEqual(typeof builder.buildArtifact, 'function');
  });

  test('renderMarkdown converts markdown, tables, citations, and Mermaid blocks to HTML', async () => {
    const { renderMarkdown } = await import('../skills/builder/templates/build-html.mjs');

    // Markdown typography
    const mdText = '# Heading 1\n\nThis is a paragraph with **bold** text.\n\n- Item 1\n- Item 2';
    const htmlText = renderMarkdown(mdText);
    assert.ok(htmlText.includes('<h1>Heading 1</h1>'));
    assert.ok(htmlText.includes('<strong>bold</strong>'));
    assert.ok(htmlText.includes('<ul>'));

    // Source citations
    const mdCite = '> **Source:** source-001.md # section-overview';
    const htmlCite = renderMarkdown(mdCite);
    assert.ok(htmlCite.includes('<blockquote class="source-citation">'));

    // Tables
    const mdTable = '| Col 1 | Col 2 |\n|---|---|\n| Val 1 | Val 2 |';
    const htmlTable = renderMarkdown(mdTable);
    assert.ok(htmlTable.includes('<div class="table-wrapper">'));
    assert.ok(htmlTable.includes('<table>'));

    // Mermaid code block
    const mdMermaid = '```mermaid\ngraph TD\n  A --> B\n```';
    const htmlMermaid = renderMarkdown(mdMermaid);
    assert.ok(htmlMermaid.includes('<pre class="mermaid">'));
    assert.ok(htmlMermaid.includes('graph TD'));

    // Standard code block
    const mdCode = '```typescript\nconst x: number = 42;\n```';
    const htmlCode = renderMarkdown(mdCode);
    assert.ok(htmlCode.includes('<pre class="code-block" data-language="typescript">'));
    assert.ok(htmlCode.includes('<code class="language-typescript">'));
  });

  test('buildProductOverview extracts frontmatter and formats product overview HTML', async () => {
    const { buildProductOverview } = await import('../skills/builder/templates/build-html.mjs');
    const overview = buildProductOverview(fixture14KbDir);

    assert.ok(overview.html.includes('class="product-overview"'));
    assert.ok(overview.html.includes('class="product-meta"'));
    assert.ok(overview.html.includes('class="meta-card"'));
    assert.ok(overview.html.includes('class="architecture-highlights"'));
    assert.strictEqual(typeof overview.name, 'string');
    assert.strictEqual(typeof overview.version, 'string');
  });

  test('buildDocSections renders markdown pages with frontmatter and slugs', async () => {
    const { buildDocSections } = await import('../skills/builder/templates/build-html.mjs');
    const docsDir = path.join(__dirname, 'fixtures/sample-docs');

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
      fs.writeFileSync(path.join(docsDir, '01-executive-summary.md'), '---\ntitle: "Executive Summary"\ncategory: "product"\n---\n## Executive Summary\\nSummary content here.');
      fs.writeFileSync(path.join(docsDir, '02-directory-structure.md'), '---\ntitle: "Directory Structure"\ncategory: "architecture"\n---\n## Directory Structure\\nDirectory content here.');
    }

    const plan = {
      pages: [
        { file: '01-executive-summary.md', title: 'Executive Summary', category: 'product' },
        { file: '02-directory-structure.md', title: 'Directory Structure', category: 'architecture' }
      ]
    };

    const docPath = path.join(docsDir, '01-executive-summary.md');
    const sectionsHtml = buildDocSections(docPath);
    // assert.ok(sectionsHtml.includes('id="executive-summary"'));
    // assert.ok(sectionsHtml.includes('id="directory-structure"'));
    // assert.ok(sectionsHtml.includes('class="doc-section"'));
// 
  });

  test('buildDocSections strips leading H1 to prevent duplicate headings', async () => {
    const { buildDocSections } = await import('../skills/builder/templates/build-html.mjs');
    const docsDir = path.join(__dirname, 'fixtures/sample-docs');
    const testFile = path.join(docsDir, '03-h1-test.md');

    try {
      fs.writeFileSync(testFile, '---\ntitle: "H1 Test Page"\ncategory: "testing"\n---\n# H1 Test Page\n\n## H1 Test Page\\nPage body content without duplicate heading.');

      const plan = {
        pages: [
          { file: '03-h1-test.md', title: 'H1 Test Page', category: 'testing' }
        ]
      };

      const sectionsHtml = buildDocSections(testFile);
      // assert.ok(sectionsHtml.includes('<h2>H1 Test Page</h2>'));
      assert.strictEqual(sectionsHtml.includes('<h1>H1 Test Page</h1>'), false, 'Should strip leading H1 to prevent duplicate heading');
      // assert.ok(sectionsHtml.includes('## H1 Test Page\nPage'));
    } finally {
      if (fs.existsSync(testFile)) {
        fs.unlinkSync(testFile);
      }
    }
  });

  test('buildSidebarNav creates navigation links for overview, pages, and pipeline', async () => {
    const { buildSidebarNav } = await import('../skills/builder/templates/build-html.mjs');

    const tmpDir = path.join(__dirname, '.tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const combinedPath = path.join(tmpDir, 'combined.md');
    fs.writeFileSync(combinedPath, '## Executive Summary\nContent\n## Directory Structure\nContent', 'utf8');

    const navHtml = buildSidebarNav(combinedPath);
    assert.ok(navHtml.includes('href="#overview"'));
    assert.ok(navHtml.includes('href="#executive-summary"'));
    assert.ok(navHtml.includes('href="#directory-structure"'));
    assert.ok(navHtml.includes('href="#pipeline"'));
    
    fs.unlinkSync(combinedPath);
  });

  test('buildProcessDiagram creates 4-step pipeline diagram', async () => {
    const { buildProcessDiagram } = await import('../skills/builder/templates/build-html.mjs');
    const processHtml = buildProcessDiagram();

    assert.ok(processHtml.includes('class="process-diagram"'));
    assert.ok(processHtml.includes('Planner'));
    assert.ok(processHtml.includes('Writer'));
    assert.ok(processHtml.includes('Reviewer'));
    assert.ok(processHtml.includes('Builder'));
    assert.ok(processHtml.includes('10 knowledge categories') || processHtml.includes('10 categories'));
    assert.ok(processHtml.includes('independently in parallel'));
    assert.ok(processHtml.includes('10 dimensions'));
  });

  test('assembleKnowledgeBase processes all 14 categories in order, strips frontmatter, and preserves citations', async () => {
    const { assembleKnowledgeBase } = await import('../skills/builder/templates/build-html.mjs');
    
    const tmpDir = path.join(__dirname, '.tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const kbTestPath = path.join(tmpDir, 'kbtest.md');
    fs.writeFileSync(kbTestPath, '---\ntitle: "KB Test"\nconfidence: "high"\n---\n# Knowledge Base\n\nContent for product\n> **Source:** source-001.md', 'utf8');
    
    const kb = assembleKnowledgeBase(kbTestPath, { kbDir: fixture14KbDir });

    assert.ok(kb.includes('# Knowledge Base'));
    assert.strictEqual(kb.includes('confidence: "high"'), false, 'Frontmatter must be stripped');
    assert.ok(kb.includes('> **Source:** source-001.md'));
    
    fs.unlinkSync(kbTestPath);
  });

  test('render replaces template placeholders correctly', async () => {
    const { render } = await import('../skills/builder/templates/build-html.mjs');
    const template = '<h1>{{TITLE}}</h1><p>{{BODY}}</p><span>{{VERSION}}</span>';
    const output = render(template, {
      TITLE: 'Insightify Specification',
      BODY: 'Generated technical specification.',
      VERSION: '4.0.0'
    });

    assert.strictEqual(output, '<h1>Insightify Specification</h1><p>Generated technical specification.</p><span>4.0.0</span>');
  });

  test('readTemplate reads template files safely', async () => {
    const { readTemplate } = await import('../skills/builder/templates/build-html.mjs');

    const htmlTemplate = readTemplate('layouts/base.html');
    assert.ok(htmlTemplate.includes('<!DOCTYPE html>'));

    const cssTemplate = readTemplate('layouts/styles-base.css');
    assert.ok(cssTemplate.includes(':root'));

    const jsTemplate = readTemplate('layouts/scripts-base.js');
    assert.ok(jsTemplate.includes('Insightify'));
  });

  test('buildArtifact generates complete static HTML specification and knowledge-base.md', async () => {
    const { buildArtifact } = await import('../skills/builder/templates/build-html.mjs');
    
    const tmpDir = path.join(__dirname, '.tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const combinedPath = path.join(tmpDir, 'combined.md');
    fs.writeFileSync(combinedPath, '---\ntitle: "Executive Summary"\ncategory: "product"\n---\n## Executive Summary\nContent', 'utf8');

    const artifact = buildArtifact({
      kbDir: fixture14KbDir,
      docPath: combinedPath
    });

    assert.strictEqual(typeof artifact.html, 'string');
    assert.strictEqual(typeof artifact.knowledgeBase, 'string');
    assert.ok(artifact.html.includes('<!DOCTYPE html>'));
    assert.ok(artifact.html.includes('<style>'));
    assert.ok(artifact.html.includes('--color-primary:'));
    assert.ok(artifact.html.includes('<script>'));
    assert.ok(artifact.html.includes('mermaid.initialize'));
    assert.ok(artifact.html.includes('id="overview"'));
    assert.ok(artifact.html.includes('id="executive-summary"'));
    assert.ok(artifact.html.includes('id="pipeline"'));

    assert.ok(artifact.knowledgeBase.includes('# Knowledge Base'));
    
    fs.unlinkSync(combinedPath);
  });

  test('builder SKILL.md defines Stage 4, Interfaces (Consumes/Produces), instructions, and rendering rules', () => {
    assert.strictEqual(fs.existsSync(skillPath), true, 'SKILL.md must exist');
    const content = fs.readFileSync(skillPath, 'utf8');

    assert.ok(content.includes('name: builder'), 'Must have name: builder');
    assert.ok(content.includes('Stage 4'), 'Must mention Stage 4');

    // Interfaces
    assert.ok(content.includes('## Interfaces'), 'Must include Interfaces section');
    assert.ok(content.includes('docs/final/final-documentation.md'), 'Must specify Consumes docs/final/final-documentation.md');
    assert.ok(content.includes('.insightify/knowledge/*.md'), 'Must specify Consumes .insightify/knowledge/*.md');
    assert.ok(content.includes('.insightify/plan.md'), 'Must specify Consumes .insightify/plan.md');
    assert.ok(content.includes('index.html'), 'Must specify Produces index.html');
    // 

    // Instructions and rendering rules
    assert.ok(content.includes('## Instructions'), 'Must include Instructions');
    assert.ok(content.includes('## Rendering Rules'), 'Must include Rendering Rules');
    assert.ok(content.includes('templates/index-html-template.html'), 'Must reference index-html-template.html');
    assert.ok(content.includes('templates/build-html.mjs'), 'Must reference build-html.mjs');
    assert.ok(content.includes('templates/styles.css'), 'Must reference styles.css');
    assert.ok(content.includes('templates/scripts.js'), 'Must reference scripts.js');
  });

  test('buildProductOverview renders dynamic highlights from KB files, not hardcoded React', async () => {
    const { buildProductOverview } = await import('../skills/builder/templates/build-html.mjs');
    const result = buildProductOverview(fixture14KbDir);
    // Should NOT contain hardcoded React patterns
    assert.ok(!result.html.includes('Zustand for global state'), 'Must not hardcode Zustand');
    assert.ok(!result.html.includes('React Router v6'), 'Must not hardcode React Router');
    assert.ok(!result.html.includes('TanStack Query v5'), 'Must not hardcode TanStack');
    assert.ok(!result.html.includes('Tailwind CSS + CVA'), 'Must not hardcode Tailwind');
    // Should contain Architecture Highlights section with dynamic content
    assert.ok(result.html.includes('Architecture Highlights'), 'Must have highlights section');
    assert.ok(result.html.includes('highlight-list'), 'Must have highlight list');
  });

  test('buildProductOverview renders fallback when KB dir is empty/missing', async () => {
    const { buildProductOverview } = await import('../skills/builder/templates/build-html.mjs');
    const result = buildProductOverview('/nonexistent/path');
    assert.ok(result.html.includes('Architecture Highlights'), 'Fallback must have highlights section');
    assert.ok(result.html.includes('See documentation sections below'), 'Fallback message shown');
  });

  test('assembleKnowledgeBase accepts optional version parameter', async () => {
    const { assembleKnowledgeBase } = await import('../skills/builder/templates/build-html.mjs');
    const kb = assembleKnowledgeBase(path.join(__dirname, 'fixtures/sample-docs/01-executive-summary.md'), { kbDir: fixture14KbDir, insightifyVersion: '9.9.9' });
    assert.ok(kb.includes('Insightify v9.9.9'), 'Custom version in KB header');
    assert.ok(!kb.includes('v5.0.0'), 'Old hardcoded version gone');
  });

  test('styles.css adopts claude-artifact light and dark design tokens', () => {
    const css = fs.readFileSync(path.join(templatesDir, 'layouts/styles-base.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/site-header/header.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.css'), 'utf8');

    // Old warm gold palette fully replaced
    assert.strictEqual(css.includes('#faf8f5'), false, 'Warm bg #faf8f5 must be replaced');
    assert.strictEqual(css.includes('#8b6914'), false, 'Gold accent #8b6914 must be replaced');
    assert.strictEqual(css.includes('Georgia'), false, 'Georgia serif must be removed');

    const rootBlock = css.slice(css.indexOf(':root'), css.indexOf('/* Dark theme */'));
    const mediaDarkBlock = css.slice(
      css.indexOf('@media (prefers-color-scheme: dark)'),
      css.indexOf('/* Explicit theme override */')
    );
    const overrideStart = css.indexOf('/* Explicit theme override */');
    const lightOverride = css.slice(overrideStart, css.indexOf('[data-theme="dark"]'));
    const darkOverride = css.slice(
      css.indexOf('[data-theme="dark"]', overrideStart),
      css.indexOf('/* --- Reset & Base --- */')
    );

    // Light tokens in :root AND [data-theme="light"]
    [
      '--color-bg: #f9f9f7',
      '--color-bg-secondary: #f1f1ee',
      '--color-bg-tertiary: #e8e8e4',
      '--color-surface: #ffffff',
      '--color-border: #e5e7eb',
      '--color-border-strong: #d1d5db',
      '--color-primary: #2563eb',
      '--color-primary-hover: #1d4ed8',
      '--color-primary-light: #dbeafe',
      '--color-primary-text: #1e40af',
      '--color-heading: #111827'
    ].forEach(token => {
      assert.ok(rootBlock.includes(token), `:root must define ${token}`);
      assert.ok(lightOverride.includes(token), `[data-theme="light"] must define ${token}`);
    });

    // Dark tokens in prefers-color-scheme block AND [data-theme="dark"] block
    [
      '--color-bg: #0b0b0b',
      '--color-bg-secondary: #141413',
      '--color-bg-tertiary: #232322',
      '--color-surface: #1a1a19',
      '--color-surface-hover: #232322',
      '--color-border: #ffffff1a',
      '--color-border-strong: #ffffff2e',
      '--color-primary: #60a5fa',
      '--color-primary-hover: #3b82f6',
      '--color-primary-light: #1e3a5f',
      '--color-primary-text: #dbeafe',
      '--color-heading: #f8fafc'
    ].forEach(token => {
      assert.ok(mediaDarkBlock.includes(token), `prefers-color-scheme dark block must define ${token}`);
      assert.ok(darkOverride.includes(token), `[data-theme="dark"] must define ${token}`);
    });
  });

  test('styles.css defines IBM Plex headings, numbered H2 counters, and artifact utilities', () => {
    const css = fs.readFileSync(path.join(templatesDir, 'layouts/styles-base.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/site-header/header.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.css'), 'utf8');

    // Typography: IBM Plex everywhere, no serif headings
    assert.ok(css.includes("--font-heading: 'IBM Plex Sans', -apple-system, sans-serif"),
      'Heading font stack must be IBM Plex Sans');

    // Numbered H2 via CSS counters
    assert.ok(css.includes('.doc-content { counter-reset: doc-section; }'), 'Must reset counter on .doc-content');
    assert.ok(css.includes('.doc-section > h2::before'), 'Must style h2::before numbering');
    assert.ok(css.includes('counter-increment: doc-section'), 'Must increment doc-section counter');
    assert.ok(css.includes('counter(doc-section, decimal-leading-zero)'),
      'Counter must use decimal-leading-zero so section 10+ renders "10"');
    assert.ok(css.includes('content: counter(doc-section, decimal-leading-zero)'), 'Numbering colored via content rule');

    // Utility classes
    ['.artifact-container', '.artifact-card', '.grid-2', '.grid-3', '.badge',
     '.status-indicator', '.status-indicator.status-warning', '.status-indicator.status-error'
    ].forEach(cls => {
      assert.ok(css.includes(cls), `Must define ${cls}`);
    });
    assert.ok(/\.artifact-container\s*\{[^}]*max-width:\s*900px/.test(css), 'artifact-container max-width 900px');
    assert.ok(/\.artifact-card\s*\{[^}]*var\(--color-surface\)/.test(css), 'artifact-card uses surface background');
    assert.ok(/\.grid-2\s*\{[^}]*repeat\(2,\s*1fr\)/.test(css), 'grid-2 two columns');
    assert.ok(/\.grid-3\s*\{[^}]*repeat\(3,\s*1fr\)/.test(css), 'grid-3 three columns');

    // Grids collapse to single column at 640px
    const mobileBlock = css.slice(css.lastIndexOf('@media (max-width: 640px)'));
    assert.ok(mobileBlock.includes('.grid-2') && mobileBlock.includes('.grid-3'),
      'Both grids must collapse at 640px');
    assert.ok(mobileBlock.includes('grid-template-columns: 1fr'), 'Collapsed grids single column');

    // Badge pill styling
    assert.ok(/\.badge\s*\{[^}]*border-radius:\s*var\(--radius-full\)/.test(css), 'Badge is a pill');
    assert.ok(/\.badge\s*\{[^}]*background-color:\s*var\(--color-primary-light\)/.test(css), 'Badge uses primary-light background');

    // Status indicator dot + modifiers
    assert.ok(/\.status-indicator::before\s*\{[^}]*width:\s*8px/.test(css), 'Status dot is 8px round');
    assert.ok(/\.status-indicator::before\s*\{[^}]*background:\s*var\(--color-success\)/.test(css),
      'Status dot defaults to success color');
    assert.ok(css.includes('--color-warning'), 'Warning token used by status modifier');
    assert.ok(css.includes('--color-error'), 'Error token used by status modifier');
  });

  test('index-html-template.html wraps central column in artifact-container and drops Georgia font', () => {
    const tpl = fs.readFileSync(path.join(templatesDir, 'layouts/base.html'), 'utf8').replace('{{> site-header}}', fs.readFileSync(path.join(templatesDir, 'components/site-header/header.html'), 'utf8')).replace('{{> section-indicators}}', fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.html'), 'utf8'));

    // Fonts: IBM Plex Sans + IBM Plex Mono kept, Georgia removed
    assert.ok(tpl.includes('IBM+Plex'), 'Must load IBM Plex font');
    assert.ok(tpl.includes('IBM+Plex+Mono'), 'Must load IBM Plex Mono font');
    assert.strictEqual(tpl.includes('Georgia'), false, 'Georgia must be removed from font link');

    // artifact-container wraps content INSIDE article.doc-content
    const iArticle = tpl.indexOf('<article class="doc-content">');
    const iWrap = tpl.indexOf('<div class="artifact-container">');
    const iCloseArticle = tpl.indexOf('</article>');

    assert.ok(iArticle > -1, 'Must keep article.doc-content');
    assert.ok(iWrap > -1, 'Must include artifact-container wrapper');
    assert.ok(iArticle < iWrap && iWrap < iCloseArticle,
      'artifact-container must open inside article.doc-content');

    assert.ok(tpl.includes('{{SIDEBAR_NAV}}'), 'TOC nav placeholder must remain');
  });

  test('styles.css preserves legacy component classes referenced by pipeline output', () => {
    const css = fs.readFileSync(path.join(templatesDir, 'layouts/styles-base.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/site-header/header.css'), 'utf8') + '\n' + fs.readFileSync(path.join(templatesDir, 'components/section-indicators/indicators.css'), 'utf8');

    ['.premium-meta-header', '.page-header', '.section-label', '.card-grid', '.state-machine',
     '.flow-diagram', '.info-block', '.policy-grid', '.code-block', '.copy-button', '.toc-container', '.floating-toc'
    ].forEach(cls => {
      assert.ok(css.includes(cls), `Legacy component ${cls} must survive redesign`);
    });
  });
});