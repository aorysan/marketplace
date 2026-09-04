const { execSync } = require('child_process');
const path = require('path');

const testScripts = [
  'validate-manifest.js',
  'test-writer-schema.js',
  'test-reviewer-schema.js',
  'test-builder-inlining.js',
  'test-publisher-workflow.js',
  'test-orchestrator.js'
];

console.log('--- Running Layer 3 Compro Plugin Verification Suite ---');

for (const script of testScripts) {
  const scriptPath = path.join(__dirname, script);
  console.log(`\n[RUN] ${script}...`);
  try {
    const output = execSync(`node ${scriptPath}`, { encoding: 'utf-8' });
    process.stdout.write(output);
  } catch (err) {
    console.error(`[FAIL] ${script}`);
    console.error(err.stdout || err.message);
    process.exit(1);
  }
}

console.log('\n========================================');
console.log('ALL TESTS PASSED! Layer 3 is fully compliant.');
console.log('========================================');
process.exit(0);
