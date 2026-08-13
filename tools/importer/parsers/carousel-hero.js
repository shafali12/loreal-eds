/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel-hero
 * Base block: carousel
 * Source URL: https://www.loreal.com/en/
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt + blocks/carousel-hero/_carousel-hero.json):
 *   Container block. First row = block name (handled by createBlock).
 *   Each subsequent row = one slide with two cells (columns):
 *     - cell 1: media_image  (reference)   -> <!-- field:media_image --> + <img>
 *               media_imageAlt is a collapsed field (ends with "Alt") -> carried as the img alt attribute, no comment.
 *     - cell 2: content_text (richtext)     -> <!-- field:content_text --> + heading + CTA link
 *
 * xwalk: field hints inserted before content per hinting rules. Collapsed *_imageAlt gets no hint.
 */

// Build a clean anchor (href + trimmed text) stripping wrapper spans/classes from the source CTA.
function buildCleanAnchor(document, srcAnchor, fallbackText) {
  if (!srcAnchor) return null;
  const href = srcAnchor.getAttribute('href');
  if (!href) return null;
  const a = document.createElement('a');
  a.setAttribute('href', href);
  const text = (srcAnchor.textContent || '').trim() || (fallbackText || '').trim();
  a.textContent = text;
  return a;
}

export default function parse(element, { document }) {
  // Collect slides. Primary: direct children of the slider list; fallback: slide class.
  let slides = Array.from(element.querySelectorAll('.slider__inner > li'));
  if (!slides.length) slides = Array.from(element.querySelectorAll('li.slider__slide'));

  const cells = [];

  slides.forEach((slide) => {
    // INPUT extraction (validated against source.html)
    const img = slide.querySelector('.responsive-image__media img, .hero__image img, img');
    const heading = slide.querySelector('.hero-carousel__title, h1, h2, h3');
    const ctaSrc = slide.querySelector('a.hero__btn, a.btn, .hero-carousel__content a[href]');

    // Cell 1: image (media_image). Alt is collapsed into the img element.
    let imageCell;
    if (img) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:media_image '));
      imageCell.appendChild(img);
    } else {
      imageCell = ''; // keep the column, no hint on an empty cell
    }

    // Cell 2: text content (content_text) = heading + CTA
    const contentCell = document.createDocumentFragment();
    const contentNodes = [];
    if (heading) contentNodes.push(heading);
    const cta = buildCleanAnchor(document, ctaSrc, heading ? heading.textContent : '');
    if (cta) contentNodes.push(cta);
    let textCell;
    if (contentNodes.length) {
      contentCell.appendChild(document.createComment(' field:content_text '));
      contentNodes.forEach((n) => contentCell.appendChild(n));
      textCell = contentCell;
    } else {
      textCell = '';
    }

    // Only emit a slide row if it has real content.
    if (img || contentNodes.length) {
      cells.push([imageCell, textCell]);
    }
  });

  // Empty-block guard: nothing usable extracted.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
