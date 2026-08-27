import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { html2md } from '@adobe/helix-html2md';
import { md2jcr } from '@adobe/helix-md2jcr';

const REPO = '/workspace/current';
const OUT = process.env.JCR_OUT || '/tmp/jcrbuild/jcr-out';

const log = { info() {}, warn() {}, error(...a) { console.error(...a); }, debug() {} };

const definition = JSON.parse(readFileSync(join(REPO, 'component-definition.json'), 'utf8'));
const models = JSON.parse(readFileSync(join(REPO, 'component-models.json'), 'utf8'));
const filters = JSON.parse(readFileSync(join(REPO, 'component-filters.json'), 'utf8'));

// Pages: [plainHtmlRelPath, jcrRelPath (page path under /content root)]
const pages = [
  ['content/en.plain.html', 'en'],
  ['content/en/beauty-science-and-technology.plain.html', 'en/beauty-science-and-technology'],
  ['content/en/beauty-science-and-technology/beauty-research-and-innovation.plain.html', 'en/beauty-science-and-technology/beauty-research-and-innovation'],
  ['content/en/beauty-science-and-technology/beauty-tech.plain.html', 'en/beauty-science-and-technology/beauty-tech'],
  ['content/en/beauty-science-and-technology/l-oreal-open-innovation.plain.html', 'en/beauty-science-and-technology/l-oreal-open-innovation'],
  ['content/en/beauty-science-and-technology/l-oreal-open-innovation/beauty-tech-atelier.plain.html', 'en/beauty-science-and-technology/l-oreal-open-innovation/beauty-tech-atelier'],
  ['content/en/beauty-science-and-technology/l-oreal-open-innovation/creating-breakthrough-products-through-collaborative-play.plain.html', 'en/beauty-science-and-technology/l-oreal-open-innovation/creating-breakthrough-products-through-collaborative-play'],
];

const mediaHandler = {
  async put(res) { return res; },
  createMediaResource(buffer, len, mime, sourceUri) { return { uri: sourceUri, sourceUri }; },
  async getBlob(uri) { return { uri, sourceUri: uri }; },
};

async function run() {
  const results = [];
  for (const [rel, jcrPath] of pages) {
    const abs = join(REPO, rel);
    if (!existsSync(abs)) { console.error('MISSING', rel); continue; }
    let inner = readFileSync(abs, 'utf8');
    // Sanitize invalid block names: the importer occasionally captures an
    // unmapped element (e.g. a stats band) with a purely-numeric CSS class
    // like <div class="98">, which md2jcr rejects ("component '98' does not
    // exist"). Preserve the figure as leading text and drop the numeric class
    // so the content survives as default content.
    inner = inner.replace(/<div class="(\d+)">/g, (m, num) => `<div><p>${num}</p>`);
    const html = `<!DOCTYPE html><html><head><title></title></head><body><main>${inner}</main></body></html>`;
    const url = `https://main--loreal-eds--shafali12.aem.page/${jcrPath}`;

    let md;
    try {
      md = await html2md(html, { log, url, mediaHandler });
    } catch (e) {
      console.error('html2md FAILED for', rel, e.message);
      continue;
    }

    let jcr;
    try {
      jcr = await md2jcr(md, { log, models, definition, filters });
    } catch (e) {
      console.error('md2jcr FAILED for', rel, e.message);
      continue;
    }

    // Post-process: md2jcr occasionally leaves a bare '&' unescaped inside a
    // button `link` attribute (image/richtext attrs are escaped correctly).
    // Escape any '&' that is NOT already the start of a valid XML entity so the
    // resulting .content.xml is well-formed.
    jcr = jcr.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');

    const outFile = join(OUT, jcrPath, '.content.xml');
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, jcr, 'utf8');
    results.push({ jcrPath, mdLen: md.length, jcrLen: jcr.length });
    console.log(`OK ${jcrPath}  (md ${md.length}b -> jcr ${jcr.length}b)`);
  }
  console.log('\nDONE:', results.length, 'pages converted');
}
run().catch((e) => { console.error(e); process.exit(1); });
