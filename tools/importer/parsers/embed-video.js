/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: embed-video
 * Base block: embed
 * Source URL: https://www.loreal.com/en/groupe
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt + blocks/embed-video/_embed-video.json):
 *   Single-column Embed block. 2 rows total:
 *     - Row 1: block name (handled by createBlock)
 *     - Row 2: single cell with the external content URL. An optional poster image may be
 *              placed ABOVE the link in the same cell.
 *   Model fields share the `embed_` prefix, so they group into ONE cell:
 *     - embed_placeholder      (reference)  -> field:embed_placeholder  (poster <img>, if any)
 *     - embed_placeholderAlt   (collapsed, ends with "Alt") -> carried on <img> alt attr, no comment
 *     - embed_uri              (text)       -> field:embed_uri          (the embed URL as an <a>)
 *
 * Source shape: `.flowplayer-embed-container` wraps an `<iframe>` whose `src` is the
 * lwcdn/flowplayer embed URL. No poster image present in source, but a fallback selector
 * is included in case one appears on other instances.
 *
 * xwalk: field hints inserted BEFORE content, both in the single grouped cell.
 * embed_placeholderAlt is collapsed onto the <img> alt attribute (no field comment).
 */
export default function parse(element, { document }) {
  // INPUT extraction (validated against source.html) --------------------------

  // Embed URL: prefer an iframe src; fall back to an explicit link or data attribute.
  const iframe = element.querySelector('iframe[src]');
  const linkEl = element.querySelector('a[href]');
  const embedUrl = iframe
    ? iframe.getAttribute('src')
    : (linkEl ? linkEl.getAttribute('href') : null);

  // Optional poster image (not present in observed source).
  const poster = element.querySelector('img');

  // Empty-block guard: no embeddable URL found.
  if (!embedUrl) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Single grouped cell: poster image (optional) above the URL link.
  const contentCell = document.createDocumentFragment();

  if (poster) {
    contentCell.appendChild(document.createComment(' field:embed_placeholder '));
    contentCell.appendChild(poster);
  }

  contentCell.appendChild(document.createComment(' field:embed_uri '));
  const a = document.createElement('a');
  a.setAttribute('href', embedUrl);
  a.textContent = embedUrl;
  contentCell.appendChild(a);

  const cells = [[contentCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'embed-video', cells });
  element.replaceWith(block);
}
