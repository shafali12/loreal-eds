/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero-stage
 * Base block: hero
 * Source URL: https://www.loreal.com/en/groupe (also group-overview, commitments-overview, brands-portfolio)
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt + blocks/hero-stage/_hero-stage.json):
 *   Single-column Hero block. Max 3 rows total:
 *     - Row 1: block name (handled by createBlock)
 *     - Row 2: Background Image (optional)  -> field:image  (+ collapsed imageAlt on <img> alt attr)
 *     - Row 3: Title / Subheading / CTA     -> field:text   (richtext)
 *   There must never be more than 3 rows -> image and text each occupy a single 1-cell row.
 *
 * Source shape: `section.hero.hero--stage` contains:
 *   - `.hero__image .responsive-image__media img` (full-bleed background KV image)
 *   - `.hero__content` with `h1.hero__title` and an optional `p.hero__desc` (commitments page).
 *   No CTA present on any observed instance, but a fallback anchor selector is included
 *   in case other pages carry one.
 *
 * xwalk: field hints (image, text) inserted BEFORE content. imageAlt is a collapsed field
 * (ends with "Alt") -> carried as the <img> alt attribute, no field comment.
 */
export default function parse(element, { document }) {
  // INPUT extraction (validated against source.html) --------------------------

  // Background image: prefer the hero image wrapper, fall back to any img.
  const img = element.querySelector(
    '.hero__image img, .image--hero img, .responsive-image__media img, img',
  );

  // Title heading.
  const title = element.querySelector('.hero__title, .hero__content h1, h1, h2');

  // Optional description / subheading.
  const desc = element.querySelector('.hero__desc, .hero__content p, p');

  // Optional CTA(s) — not present on observed instances, kept as a defensive fallback.
  const ctaLinks = Array.from(
    element.querySelectorAll('.hero__content a[href], a.button, a.cta'),
  );

  const titleText = title ? (title.textContent || '').trim() : '';
  const descText = desc ? (desc.textContent || '').trim() : '';

  // Empty-block guard: nothing usable extracted.
  if (!img && !titleText && !descText && !ctaLinks.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image cell (field:image). Alt collapses onto the <img> alt attribute.
  if (img) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(img);
    cells.push([imageCell]);
  }

  // Row 3: text cell (field:text) = heading + optional description + optional CTA(s).
  const textCell = document.createDocumentFragment();
  let hasText = false;
  textCell.appendChild(document.createComment(' field:text '));
  if (titleText) {
    const h1 = document.createElement('h1');
    h1.textContent = titleText;
    textCell.appendChild(h1);
    hasText = true;
  }
  if (descText) {
    const p = document.createElement('p');
    p.textContent = descText;
    textCell.appendChild(p);
    hasText = true;
  }
  ctaLinks.forEach((a) => {
    const href = a.getAttribute('href');
    const text = (a.textContent || '').trim();
    if (href && text) {
      const p = document.createElement('p');
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = text;
      p.appendChild(link);
      textCell.appendChild(p);
      hasText = true;
    }
  });
  if (hasText) {
    cells.push([textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-stage', cells });
  element.replaceWith(block);
}
