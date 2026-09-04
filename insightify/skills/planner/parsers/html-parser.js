const cheerio = require('cheerio');

function parseHtml(htmlString) {
  const $ = cheerio.load(htmlString);
  $('nav, footer, script, style, .ads, .sidebar').remove();
  $('body > header').remove();

  const title = $('h1').first().text().trim() || $('title').text().trim() || 'Untitled Page';
  const $content = $('main, article, body').first();

  const md = convertNode($, $content, 0);
  const cleaned = md
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return `# ${title}\n\n${cleaned}`;
}

function convertNode($, $el, depth) {
  let result = '';

  $el.contents().each((_, node) => {
    if (node.type === 'text') {
      const text = $(node).text();
      if (text.trim()) {
        result += text.replace(/\s+/g, ' ');
      }
      return;
    }

    if (node.type !== 'tag') return;

    const $node = $(node);
    const tag = node.tagName.toLowerCase();

    // Headings
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1], 10);
      const text = $node.text().trim();
      if (text) {
        result += `\n\n${'#'.repeat(level)} ${text}\n\n`;
      }
      return;
    }

    // Paragraphs
    if (tag === 'p') {
      const inner = convertInline($, $node);
      if (inner.trim()) {
        result += `\n\n${inner.trim()}\n\n`;
      }
      return;
    }

    // Code blocks (pre > code)
    if (tag === 'pre') {
      const $code = $node.find('code').first();
      const codeText = $code.length ? $code.text() : $node.text();
      const langClass = $code.attr('class') || '';
      const langMatch = langClass.match(/language-(\w+)/);
      const lang = langMatch ? langMatch[1] : '';
      result += `\n\n\`\`\`${lang}\n${codeText}\n\`\`\`\n\n`;
      return;
    }

    // Unordered lists
    if (tag === 'ul') {
      result += '\n';
      $node.children('li').each((_, li) => {
        const inner = convertListItem($, $(li), depth, '-');
        result += inner;
      });
      result += '\n';
      return;
    }

    // Ordered lists
    if (tag === 'ol') {
      result += '\n';
      $node.children('li').each((i, li) => {
        const inner = convertListItem($, $(li), depth, `${i + 1}.`);
        result += inner;
      });
      result += '\n';
      return;
    }

    // Tables
    if (tag === 'table') {
      result += '\n' + convertTable($, $node) + '\n';
      return;
    }

    // Images
    if (tag === 'img') {
      const alt = $node.attr('alt') || '';
      const src = $node.attr('src') || '';
      if (src) {
        result += `![${alt}](${src})`;
      }
      return;
    }

    // Divs and other containers — recurse
    result += convertNode($, $node, depth);
  });

  return result;
}

function convertInline($, $el) {
  let result = '';

  $el.contents().each((_, node) => {
    if (node.type === 'text') {
      result += $(node).text().replace(/\s+/g, ' ');
      return;
    }

    if (node.type !== 'tag') return;

    const $node = $(node);
    const tag = node.tagName.toLowerCase();

    if (tag === 'strong' || tag === 'b') {
      result += `**${$node.text().trim()}**`;
    } else if (tag === 'em' || tag === 'i') {
      result += `*${$node.text().trim()}*`;
    } else if (tag === 'code') {
      result += `\`${$node.text()}\``;
    } else if (tag === 'a') {
      const href = $node.attr('href') || '';
      const text = $node.text().trim();
      result += `[${text}](${href})`;
    } else if (tag === 'img') {
      const alt = $node.attr('alt') || '';
      const src = $node.attr('src') || '';
      result += `![${alt}](${src})`;
    } else if (tag === 'br') {
      result += '\n';
    } else {
      result += convertInline($, $node);
    }
  });

  return result;
}

function convertListItem($, $li, depth, marker) {
  const indent = '  '.repeat(depth);
  let text = '';
  let sublist = '';

  $li.contents().each((_, node) => {
    if (node.type === 'text') {
      text += $(node).text().replace(/\s+/g, ' ').trim();
      return;
    }
    if (node.type !== 'tag') return;

    const tag = node.tagName.toLowerCase();
    if (tag === 'ul' || tag === 'ol') {
      const $sub = $(node);
      const subMarker = tag === 'ul' ? '-' : null;
      $sub.children('li').each((i, subLi) => {
        const m = subMarker || `${i + 1}.`;
        sublist += convertListItem($, $(subLi), depth + 1, m);
      });
    } else {
      text += convertInline($, $(node));
    }
  });

  let result = `${indent}${marker} ${text.trim()}\n`;
  if (sublist) {
    result += sublist;
  }
  return result;
}

function convertTable($, $table) {
  const rows = [];
  $table.find('tr').each((_, tr) => {
    const cells = [];
    $(tr).find('th, td').each((__, cell) => {
      cells.push($(cell).text().trim().replace(/\|/g, '\\|'));
    });
    rows.push(cells);
  });

  if (rows.length === 0) return '';

  const header = rows[0];
  const separator = header.map(() => '---');
  const dataRows = rows.slice(1);

  let md = `| ${header.join(' | ')} |\n`;
  md += `| ${separator.join(' | ')} |\n`;
  for (const row of dataRows) {
    // Pad row to header length
    while (row.length < header.length) row.push('');
    md += `| ${row.join(' | ')} |\n`;
  }

  return md;
}

module.exports = { parseHtml };
