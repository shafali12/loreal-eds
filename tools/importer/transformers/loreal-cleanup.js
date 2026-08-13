/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: L'Oréal site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content (hero carousel, search box, cards scroller).
 *
 * ALL selectors below are verified against migration-work/cleaned.html:
 *   - #onetrust-consent-sdk ......... line 1100 (OneTrust cookie consent overlay)
 *   - a.skipto / li.cookie-atag ..... lines 26-38 (skip-to-content nav list)
 *   - header (header.header) ........ line 39 (site header: mega-menu, mobile menu,
 *                                              stock ticker, country + a11y modals)
 *   - .footer (div.footer) .......... line 1018 (footer block wrapper)
 *   - footer (footer.footer__legal) . line 1049 (nested legal footer)
 *   - iframe ........................ lines 1098, 1384 (empty tracking/util iframes)
 *   - link .......................... lines 4, 22 (stray <link> tags in body)
 *   - meta, title ................... lines 5-23 (head elements leaked into body)
 *
 * Block instances handled by parsers are intentionally NOT removed here:
 *   .hero-carousel (731), #search-box-form (832), .scroll-slider (861).
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Cookie consent overlay / preference center (blocks parsing if left in place).
    // Found in captured HTML: <div id="onetrust-consent-sdk"> (line 1100)
    WebImporter.DOMUtils.remove(element, ['#onetrust-consent-sdk']);

    // Skip-to-content navigation list (non-authorable a11y chrome).
    // Found in captured HTML: <a class="skipto"> and <li class="cookie-atag"> (lines 26-38)
    // Remove the whole enclosing <ul> so no empty list markup is left behind.
    element.querySelectorAll('a.skipto, li.cookie-atag').forEach((el) => {
      const list = el.closest('ul');
      if (list) {
        list.remove();
      } else {
        el.remove();
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome. Selectors verified in captured HTML.
    //   header ......... <header class="header"> (line 39)
    //   .footer ........ <div class="footer container container--large"> (line 1018)
    //   footer ......... <footer class="footer__legal"> (line 1049)
    //   iframe ......... empty util/tracking iframes (lines 1098, 1384)
    //   link ........... stray <link> tags in body (lines 4, 22)
    //   meta, title .... head elements leaked into body (lines 5-23)
    WebImporter.DOMUtils.remove(element, [
      'header',
      '.footer',
      'footer',
      'iframe',
      'link',
      'meta',
      'title',
    ]);
  }
}
