const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const CURATED_IMAGE_CATALOG = {
  'architecture-portrait': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&h=1200&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&h=1200&q=80'
  ],
  'architecture-modern': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&h=900&q=80',
    'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=1600&h=900&q=80'
  ],
  'creative-meeting': [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&h=1200&q=80'
  ],
  'tech-workspace': [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&h=1200&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&h=1200&q=80'
  ],
  'corporate-team': [
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1600&h=900&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&h=1200&q=80'
  ]
};

const SLOT_MAP = {
  'hero': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'hero-fallback.svg' },
  'problem': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'problem-fallback.svg' },
  'solution': { category: 'creative-meeting', orientation: 'portrait', fallback: 'solution-fallback.svg' },
  'features': { category: 'tech-workspace', orientation: 'portrait', fallback: 'services-fallback.svg' },
  'services': { category: 'tech-workspace', orientation: 'portrait', fallback: 'services-fallback.svg' },
  'ecosystem': { category: 'tech-workspace', orientation: 'landscape', fallback: 'services-fallback.svg' },
  'traction': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'metrics-fallback.svg' },
  'metrics': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'metrics-fallback.svg' },
  'differentiator': { category: 'architecture-portrait', orientation: 'portrait', fallback: 'problem-fallback.svg' },
  'pricing': { category: 'tech-workspace', orientation: 'portrait', fallback: 'services-fallback.svg' },
  'closing': { category: 'corporate-team', orientation: 'portrait', fallback: 'closing-fallback.svg' }
};

function mapCommentToSlot(commentStr) {
  if (!commentStr) return { slot: 'hero', ...SLOT_MAP['hero'] };
  const match = commentStr.match(/<!--\s*image:\s*([a-zA-Z0-9_-]+)/i);
  const slot = match ? match[1].toLowerCase() : 'hero';
  const mapped = SLOT_MAP[slot] || SLOT_MAP['hero'];
  return { slot, ...mapped };
}

function downloadFile(url, destPath, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: timeoutMs }, response => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        const redirectUrl = new URL(response.headers.location, url).toString();
        return downloadFile(redirectUrl, destPath, timeoutMs).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error(`HTTP Status ${response.statusCode}`));
      }
      const file = fs.createWriteStream(destPath);
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
      file.on('error', err => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
    });

    req.on('timeout', () => {
      req.destroy();
      fs.unlink(destPath, () => {});
      reject(new Error('Request timeout'));
    });

    req.on('error', err => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function fetchImageWithFallback(options = {}) {
  const { category, destPath, slot = 'hero', forceFallback = false } = options;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  const fallbackFile = (SLOT_MAP[slot] && SLOT_MAP[slot].fallback) || 'hero-fallback.svg';
  const localFallbackPath = path.join(__dirname, '..', 'templates', 'assets', 'fallback', fallbackFile);

  const applyFallback = () => {
    if (fs.existsSync(localFallbackPath)) {
      // Ensure SVG fallback retains .svg extension; do not save SVG XML into a .jpg file
      const svgDestPath = destPath.replace(/\.jpe?g$/i, '.svg');
      fs.copyFileSync(localFallbackPath, svgDestPath);
      if (fs.existsSync(destPath) && destPath !== svgDestPath) {
        try { fs.unlinkSync(destPath); } catch (e) {}
      }
      return svgDestPath;
    }
    throw new Error(`Fallback SVG not found at ${localFallbackPath}`);
  };

  const svgDestPath = destPath.replace(/\.jpe?g$/i, '.svg');

  // Idempotency: skip if already valid (> 1024 bytes for jpg, > 100 bytes for svg)
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1024) {
    return destPath;
  }
  if (fs.existsSync(svgDestPath) && fs.statSync(svgDestPath).size > 100) {
    return svgDestPath;
  }

  if (forceFallback) {
    return applyFallback();
  }

  const urls = CURATED_IMAGE_CATALOG[category] || CURATED_IMAGE_CATALOG['architecture-portrait'];
  const targetUrl = urls[0];

  try {
    await downloadFile(targetUrl, destPath, 5000);
    return destPath;
  } catch (err) {
    console.warn(`[WARN] Primary CDN download failed for ${slot}: ${err.message}. Trying Picsum fallback...`);
    try {
      const picsumUrl = (SLOT_MAP[slot] && SLOT_MAP[slot].orientation === 'landscape')
        ? 'https://picsum.photos/1600/900'
        : 'https://picsum.photos/800/1200';
      await downloadFile(picsumUrl, destPath, 4000);
      return destPath;
    } catch (picsumErr) {
      console.warn(`[WARN] Picsum fallback failed: ${picsumErr.message}. Applying local SVG fallback.`);
      return applyFallback();
    }
  }
}

module.exports = {
  CURATED_IMAGE_CATALOG,
  SLOT_MAP,
  mapCommentToSlot,
  fetchImageWithFallback
};
