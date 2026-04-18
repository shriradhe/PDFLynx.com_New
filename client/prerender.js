import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PUBLIC_ROUTES } from './src/utils/seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');

async function serveDistFolder(port = 3000) {
  const app = express();
  // Serve everything from dist
  app.use(express.static(distDir));
  // Fallback to index.html for SPA routing
  app.use((req, res) => res.sendFile(path.join(distDir, 'index.html')));

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}

async function run() {
  console.log('Starting prerender script...');
  const server = await serveDistFolder(3000);
  console.log('Static server started on port 3000');

  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Speed up by preventing unnecessary resource loading
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const resourceType = req.resourceType();
    if (['image', 'media', 'font', 'websocket'].includes(resourceType)) {
      req.abort();
    } else {
      req.continue();
    }
  });

  for (const route of PUBLIC_ROUTES) {
    console.log(`Prerendering ${route}...`);
    try {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle0', timeout: 30000 });
      
      // Give React a moment to fully hydrate and render meta tags dynamically via react-helmet-async
      // Wait for at least one element inside #root to ensure it's not a blank shell
      await page.waitForSelector('#root > *', { timeout: 10000 }).catch(() => {});
      
      // Additional small delay for helmet to update DOM
      await new Promise(r => setTimeout(r, 500));

      let content = await page.content();

      // Determine output file path (e.g. /merge-pdf -> dist/merge-pdf.html)
      const isIndex = route === '/';
      const targetSubPath = isIndex ? 'index.html' : `${route.slice(1)}.html`;
      const targetFile = path.join(distDir, targetSubPath);
      const targetDir = path.dirname(targetFile);

      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true });
      }

      await fs.writeFile(targetFile, content);
      console.log(`Saved ${route} -> ${targetFile.replace(__dirname, '')}`);
    } catch (error) {
      console.error(`Failed to prerender ${route}:`, error.message);
    }
  }

  await browser.close();
  server.close();
  console.log('Prerendering completely finished.');
}

run();
