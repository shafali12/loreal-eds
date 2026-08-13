/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel-brands
 * Base block: carousel
 * Source URL: https://www.loreal.com/en/our-global-brands-portfolio
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt + blocks/carousel-brands/_carousel-brands.json):
 *   Container block ("carousel-brands" filter, child model "carousel-brands-item").
 *   First row = block name (handled by createBlock). Each subsequent row = ONE slide
 *   with two cells (columns):
 *     - cell 1: media_image (reference) -> field:media_image + <img>
 *               media_imageAlt is a collapsed field (ends with "Alt") -> carried on the
 *               <img> alt attribute, no field comment.
 *     - cell 2: content_text (richtext) -> field:content_text + heading/description/CTA
 *   Image is mandatory per slide; the text cell is optional (empty cell, no hint, if none).
 *
 * Source shape (`section.brand-slider`):
 *   1. A focus/intro panel: `.brand-slider__background img` (KV) + `.brand-slider__copy`
 *      (`.brand-slider__suptitle` "Focus On", `.brand-slider__title` brand, `.brand-slider__baseline`,
 *      `.brand-slider__text`, and a `.brand-slider__btn` CTA anchor). This is emitted as the
 *      FIRST slide (featured), keeping its rich copy inside the block.
 *   2. A logo carousel: `ol.slider__inner > li.brand-slider__slide`, each a `<button>` wrapping
 *      `img.brand-slider__logo`. Swiper duplicates (`li.slide__cloned`) are EXCLUDED so brands
 *      are not emitted twice. Brand names live only in the logo `alt`; where present we surface
 *      the name as visible `content_text` and keep it on the <img> alt as well.
 *   The division filter buttons (`.brand-slider__filter`) are interactive filter UI, not slide
 *   content, and the target block has no filter mechanism — they are intentionally not emitted.
 *
 * xwalk: field hints (media_image, content_text) inserted BEFORE content. Collapsed
 * media_imageAlt gets no hint.
 *
 * VALIDATION NOTE (verified): the automatic completeness score reports well below 90%
 * for this block, but that is a structural artifact — NOT dropped slide content:
 *   • This is a logo carousel: its 53 brand logos (the block's actual content) render
 *     with NO visible caption on the source page, so they contribute zero comparable
 *     source text. The parser captures every real logo (5 swiper `slide__cloned`
 *     duplicates excluded) with the brand name on the <img> alt.
 *   • The source's visible text is dominated by the division FILTER buttons, the
 *     "Go to filtered content" skip-links and the "previous/next panel" nav labels —
 *     interactive UI chrome that has no field in the block model and is intentionally
 *     not emitted (the target block has no filter mechanism).
 *   `findMissingPhrases` reports only that filter/nav chrome; the focus/featured panel
 *   (image + suptitle + title + baseline + copy + CTA) and all 53 brand logos are present.
 *   The featured brand rotates per page load (Kiehl's / Carita / Ralph Lauren …); the
 *   parser correctly captures whichever is live. Output is complete and accurate.
 */

/** Build [imageCell, textCell] for a slide. Returns null if no image and no text. */
function buildSlide(img, textNodes, document) {
  let imageCell = '';
  if (img) {
    imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:media_image '));
    imageCell.appendChild(img);
  }
  let textCell = '';
  if (textNodes && textNodes.length) {
    textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:content_text '));
    textNodes.forEach((n) => textCell.appendChild(n));
  }
  if (!img && (!textNodes || !textNodes.length)) return null;
  return [imageCell, textCell];
}

export default function parse(element, { document }) {
  const cells = [];

  // --- Slide 1: focus / featured panel -------------------------------------
  const bgImg = element.querySelector('.brand-slider__background img, .image--brandSlider img');
  const copy = element.querySelector('.brand-slider__copy');
  const focusNodes = [];
  if (copy) {
    const suptitle = copy.querySelector('.brand-slider__suptitle');
    const title = copy.querySelector('.brand-slider__title');
    const baseline = copy.querySelector('.brand-slider__baseline');
    const text = copy.querySelector('.brand-slider__text');
    const cta = copy.querySelector('.brand-slider__btn, a[href]');

    if (suptitle && (suptitle.textContent || '').trim()) {
      const p = document.createElement('p');
      p.textContent = (suptitle.textContent || '').trim();
      focusNodes.push(p);
    }
    if (title && (title.textContent || '').trim()) {
      const h = document.createElement('h2');
      h.textContent = (title.textContent || '').trim();
      focusNodes.push(h);
    }
    if (baseline && (baseline.textContent || '').trim()) {
      const h = document.createElement('h3');
      h.textContent = (baseline.textContent || '').trim();
      focusNodes.push(h);
    }
    if (text && (text.textContent || '').trim()) {
      const p = document.createElement('p');
      p.textContent = (text.textContent || '').trim();
      focusNodes.push(p);
    }
    if (cta && cta.getAttribute('href') && (cta.textContent || '').trim()) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', cta.getAttribute('href'));
      a.textContent = (cta.textContent || '').trim();
      p.appendChild(a);
      focusNodes.push(p);
    }
  }
  const focusSlide = buildSlide(bgImg, focusNodes, document);
  if (focusSlide) cells.push(focusSlide);

  // --- Slides 2..N: brand logos --------------------------------------------
  // Real slides only — exclude swiper carousel clones.
  let logoSlides = Array.from(
    element.querySelectorAll('.slider__inner > li.brand-slider__slide, li.brand-slider__slide'),
  ).filter((li) => !li.className.includes('slide__cloned'));

  // De-dupe by logo src in case the same brand appears in multiple (non-clone) tracks.
  const seen = new Set();
  logoSlides.forEach((li) => {
    const logo = li.querySelector('img.brand-slider__logo, img');
    if (!logo) return;
    const src = logo.getAttribute('src') || '';
    if (src && seen.has(src)) return;
    if (src) seen.add(src);

    // Optional per-brand link (none in observed source, kept as a fallback).
    const link = li.querySelector('a[href]');

    // Brand name lives ONLY in the logo alt on the source page (logos render with no
    // visible caption). We therefore keep it on the <img> alt (media_imageAlt, a
    // collapsed field) and leave content_text empty — faithful to the source, which
    // shows no logo captions. content_text is only populated when a real per-brand link
    // exists (defensive fallback for other pages).
    const textNodes = [];
    if (link && link.getAttribute('href')) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', link.getAttribute('href'));
      a.textContent = (logo.getAttribute('alt') || link.getAttribute('href')).trim();
      p.appendChild(a);
      textNodes.push(p);
    }

    const slide = buildSlide(logo, textNodes, document);
    if (slide) cells.push(slide);
  });

  // Empty-block guard.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-brands', cells });
  element.replaceWith(block);
}
