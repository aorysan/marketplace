const { describe, test, after } = require('node:test');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

// The verifier is ESM, so it is loaded dynamically like the other .mjs modules.
const loadVerifier = () => import('../scripts/verify-output.mjs');

const DOC = [
  '# Verify Project - Product Knowledge Base',
  '',
  '## Ringkasan Produk',
  'Isi section produk.',
  '',
  '## Arsitektur Sistem',
  'Isi section arsitektur.',
  '',
  '## Batasan dan Limitasi',
  'Isi section batasan.',
  ''
].join('\n');

describe('Output Verifier (scripts/verify-output.mjs)', () => {
  const tmpDir = path.join(__dirname, '.tmp-verify');

  after(() => {
    if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const fileIn = (dir, rel, content) => {
    const target = path.join(dir, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
    return target;
  };

  // Produces a complete OUT_DIR shaped like a real pipeline run.
  const setupOutput = async (dir) => {
    const { buildArtifact } = await import('../skills/builder/templates/build-html.mjs');

    ['product', 'architecture', 'constraints-and-limits'].forEach((category) => {
      fileIn(dir, `.insightify/knowledge/${category}.md`, [
        '---',
        `category: "${category}"`,
        'name: "Verify Project"',
        'confidence: "high"',
        '---',
        '',
        `# ${category}`,
        'Fakta hasil ekstraksi.',
        '',
        '> **Source:** source-001.md § Overview',
        ''
      ].join('\n'));
    });

    fileIn(dir, 'docs/final/final-documentation.md', DOC);
    fileIn(dir, 'docs/markdown/documentation.md', DOC);
    fileIn(dir, '.insightify/plan.md', ['---', 'total_sections: 3', '---', '', '# Plan', ''].join('\n'));
    fileIn(dir, '.insightify/sources/manifest.md', '# Sources\n');

    buildArtifact({
      outDir: dir,
      kbDir: path.join(dir, '.insightify/knowledge'),
      docPath: path.join(dir, 'docs/final/final-documentation.md'),
      insightifyVersion: '6.4.1'
    });
  };

  test('passes a complete, clean output', async () => {
    const { verifyOutput } = await loadVerifier();
    const dir = path.join(tmpDir, 'valid');
    await setupOutput(dir);

    const result = verifyOutput(dir);
    const failed = result.failures.map((item) => item.name);

    assert.deepStrictEqual(failed, [], `check gagal: ${failed.join(', ')}`);
    assert.strictEqual(result.passed, true);
    assert.strictEqual(
      result.checks.filter((item) => item.name === 'parity jumlah section (dokumen = knowledge base)')[0].ok,
      true,
      'parity dokumen dan knowledge base harus lulus'
    );
  });

  test('rejects an output that leaks source citations to the client', async () => {
    const { verifyOutput } = await loadVerifier();
    const dir = path.join(tmpDir, 'with-citation');
    await setupOutput(dir);
    fs.appendFileSync(path.join(dir, 'Product-Knowledge-Base.md'), '\n> **Source:** source-001.md § Overview\n');

    const result = verifyOutput(dir);

    assert.strictEqual(result.passed, false, 'sitasi bocor harus ditolak');
    assert.ok(
      result.failures.some((item) => item.name === 'output klien bebas sitasi'),
      'harus menandai check sitasi sebagai gagal'
    );
  });

  test('rejects an output whose HTML lost a section anchor', async () => {
    const { verifyOutput } = await loadVerifier();
    const dir = path.join(tmpDir, 'missing-anchor');
    await setupOutput(dir);

    const htmlPath = path.join(dir, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    fs.writeFileSync(htmlPath, html.replace('<section id="arsitektur-sistem"', '<section id="removed"'), 'utf8');

    const result = verifyOutput(dir);

    assert.strictEqual(result.passed, false, 'anchor hilang harus ditolak');
    assert.ok(
      result.failures.some((item) => item.name === 'setiap section punya anchor di HTML'),
      'harus menandai check anchor sebagai gagal'
    );
  });

  test('rejects an output whose plan contradicts the document', async () => {
    const { verifyOutput } = await loadVerifier();
    const dir = path.join(tmpDir, 'plan-mismatch');
    await setupOutput(dir);
    fileIn(dir, '.insightify/plan.md', ['---', 'total_sections: 9', '---', '', '# Plan', ''].join('\n'));

    const result = verifyOutput(dir);

    assert.strictEqual(result.passed, false, 'plan yang tidak sinkron harus ditolak');
    assert.ok(
      result.failures.some((item) => item.name === 'plan total_sections = jumlah section dokumen'),
      'harus menandai check plan sebagai gagal'
    );
  });
});
