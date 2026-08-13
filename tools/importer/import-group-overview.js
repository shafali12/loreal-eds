/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroStageParser from './parsers/hero-stage.js';
import embedVideoParser from './parsers/embed-video.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import columnsStatsParser from './parsers/columns-stats.js';
import columnsQuoteParser from './parsers/columns-quote.js';

// TRANSFORMER IMPORTS
import lorealCleanupTransformer from './transformers/loreal-cleanup.js';

const parsers = {
  'hero-stage': heroStageParser,
  'embed-video': embedVideoParser,
  'cards-feature': cardsFeatureParser,
  'columns-stats': columnsStatsParser,
  'columns-quote': columnsQuoteParser,
};

const transformers = [
  lorealCleanupTransformer,
];

const PAGE_TEMPLATE = {
  name: 'group-overview',
  description: 'Group/about overview page: hero stage, intro copy with embedded video, 3-up feature cards, key-figures stats row, and a leadership quote with portrait.',
  urls: [
    'https://www.loreal.com/en/groupe',
  ],
  blocks: [
    { name: 'hero-stage', instances: ['#content section.hero.hero--stage'] },
    { name: 'embed-video', instances: ['#content .flowplayer-embed-container'] },
    { name: 'cards-feature', instances: ['#content .card-grid'] },
    { name: 'columns-stats', instances: ['#content .container--large.keycontainer-bg'] },
    { name: 'columns-quote', instances: ['#content .container--large.--margin-large'] },
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element, section: blockDef.section || null });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

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
