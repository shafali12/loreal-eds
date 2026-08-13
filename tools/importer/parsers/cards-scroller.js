/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-scroller
 * Base block: cards
 * Source URL: https://www.loreal.com/en/
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt + blocks/cards-scroller/_cards-scroller.json):
 *   Container block. First row = block name (handled by createBlock).
 *   Each subsequent row = one card with two cells (columns):
 *     - cell 1: image  (reference)  -> <!-- field:image --> + <img>
 *               imageAlt is a collapsed field (ends with "Alt") -> carried as the img alt attribute, no comment.
 *     - cell 2: text   (richtext)   -> <!-- field:text --> + title (as a link to the destination)
 *   Note: an image cell may be empty (no image present) but the cell must still be included.
 *
 * Source shape: each `.scroll-slider__slide` contains a `.card` with an image, a `.card__title`
 * caption, and a `.ghost-link` anchor (whole-card link with off-screen label). We surface the
 * title as the linked text pointing at the card's destination.
 *
 * xwalk: field hints (image, text) inserted before content. Collapsed imageAlt gets no hint.
 *
 * The source `.scroll-slider` also contains an intro text column
 * (`.scroll-slider__side-content`: an eyebrow, a heading, and a paragraph). That is
 * default content, not part of the cards block, so we lift it OUT of the block and
 * insert it as sibling default content immediately before the generated block.
 */
export default function parse(element, { document }) {
  // Preserve the intro text column ("Discover" eyebrow + "Our beautiful stories"
  // heading + intro paragraph) as default content placed before the cards block.
  const introFragment = document.createDocumentFragment();
  const sideContent = element.querySelector('.scroll-slider__side-content');
  if (sideContent) {
    const eyebrow = sideContent.querySelector('.scroll-slider__sub-title');
    const title = sideContent.querySelector('.scroll-slider__title');
    const copy = sideContent.querySelector('.scroll-slider__copy');

    const titleText = title ? (title.textContent || '').trim() : '';
    if (titleText) {
      // Eyebrow becomes a small heading above the main heading.
      if (eyebrow && (eyebrow.textContent || '').trim()) {
        const h3 = document.createElement('h3');
        h3.textContent = (eyebrow.textContent || '').trim();
        introFragment.appendChild(h3);
      }
      const h2 = document.createElement('h2');
      h2.textContent = titleText;
      introFragment.appendChild(h2);
    }
    if (copy) {
      const copyText = (copy.textContent || '').trim();
      if (copyText) {
        const p = document.createElement('p');
        p.textContent = copyText;
        introFragment.appendChild(p);
      }
    }
  }

  // Collect cards. Primary: slide wrappers; fallback: card elements directly.
  let cards = Array.from(element.querySelectorAll('.scroller-content > .scroll-slider__slide'));
  if (!cards.length) cards = Array.from(element.querySelectorAll('.scroll-slider__slide'));
  if (!cards.length) cards = Array.from(element.querySelectorAll('.card'));

  const cells = [];

  cards.forEach((cardWrap) => {
    // INPUT extraction (validated against source.html)
    const img = cardWrap.querySelector('.responsive-image__media img, .image img, img');
    const titleEl = cardWrap.querySelector('.card__title, h2, h3, .card__text p');
    const linkSrc = cardWrap.querySelector('a.ghost-link, a[href]');
    const href = linkSrc ? linkSrc.getAttribute('href') : null;
    const titleText = titleEl ? (titleEl.textContent || '').trim() : '';

    // Cell 1: image (image field). Alt collapsed into the <img>.
    let imageCell;
    if (img) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    } else {
      imageCell = ''; // keep the column; empty cell gets no hint
    }

    // Cell 2: text (text field) = title as a link to the destination.
    let textCell = '';
    if (titleText) {
      textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(' field:text '));
      const p = document.createElement('p');
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = titleText;
        p.appendChild(a);
      } else {
        p.textContent = titleText;
      }
      textCell.appendChild(p);
    }

    if (img || titleText) {
      cells.push([imageCell, textCell]);
    }
  });

  // Empty-block guard: nothing usable extracted.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-scroller', cells });

  // Emit the intro default content (if any) before the block, then the block.
  if (introFragment.childNodes.length) {
    element.replaceWith(introFragment, block);
  } else {
    element.replaceWith(block);
  }
}
