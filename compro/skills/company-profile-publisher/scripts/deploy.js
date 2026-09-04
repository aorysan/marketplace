#!/usr/bin/env node

/**
 * deploy.js — Helper script untuk company-profile-publisher
 * Men-deploy folder ke Vercel menggunakan CLI, lalu memverifikasi
 * preview URL dengan HTTP GET 200 (dengan retries).
 *
 * Usage: node deploy.js <folder-path> [--prod]
 */

const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const https = require('https');

const FOLDER = process.argv[2];
const IS_PROD = process.argv.includes('--prod');

const PREVIEW_URL_REGEX = /https:\/\/[a-zA-Z0-9-]+\.vercel\.app/;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Requirement 1: Argument validation and check folder exists
if (!FOLDER) {
  console.error('Usage: node deploy.js <folder-path> [--prod]');
  process.exit(1);
}

if (!fs.existsSync(FOLDER)) {
  console.error(`Folder not found: ${FOLDER}`);
  process.exit(1);
}

// Requirement 2: Check Vercel CLI and auth
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch {
  console.error('Vercel CLI not found. Install with: npm i -g vercel');
  process.exit(1);
}

try {
  execSync('vercel whoami', { stdio: 'ignore' });
} catch {
  console.error('Vercel CLI not authenticated. Run: vercel login');
  process.exit(1);
}

/**
 * Active HTTP GET validation of the preview URL.
 * Verifies an HTTP 200 status with retries (short delay between attempts).
 * Resolves true when a 200 is observed, false otherwise.
 */
function checkPreviewUrl(url) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        res.resume(); // drain the response
        resolve(res.statusCode === 200);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}

// Requirement 5: verify GET 200 with 3 retries
async function verifyLiveUrl(url) {
  let ok = false;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    ok = await checkPreviewUrl(url);
    if (ok) {
      console.log(`[GET ${attempt}/${MAX_RETRIES}] ${url} -> 200 OK`);
      return ok;
    }
    console.log(
      `[GET ${attempt}/${MAX_RETRIES}] ${url} -> not ready (retrying in ${RETRY_DELAY_MS}ms)...`
    );
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
  return ok;
}

(async () => {
  // Requirement 3: Deploy command uses --no-wait (preserving optional --prod)
  let args = ['deploy', '--yes', '--no-wait'];
  args = args.concat([FOLDER]);
  if (IS_PROD) args.push('--prod');

  let output;
  try {
    // On Windows the npm-global `vercel` is a .cmd shim that cannot be
    // spawned directly (ENOENT). `cmd.exe /c` runs it, and args stay
    // separate argv elements (no shell-string concatenation => no
    // injection, space-safe). The positional FOLDER arg already targets
    // the folder, so no cwd override is needed.
    const result = spawnSync('cmd.exe', ['/c', 'vercel', ...args], {
      encoding: 'utf-8',
    });
    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error((result.stderr || result.stdout || '').trim() || 'vercel exited with an error');
    }
    output = result.stdout;
  } catch (error) {
    console.error('Deploy failed:');
    console.error(error.stdout || error.message);
    process.exit(1);
  }

  console.log('Deploy output:');
  console.log(output);

  // Requirement 4: Extract preview URL with the specific vercel.app regex
  const urlMatch = output.match(PREVIEW_URL_REGEX);
  if (!urlMatch) {
    console.error('Could not extract preview URL from deploy output.');
    process.exit(1);
  }
  const previewUrl = urlMatch[0];

  // Requirement 5: Active HTTP GET 200 verification with retries
  const live = await verifyLiveUrl(previewUrl);

  // Requirement 6: Output preview URL and summary status
  console.log('\n==========================================');
  console.log('Preview URL:', previewUrl);
  if (live) {
    console.log('Status: LIVE — HTTP GET 200 confirmed');
  } else {
    console.log('Status: DEPLOYED (URL returned but not yet reachable via GET 200)');
  }
  console.log('==========================================');

  console.log(JSON.stringify({ previewUrl, live, prod: IS_PROD }));
})().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
