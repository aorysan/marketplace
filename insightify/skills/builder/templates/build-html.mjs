import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively find files matching extension
 */
function getAllFilesRecursive(dir, ext, fileList = []) {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      if (file.isDirectory()) {
        getAllFilesRecursive(fullPath, ext, fileList);
      } else if (file.name.endsWith(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList.sort();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render markdown to HTML
 */
export function renderMarkdown(md) {
  if (!md) return '';

  // Pre-process special directives (e.g., :::flow, :::state, :::grid)
  const directiveMap = {
    'flow': 'flow-diagram',
    'state': 'state-machine',
    'grid': 'card-grid',
    'policy-grid': 'policy-grid'
  };
  let processedMd = md.replace(/^:::([a-z0-9-]+)\s*\r?\n([\s\S]*?)\r?\n:::/gm, (match, dir, content) => {
    const className = directiveMap[dir] || dir;
    return `<div class="${className}">\n\n${content}\n\n</div>`;
  });

  // Custom renderer for citations, code blocks, mermaid, and tables
  const renderer = new marked.Renderer();

  // Render headings with section numbers for H2
  renderer.heading = (heading, level) => {
    const text = typeof heading === 'object' ? (heading.text || '') : (heading || '');
    const depth = typeof heading === 'object' ? heading.depth : level;
    
    if (depth === 2) {
      return `<h2>${text}</h2>\n`;
    }
    return `<h${depth}>${text}</h${depth}>\n`;
  };

  // Render blockquotes with source citations
  renderer.blockquote = (quote) => {
    const quoteText = typeof quote === 'object' ? (quote.text || '') : quote;
    if (quoteText.includes('**Source:**') || quoteText.includes('<strong>Source:</strong>') || quoteText.includes('Source:')) {
      return `<blockquote class="source-citation">${quoteText}</blockquote>\n`;
    }
    return `<blockquote>${quoteText}</blockquote>\n`;
  };

  // Render code blocks with language and Mermaid support
  renderer.code = (code, language) => {
    const text = typeof code === 'object' ? (code.text || '') : (code || '');
    const lang = (typeof code === 'object' ? code.lang : language) || 'text';
    const cleanLang = lang.trim().toLowerCase();

    if (cleanLang === 'mermaid') {
      return `<pre class="mermaid">${escapeHtml(text)}</pre>\n`;
    }
    return `<pre class="code-block" data-language="${escapeHtml(cleanLang)}"><code class="language-${escapeHtml(cleanLang)}">${escapeHtml(text)}</code></pre>\n`;
  };

  // Render tables with responsive wrapper
  renderer.table = (header, body) => {
    const head = typeof header === 'object' ? (header.header || '') : header;
    const rows = typeof header === 'object' ? (header.rows || '') : body;
    return `<div class="table-wrapper"><table><thead>${head}</thead><tbody>${rows}</tbody></table></div>\n`;
  };

  const html = marked.parse(processedMd, { renderer, gfm: true, breaks: true });
  return html;
}

/**
 * Parse markdown with frontmatter
 */
function parseMarkdownWithFrontmatter(md) {
  if (!md || typeof md !== 'string') return { frontmatter: {}, content: '' };
  const frontmatterMatch = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (frontmatterMatch) {
    const frontmatter = parseYaml(frontmatterMatch[1]);
    return { frontmatter, content: frontmatterMatch[2] };
  }
  return { frontmatter: {}, content: md };
}

/**
 * Simple YAML parser for frontmatter
 */
function parseYaml(yaml) {
  const result = {};
  if (!yaml) return result;
  const lines = yaml.split('\n');
  let currentKey = null;

  for (let rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line || line.startsWith('#')) continue;

    // Check array item
    if (line.trim().startsWith('- ') && currentKey) {
      let item = line.trim().substring(2).trim();
      if ((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'"))) {
        item = item.slice(1, -1);
      }
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(item);
      continue;
    }

    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      if (!value) {
        currentKey = key;
        result[key] = [];
        continue;
      }

      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      // Handle inline arrays [a, b, c]
      else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch {
          value = value.slice(1, -1).split(',').map(v => {
            let item = v.trim();
            if ((item.startsWith('"') && item.endsWith('"')) || (item.startsWith("'") && item.endsWith("'"))) {
              item = item.slice(1, -1);
            }
            return item;
          });
        }
      }

      result[key] = value;
      currentKey = key;
    }
  }
  return result;
}

/**
 * Extract architecture highlights dynamically from knowledge base files
 */
function extractArchitectureHighlights(kbDir, techStack) {
  const highlights = [];

  if (!kbDir || !fs.existsSync(kbDir)) {
    return '<li>See documentation sections below for architecture details</li>';
  }

  const kbSources = [
    { file: 'architecture.md', label: 'Architecture' },
    { file: 'state-and-data.md', label: 'State & Data' },
    { file: 'design-system.md', label: 'Design System' },
    { file: 'api-patterns.md', label: 'API Patterns' },
    { file: 'business-policies.md', label: 'Business Policies' }
  ];

  for (const { file, label } of kbSources) {
    const filePath = path.join(kbDir, file);
    if (!fs.existsSync(filePath)) continue;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { content: body } = parseMarkdownWithFrontmatter(content);
      if (!body || !body.trim()) continue;

      // Extract first H2 heading and its first paragraph as description
      const h2Match = body.match(/^##\s+(.+)$/m);
      const heading = h2Match ? h2Match[1].trim() : label;

      // Get first paragraph after H2
      const afterH2 = h2Match ? body.substring(body.indexOf(h2Match[0]) + h2Match[0].length) : body;
      const paraMatch = afterH2.trim().match(/^([^\n#][^\n]*)/);
      let description = paraMatch ? paraMatch[1].trim() : '';
      if (description.length > 120) {
        description = description.substring(0, 117) + '...';
      }

      if (description) {
        highlights.push(`<li><strong>${escapeHtml(heading)}</strong> — ${escapeHtml(description)}</li>`);
      } else {
        highlights.push(`<li><strong>${escapeHtml(heading)}</strong></li>`);
      }
    } catch {
      // Skip unreadable files silently
    }
  }

  if (techStack.length > 0 && highlights.length > 0) {
    highlights.unshift(`<li><strong>Tech Stack</strong> — ${techStack.map(t => escapeHtml(t)).join(', ')}</li>`);
  }

  if (highlights.length === 0) {
    return '<li>See documentation sections below for architecture details</li>';
  }

  return highlights.join('\n          ');
}

/**
 * Build product overview from knowledge base
 */
export function buildProductOverview(kbDir) {
  let productMd = '';

  if (kbDir && fs.existsSync(kbDir)) {
    try {
      productMd = fs.readFileSync(path.join(kbDir, 'product.md'), 'utf-8');
    } catch {}
  }

  // Extract product info
  const { frontmatter: productInfo, content: productBody } = parseMarkdownWithFrontmatter(productMd);
  const name = productInfo.name || productInfo.title || (productMd.match(/^#\s+(.+)$/m)?.[1]) || 'Project';
  const description = productInfo.description || productBody || 'Frontend Technical Specification';
  const version = productInfo.version || '1.0.0';
  const tagline = productInfo.tagline || productInfo.value_proposition || productInfo.valueProposition || '';
  const audience = productInfo.audience || productInfo.target_audience || 'Developers & Engineering Team';
  const docType = productInfo.doc_type || productInfo.docType || 'React/Frontend Application';

  let rawTechStack = productInfo.techStack || productInfo.tech_stack || [];
  if (typeof rawTechStack === 'string') {
    rawTechStack = [rawTechStack];
  }
  const techStack = Array.isArray(rawTechStack) ? rawTechStack : [];

  let html = `
    <div class="product-overview">
      <div class="product-meta">
        <div class="meta-card">
          <span class="meta-label">Product</span>
          <span class="meta-value">${escapeHtml(name)}</span>
        </div>
        <div class="meta-card">
          <span class="meta-label">Version</span>
          <span class="meta-value">${escapeHtml(version)}</span>
        </div>
        <div class="meta-card">
          <span class="meta-label">Type</span>
          <span class="meta-value">${escapeHtml(docType)}</span>
        </div>
        <div class="meta-card">
          <span class="meta-label">Audience</span>
          <span class="meta-value">${escapeHtml(audience)}</span>
        </div>
      </div>

      <div class="product-description">
        ${renderMarkdown(description)}
      </div>

      ${techStack.length > 0 ? `
        <div class="tech-stack">
          <h3>Technology Stack</h3>
          <div class="tech-badges">
            ${techStack.map(tech => `<span class="tech-badge">${escapeHtml(tech)}</span>`).join('')}
          </div>
        </div>
      ` : ''}

      <div class="architecture-highlights">
        <h3>Architecture Highlights</h3>
        <ul class="highlight-list">
          ${extractArchitectureHighlights(kbDir, techStack)}
        </ul>
      </div>
    </div>
  `;

  return { html, name, version, tagline, description, audience, docType, techStack };
}

/**
 * Helper to parse plan pages from text or object
 */
function parsePlanPages(planInput) {
  if (!planInput) return [];

  if (Array.isArray(planInput)) return planInput;
  if (typeof planInput === 'object' && Array.isArray(planInput.pages)) return planInput.pages;

  if (typeof planInput === 'string') {
    try {
      const parsed = JSON.parse(planInput);
      if (Array.isArray(parsed)) return parsed;
      if (Array.isArray(parsed.pages)) return parsed.pages;
    } catch {}

    const pages = [];
    const lines = planInput.split('\n');

    // Check for ### N. Page Name
    for (const line of lines) {
      const match = line.trim().match(/^###\s+(?:(\d+)\.\s+)?(.+)$/);
      if (match) {
        const num = match[1];
        const title = match[2].trim();
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const file = num ? `${num.padStart(2, '0')}-${slug}.md` : `${slug}.md`;
        pages.push({ title: num ? `${num}. ${title}` : title, file, slug });
      }
    }

    if (pages.length > 0) return pages;

    // Check for list items - N. Page Name
    for (const line of lines) {
      const match = line.trim().match(/^-\s+(?:\[[ xX]\]\s+)?(?:(\d+)\.\s+)?(.+)$/);
      if (match) {
        const num = match[1];
        const title = match[2].trim();
        if (title.startsWith('All ') || title.startsWith('Dependency ') || title.startsWith('Priority ')) continue;
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const file = num ? `${num.padStart(2, '0')}-${slug}.md` : `${slug}.md`;
        pages.push({ title: num ? `${num}. ${title}` : title, file, slug });
      }
    }

    return pages;
  }

  return [];
}

/**
 * Build documentation sections from markdown pages
 */
export function buildDocSections(docPath) {
  if (!docPath || !fs.existsSync(docPath)) return '';
  const md = fs.readFileSync(docPath, 'utf-8');
  
  let { content: body } = parseMarkdownWithFrontmatter(md);
  
  // Strip leading H1 since HTML already renders the title
  body = body.replace(/^#\s+.+?(?:\r?\n)+/, '');
  
  const sections = body.split(/(?=^##\s+)/m);
  let sectionsHtml = '';
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    const match = section.match(/^##\s+(.+)$/m);
    if (match) {
      const title = match[1].trim();
      const titleLower = title.toLowerCase();
      if (titleLower === 'table of contents' ||
          titleLower === 'approval workflows' ||
          titleLower === 'unanswered questions' ||
          titleLower === 'known gaps') continue;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const sectionContent = section.substring(match[0].length);
      
      sectionsHtml += `
      <section id="${escapeHtml(slug)}" class="doc-section">
        <h2>${escapeHtml(title)}</h2>
        ${renderMarkdown(sectionContent.trim())}
      </section>
      `;
    } else {
      sectionsHtml += renderMarkdown(section);
    }
  }
  
  return sectionsHtml;
}

/**
 * Build sidebar navigation from document
 */
export function buildSidebarNav(docPath) {
  let navHtml = '';
  navHtml += `
    <a href="#overview" class="section-indicator active" data-section="overview">
      <span class="indicator-label">Overview</span>
      <span class="indicator-line"></span>
    </a>
  `;
  
  if (docPath && fs.existsSync(docPath)) {
    const md = fs.readFileSync(docPath, 'utf-8');
    const sections = md.match(/^##\s+(.+)$/gm) || [];
    for (const section of sections) {
      const title = section.replace(/^##\s+/, '').trim();
      const titleLower = title.toLowerCase();
      if (titleLower === 'table of contents' ||
          titleLower === 'approval workflows' ||
          titleLower === 'unanswered questions' ||
          titleLower === 'known gaps') continue;
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navHtml += `
        <a href="#${escapeHtml(slug)}" class="section-indicator" data-section="${escapeHtml(slug)}">
          <span class="indicator-label">${escapeHtml(title)}</span>
          <span class="indicator-line"></span>
        </a>
      `;
    }
  }


  return navHtml;
}

/**
 * Build process diagram
 */
export function buildProcessDiagram() {
  return `
    <div class="process-diagram">
      <div class="process-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>Planner</h3>
          <p>Ingest sources → Extract 10 knowledge categories → Generate documentation plan</p>
          <div class="step-io">
            <span class="input">Sources (files, URLs)</span>
            <span class="arrow">→</span>
            <span class="output">Knowledge Base + Plan</span>
          </div>
        </div>
      </div>
      <div class="process-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>Writer</h3>
          <p>Generate document sections independently in parallel</p>
          <div class="step-io">
            <span class="input">Knowledge Base + Plan</span>
            <span class="arrow">→</span>
            <span class="output">Documentation Document</span>
          </div>
        </div>
      </div>
      <div class="process-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>Reviewer</h3>
          <p>Evaluate across 10 dimensions (Accuracy, Completeness, Consistency, Structure, Usability, Type Safety, Architecture Alignment, Business Alignment, Scannability, Brevity)</p>
          <div class="step-io">
            <span class="input">Markdown Pages</span>
            <span class="arrow">→</span>
            <span class="output">Review Report + Issues</span>
          </div>
        </div>
      </div>
      <div class="process-step">
        <div class="step-number">4</div>
        <div class="step-content">
          <h3>Builder</h3>
          <p>Render artifact-style HTML with sidebar, Mermaid diagrams, dark/light mode, and assemble knowledge-base.md</p>
          <div class="step-io">
            <span class="input">Approved Pages</span>
            <span class="arrow">→</span>
            <span class="output">index.html + knowledge-base.md</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Assemble knowledge base from finalized documentation
 */
export function assembleKnowledgeBase(finalDocPath, options = {}) {
  let projectName = 'Project';
  if (options.kbDir && fs.existsSync(path.join(options.kbDir, 'product.md'))) {
    try {
      const prodContent = fs.readFileSync(path.join(options.kbDir, 'product.md'), 'utf-8');
      const { frontmatter } = parseMarkdownWithFrontmatter(prodContent);
      if (frontmatter.name) projectName = frontmatter.name;
    } catch {}
  }

  const pluginVersion = options.insightifyVersion || '6.4.1';
  let kbMd = `# Knowledge Base: ${projectName}\n\n`;
  kbMd += `*Generated by Insightify v${pluginVersion}*\n\n`;

  if (!finalDocPath || !fs.existsSync(finalDocPath)) return kbMd;

  const content = fs.readFileSync(finalDocPath, 'utf-8');
  // Strip frontmatter
  let body = content;
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (frontmatterMatch) {
    body = frontmatterMatch[2];
  }

  const toc = [];
  const sections = body.match(/^##\s+(.+)$/gm) || [];
  for (const section of sections) {
    const title = section.replace(/^##\s+/, '').trim();
    if (title.toLowerCase() === 'table of contents') continue;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    toc.push(`- [${title}](#${slug})`);
  }

  if (toc.length > 0) {
    kbMd += `## Table of Contents\n\n${toc.join('\n')}\n\n---\n\n`;
  }

  kbMd += body.trim();
  return kbMd;
}

/**
 * Render template with data
 */
export function render(template, data = {}) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`;
    result = result.replaceAll(placeholder, value !== undefined && value !== null ? String(value) : '');
  }
  return result;
}

/**
 * Read template file safely from templates directory
 */
export function readTemplate(templateName) {
  const templatePath = path.join(__dirname, templateName);
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (e) {
    return '';
  }
}

/**
 * Build single artifact HTML and knowledge base
 */
export function buildArtifact(options = {}) {
  const kbDir = options.kbDir || path.join(options.outDir || '.', '.insightify/knowledge');
  const docPath = options.docPath || path.join(options.outDir || '.', 'docs/final/final-documentation.md');
  const plan = options.plan || (options.planFile && fs.existsSync(options.planFile) ? fs.readFileSync(options.planFile, 'utf-8') : null) || {};

  const overview = buildProductOverview(kbDir);
  const docSections = buildDocSections(docPath);
  const sidebarNav = buildSidebarNav(docPath);
  const processDiagram = buildProcessDiagram();

  let htmlTemplate = options.htmlTemplate;
  if (!htmlTemplate) {
    const baseHtml = readTemplate('layouts/base.html');
    if (baseHtml) {
      htmlTemplate = baseHtml.replace(/\{\{>\s*([a-zA-Z0-9_-]+)\}\}/g, (match, compName) => {
        const compDir = path.join(__dirname, 'components', compName);
        const htmlFiles = getAllFilesRecursive(compDir, '.html');
        return htmlFiles.map(f => fs.readFileSync(f, 'utf-8')).join('\n');
      });
    } else if (readTemplate('index-html-template.html')) {
      // Fallback to legacy path for compatibility if layout doesn't exist
      htmlTemplate = readTemplate('index-html-template.html');
    }
  }

  let styles = options.styles;
  if (!styles) {
    let cssList = [];
    const baseCss = readTemplate('layouts/styles-base.css');
    if (baseCss) cssList.push(baseCss);

    const componentsDir = path.join(__dirname, 'components');
    const cssFiles = getAllFilesRecursive(componentsDir, '.css');
    for (const f of cssFiles) {
      cssList.push(fs.readFileSync(f, 'utf-8'));
    }

    if (cssList.length > 0) {
      styles = cssList.join('\n');
    } else {
      styles = readTemplate('styles.css');
    }
  }

  let scripts = options.scripts;
  if (!scripts) {
    const baseJs = readTemplate('layouts/scripts-base.js');
    if (baseJs) {
      // Replace placeholders precisely to maintain IIFE encapsulation
      scripts = baseJs.replace(/\{\{>\s*([a-zA-Z0-9_-]+)-js\}\}/g, (match, compName) => {
        const compDir = path.join(__dirname, 'components', compName);
        const jsFiles = getAllFilesRecursive(compDir, '.js');
        return jsFiles.map(f => fs.readFileSync(f, 'utf-8')).join('\n');
      });
      // Append any component JS that wasn't injected? The reviewer said "just like HTML assembly".
      // We will assume components that need JS injection must declare a placeholder in scripts-base.js
    } else {
      scripts = readTemplate('scripts.js');
    }
  }

  const insightifyVersion = options.insightifyVersion || '6.4.1';
  const renderedHtml = render(htmlTemplate, {
    TITLE: `${overview.name} - Technical Specification`,
    PRODUCT_NAME: overview.name,
    TAGLINE: overview.tagline,
    VERSION: overview.version,
    GENERATED_AT: new Date().toISOString().split('T')[0],
    SIDEBAR_NAV: sidebarNav,
    PRODUCT_OVERVIEW: overview.html,
    DOC_SECTIONS: docSections,
    PROCESS_DIAGRAM: processDiagram,
    STYLE: `<style>\n${styles}\n</style>`,
    SCRIPTS: `<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>\n<script>\n${scripts}\n</script>`,
    INSIGHTIFY_VERSION: insightifyVersion
  });

  const knowledgeBase = assembleKnowledgeBase(docPath, { kbDir, insightifyVersion });

  if (options.outDir) {
    fs.mkdirSync(options.outDir, { recursive: true });
    fs.writeFileSync(path.join(options.outDir, 'index.html'), renderedHtml, 'utf-8');
    fs.writeFileSync(path.join(options.outDir, 'Product-Knowledge-Base.md'), knowledgeBase, 'utf-8');
  }

  return { html: renderedHtml, knowledgeBase };
}
