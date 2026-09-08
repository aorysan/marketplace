function parseDeclarations(text) {
  const declarations = [];
  const declRegex = /(?:^|[;{])\s*([a-zA-Z-]+)\s*:\s*([^;]+)/g;
  let match;
  while ((match = declRegex.exec(text)) !== null) {
    declarations.push({ property: match[1].trim(), value: match[2].trim() });
  }
  return declarations;
}

function toHexChannel(value) {
  const n = Math.max(0, Math.min(255, Math.round(Number(value))));
  return n.toString(16).padStart(2, '0');
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

function colorToHex(raw) {
  const value = raw.trim();

  const hexMatch = value.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return '#' + hex.split('').map(c => c + c).join('').toLowerCase();
    }
    return '#' + hex.toLowerCase();
  }

  const rgbMatch = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d*\.?\d+)\s*)?\)$/i);
  if (rgbMatch) {
    let hex = '#' + toHexChannel(rgbMatch[1]) + toHexChannel(rgbMatch[2]) + toHexChannel(rgbMatch[3]);
    if (rgbMatch[4] !== undefined) {
      hex += toHexChannel(Math.round(Number(rgbMatch[4]) * 255));
    }
    return hex;
  }

  const hslMatch = value.match(/^hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*(\d*\.?\d+)\s*)?\)$/i);
  if (hslMatch) {
    const [r, g, b] = hslToRgb(Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3]));
    let hex = '#' + toHexChannel(r) + toHexChannel(g) + toHexChannel(b);
    if (hslMatch[4] !== undefined) {
      hex += toHexChannel(Math.round(Number(hslMatch[4]) * 255));
    }
    return hex;
  }

  return null;
}

function collectFromValue(value, add) {
  const patterns = [
    /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?!\w)/g,
    /rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[\d.]+\s*)?\)/gi,
    /hsla?\(\s*\d{1,3}(?:\.\d+)?\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*[\d.]+\s*)?\)/gi
  ];
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(value)) !== null) {
      add(match[0]);
    }
  }
}

function extractColors($) {
  if (typeof $ !== 'function') return [];
  try {
    const entries = new Map();
    const add = (raw) => {
      const hex = colorToHex(raw);
      if (hex && !entries.has(hex)) {
        entries.set(hex, { color: raw.trim(), hex });
      }
    };

    $('style').each((_, el) => {
      const css = $(el).text() || '';
      parseDeclarations(css).forEach(decl => collectFromValue(decl.value, add));
    });

    $('*[style]').each((_, el) => {
      const attr = $(el).attr('style') || '';
      parseDeclarations(attr).forEach(decl => collectFromValue(decl.value, add));
    });

    return Array.from(entries.values());
  } catch {
    return [];
  }
}

function renderColorsSection(colors) {
  if (!colors.length) return '';
  const rows = colors.map(c => `| ${c.color} | ${c.hex} |`).join('\n');
  return `\n\n## Colors\n\n| Color | Hex |\n|-------|-----|\n${rows}`;
}

module.exports = { extractColors, renderColorsSection };
