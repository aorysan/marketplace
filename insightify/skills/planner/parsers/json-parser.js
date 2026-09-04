function stripJsonComments(str) {
  let result = '';
  let inString = false;
  let inSingleComment = false;
  let inMultiComment = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const next = str[i + 1];

    if (inSingleComment) {
      if (char === '\n' || char === '\r') {
        inSingleComment = false;
        result += char;
      }
      continue;
    }

    if (inMultiComment) {
      if (char === '*' && next === '/') {
        inMultiComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      result += char;
      if (char === '\\') {
        if (i + 1 < str.length) {
          result += str[i + 1];
          i++;
        }
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    // Outside string
    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    if (char === '/' && next === '/') {
      inSingleComment = true;
      i++;
      continue;
    }

    if (char === '/' && next === '*') {
      inMultiComment = true;
      i++;
      continue;
    }

    result += char;
  }

  return stripTrailingCommas(result);
}

function stripTrailingCommas(str) {
  let result = '';
  let inString = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (inString) {
      result += char;
      if (char === '\\') {
        if (i + 1 < str.length) {
          result += str[i + 1];
          i++;
        }
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    if (char === ',') {
      // Lookahead for next non-whitespace character
      let nextNonWs = '';
      for (let j = i + 1; j < str.length; j++) {
        if (!/\s/.test(str[j])) {
          nextNonWs = str[j];
          break;
        }
      }
      if (nextNonWs === '}' || nextNonWs === ']') {
        continue; // Skip trailing comma
      }
    }

    result += char;
  }

  return result;
}

function parseJson(jsonString, lang) {
  try {
    const cleanJson = stripJsonComments(jsonString);
    const data = JSON.parse(cleanJson);
    const extracted = {
      dependencies: [],
      devDependencies: [],
      peerDependencies: [],
      scripts: [],
      compilerOptions: {}
    };

    if (data.dependencies) {
      extracted.dependencies = Object.entries(data.dependencies).map(([k, v]) => `${k}: ${v}`);
    }
    if (data.devDependencies) {
      extracted.devDependencies = Object.entries(data.devDependencies).map(([k, v]) => `${k}: ${v}`);
    }
    if (data.peerDependencies) {
      extracted.peerDependencies = Object.entries(data.peerDependencies).map(([k, v]) => `${k}: ${v}`);
    }
    if (data.scripts) {
      extracted.scripts = Object.entries(data.scripts).map(([k, v]) => `${k}: ${v}`);
    }
    if (data.compilerOptions) {
      extracted.compilerOptions = data.compilerOptions;
    }

    // Build output strictly containing dependencies, scripts, compiler options
    let output = '';

    if (extracted.dependencies.length > 0) {
      output += `## Dependencies\n`;
      extracted.dependencies.forEach(d => output += `- ${d}\n`);
      output += '\n';
    }

    if (extracted.devDependencies.length > 0) {
      output += `## Dev Dependencies\n`;
      extracted.devDependencies.forEach(d => output += `- ${d}\n`);
      output += '\n';
    }

    if (extracted.peerDependencies.length > 0) {
      output += `## Peer Dependencies\n`;
      extracted.peerDependencies.forEach(d => output += `- ${d}\n`);
      output += '\n';
    }

    if (extracted.scripts.length > 0) {
      output += `## Scripts\n`;
      extracted.scripts.forEach(s => output += `- ${s}\n`);
      output += '\n';
    }

    if (Object.keys(extracted.compilerOptions).length > 0) {
      output += `## TypeScript Compiler Options\n\`\`\`json\n${JSON.stringify(extracted.compilerOptions, null, 2)}\n\`\`\`\n\n`;
    }

    const finalOutput = output.trim();
    if (!finalOutput) {
      return `## JSON Data\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    }
    return finalOutput;
  } catch (e) {
    return `# JSON Parse Error\n\n\`\`\`json\n${jsonString}\n\`\`\`\n\nError: ${e.message}`;
  }
}

module.exports = { parseJson };