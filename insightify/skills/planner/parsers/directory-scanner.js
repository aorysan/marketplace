const fs = require('fs');
const path = require('path');

/**
 * Scans a directory and generates a tree structure for documentation
 * Ignores node_modules, .git, dist, build, .next, .vercel, coverage, .turbo, .cache, .insightify
 */
function scanDirectory(dirPath, options = {}) {
  const {
    maxDepth = 4,
    ignorePatterns = ['node_modules', '.git', 'dist', 'build', '.next', '.vercel', 'coverage', '.turbo', '.cache', '.insightify'],
    includeFiles = true,
    includeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.scss', '.html', '.svg', '.png', '.jpg', '.jpeg', '.yaml', '.yml', '.toml', '.env']
  } = options;

  const resolvedPath = path.resolve(dirPath);
  const baseName = path.basename(resolvedPath) || '.';

  const tree = {
    name: baseName,
    path: resolvedPath,
    relativePath: '',
    type: 'directory',
    children: [],
    stats: { directories: 0, files: 0, totalSize: 0 }
  };

  if (!fs.existsSync(resolvedPath)) {
    tree.error = `Path does not exist: ${resolvedPath}`;
    return tree;
  }

  function shouldIgnore(name) {
    return ignorePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
        return regex.test(name);
      }
      return name === pattern;
    });
  }

  function scan(currentPath, currentDepth, currentNode) {
    const currentSubtreeStats = { directories: 0, files: 0, totalSize: 0 };
    if (currentDepth >= maxDepth) return currentSubtreeStats;

    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      // Sort: directories first, then files, alphabetically
      entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      for (const entry of entries) {
        if (shouldIgnore(entry.name)) {
          continue;
        }

        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(resolvedPath, fullPath).replace(/\\/g, '/');

        let stat;
        try {
          stat = fs.statSync(fullPath);
        } catch {
          continue;
        }

        const isDir = entry.isDirectory();
        const ext = isDir ? null : path.extname(entry.name).toLowerCase();

        if (isDir) {
          const childDirNode = {
            name: entry.name,
            path: fullPath,
            relativePath,
            type: 'directory',
            children: [],
            stats: { directories: 0, files: 0, totalSize: 0 }
          };
          currentNode.children.push(childDirNode);

          // Count this directory itself
          currentSubtreeStats.directories += 1;

          // Recursively scan subtree and accumulate bottom-up stats
          const childStats = scan(fullPath, currentDepth + 1, childDirNode);

          childDirNode.stats.directories = childStats.directories;
          childDirNode.stats.files = childStats.files;
          childDirNode.stats.totalSize = childStats.totalSize;

          currentSubtreeStats.directories += childStats.directories;
          currentSubtreeStats.files += childStats.files;
          currentSubtreeStats.totalSize += childStats.totalSize;
        } else if (includeFiles && (!includeExtensions || includeExtensions.length === 0 || includeExtensions.includes(ext))) {
          const fileNode = {
            name: entry.name,
            path: fullPath,
            relativePath,
            type: 'file',
            size: stat.size,
            extension: ext
          };
          currentNode.children.push(fileNode);

          currentSubtreeStats.files += 1;
          currentSubtreeStats.totalSize += stat.size;
        }
      }
    } catch (e) {
      currentNode.error = e.message;
    }

    return currentSubtreeStats;
  }

  const rootStats = scan(resolvedPath, 0, tree);
  tree.stats = rootStats;

  return tree;
}

/**
 * Generates a formatted ASCII markdown tree representation
 */
function generateTreeMarkdown(tree, prefix = '', isLast = true, isRoot = true) {
  let output = '';

  if (isRoot) {
    output += `📁 ${tree.name}/\n`;
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach((child, index) => {
        output += generateTreeMarkdown(child, '', index === tree.children.length - 1, false);
      });
    }
    return output;
  }

  const connector = isLast ? '└── ' : '├── ';
  const childPrefix = prefix + (isLast ? '    ' : '│   ');

  if (tree.type === 'directory') {
    output += `${prefix}${connector}📁 ${tree.name}/\n`;
    if (tree.children && tree.children.length > 0) {
      tree.children.forEach((child, index) => {
        output += generateTreeMarkdown(child, childPrefix, index === tree.children.length - 1, false);
      });
    }
  } else {
    const icon = getFileIcon(tree.extension);
    output += `${prefix}${connector}${icon} ${tree.name}\n`;
  }

  return output;
}

function getFileIcon(ext) {
  const icons = {
    '.ts': '📘', '.tsx': '⚛️', '.js': '📜', '.jsx': '⚛️',
    '.json': '📋', '.md': '📝', '.css': '🎨', '.scss': '🎨',
    '.html': '🌐', '.svg': '🖼️', '.png': '🖼️', '.jpg': '🖼️', '.jpeg': '🖼️',
    '.yml': '⚙️', '.yaml': '⚙️', '.toml': '⚙️', '.ini': '⚙️', '.env': '⚙️',
    '.sh': '💻', '.py': '🐍', '.rs': '🦀', '.go': '🐹',
    '.java': '☕', '.cs': '🔷', '.php': '🐘', '.rb': '💎'
  };
  return (ext && icons[ext.toLowerCase()]) || '📄';
}

