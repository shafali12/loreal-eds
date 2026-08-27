/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroStageParser from './parsers/hero-stage.js';
import columnsMediaParser from './parsers/columns-media.js';

// TRANSFORMER IMPORTS
import lorealCleanupTransformer from './transformers/loreal-cleanup.js';
import lorealSectionsTransformer from './transformers/loreal-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-stage': heroStageParser,
  'columns-media': columnsMediaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'beauty-science-and-technology',
  description: "L'Oréal Beauty Science & Technology section pages: full-bleed hero stage, a centered intro paragraph, and alternating two-column image + text media rows.",
  urls: [
    'https://www.loreal.com/en/beauty-science-and-technology/',
    'https://www.loreal.com/en/beauty-science-and-technology/beauty-research-and-innovation/',
    'https://www.loreal.com/en/beauty-science-and-technology/beauty-tech/',
    'https://www.loreal.com/en/beauty-science-and-technology/l-oreal-open-innovation/',
    'https://www.loreal.com/en/beauty-science-and-technology/l-oreal-open-innovation/beauty-tech-atelier/',
    'https://www.loreal.com/en/beauty-science-and-technology/l-oreal-open-innovation/creating-breakthrough-products-through-collaborative-play/',
  ],
  blocks: [
    {
      name: 'hero-stage',
      instances: [
        '#content section.container.hero.hero--stage',
        'section.hero.hero--stage',
      ],
    },
    {
      name: 'columns-media',
      instances: [
        '#content > div.container.container--is-maxwidth > div.container--large:has(.copy-block--imgdisplay img)',
        '#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(3)',
        '#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(4)',
        '#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(5)',
      ],
    },
  ],
  sections: [
    {
      id: 'rc3',
      name: 'Hero stage',
      selector: [
        '#content > div.container.container--is-maxwidth > section.container.hero.hero--stage.hero--bottom.hero--left',
        '#content section.container.hero.hero--stage',
      ],
      style: null,
      blocks: ['hero-stage'],
      defaultContent: [],
    },
    {
      id: 'rc5',
      name: 'Intro paragraph',
      selector: '#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(2)',
      style: null,
      blocks: [],
      defaultContent: [
        '#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(2) .copy-block--fullwidth p',
      ],
    },
    {
      id: 'rc6',
      name: 'Media row 1',
      selector: '#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(3)',
      style: null,
      blocks: ['columns-media'],
      defaultContent: [],
    },
    {
      id: 'rc7',
      name: 'Media row 2',
      selector: '#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(4)',
      style: null,
      blocks: ['columns-media'],
      defaultContent: [],
    },
    {
      id: 'rc8',
      name: 'Media row 3',
      selector: '#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(5)',
      style: null,
      blocks: ['columns-media'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup runs first, section boundaries after
const transformers = [
  lorealCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [lorealSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration.
 * De-duplicates by element so a block matched by multiple selectors
 * (e.g. :has() plus nth-of-type fallbacks) is only parsed once.
 * @param {Document} document
 * @param {Object} template - PAGE_TEMPLATE
 * @returns {Array} block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      let elements;
      try {
        elements = document.querySelectorAll(selector);
      } catch (e) {
        console.warn(`Invalid selector for "${blockDef.name}": ${selector}`, e.message);
        return;
      }
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        if (seen.has(element)) return; // already captured by an earlier selector
        seen.add(element);
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup + section breaks)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return; // already replaced by earlier parser
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section metadata anchoring)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
