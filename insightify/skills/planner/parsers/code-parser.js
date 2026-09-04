const { extractAst } = require('./ast-extractor');

function parseCode(codeString, lang) {
  const comments = [];
  const extracted = {
    interfaces: [],
    types: [],
    enums: [],
    jsxComponents: [],
    hooks: [],
    imports: [],
    comments: []
  };

  // 1. Match JSDoc /** ... */
  const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;
  let match;
  while ((match = jsdocRegex.exec(codeString)) !== null) {
    const cleaned = match[1].replace(/^\s*\* ?/gm, '').trim();
    if (cleaned) comments.push(cleaned);
  }

  // 2. Match Python triple quote docstrings """ ... """ and ''' ... '''
  if (lang === 'py' || lang === 'python') {
    const pyDoubleRegex = /"""([\s\S]*?)"""/g;
    while ((match = pyDoubleRegex.exec(codeString)) !== null) {
      const cleaned = match[1].trim();
      if (cleaned) comments.push(cleaned);
    }
    const pySingleRegex = /'''([\s\S]*?)'''/g;
    while ((match = pySingleRegex.exec(codeString)) !== null) {
      const cleaned = match[1].trim();
      if (cleaned) comments.push(cleaned);
    }
  }

  // 3. TypeScript / JavaScript extraction
  if (['ts', 'tsx', 'js', 'jsx', 'javascript', 'typescript'].includes(lang)) {
    // Helper to find matching closing brace accounting for comments, strings, and regex literals
    function extractBraceContent(str, openBraceIndex) {
      let depth = 0;
      let inString = null;
      let inLineComment = false;
      let inBlockComment = false;
      let inRegex = false;

      for (let i = openBraceIndex; i < str.length; i++) {
        const char = str[i];
        const next = str[i + 1];

        if (inLineComment) {
          if (char === '\n') inLineComment = false;
          continue;
        }
        if (inBlockComment) {
          if (char === '*' && next === '/') {
            inBlockComment = false;
            i++;
          }
          continue;
        }
        if (inString) {
          if (char === '\\') {
            i++; // skip escaped character
          } else if (char === inString) {
            inString = null;
          }
          continue;
        }
        if (inRegex) {
          if (char === '\\') {
            i++; // skip escaped character in regex
          } else if (char === '/') {
            inRegex = false;
          } else if (char === '\n') {
            inRegex = false;
          }
          continue;
        }

        if (char === '/' && next === '/') {
          inLineComment = true;
          i++;
          continue;
        }
        if (char === '/' && next === '*') {
          inBlockComment = true;
          i++;
          continue;
        }
        // Regex literal check: starts with / preceded by operators, punctuation, or block start
        if (char === '/') {
          let prevChar = '';
          for (let j = i - 1; j >= openBraceIndex; j--) {
            if (!/\s/.test(str[j])) {
              prevChar = str[j];
              break;
            }
          }
          if (!prevChar || /[=:(,;[?!&|{+\-*%^~]/.test(prevChar)) {
            inRegex = true;
            continue;
          }
        }
        if (char === '"' || char === "'" || char === '`') {
          inString = char;
          continue;
        }

        if (char === '{') {
          depth++;
        } else if (char === '}') {
          depth--;
          if (depth === 0) {
            return {
              body: str.substring(openBraceIndex + 1, i),
              endIndex: i
            };
          }
        }
      }
      return null;
    }

    // Imports: handles multiline, default, named, mixed, namespace, type-only, side-effect
    const importRegex = /(?:^|\n)\s*import\s+(?:(type)\s+)?(?:([A-Za-z0-9_$]+)\s*,\s*)?(?:\{([^}]+)\}|\*\s+as\s+([A-Za-z0-9_$]+)|([A-Za-z0-9_$]+))?\s*(?:from\s+)?['"]([^'"]+)['"]/g;
    while ((match = importRegex.exec(codeString)) !== null) {
      const isType = !!match[1];
      const defaultExport = match[2] || match[5] || null;
      const namedRaw = match[3];
      const namespace = match[4] || null;
      const source = match[6];

      const named = namedRaw
        ? namedRaw.split(',').map(s => s.trim().replace(/\s+as\s+.+/, '').trim()).filter(Boolean)
        : [];

      extracted.imports.push({
        source,
        default: defaultExport,
        named,
        namespace,
        isType
      });
    }

    // Interfaces: captures full signature including generics and extends clauses
    const interfaceHeaderRegex = /(?:^|\n)\s*(?:export\s+)?interface\s+(([A-Za-z0-9_$]+)(?:<[^>]*>)?(?:\s+extends\s+[^{]+)?)\s*\{/g;
    while ((match = interfaceHeaderRegex.exec(codeString)) !== null) {
      const signature = match[1].trim();
      const name = match[2].trim();
      const openBraceIdx = interfaceHeaderRegex.lastIndex - 1;
      const block = extractBraceContent(codeString, openBraceIdx);
      if (block) {
        extracted.interfaces.push({
          name,
          signature,
          body: block.body.trim()
        });
        interfaceHeaderRegex.lastIndex = block.endIndex + 1;
      }
    }

    // Helper to find type definition body accounting for nested braces, brackets, parens, and comments
    function extractTypeDefinition(str, startIndex) {
      let depth = 0;
      let inString = null;
      let inLineComment = false;
      let inBlockComment = false;

      for (let i = startIndex; i < str.length; i++) {
        const char = str[i];
        const next = str[i + 1];

        if (inLineComment) {
          if (char === '\n') inLineComment = false;
          continue;
        }
        if (inBlockComment) {
          if (char === '*' && next === '/') {
            inBlockComment = false;
            i++;
          }
          continue;
        }
        if (inString) {
          if (char === '\\') {
            i++;
          } else if (char === inString) {
            inString = null;
          }
          continue;
        }

        if (char === '/' && next === '/') {
          inLineComment = true;
          i++;
          continue;
        }
        if (char === '/' && next === '*') {
          inBlockComment = true;
          i++;
          continue;
        }
        if (char === '"' || char === "'" || char === '`') {
          inString = char;
          continue;
        }

        if (char === '{' || char === '(' || char === '<' || char === '[') {
          depth++;
        } else if (char === '}' || char === ')' || char === '>' || char === ']') {
          if (depth > 0) depth--;
        } else if (char === ';' && depth === 0) {
          return {
            definition: str.substring(startIndex, i).trim(),
            endIndex: i
          };
        }
      }

      const remaining = str.substring(startIndex).trim();
      if (remaining) {
        return {
          definition: remaining.replace(/;$/, '').trim(),
          endIndex: str.length
        };
      }
      return null;
    }

    // Types: captures full signature including generics
    const typeHeaderRegex = /(?:^|\n)\s*(?:export\s+)?type\s+(([A-Za-z0-9_$]+)(?:<[^>]*>)?)\s*=\s*/g;
    while ((match = typeHeaderRegex.exec(codeString)) !== null) {
      const signature = match[1].trim();
      const name = match[2].trim();
      const block = extractTypeDefinition(codeString, typeHeaderRegex.lastIndex);
      if (block) {
        extracted.types.push({
          name,
          signature,
          definition: block.definition
        });
        typeHeaderRegex.lastIndex = block.endIndex + 1;
      }
    }

    // Enums: captures regular enum and const enum
    const enumHeaderRegex = /(?:^|\n)\s*(?:export\s+)?(?:const\s+)?enum\s+(([A-Za-z0-9_$]+))\s*\{/g;
    while ((match = enumHeaderRegex.exec(codeString)) !== null) {
      const name = match[2].trim();
      const openBraceIdx = enumHeaderRegex.lastIndex - 1;
      const block = extractBraceContent(codeString, openBraceIdx);
      if (block) {
        extracted.enums.push({
          name,
          members: block.body.trim()
        });
        enumHeaderRegex.lastIndex = block.endIndex + 1;
      }
    }

    // React Components (PascalCase identifiers)
    const arrowComponentRegex = /(?:^|\n)\s*(?:export\s+)?(?:const|let|var)\s+([A-Z][A-Za-z0-9_$]*)\s*(?::\s*[^=]+)?\s*=\s*(?:React\.)?(?:memo|forwardRef)?\s*\(?(?:\([^)]*\)|[A-Za-z0-9_$,\s{}]+)?\s*(?::\s*[^=>]+)?\s*=>/g;
    while ((match = arrowComponentRegex.exec(codeString)) !== null) {
      const name = match[1];
      if (!extracted.jsxComponents.includes(name) && !extracted.hooks.includes(name)) {
        extracted.jsxComponents.push(name);
      }
    }

    const hocComponentRegex = /(?:^|\n)\s*(?:export\s+)?(?:const|let|var)\s+([A-Z][A-Za-z0-9_$]*)\s*=\s*(?:React\.)?(?:memo|forwardRef)\s*\(/g;
    while ((match = hocComponentRegex.exec(codeString)) !== null) {
      const name = match[1];
      if (!extracted.jsxComponents.includes(name)) {
        extracted.jsxComponents.push(name);
      }
    }

    const funcComponentRegex = /(?:^|\n)\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Z][A-Za-z0-9_$]*)\s*\(/g;
    while ((match = funcComponentRegex.exec(codeString)) !== null) {
      const name = match[1];
      if (!extracted.jsxComponents.includes(name)) {
        extracted.jsxComponents.push(name);
      }
    }

    // Hooks: useXxx (function declarations & arrow functions)
    const hookFuncRegex = /(?:^|\n)\s*(?:export\s+)?(?:async\s+)?function\s+(use[A-Z][A-Za-z0-9_$]*)\s*\(/g;
    while ((match = hookFuncRegex.exec(codeString)) !== null) {
      const name = match[1];
      if (!extracted.hooks.includes(name)) {
        extracted.hooks.push(name);
      }
    }

    const hookArrowRegex = /(?:^|\n)\s*(?:export\s+)?(?:const|let|var)\s+(use[A-Z][A-Za-z0-9_$]*)\s*=/g;
    while ((match = hookArrowRegex.exec(codeString)) !== null) {
      const name = match[1];
      if (!extracted.hooks.includes(name)) {
        extracted.hooks.push(name);
      }
    }
  }

  extracted.comments = comments;

  // Build markdown representation strictly for interfaces, types, enums, components, hooks, imports
  let output = comments.join('\n\n');
  const hasDefinitions = extracted.interfaces.length > 0 || extracted.types.length > 0 || 
                         extracted.enums.length > 0 || extracted.jsxComponents.length > 0 || 
                         extracted.hooks.length > 0;
  
  if (!output && !hasDefinitions) {
      output = codeString;
  }

  if (extracted.interfaces.length > 0) {
    output += '\n\n## Interfaces\n';
    extracted.interfaces.forEach(i => {
      output += `\n### ${i.name}\n\`\`\`typescript\ninterface ${i.signature} {\n${i.body}\n}\n\`\`\``;
    });
  }

  if (extracted.types.length > 0) {
    output += '\n\n## Types\n';
    extracted.types.forEach(t => {
      output += `\n### ${t.name}\n\`\`\`typescript\ntype ${t.signature} = ${t.definition};\n\`\`\``;
    });
  }

  if (extracted.enums.length > 0) {
    output += '\n\n## Enums\n';
    extracted.enums.forEach(e => {
      output += `\n### ${e.name}\n\`\`\`typescript\nenum ${e.name} {\n${e.members}\n}\n\`\`\``;
    });
  }

  if (extracted.jsxComponents.length > 0) {
    output += '\n\n## React Components\n';
    extracted.jsxComponents.forEach(c => {
      output += `\n- \`${c}\``;
    });
  }

  if (extracted.hooks.length > 0) {
    output += '\n\n## Hooks\n';
    extracted.hooks.forEach(h => {
      output += `\n- \`${h}\``;
    });
  }

  if (extracted.imports.length > 0) {
    output += '\n\n## Imports\n';
    extracted.imports.forEach(i => {
      const parts = [];
      if (i.isType) parts.push('type');
      if (i.namespace) parts.push(`* as ${i.namespace}`);
      if (i.default) parts.push(i.default);
      if (i.named.length > 0) parts.push(`{ ${i.named.join(', ')} }`);
      const specifier = parts.join(' ');
      output += `\n- From \`${i.source}\`${specifier ? ': ' + specifier : ''}`;
    });
  }

  const astResult = extractAst(codeString, lang);
  if (astResult.status === 'success' && (astResult.imports.length > 0 || astResult.exports.length > 0)) {
      output += '\n\n<ast-dependencies>\n';
      output += JSON.stringify({ imports: astResult.imports, exports: astResult.exports }, null, 2);
      output += '\n</ast-dependencies>';
  }

  return output;
}

module.exports = { parseCode };
