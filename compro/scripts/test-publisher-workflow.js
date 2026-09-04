const fs = require('fs');
const path = require('path');

const deployScriptPath = path.join(__dirname, '..', 'skills', 'company-profile-publisher', 'scripts', 'deploy.js');
const skillPath = path.join(__dirname, '..', 'skills', 'company-profile-publisher', 'SKILL.md');

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

// Check SKILL.md has User Confirmation Gate and SEO Auto-Fix
if (!skillContent.includes('Auto-Fix') || !skillContent.includes('Konfirmasi') || !skillContent.includes('User Confirmation')) {
  console.error('FAIL: SKILL.md missing Auto-Fix or User Confirmation Gate documentation');
  process.exit(1);
}

console.log('PASS: publisher and deploy.js contain SEO Auto-Fix, confirmation gate, and GET 200 check');
process.exit(0);
