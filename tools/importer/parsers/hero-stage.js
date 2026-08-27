/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-stage.
 * Base block: hero (single-column block, max 3 rows per library convention).
 * Source: https://www.loreal.com/en/beauty-science-and-technology/
 * UE model (blocks/hero/_hero.json): image (reference), imageAlt (collapsed), text (richtext).
 * Generated: 2026-08-27
 *
 * Library convention: 1 column, 3 rows.
 *   Row 1: block name (added by createBlock).
 *   Row 2: single cell = background image (optional).
 *   Row 3: single cell = Title + Subheading + optional CTA (as richtext).
 * Never more than 3 rows.
 *
 * Source structure: <section class="hero hero--stage"> with a background image
 * (div.image--hero img) plus an overlaid h1 title and subtitle paragraph.
 * Field hints (xwalk): field:image on the image cell, field:text on the text cell.
 * imageAlt is a collapsed field (Alt suffix) -> stays as the img alt attribute, no hint.
 */
export default function parse(element, { document }) {
  // Background image (validated against source: div.image--hero img)
  const image = element.querySelector(
    '.image--hero img, .hero__image img, .image img, img',
  );

  // Overlaid title + subtitle
  const heading = element.querySelector('h1.hero__title, h1, h2, [class*="title"]');
  const description = element.querySelector('p.hero__desc, .hero__content p, p');
  // Optional CTA (defensive: source has none, but sibling variants may)
  const cta = element.querySelector('a.btn, .hero__content a, a[class*="button"]');

  // Empty-block guard: bail if there is no meaningful content
  if (!image && !heading && !description) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image field (optional)
  if (image) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(image);
    cells.push([imageCell]);
  }

  // Row 3: text field (title + subheading + optional CTA)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (description) textCell.appendChild(description);
  if (cta) textCell.appendChild(cta);
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-stage', cells });
  element.replaceWith(block);
}
