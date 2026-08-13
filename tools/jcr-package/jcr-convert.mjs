/*
 * Build helper: EDS .plain.html pages -> block-table HTML -> EDS markdown
 * (grid-tables) -> JCR XML (cq:Page) via the AEM helix importer + md2jcr.
 *
 * The delivered .plain.html represents blocks as <div class="blockname"> with
 * nested field cells. html2md only turns <table> structures into the grid-tables
 * that md2jcr recognizes as blocks, so we first rebuild each block <div> into the
 * <table> form (block name in the header row, one row per record, one <td> per
 * field cell) — the inverse of EDS block decoration. Default content (headings,
 * paragraphs, images, buttons) is left as-is and converts to normal markdown.
 */
import { html2md } from '@adobe/helix-importer/src/index.js';
import { md2jcr } from '@adobe/helix-md2jcr/src/index.js';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { JSDOM } from 'jsdom';

const repo = '/backups/shafali12/loreal-eds/repo';
const out = '/tmp/jcrpkg-build';

const models = JSON.parse(await readFile(`${repo}/component-models.json`, 'utf-8'));
const defs = JSON.parse(await readFile(`${repo}/component-definition.json`, 'utf-8'));
const filters = JSON.parse(await readFile(`${repo}/component-filters.json`, 'utf-8'));
let definition;
if (defs.groups) definition = defs;
else if (defs.definitions) definition = { groups: [{ title: 'Blocks', id: 'blocks', components: defs.definitions }] };
else definition = defs;
const filtersArr = Array.isArray(filters) ? filters : filters.filters;
// Drop dangling filter references: a component template may name a `filter` that
// has no entry in component-filters.json (e.g. search-box declares filters: []),
// which makes md2jcr's ModelHelper crash. Such blocks are pure key-value (model)
// blocks, so removing the stale filter ref lets them convert via their model.
const filterIds = new Set(filtersArr.map((f) => f.id));
(definition.groups || []).forEach((g) => (g.components || []).forEach((c) => {
  const tpl = c.plugins?.xwalk?.page?.template;
  if (tpl && tpl.filter && !filterIds.has(tpl.filter)) delete tpl.filter;
}));
const opts = {
  models: Array.isArray(models) ? models : models.models,
  definition,
  filters: filtersArr,
};

// blockname -> "Block Name" header label used by html2md/md2jcr to match a block.
function blockLabel(cls) {
  return cls.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// XML attribute-value escaping for values we splice into JCR nodes directly.
function xmlAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/*
 * hero-stage is a key-value block whose model [image, imageAlt, text] the current
 * md2jcr cannot map from any grid-table layout (image + heading in one record
 * throws "content isn't mapping to the model"). Every other block converts via
 * md2jcr; for hero-stage we extract its fields from the source div and build the
 * JCR node directly, then splice it into the page XML in place of a placeholder.
 */
function heroStageNode(blockDiv, nodeName) {
  const img = blockDiv.querySelector('img');
  const image = img ? (img.getAttribute('src') || '') : '';
  const imageAlt = img ? (img.getAttribute('alt') || '') : '';
  // Everything except the image cell is the richtext "text" field.
  const imgCell = img ? img.closest('div') : null;
  const parts = [];
  blockDiv.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (cell === imgCell) return;
    cell.childNodes.forEach((n) => {
      if (n.nodeType === 8) return;
      if (n.nodeType === 1) parts.push(n.outerHTML);
    });
  });
  const text = parts.join('');
  const attrs = [
    'jcr:primaryType="nt:unstructured"',
    'sling:resourceType="core/franklin/components/block/v1/block"',
    'name="Hero Stage"',
    'model="hero-stage"',
    `image="${xmlAttr(image)}"`,
    imageAlt ? `imageAlt="${xmlAttr(imageAlt)}"` : 'imageAlt=""',
    `text="${xmlAttr(text)}"`,
  ];
  return `<${nodeName} ${attrs.join(' ')}/>`;
}

