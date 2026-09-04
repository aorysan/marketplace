const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function renderScreenshots() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const brand = process.argv[3] || 'pawitra';
  const routes = process.argv.slice(4).length > 0
    ? process.argv.slice(4)
    : ['/', '/about', '/layanan-aplikasi-rt-digital', '/portfolio', '/blog', '/careers', '/contact'];

  const previewDir = path.join(process.cwd(), 'landings', brand, 'reports', '.preview');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  console.log(`Launching Puppeteer for ${baseUrl}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  
  // Set desktop viewport
  await page.setViewport({ width: 1440, height: 900 });

  for (const route of routes) {
    const targetUrl = `${baseUrl.replace(/\/$/, '')}${route}`;
    console.log(`Navigating to ${targetUrl}...`);
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 15000 });
      const safeName = route === '/' ? 'home' : route.replace(/[^a-zA-Z0-9]/g, '_');
      
      // Desktop screenshot
      await page.setViewport({ width: 1440, height: 900 });
      await page.screenshot({
        path: path.join(previewDir, `desktop_${safeName}.png`),
        fullPage: true,
      });

      // Mobile screenshot
      await page.setViewport({ width: 375, height: 812, isMobile: true });
      await page.screenshot({
        path: path.join(previewDir, `mobile_${safeName}.png`),
        fullPage: true,
      });

      console.log(`✓ Screenshots saved for ${route}`);
    } catch (err) {
      console.error(`Error rendering ${route}:`, err.message);
    }
  }

  await browser.close();
  console.log('Rendering complete. Screenshots saved to:', previewDir);
}

renderScreenshots();
