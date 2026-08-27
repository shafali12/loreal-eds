/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: loreal.com section boundaries.
 * Inserts a section-break <hr> before every section except the first, and a
 * Section Metadata block after every section that carries a `style`.
 * Section selectors come from payload.template.sections (DOM-verified during
 * page analysis). Breaks are inserted in beforeTransform — before block
 * parsers can replace section elements — and metadata is anchored in
 * afterTransform via a temporary marker on the inserted <hr>.
 *
 * For the beauty-science-and-technology template all five sections have
 * style === null, so this transformer inserts 4 section-break <hr> elements
 * (one before each non-first section) and no Section Metadata blocks.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

// Section selectors in page-templates.json may be a string or an array of
// candidate selectors (e.g. section rc3). Return the first element that matches.
function findSectionEl(root, selector) {
  const selectors = Array.isArray(selector) ? selector : [selector];
  for (const sel of selectors) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    // Insert breaks now, before parsers can replace any section element.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no break, no metadata needed

      const sectionEl = findSectionEl(element, section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = element.ownerDocument.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    // Parsers have now run and may have replaced section elements. Anchor each
    // styled section's Section Metadata block to whichever still exists: the
    // marker <hr> placed above, or (first section, no marker inserted) the
    // original element itself.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || findSectionEl(element, section.selector);
      if (!anchor) continue; // neither survived — selector didn't match post-parse; skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(element.ownerDocument, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
