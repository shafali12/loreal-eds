/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-beauty-science-and-technology.js
  var import_beauty_science_and_technology_exports = {};
  __export(import_beauty_science_and_technology_exports, {
    default: () => import_beauty_science_and_technology_default
  });

  // tools/importer/parsers/hero-stage.js
  function parse(element, { document }) {
    const image = element.querySelector(
      ".image--hero img, .hero__image img, .image img, img"
    );
    const heading = element.querySelector('h1.hero__title, h1, h2, [class*="title"]');
    const description = element.querySelector("p.hero__desc, .hero__content p, p");
    const cta = element.querySelector('a.btn, .hero__content a, a[class*="button"]');
    if (!image && !heading && !description) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(image);
      cells.push([imageCell]);
    }
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    if (heading) textCell.appendChild(heading);
    if (description) textCell.appendChild(description);
    if (cta) textCell.appendChild(cta);
    cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-stage", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-media.js
  function parse2(element, { document }) {
    let contentCells = Array.from(
      element.querySelectorAll(".copy-block--imgdisplay")
    );
    if (contentCells.length < 2) {
      const copyBlock = element.querySelector(".copy-block") || element;
      contentCells = Array.from(copyBlock.children).filter(
        (child) => child.querySelector("img, h2, h3, p")
      );
    }
    if (contentCells.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const rowCells = contentCells.map((cell) => {
      const contents = Array.from(cell.childNodes);
      return contents.length ? contents : [cell];
    });
    const cells = [rowCells];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/loreal-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        // cookie banner + preference center
        "iframe"
        // ot-text-resize / consent overlay iframes (cleaned.html line 901, 1187)
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Empty leading page-shell div (cleaned.html lines 2-3).
        "body > div:nth-of-type(1)",
        // Skip-to-content accessibility links, auto-populated chrome (cleaned.html lines 24-25).
        "#main-container > ul",
        // Global site header + mega menu (cleaned.html line 38).
        "header.header",
        // Breadcrumb navigation wrapper, auto-populated (cleaned.html lines 740-755).
        "#content > div.container.container--is-maxwidth > div.container--large.--white",
        // Global site footer (cleaned.html line 819).
        ".footer.container.container--large",
        // Non-authorable head/meta leftovers.
        "link",
        "meta",
        "title",
        "noscript",
        "style",
        "script"
      ]);
    }
  }

  // tools/importer/transformers/loreal-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function findSectionEl(root, selector) {
    const selectors = Array.isArray(selector) ? selector : [selector];
    for (const sel of selectors) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = findSectionEl(element, section.selector);
        if (!sectionEl) continue;
        const hr = element.ownerDocument.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || findSectionEl(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(element.ownerDocument, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-beauty-science-and-technology.js
  var parsers = {
    "hero-stage": parse,
    "columns-media": parse2
  };
  var PAGE_TEMPLATE = {
    name: "beauty-science-and-technology",
    description: "L'Or\xE9al Beauty Science & Technology section pages: full-bleed hero stage, a centered intro paragraph, and alternating two-column image + text media rows.",
    urls: [
      "https://www.loreal.com/en/beauty-science-and-technology/",
      "https://www.loreal.com/en/beauty-science-and-technology/beauty-research-and-innovation/",
      "https://www.loreal.com/en/beauty-science-and-technology/beauty-tech/",
      "https://www.loreal.com/en/beauty-science-and-technology/l-oreal-open-innovation/",
      "https://www.loreal.com/en/beauty-science-and-technology/l-oreal-open-innovation/beauty-tech-atelier/",
      "https://www.loreal.com/en/beauty-science-and-technology/l-oreal-open-innovation/creating-breakthrough-products-through-collaborative-play/"
    ],
    blocks: [
      {
        name: "hero-stage",
        instances: [
          "#content section.container.hero.hero--stage",
          "section.hero.hero--stage"
        ]
      },
      {
        name: "columns-media",
        instances: [
          "#content > div.container.container--is-maxwidth > div.container--large:has(.copy-block--imgdisplay img)",
          "#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(3)",
          "#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(4)",
          "#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(5)"
        ]
      }
    ],
    sections: [
      {
        id: "rc3",
        name: "Hero stage",
        selector: [
          "#content > div.container.container--is-maxwidth > section.container.hero.hero--stage.hero--bottom.hero--left",
          "#content section.container.hero.hero--stage"
        ],
        style: null,
        blocks: ["hero-stage"],
        defaultContent: []
      },
      {
        id: "rc5",
        name: "Intro paragraph",
        selector: "#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(2)",
        style: null,
        blocks: [],
        defaultContent: [
          "#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(2) .copy-block--fullwidth p"
        ]
      },
      {
        id: "rc6",
        name: "Media row 1",
        selector: "#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(3)",
        style: null,
        blocks: ["columns-media"],
        defaultContent: []
      },
      {
        id: "rc7",
        name: "Media row 2",
        selector: "#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(4)",
        style: null,
        blocks: ["columns-media"],
        defaultContent: []
      },
      {
        id: "rc8",
        name: "Media row 3",
        selector: "#content > div.container.container--is-maxwidth > div.container--large:nth-of-type(5)",
        style: null,
        blocks: ["columns-media"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
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
    const seen = /* @__PURE__ */ new Set();
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
          if (seen.has(element)) return;
          seen.add(element);
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_beauty_science_and_technology_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_beauty_science_and_technology_exports);
})();
