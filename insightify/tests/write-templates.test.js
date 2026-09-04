const { describe, test } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('Writer Templates (11 Templates, 10 Merged Categories)', () => {
  const templateDir = path.join(__dirname, '../skills/writer/templates');
  const expectedTemplates = [
    'executive-summary-template.md',
    'directory-structure-template.md',
    'architecture-template.md',
    'state-and-data-template.md',
    'design-system-template.md',
    'api-patterns-template.md',
    'features-and-journeys-template.md',
    'business-policies-template.md',
    'constraints-and-limits-template.md',
    'workflows-template.md',
    'appendix-template.md'
  ];

  test('templates directory contains exactly the 11 aligned templates (10 categories + doc framing)', () => {
    const files = fs.readdirSync(templateDir).filter(f => f.endsWith('.md'));
    assert.strictEqual(files.length, 11, `Expected 11 templates, found ${files.length}: ${files.join(', ')}`);
    expectedTemplates.forEach(t => {
      assert.ok(files.includes(t), `Template ${t} should be present in ${templateDir}`);
    });
  });

  function parseAndValidateFrontmatter(content, filename) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    assert.ok(match, `${filename} must start with valid YAML frontmatter enclosed in --- delimiters`);
    const yamlBlock = match[1];

    // Validate title field with strict multiline regex
    const titleMatch = yamlBlock.match(/^title:\s*["']?(.+?)["']?\s*$/m);
    assert.ok(titleMatch && titleMatch[1].trim().length > 0, `${filename} must define a non-empty 'title:' in YAML frontmatter`);

    // Validate description field with strict multiline regex
    const descMatch = yamlBlock.match(/^description:\s*["']?(.+?)["']?\s*$/m);
    assert.ok(descMatch && descMatch[1].trim().length > 0, `${filename} must define a non-empty 'description:' in YAML frontmatter`);

    // Validate audience field with strict multiline regex
    const audienceMatch = yamlBlock.match(/^audience:\s*["']?(.+?)["']?\s*$/m);
    assert.ok(audienceMatch && audienceMatch[1].trim().length > 0, `${filename} must define a non-empty 'audience:' in YAML frontmatter`);

    // Validate sources list in YAML frontmatter
    const sourcesMatch = yamlBlock.match(/^sources:\s*\r?\n((?:\s*-\s*.+\r?\n?)+)/m);
    assert.ok(sourcesMatch, `${filename} must define a 'sources:' list in YAML frontmatter`);
    const sources = sourcesMatch[1].split(/\r?\n/).map(s => s.replace(/^\s*-\s*/, '').trim()).filter(Boolean);
    assert.ok(sources.length > 0, `${filename} must list at least one source in YAML frontmatter`);

    return {
      title: titleMatch[1].trim(),
      description: descMatch[1].trim(),
      audience: audienceMatch[1].trim(),
      sources
    };
  }

  expectedTemplates.forEach(filename => {
    test(`template ${filename} exists and has valid frontmatter & structure`, () => {
      const filePath = path.join(templateDir, filename);
      assert.strictEqual(fs.existsSync(filePath), true, `${filename} must exist`);
      const content = fs.readFileSync(filePath, 'utf8');

      // Strict YAML Frontmatter validation
      const frontmatter = parseAndValidateFrontmatter(content, filename);
      assert.ok(frontmatter.title, `${filename} parsed frontmatter title`);
      assert.ok(frontmatter.description, `${filename} parsed frontmatter description`);
      assert.ok(frontmatter.audience, `${filename} parsed frontmatter audience`);
      assert.ok(frontmatter.sources.length > 0, `${filename} parsed frontmatter sources list`);

      // Content structure validation
      assert.ok(content.includes('# '), `${filename} must have an H1 title`);
      assert.ok(content.includes('## '), `${filename} must have H2 section headers`);
      assert.ok(content.includes('> **Source:**'), `${filename} must contain blockquote source citations`);
    });
  });

  test('executive-summary-template contains vision, tech stack, key features, and architecture highlights', () => {
    const content = fs.readFileSync(path.join(templateDir, 'executive-summary-template.md'), 'utf8');
    assert.ok(content.includes('Project Vision & Value Proposition'), 'Must contain vision section');
    assert.ok(content.includes('Tech Stack Summary'), 'Must contain tech stack summary');
    assert.ok(content.includes('Key Features at a Glance'), 'Must contain key features table');
    assert.ok(content.includes('Architecture Highlights'), 'Must contain architecture highlights');
  });

  test('directory-structure-template contains tree, module boundary rules, and import conventions', () => {
    const content = fs.readFileSync(path.join(templateDir, 'directory-structure-template.md'), 'utf8');
    assert.ok(content.includes('<details') && content.includes('<summary>'), 'Must contain collapsible details/summary tree');
    assert.ok(content.includes('Module Boundary Rules'), 'Must contain module boundary rules table');
    assert.ok(content.includes('Import Path Conventions'), 'Must contain import path conventions code block');
  });

  test('architecture-template merges layouts, routing, and entity data models', () => {
    const content = fs.readFileSync(path.join(templateDir, 'architecture-template.md'), 'utf8');
    // Layouts
    assert.ok(content.includes('PublicLayout'), 'Must define PublicLayout');
    assert.ok(content.includes('AuthLayout'), 'Must define AuthLayout');
    assert.ok(content.includes('ProtectedLayout'), 'Must define ProtectedLayout');
    assert.ok(content.includes('Component Composition Tree'), 'Must contain component composition tree');
    assert.ok(content.includes('graph TD') || content.includes('flowchart TD'), 'Must contain Mermaid tree diagram');
    // Routing
    assert.ok(content.includes('PublicRoute'), 'Must define PublicRoute guard');
    assert.ok(content.includes('PrivateRoute'), 'Must define PrivateRoute guard');
    assert.ok(content.includes('RoleRoute'), 'Must define RoleRoute guard');
    assert.ok(content.includes('LazyPage'), 'Must define lazy page wrapper');
    assert.ok(content.includes('routeMeta') || content.includes('RouteMeta'), 'Must define route metadata');
    // Data models (entities)
    assert.ok(content.includes('interface BaseEntity'), 'Must define BaseEntity');
    assert.ok(content.includes('interface ApiResponse'), 'Must define ApiResponse');
    assert.ok(content.includes('interface PaginatedResponse'), 'Must define PaginatedResponse');
    assert.ok(content.includes('classDiagram'), 'Must contain Mermaid class diagram');
  });

  test('state-and-data-template contains stores, selectors, flow diagram, and persistence', () => {
    const content = fs.readFileSync(path.join(templateDir, 'state-and-data-template.md'), 'utf8');
    assert.ok(content.includes('useAuthStore'), 'Must define useAuthStore');
    assert.ok(content.includes('useAppStore'), 'Must define useAppStore');
    assert.ok(content.includes('State Flow Diagram'), 'Must contain state flow diagram');
    assert.ok(content.includes('Persistence Strategy'), 'Must define persistence strategy');
  });

  test('design-system-template contains component registry, design tokens, and accessibility', () => {
    const content = fs.readFileSync(path.join(templateDir, 'design-system-template.md'), 'utf8');
    assert.ok(content.includes('Button'), 'Must specify Button component');
    assert.ok(content.includes('Input'), 'Must specify Input component');
    assert.ok(content.includes('Modal'), 'Must specify Modal component');
    assert.ok(content.includes('Component Registry Table'), 'Must contain component registry table');
    assert.ok(content.includes('Design Token References'), 'Must contain design tokens');
    assert.ok(content.includes('Accessibility Checklist'), 'Must contain accessibility checklist');
  });

  test('api-patterns-template contains apiClient, custom hooks, and error handling flow', () => {
    const content = fs.readFileSync(path.join(templateDir, 'api-patterns-template.md'), 'utf8');
    assert.ok(content.includes('apiClient'), 'Must define apiClient');
    assert.ok(content.includes('useFetchData'), 'Must define useFetchData hook');
    assert.ok(content.includes('useMutation'), 'Must define useMutation hook');
    assert.ok(content.includes('useOptimisticUpdate'), 'Must define optimistic update pattern');
    assert.ok(content.includes('Error Handling Flow'), 'Must contain error handling flow diagram');
  });

  test('features-and-journeys-template contains feature catalog, Gherkin stories, personas, and acceptance criteria', () => {
    const content = fs.readFileSync(path.join(templateDir, 'features-and-journeys-template.md'), 'utf8');
    assert.ok(content.includes('Feature Catalog'), 'Must contain feature catalog table');
    assert.ok(content.includes('<Feature 1 Name>'), 'Must use standardized placeholder syntax for features');
    assert.ok(content.includes('Feature:'), 'Must contain Gherkin Feature definition');
    assert.ok(content.includes('Scenario:'), 'Must contain Gherkin Scenario definition');
    assert.ok(content.includes('Acceptance Criteria'), 'Must contain acceptance criteria table');
    assert.ok(content.includes('Technical Mapping'), 'Must contain technical mapping table');
  });

  test('business-policies-template contains shared concerns (auth/theming/i18n/error/logging/flags) and glossary', () => {
    const content = fs.readFileSync(path.join(templateDir, 'business-policies-template.md'), 'utf8');
    assert.ok(content.includes('Provider Composition Tree'), 'Must contain provider tree');
    assert.ok(content.includes('AuthProvider'), 'Must define AuthProvider');
    assert.ok(content.includes('ThemeProvider'), 'Must define ThemeProvider');
    assert.ok(content.includes('I18nProvider'), 'Must define I18nProvider');
    assert.ok(content.includes('ErrorBoundary'), 'Must define ErrorBoundary');
    assert.ok(content.includes('Logger') || content.includes('logger'), 'Must define logger utility');
    assert.ok(content.includes('FeatureFlagsProvider'), 'Must define FeatureFlagsProvider');
    assert.ok(content.includes('Glossary'), 'Must contain glossary table');
    assert.ok(content.includes('Acronyms & Abbreviations'), 'Must contain acronyms table');
    assert.ok(content.includes('Naming Conventions'), 'Must contain naming conventions table');
  });

  test('constraints-and-limits-template contains technical constraints, budgets, security, and known issues', () => {
    const content = fs.readFileSync(path.join(templateDir, 'constraints-and-limits-template.md'), 'utf8');
    assert.ok(content.includes('Technical Constraints'), 'Must contain technical constraints table');
    assert.ok(content.includes('Performance Budgets'), 'Must contain performance budgets table');
    assert.ok(content.includes('Security Requirements'), 'Must contain security requirements table');
    assert.ok(content.includes('Known Issues & Workarounds'), 'Must contain known issues table');
  });

  test('workflows-template contains development workflows, CI pipeline, deployment, and decision trees', () => {
    const content = fs.readFileSync(path.join(templateDir, 'workflows-template.md'), 'utf8');
    assert.ok(content.includes('Feature Development'), 'Must contain feature development workflow');
    assert.ok(content.includes('Bug Fix Workflow'), 'Must contain bug fix workflow');
    assert.ok(content.includes('CI Pipeline'), 'Must contain CI pipeline');
    assert.ok(content.includes('Production Deployment') || content.includes('Deployment Workflows'), 'Must contain deployment workflow');
    assert.ok(content.includes('Decision Trees'), 'Must contain decision trees');
  });

  test('appendix-template contains references, changelog, contributor guide, and generation metadata with standardized placeholders', () => {
    const content = fs.readFileSync(path.join(templateDir, 'appendix-template.md'), 'utf8');
    assert.ok(content.includes('External References & Links'), 'Must contain external references');
    assert.ok(content.includes('Changelog'), 'Must contain changelog section');
    assert.ok(content.includes('Contributor Guide'), 'Must contain contributor guide');
    assert.ok(content.includes('License & Attribution'), 'Must contain license & attribution');
    assert.ok(content.includes('Generation Metadata'), 'Must contain generation metadata table');
    assert.ok(content.includes('<GENERATED_AT>'), 'Must use standardized placeholder for generation timestamp');
    assert.ok(content.includes('<Project Name>'), 'Must use standardized placeholder for project name');
  });

  test('writer skill instructs sub-agents to render sections independently in parallel with max concurrency 5', () => {
    const skill = fs.readFileSync(path.join(__dirname, '../skills/writer/SKILL.md'), 'utf8');

    assert.ok(skill.includes('sub-agents'), 'SKILL.md must mention sub-agents');
    assert.ok(skill.includes('independently in parallel'), 'SKILL.md must instruct to render independently in parallel');
    assert.ok(skill.includes('maximum concurrency of 5'), 'SKILL.md must specify maximum concurrency of 5');
    assert.ok(skill.includes('stitch them together'), 'SKILL.md must instruct to stitch them together');

    // Output target
    assert.ok(skill.includes('docs/markdown/'), 'Must reference docs/markdown/ output path');
  });

  test('writer SKILL.md contains Artifact HTML Formatting section with builder utility classes', () => {
    const skill = fs.readFileSync(path.join(__dirname, '../skills/writer/SKILL.md'), 'utf8');
    assert.ok(skill.includes('## Artifact HTML Formatting'), 'SKILL.md must contain an Artifact HTML Formatting section');

    const utilityClasses = ['artifact-card', 'grid-2', 'grid-3', 'badge', 'status-indicator'];
    utilityClasses.forEach(cls => {
      assert.ok(skill.includes(cls), `Artifact HTML Formatting must reference ${cls}`);
    });

    assert.ok(skill.includes('status-warning'), 'status-indicator guidance must include status-warning modifier');
    assert.ok(skill.includes('status-error'), 'status-indicator guidance must include status-error modifier');

    // Section must sit after Content Structure and before Cross-References
    const contentIdx = skill.indexOf('## Content Structure');
    const artifactIdx = skill.indexOf('## Artifact HTML Formatting');
    const crossRefIdx = skill.indexOf('## Cross-References');
    assert.ok(contentIdx !== -1 && artifactIdx !== -1 && crossRefIdx !== -1, 'Required sections must exist');
    assert.ok(contentIdx < artifactIdx && artifactIdx < crossRefIdx,
      'Artifact HTML Formatting must appear after Content Structure and before Cross-References');

    assert.ok(skill.includes('do not invent other class names'), 'Must restrict Writer to Builder CSS classes');

    // Raw HTML only inside artifact wrappers (marked 12 does not render markdown nested in raw HTML)
    assert.ok(skill.includes('use raw HTML only'), 'Wrapper guidance must mandate raw HTML only inside wrappers');
    assert.ok(skill.includes('Markdown syntax will not be rendered'),
      'Wrapper guidance must warn that markdown syntax will not be rendered inside raw HTML wrappers');

    // Strict HTML Grid card rules and anti-patterns
    assert.ok(skill.includes('Mandatory HTML Grid Cards for Enumerations'),
      'Must enforce mandatory HTML grid cards for enumerations');
    assert.ok(skill.includes('forbid standard markdown lists') || skill.includes('NO Markdown Bullets'),
      'Must explicitly forbid markdown bullet lists for structures');
    assert.ok(skill.includes('<h4>') && skill.includes('<code>'),
      'Must specify <h4> for card titles and <code> for code terms');
    assert.ok(skill.includes('Few-Shot HTML Grid Template'),
      'Must include a few-shot HTML grid template example');
  });
});
