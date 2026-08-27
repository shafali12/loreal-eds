/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: loreal.com site-wide cleanup.
 * Removes non-authorable global chrome so the import contains only page-level
 * authorable content. Every selector below was verified against the captured
 * DOM in migration-work/cleaned.html.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // OneTrust cookie consent SDK + its overlay iframe (cleaned.html lines 901-1187).
    // Removed early so it can't interfere with block matching.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk', // cookie banner + preference center
      'iframe', // ot-text-resize / consent overlay iframes (cleaned.html line 901, 1187)
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Empty leading page-shell div (cleaned.html lines 2-3).
      'body > div:nth-of-type(1)',
      // Skip-to-content accessibility links, auto-populated chrome (cleaned.html lines 24-25).
      '#main-container > ul',
      // Global site header + mega menu (cleaned.html line 38).
      'header.header',
      // Breadcrumb navigation wrapper, auto-populated (cleaned.html lines 740-755).
      '#content > div.container.container--is-maxwidth > div.container--large.--white',
      // Global site footer (cleaned.html line 819).
      '.footer.container.container--large',
      // Non-authorable head/meta leftovers.
      'link',
      'meta',
      'title',
      'noscript',
      'style',
      'script',
    ]);
  }
}
