const { describe, test } = require('node:test');
const assert = require('assert');
const path = require('path');
const { scanDirectory, generateTreeMarkdown, analyzeModuleBoundaries } = require('../skills/planner/parsers/directory-scanner');

describe('Directory Scanner', () => {
  const fixtureDir = path.join(__dirname, 'fixtures/multi-source');

  test('scanDirectory recursively traverses directory and ignores node_modules and ignore patterns', () => {
    const tree = scanDirectory(fixtureDir);
    assert.strictEqual(tree.type, 'directory');
    assert.ok(tree.children.length > 0);
    const hasNodeModules = tree.children.some(c => c.name === 'node_modules');
    assert.strictEqual(hasNodeModules, false);
    const hasGit = tree.children.some(c => c.name === '.git');
    assert.strictEqual(hasGit, false);
  });

  test('scanDirectory respects maxDepth option', () => {
    const shallowTree = scanDirectory(fixtureDir, { maxDepth: 1 });
    assert.strictEqual(shallowTree.type, 'directory');
    // At depth 1, child directories should have empty children array
    const subDirs = shallowTree.children.filter(c => c.type === 'directory');
    subDirs.forEach(d => {
      assert.strictEqual(d.children.length, 0, `Directory ${d.name} should not have children at depth 1`);
    });
  });

  test('scanDirectory filters files by includeExtensions option', () => {
    const mdOnlyTree = scanDirectory(fixtureDir, { includeExtensions: ['.md'] });
    function verifyExtensions(node) {
      if (node.type === 'file') {
        assert.strictEqual(node.extension, '.md');
      } else if (node.children) {
        node.children.forEach(verifyExtensions);
      }
    }
    verifyExtensions(mdOnlyTree);
  });

  test('scanDirectory computes accurate bottom-up stats on root and intermediate directories', () => {
    const tree = scanDirectory(fixtureDir);
    assert.ok(typeof tree.stats.directories === 'number' && tree.stats.directories > 0);
    assert.ok(typeof tree.stats.files === 'number' && tree.stats.files > 0);
    assert.ok(typeof tree.stats.totalSize === 'number' && tree.stats.totalSize > 0);

    // Verify intermediate directory nodes have non-zero aggregated stats
    const srcNode = tree.children.find(c => c.name === 'src' && c.type === 'directory');
    assert.ok(srcNode, 'src directory must be present');
    assert.strictEqual(srcNode.stats.files >= 1, true, 'src node must have at least 1 file in its stats');
    assert.strictEqual(srcNode.stats.totalSize > 0, true, 'src node totalSize must be > 0');

    const docsNode = tree.children.find(c => c.name === 'docs' && c.type === 'directory');
    assert.ok(docsNode, 'docs directory must be present');
    assert.strictEqual(docsNode.stats.files >= 1, true, 'docs node must have at least 1 file in its stats');
    assert.strictEqual(docsNode.stats.totalSize > 0, true, 'docs node totalSize must be > 0');
  });

  test('scanDirectory handles non-existent paths gracefully', () => {
    const nonExistentPath = path.join(__dirname, 'fixtures/non-existent-folder-12345');
    const tree = scanDirectory(nonExistentPath);
    assert.strictEqual(tree.type, 'directory');
    assert.ok(tree.error && tree.error.includes('Path does not exist'));
  });

  test('generateTreeMarkdown formats tree with folder and file icons', () => {
    const tree = scanDirectory(fixtureDir);
    const md = generateTreeMarkdown(tree);
    assert.ok(md.includes('📁'));
    assert.ok(md.includes('README.md'));
    assert.ok(md.includes('├── ') || md.includes('└── '));
  });

  test('generateTreeMarkdown formats nested directory hierarchy correctly', () => {
    const mockTree = {
      name: 'root',
      type: 'directory',
      children: [
        {
          name: 'src',
          type: 'directory',
          children: [
            { name: 'App.tsx', type: 'file', extension: '.tsx' },
            { name: 'index.ts', type: 'file', extension: '.ts' }
          ]
        },
        { name: 'package.json', type: 'file', extension: '.json' }
      ]
    };
    const md = generateTreeMarkdown(mockTree);
    assert.ok(md.includes('📁 root/'));
    assert.ok(md.includes('📁 src/'));
    assert.ok(md.includes('⚛️ App.tsx'));
    assert.ok(md.includes('📘 index.ts'));
    assert.ok(md.includes('📋 package.json'));
  });

  test('analyzeModuleBoundaries identifies architectural layers and rules', () => {
    const tree = scanDirectory(fixtureDir);
    const analysis = analyzeModuleBoundaries(tree);
    assert.ok(Array.isArray(analysis.layers));
    assert.ok(Array.isArray(analysis.importPatterns));
    assert.ok(analysis.importPatterns.length > 0);
    assert.ok(Array.isArray(analysis.conventions));
    assert.ok(analysis.conventions.length > 0);
    assert.ok(analysis.conventions.some(c => c.rule.includes('Absolute imports')));
  });
});