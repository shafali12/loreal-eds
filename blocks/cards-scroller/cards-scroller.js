import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Build an always-visible horizontal scroll progress bar synced to the card
 * list's scroll position (mirrors the L'Oréal "beautiful stories" scroller).
 * @param {HTMLElement} ul the scrolling card list
 * @returns {HTMLElement} the scroller wrapper (ul + track)
 */
function withScrollTrack(ul) {
  const scroller = document.createElement('div');
  scroller.className = 'cards-scroller-scroller';

  const track = document.createElement('div');
  track.className = 'cards-scroller-track';
  const thumb = document.createElement('div');
  thumb.className = 'cards-scroller-thumb';
  track.append(thumb);

  scroller.append(ul, track);

  const update = () => {
    const { scrollWidth, clientWidth, scrollLeft } = ul;
    const scrollable = scrollWidth > clientWidth + 1;
    track.hidden = !scrollable;
    if (!scrollable) return;
    const ratio = clientWidth / scrollWidth;
    const maxScroll = scrollWidth - clientWidth;
    const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
    thumb.style.width = `${ratio * 100}%`;
    thumb.style.left = `${progress * (100 - ratio * 100)}%`;
  };

  ul.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  // Recompute once images have loaded and set an initial state.
  requestAnimationFrame(update);
  ul.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', update, { once: true });
  });

  return scroller;
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-scroller-card-image';
      else div.className = 'cards-scroller-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    // Preserve the source's focal point (Scene7/DM cx,cy in 0..1) so cover-cropping
    // frames the image like the live site instead of defaulting to the centre.
    // Some L'Oréal card images are landscape sources cropped to portrait server-side;
    // createOptimizedPicture strips those crop params, so we reapply the focal point.
    let objectPosition = '';
    try {
      const params = new URL(img.src, window.location.href).searchParams;
      const cx = parseFloat(params.get('cx'));
      const cy = parseFloat(params.get('cy'));
      if (!Number.isNaN(cx) && !Number.isNaN(cy)) {
        objectPosition = `${(cx * 100).toFixed(1)}% ${(cy * 100).toFixed(1)}%`;
      }
    } catch (e) { /* non-URL src (data:), leave default centring */ }

    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    const newImg = optimizedPic.querySelector('img');
    if (objectPosition) newImg.style.objectPosition = objectPosition;
    moveInstrumentation(img, newImg);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';

  const scroller = withScrollTrack(ul);

  // Absorb the preceding intro default-content ("Discover" / "Our beautiful
  // stories" + paragraph) so it can sit as a text column to the left of the
  // scrolling cards, matching the source "beautiful stories" layout. The intro
  // is authored as normal default content; we only relocate it at render time.
  const wrapper = block.closest('.cards-scroller-wrapper') || block.parentElement;
  const prev = wrapper?.previousElementSibling;
  const intro = prev && prev.classList.contains('default-content-wrapper') ? prev : null;

  if (intro) {
    const layout = document.createElement('div');
    layout.className = 'cards-scroller-layout';

    const textCol = document.createElement('div');
    textCol.className = 'cards-scroller-intro';
    while (intro.firstChild) textCol.append(intro.firstChild);
    intro.remove();

    // Drop breadcrumb/navigation lists that may have been absorbed with the intro
    // default content — only the eyebrow, heading and copy belong in the intro.
    // A breadcrumb is a short list whose items are all plain inline content
    // (links or the current-page label) and never contain images.
    textCol.querySelectorAll('ul, ol, nav').forEach((list) => {
      const items = [...list.querySelectorAll(':scope > li')];
      if (!items.length) return;
      const hasImage = list.querySelector('img, picture');
      const allInline = items.every((li) => li.querySelector('a, strong') && !li.querySelector('img, picture'));
      if (!hasImage && allInline) list.remove();
    });

    layout.append(textCol, scroller);
    block.append(layout);
  } else {
    block.append(scroller);
  }
}
