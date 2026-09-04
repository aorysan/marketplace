import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: node render.mjs <brandName> <baseUrl> <route1> [route2...]');
  process.exit(1);
}

const brandName = args[0];
const baseUrl = args[1].replace(/\/$/, '');
const routes = args.slice(2);
const outDir = path.resolve(`landings/${brandName}/reports/.preview`);

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log(`Rendering ${routes.length} routes -> ${outDir}\n`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();

for (const route of routes) {
  const url = `${baseUrl}${route.startsWith('/') ? route : '/' + route}`;
  let routeName = route === '/' ? 'home' : route.replace(/^\//, '').replace(/\//g, '-');
  console.log(`${url} ...`);

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    await page.setViewport({ width: 1440, height: 900 });
    await new Promise(r => setTimeout(r, 2000));
    const desktopPath = path.join(outDir, `desktop-${routeName}.png`);
    await page.screenshot({ path: desktopPath, fullPage: true });
    console.log(`  desktop OK`);

    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise(r => setTimeout(r, 1000));
    const mobilePath = path.join(outDir, `mobile-${routeName}.png`);
    await page.screenshot({ path: mobilePath, fullPage: true });
    console.log(`  mobile OK`);
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
  }
}

await browser.close();
console.log('\nQC Done.');
