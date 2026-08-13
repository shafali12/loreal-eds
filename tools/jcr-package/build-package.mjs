/*
 * Build the AEM FileVault content package using Adobe's official
 * @adobe/helix-importer-jcr-packaging (the same library the AEM import pipeline
 * uses). It produces a valid package zip — proper properties.xml/filter.xml,
 * empty ancestor pages, MANIFEST — from our per-page JCR XML.
 */
import { createJcrPackage } from '@adobe/helix-importer-jcr-packaging/src/index.js';
import { readFile, readdir } from 'fs/promises';

const xmlDir = '/tmp/jcrpkg-build/xml';
const outDir = '/tmp/jcrpkg-build/official';
const siteContentPath = '/content/eds-loreal';
const assetDamPath = '/content/dam/eds-loreal';

// flat xml filename -> live page url + content path
const map = {
  'en.xml': { path: '/en', url: 'https://www.loreal.com/en' },
  'en__groupe.xml': { path: '/en/groupe', url: 'https://www.loreal.com/en/groupe' },
  'en__commitments-and-responsibilities.xml': { path: '/en/commitments-and-responsibilities', url: 'https://www.loreal.com/en/commitments-and-responsibilities' },
  'en__our-global-brands-portfolio.xml': { path: '/en/our-global-brands-portfolio', url: 'https://www.loreal.com/en/our-global-brands-portfolio' },
};

const pages = [];
for (const [file, meta] of Object.entries(map)) {
  const data = await readFile(`${xmlDir}/${file}`, 'utf-8');
  pages.push({ type: 'jcr', path: meta.path, data, url: meta.url });
}

// No DAM asset rewriting for now (images keep their absolute loreal.com URLs).
const assetUrls = [];

await createJcrPackage(outDir, pages, assetUrls, siteContentPath, assetDamPath);

const produced = await readdir(outDir);
console.log('output dir contents:', produced.join(', '));
