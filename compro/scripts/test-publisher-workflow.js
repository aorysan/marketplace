const fs = require('fs');
const path = require('path');

const deployScriptPath = path.join(__dirname, '..', 'skills', 'publisher', 'scripts', 'deploy.js');
const skillPath = path.join(__dirname, '..', 'skills', 'publisher', 'SKILL.md');

if (!fs.existsSync(deployScriptPath) || !fs.existsSync(skillPath)) {
  console.error('FAIL: publisher script or SKILL.md missing');
  process.exit(1);
}

const deployScript = fs.readFileSync(deployScriptPath, 'utf-8');
const skillContent = fs.readFileSync(skillPath, 'utf-8');

// Check deploy.js has live GET check, preview domain regex, and clean deploy
if (!deployScript.includes('https.get') && !deployScript.includes('http')) {
  console.error('FAIL: deploy.js missing live HTTP GET 200 accessibility check');
  process.exit(1);
}

if (!deployScript.includes('vercel.app')) {
  console.error('FAIL: deploy.js missing specific vercel.app domain regex');
  process.exit(1);
}

// deploy.js must spawn the vercel binary per-platform: hardcoding cmd.exe made
// every deploy fail with ENOENT on macOS/Linux, and calling the Windows shim
// without cmd.exe fails on Windows.
if (!/process\.platform\s*===\s*'win32'/.test(deployScript)) {
  console.error("FAIL: deploy.js must branch on process.platform === 'win32' before spawning vercel");
  process.exit(1);
}
if (/spawnSync\(\s*'cmd\.exe'/.test(deployScript) && !/process\.platform\s*===\s*'win32'\s*\n?\s*\?/.test(deployScript)) {
  console.error('FAIL: deploy.js spawns cmd.exe unconditionally (POSIX regression)');
  process.exit(1);
}

// Check SKILL.md has User Confirmation Gate and SEO Auto-Fix
if (!skillContent.includes('Auto-Fix') || !skillContent.includes('Konfirmasi') || !skillContent.includes('User Confirmation')) {
  console.error('FAIL: SKILL.md missing Auto-Fix or User Confirmation Gate documentation');
  process.exit(1);
}

// Check SKILL.md references consolidated paths
const pathChecks = [
  'compros/<slug>/index.html',
  'compros/<slug>/reports/seo-report.md'
];

for (const p of pathChecks) {
  if (!skillContent.includes(p)) {
    console.error(`FAIL: publisher SKILL.md missing consolidated path reference to "${p}"`);
    process.exit(1);
  }
}

console.log('PASS: publisher and deploy.js contain SEO Auto-Fix, confirmation gate, GET 200 check, and consolidated paths');
process.exit(0);
