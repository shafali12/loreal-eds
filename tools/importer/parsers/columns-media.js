/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media.
 * Base block: columns.
 * Source: https://www.loreal.com/en/beauty-science-and-technology/
 * UE model (blocks/columns/_columns.json): Columns block.
 * Generated: 2026-08-27
 *
 * Library convention: first row = block name; second row = N columns (cells),
 * each cell holding text/images/inline elements. No nested blocks.
 * Columns blocks do NOT use field hints (per hinting rules) — default content only.
 *
 * Source structure: div.container--large > div.container--medium > div.copy-block
 *   containing two ".copy-block--imgdisplay" cells:
 *     - an image cell (p > img)
 *     - a text cell (h2 heading + paragraphs + optional CTA a.btn)
 *   Image/text column order alternates between instances (image-left vs image-right);
 *   iterating in DOM order preserves each instance's source order.
 *
 * Output: one content row with 2 cells (one column per copy-block cell, in source order).
 */
export default function parse(element, { document }) {
  // Direct content cells in DOM order (preserves image-left vs image-right ordering).
  let contentCells = Array.from(
    element.querySelectorAll('.copy-block--imgdisplay'),
  );

  // Fallback: if the specific class isn't present, use the copy-block's direct children.
  if (contentCells.length < 2) {
    const copyBlock = element.querySelector('.copy-block') || element;
    contentCells = Array.from(copyBlock.children).filter(
      (child) => child.querySelector('img, h2, h3, p'),
    );
  }

  // Empty-block guard.
  if (contentCells.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build one cell per source content cell, keeping its inner content
  // (img / heading / paragraphs / CTA).
  const rowCells = contentCells.map((cell) => {
    const contents = Array.from(cell.childNodes);
    return contents.length ? contents : [cell];
  });

  const cells = [rowCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