/**
 * Analyzes module boundaries and architectural patterns from tree
 */
function analyzeModuleBoundaries(tree) {
  const boundaries = {
    layers: [],
    importPatterns: [],
    conventions: []
  };

  const layerPatterns = [
    { pattern: /(?:^|\/)(?:src\/)?components\/ui(?:\/|$)/, layer: 'UI Primitives', description: 'Shared reusable design system components' },
    { pattern: /(?:^|\/)(?:src\/)?(?:components\/layout|layouts)(?:\/|$)/, layer: 'Layout', description: 'Page layout and structural shell components' },
    { pattern: /(?:^|\/)(?:src\/)?(?:features|modules)(?:\/|$)/, layer: 'Features', description: 'Domain-specific modular feature components and logic' },
    { pattern: /(?:^|\/)(?:src\/)?hooks(?:\/|$)/, layer: 'Hooks', description: 'Shared custom React hooks' },
    { pattern: /(?:^|\/)(?:src\/)?(?:stores|store)(?:\/|$)/, layer: 'Stores', description: 'Global state management (Zustand/Redux)' },
    { pattern: /(?:^|\/)(?:src\/)?(?:services|api)(?:\/|$)/, layer: 'Services', description: 'API clients, HTTP interceptors, and external service integrations' },
    { pattern: /(?:^|\/)(?:src\/)?(?:types|interfaces|models)(?:\/|$)/, layer: 'Types', description: 'TypeScript data models and type definitions' },
    { pattern: /(?:^|\/)(?:src\/)?(?:utils|lib|helpers)(?:\/|$)/, layer: 'Utilities', description: 'Shared helper functions and utility libraries' },
    { pattern: /(?:^|\/)(?:src\/)?(?:providers|contexts)(?:\/|$)/, layer: 'Providers', description: 'React context providers and app-wide wrappers' },
    { pattern: /(?:^|\/)(?:src\/)?(?:routes|pages|app)(?:\/|$)/, layer: 'Routing', description: 'Page routes, layout shells, and navigation configuration' }
  ];

  function analyzeNode(node) {
    if (node.type === 'directory') {
      const relPath = (node.relativePath || '').replace(/\\/g, '/');

      for (const { pattern, layer, description } of layerPatterns) {
        if (pattern.test(relPath)) {
          let layerObj = boundaries.layers.find(l => l.name === layer);
          if (!layerObj) {
            layerObj = { name: layer, description, paths: [] };
            boundaries.layers.push(layerObj);
          }
          if (relPath && !layerObj.paths.includes(relPath)) {
            layerObj.paths.push(relPath);
          }
        }
      }

      if (node.children) {
        node.children.forEach(child => analyzeNode(child));
      }
    }
  }

  analyzeNode(tree);

  // Dynamic import patterns based on detected or standard layers
  boundaries.importPatterns = [
    { from: 'Features', allowedImports: ['UI Primitives', 'Hooks', 'Stores', 'Services', 'Types', 'Utilities'], aliasPattern: '@/features/*' },
    { from: 'UI Primitives', allowedImports: ['Utilities', 'Types'], aliasPattern: '@/components/ui/*' },
    { from: 'Layout', allowedImports: ['UI Primitives', 'Hooks', 'Stores', 'Types', 'Utilities'], aliasPattern: '@/layouts/*' },
    { from: 'Stores', allowedImports: ['Services', 'Types'], aliasPattern: '@/stores/*' },
    { from: 'Services', allowedImports: ['Types'], aliasPattern: '@/services/*' },
    { from: 'Hooks', allowedImports: ['Services', 'Stores', 'Types', 'Utilities'], aliasPattern: '@/hooks/*' }
  ];

  // Architectural conventions and boundary rules
  boundaries.conventions = [
    { rule: 'Absolute imports with @/ alias', pattern: '@/...', description: 'Configured in tsconfig.json paths' },
    { rule: 'Relative imports for same feature', pattern: './..., ../...', description: 'Within same feature folder' },
    { rule: 'No cross-feature imports', pattern: 'features/*/features/*', description: 'Features must not import directly from other features; use shared services/stores instead' },
    { rule: 'UI primitives from components/ui', pattern: '@/components/ui', description: 'Shared atomic components only' },
    { rule: 'Types from types/ or feature types/', pattern: '@/types, @/features/*/types', description: 'Shared or feature-scoped TypeScript definitions' },
    { rule: 'Stores from stores/', pattern: '@/stores, @/features/*/stores', description: 'Global and feature state management' },
    { rule: 'API calls from services/ or feature api/', pattern: '@/services, @/features/*/api', description: 'Centralized network and data fetching logic' }
  ];

  return boundaries;
}

module.exports = { scanDirectory, generateTreeMarkdown, analyzeModuleBoundaries };