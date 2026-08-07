import { decorateExternalImages } from '../../scripts/scripts.js';

export default function decorate(block) {
  // AEM delivers image fields as <a href="…jpg"> rather than <picture>; convert
  // them so the portrait picture detection below works on author/publish too.
  decorateExternalImages(block);
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-quote-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-quote-img-col');
        }
      }
    });
  });

  // Tag the text column and its parts so CSS can re-order/style them:
  // pull-quote (1st blockquote), body (2nd blockquote), name (p>strong), subtitle (p).
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      if (col.classList.contains('columns-quote-img-col')) return;
      if (!col.querySelector('blockquote, strong')) return;
      col.classList.add('columns-quote-text-col');

      const quotes = col.querySelectorAll('blockquote');
      if (quotes[0]) quotes[0].classList.add('columns-quote-pullquote');
      if (quotes[1]) quotes[1].classList.add('columns-quote-body');

      // Name = a <p> whose only child is <strong>; subtitle = a plain <p>.
      col.querySelectorAll('p').forEach((p) => {
        if (p.closest('blockquote')) return; // skip quote inner paragraphs
        const strongOnly = p.children.length === 1 && p.firstElementChild.tagName === 'STRONG';
        if (strongOnly) {
          p.classList.add('columns-quote-name');
        } else if (!p.querySelector('blockquote') && p.textContent.trim()) {
          // plain text paragraph that isn't the wrapper of the blockquotes
          const hasBlockChild = p.querySelector('blockquote, strong');
          if (!hasBlockChild) p.classList.add('columns-quote-subtitle');
        }
      });
    });
  });
}
