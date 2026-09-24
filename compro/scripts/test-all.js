const { execSync } = require('child_process');
const path = require('path');

const testScripts = [
  'validate-manifest.js',
  'test-writer-schema.js',
  'test-reviewer-schema.js',
  'test-builder-inlining.js',
  'test-publisher-workflow.js',
  'test-orchestrator.js',
  'test-theme-dispatch.js',
  'test-template-bundle.js',
  'test-slide-structure.js',
  'test-asset-pipeline.js',
  'test-modern-theme-files.js',
  'test-modern-render.js',
  'test-modern-golden.js',
  'test-density-split.js',
  'test-density-e2e.js'
];

console.log('--- Running Layer 3 Compro Plugin Verification Suite ---');

// Offline for tests: skip live web image search so the suite stays hermetic
// and does not burn Openverse anonymous rate limits (20/min).
const testEnv = { ...process.env, COMPRO_OFFLINE: '1' };

for (const script of testScripts) {
  const scriptPath = path.join(__dirname, script);
  console.log(`\n[RUN] ${script}...`);
  try {
    const output = execSync(`node "${scriptPath}"`, { encoding: 'utf-8', env: testEnv });
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