// Rebuild a block <div class="name"> into the <table> form the importer expects.
// The "<!-- field:name -->" hint comments are PRESERVED — md2jcr reads them to
// map cell content to the block's model fields. Container blocks (with a filter)
// keep one record per row; key-value blocks (model only) collapse all their field
// cells into a single row so md2jcr treats them as one record.
function blockDivToTable(blockDiv, document, isContainer) {
  const name = [...blockDiv.classList][0];
  const table = document.createElement('table');
  const thead = document.createElement('tr');
  const th = document.createElement('th');
  th.setAttribute('colspan', '10');
  th.textContent = blockLabel(name);
  thead.append(th);
  table.append(thead);

  const rowDivs = [...blockDiv.children].filter((c) => c.tagName === 'DIV');
  const buildCell = (source) => {
    const td = document.createElement('td');
    [...source.childNodes].forEach((n) => {
      if (n.nodeType === 8) return; // drop field-hint comments (md handles by order)
      td.append(n.cloneNode(true));
    });
    return td;
  };

  if (isContainer) {
    // one record per top-level row; each nested div is a field cell
    rowDivs.forEach((rowDiv) => {
      const tr = document.createElement('tr');
      const cells = [...rowDiv.children].filter((c) => c.tagName === 'DIV');
      (cells.length ? cells : [rowDiv]).forEach((cell) => tr.append(buildCell(cell)));
      table.append(tr);
    });
  } else {
    // key-value block: collapse ALL field content into a single row / single cell,
    // in document order. md2jcr walks the cell's children against the model's
    // fields in order (image -> imageAlt -> text ...), so a single stacked cell
    // maps cleanly even when the .plain.html splits fields across rows/divs and
    // the "<!-- field: -->" hints have been dropped by html2md.
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    const collectFieldCells = (node) => {
      const cells = [...node.children].filter((c) => c.tagName === 'DIV');
      return cells.length ? cells.flatMap(collectFieldCells) : [node];
    };
    rowDivs.forEach((rowDiv) => {
      collectFieldCells(rowDiv).forEach((cell) => {
        [...cell.childNodes].forEach((n) => {
          if (n.nodeType === 8) return;
          td.append(n.cloneNode(true));
        });
      });
    });
    tr.append(td);
    table.append(tr);
  }
  blockDiv.replaceWith(table);
}

const pages = [
  { jcr: 'en', file: 'content/en.plain.html' },
  { jcr: 'en/groupe', file: 'content/en/groupe.plain.html' },
  { jcr: 'en/commitments-and-responsibilities', file: 'content/en/commitments-and-responsibilities.plain.html' },
  { jcr: 'en/our-global-brands-portfolio', file: 'content/en/our-global-brands-portfolio.plain.html' },
];

await mkdir(`${out}/md`, { recursive: true });
await mkdir(`${out}/xml`, { recursive: true });

for (const p of pages) {
  const html = await readFile(`${repo}/${p.file}`, 'utf-8');
  const docHtml = `<!DOCTYPE html><html><head><title>${p.jcr}</title></head><body><header></header><main>${html}</main><footer></footer></body></html>`;
  const dom = new JSDOM(docHtml);
  const { document } = dom.window;
  const containerIds = new Set(opts.filters.map((f) => f.id));
  const modelIds = new Set((opts.models || []).map((m) => m.id));

  // hero-stage: build its JCR node directly (md2jcr can't map its model) and
  // leave a placeholder paragraph in the markdown that we swap out afterwards.
  const heroNodes = [];
  document.querySelectorAll('main .hero-stage').forEach((el, i) => {
    const nodeName = i === 0 ? 'herostage' : `herostage_${i}`;
    heroNodes.push(heroStageNode(el, nodeName));
    const marker = document.createElement('p');
    marker.textContent = `@@HEROSTAGE:${i}@@`;
    el.replaceWith(marker);
  });

  // Rebuild remaining block divs into tables for md2jcr.
  document.querySelectorAll('main [class]').forEach((el) => {
    const cls = [...el.classList][0];
    if (!cls) return;
    const isContainer = containerIds.has(cls);
    if (isContainer || modelIds.has(cls)) blockDivToTable(el, document, isContainer);
  });

  const url = `https://main--loreal-eds--shafali12.aem.page/${p.jcr}`;
  const res = await html2md(url, document, undefined, {});
  let md = typeof res === 'string' ? res : res.md;
  // md2jcr does not support markdown blockquotes; the quote text (columns-quote)
  // is stored as plain richtext, so demote "> " markers to normal paragraphs.
  md = md.split('\n').map((line) => line.replace(/^\s*>\s?/, '')).join('\n');
  const flat = p.jcr.replace(/\//g, '__');
  await writeFile(`${out}/md/${flat}.md`, md, 'utf-8');
  let xml = await md2jcr(md, opts);
  // md2jcr can emit a bare "&" inside attribute values for URLs with query
  // strings (e.g. ...?id=..&pi=..), which is not well-formed XML. Escape any
  // ampersand that is not already the start of a valid XML entity.
  xml = xml.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
  // Swap each hero-stage placeholder (rendered as a <text> node whose text
  // contains the marker) with the directly-built hero-stage block node.
  heroNodes.forEach((node, i) => {
    const re = new RegExp(`<([a-zA-Z0-9_]+)\\b[^>]*sling:resourceType="core/franklin/components/text/v1/text"[^>]*text="[^"]*@@HEROSTAGE:${i}@@[^"]*"[^>]*/>`);
    if (re.test(xml)) xml = xml.replace(re, node);
    else xml = xml.replace(new RegExp(`<[^>]*@@HEROSTAGE:${i}@@[^>]*/>`), node);
  });
  await writeFile(`${out}/xml/${flat}.xml`, xml, 'utf-8');
  const blockCount = (xml.match(/sling:resourceType="core\/franklin\/components\/block\/v1\/block"/g) || []).length;
  const heroCount = (xml.match(/model="hero-stage"/g) || []).length;
  console.log(`${p.jcr}: md=${md.length}b xml=${xml.length}b blocks=${blockCount} hero=${heroCount} cq:Page=${/cq:Page/.test(xml)}`);
}
console.log('DONE');
