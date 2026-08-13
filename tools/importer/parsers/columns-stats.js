/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns-stats
 * Base block: columns
 * Source URL: https://www.loreal.com/en/groupe
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt + blocks/columns-stats/_columns-stats.json):
 *   Columns block. First row = block name (handled by createBlock). The SECOND row
 *   contains one cell per column; each additional row must have the same column count.
 *   This "key figures" band is a single content row of N stat columns.
 *
 *   ⚠️ Columns blocks do NOT use field hints (see hinting rules: Columns exception).
 *      Cells contain default content only — no <!-- field:* --> comments.
 *
 * Source shape: `.container--large.keycontainer-bg` wraps a `.key-figure` whose
 *   `.key-figure__cols` children each hold a big number (`p.normal`, may contain
 *   `<sup>` / `<span class="--serif">`) and a label (`p.key-figure--subtitle`).
 *   Each `.key-figure__cols` becomes one column cell; the number is promoted to a
 *   heading (visual emphasis) and the label kept as a paragraph.
 *
 * The block JS derives its column count from the number of cells in the first
 * content row, so all stats go in ONE row with one cell per stat.
 */
export default function parse(element, { document }) {
  // INPUT extraction (validated against source.html) --------------------------
  let statCols = Array.from(element.querySelectorAll('.key-figure__cols'));
  // Fallbacks for cross-page variation.
  if (!statCols.length) statCols = Array.from(element.querySelectorAll('.key-figure > div, .key-figure__col'));

  const rowCells = [];

  statCols.forEach((col) => {
    const numberEl = col.querySelector('p.normal, .key-figure__number, p:first-of-type');
    const labelEl = col.querySelector('.key-figure--subtitle, p.key-figure--subtitle, p:last-of-type');

    const cellNodes = [];

    // Number -> heading for emphasis, preserving inline markup (sup, spans, strong).
    if (numberEl) {
      const numHtml = (numberEl.innerHTML || '').trim();
      const numText = (numberEl.textContent || '').trim();
      if (numText) {
        const h = document.createElement('h2');
        h.innerHTML = numHtml;
        cellNodes.push(h);
      }
    }

    // Label -> paragraph.
    if (labelEl && labelEl !== numberEl) {
      const labelText = (labelEl.textContent || '').trim();
      if (labelText) {
        const p = document.createElement('p');
        p.innerHTML = (labelEl.innerHTML || '').trim();
        cellNodes.push(p);
      }
    }

    if (cellNodes.length) rowCells.push(cellNodes);
  });

  // Empty-block guard.
  if (!rowCells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single content row, one cell per stat column (Columns block — no field hints).
  const cells = [rowCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-stats', cells });
  element.replaceWith(block);
}
