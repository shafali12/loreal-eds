/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: search-box
 * Base block: search
 * Source URL: https://www.loreal.com/en/
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt + blocks/search-box/_search-box.json):
 *   Simple block, 1 column.
 *     Row 1 = block name (handled by createBlock).
 *     Row 2 = the absolute URL to the query index to search. Model field: `index` (component: text).
 *   The `classes` field is intentionally skipped (hinting Rule 5).
 *
 * The source is L'Oréal's custom search widget (label + input + submit) which posts to a
 * results page and exposes no EDS query-index URL. The Search block requires a query-index
 * JSON to operate, so the parser emits the standard EDS site query index path for the target
 * site. The label/placeholder/submit text from the source are presentation the block renders
 * itself and are not part of the block model.
 *
 * xwalk: `index` field hint inserted before content.
 */
export default function parse(element, { document }) {
  // The Search block is driven by a query-index JSON, not by the source form's action.
  // Default to the target site's root query index.
  const indexUrl = '/query-index.json';

  const indexCell = document.createDocumentFragment();
  indexCell.appendChild(document.createComment(' field:index '));
  const link = document.createElement('a');
  link.setAttribute('href', indexUrl);
  link.textContent = indexUrl;
  indexCell.appendChild(link);

  const cells = [
    [indexCell], // single-column row: one cell holding the index field
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'search-box', cells });
  element.replaceWith(block);
}
