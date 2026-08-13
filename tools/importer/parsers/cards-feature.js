/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: cards-feature
 * Base block: cards
 * Source URL: https://www.loreal.com/en/groupe
 * Generated: 2026-08-06
 *
 * Structure (from library-description.txt + blocks/cards-feature/_cards-feature.json):
 *   Container block ("cards-feature" filter, child model "card"). First row = block name
 *   (handled by createBlock). Each subsequent row = ONE card with two cells (columns):
 *     - cell 1: image  (reference) -> field:image + <img>  (imageAlt collapsed onto <img> alt)
 *     - cell 2: text   (richtext)  -> field:text  + heading + description + "Discover" CTA
 *   Note: an image or text cell may be empty, but the (empty) cell must still be included.
 *
 * Source shape: each card is a `div.card-grid.slidercard__inner` containing
 *   `.slidercard__figure img` (KV image), `.slidercard__content` (`h3.slidercard__title`
 *   + `.slidercard__description` paragraph), and a trailing `a.btn--white` "Discover" link.
 *   The mapped selector (`#content .card-grid`) matches each card individually; the cards
 *   are siblings inside a shared `ul.storyslider__list`. To produce ONE 3-up feature grid
 *   (instead of three single-card blocks) we consolidate all sibling cards into a single
 *   block on the first invocation and mark the shared list so later invocations no-op.
 *   When no shared list ancestor exists we fall back to a single-card block per element.
 *
 * xwalk: field hints (image, text) inserted BEFORE content. Collapsed imageAlt gets no hint.
 */

/**
 * Build the two cells ([imageCell, textCell]) for a single card root element.
 * Returns null if the card has neither an image nor any text content.
 */
function buildCardCells(cardRoot, document) {
  const img = cardRoot.querySelector(
    '.slidercard__figure img, .slidercard__visual img, figure img, img',
  );
  const title = cardRoot.querySelector('.slidercard__title, h1, h2, h3, h4, h5, h6');
  const descWrap = cardRoot.querySelector('.slidercard__description');
  const cta = cardRoot.querySelector('a.btn, a.btn--white, .slidercard__cta a, a[href]');

  // Collect text content nodes first so we can skip the field:text hint on an empty cell.
  const textNodes = [];

  const titleText = title ? (title.textContent || '').trim() : '';
  if (titleText) {
    const tag = /^h[1-6]$/i.test(title.tagName) ? title.tagName.toLowerCase() : 'h3';
    const h = document.createElement(tag);
    h.textContent = titleText;
    textNodes.push(h);
  }

  if (descWrap) {
    const paras = descWrap.querySelectorAll('p');
    if (paras.length) {
      paras.forEach((p) => {
        if ((p.textContent || '').trim()) textNodes.push(p.cloneNode(true));
      });
    } else {
      const t = (descWrap.textContent || '').trim();
      if (t) {
        const p = document.createElement('p');
        p.textContent = t;
        textNodes.push(p);
      }
    }
  }

  if (cta) {
    const href = cta.getAttribute('href');
    const text = (cta.textContent || '').trim();
    if (href && text) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.textContent = text;
      p.appendChild(a);
      textNodes.push(p);
    }
  }

  if (!img && !textNodes.length) return null;

  // Cell 1: image (field:image). Empty cell (no hint) if no image.
  let imageCell = '';
  if (img) {
    imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(img);
  }

  // Cell 2: text (field:text). Empty cell (no hint) if no text.
  let textCell = '';
  if (textNodes.length) {
    textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textNodes.forEach((n) => textCell.appendChild(n));
  }

  return [imageCell, textCell];
}

export default function parse(element, { document }) {
  // Shared list ancestor that groups sibling cards into one grid.
  const groupList = element.closest('ul.storyslider__list, .storyslider__list');

  if (groupList) {
    // Consolidation path: only the first-processed card builds the combined block.
    if (groupList.hasAttribute('data-cf-consolidated')) return;
    groupList.setAttribute('data-cf-consolidated', '1');

    let cardRoots = Array.from(groupList.querySelectorAll('.card-grid'));
    if (!cardRoots.length) cardRoots = Array.from(groupList.querySelectorAll('.slidercard'));
    if (!cardRoots.length) cardRoots = [element];

    const cells = [];
    cardRoots.forEach((root) => {
      const row = buildCardCells(root, document);
      if (row) cells.push(row);
    });

    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }

    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
    // Replace the whole shared list (removing all sibling cards) with the single block.
    groupList.replaceWith(block);
    return;
  }

  // Single-card fallback: no shared list ancestor -> one card per element.
  const row = buildCardCells(element, document);
  if (!row) {
    element.replaceWith(...element.childNodes);
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells: [row] });
  element.replaceWith(block);
}
