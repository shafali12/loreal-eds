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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function buildCleanAnchor(document, srcAnchor, fallbackText) {
    if (!srcAnchor) return null;
    const href = srcAnchor.getAttribute("href");
    if (!href) return null;
    const a = document.createElement("a");
    a.setAttribute("href", href);
    const text = (srcAnchor.textContent || "").trim() || (fallbackText || "").trim();
    a.textContent = text;
    return a;
  }
  function parse(element, { document }) {
    let slides = Array.from(element.querySelectorAll(".slider__inner > li"));
    if (!slides.length) slides = Array.from(element.querySelectorAll("li.slider__slide"));
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".responsive-image__media img, .hero__image img, img");
      const heading = slide.querySelector(".hero-carousel__title, h1, h2, h3");
      const ctaSrc = slide.querySelector("a.hero__btn, a.btn, .hero-carousel__content a[href]");
      let imageCell;
      if (img) {
        imageCell = document.createDocumentFragment();
        imageCell.appendChild(document.createComment(" field:media_image "));
        imageCell.appendChild(img);
      } else {
        imageCell = "";
      }
      const contentCell = document.createDocumentFragment();
      const contentNodes = [];
      if (heading) contentNodes.push(heading);
      const cta = buildCleanAnchor(document, ctaSrc, heading ? heading.textContent : "");
      if (cta) contentNodes.push(cta);
      let textCell;
      if (contentNodes.length) {
        contentCell.appendChild(document.createComment(" field:content_text "));
        contentNodes.forEach((n) => contentCell.appendChild(n));
        textCell = contentCell;
      } else {
        textCell = "";
      }
      if (img || contentNodes.length) {
        cells.push([imageCell, textCell]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/search-box.js
  function parse2(element, { document }) {
    const indexUrl = "/query-index.json";
    const indexCell = document.createDocumentFragment();
    indexCell.appendChild(document.createComment(" field:index "));
    const link = document.createElement("a");
    link.setAttribute("href", indexUrl);
    link.textContent = indexUrl;
    indexCell.appendChild(link);
    const cells = [
      [indexCell]
      // single-column row: one cell holding the index field
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "search-box", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-scroller.js
  function parse3(element, { document }) {
    const introFragment = document.createDocumentFragment();
    const sideContent = element.querySelector(".scroll-slider__side-content");
    if (sideContent) {
      const eyebrow = sideContent.querySelector(".scroll-slider__sub-title");
      const title = sideContent.querySelector(".scroll-slider__title");
      const copy = sideContent.querySelector(".scroll-slider__copy");
      const titleText = title ? (title.textContent || "").trim() : "";
      if (titleText) {
        if (eyebrow && (eyebrow.textContent || "").trim()) {
          const h3 = document.createElement("h3");
          h3.textContent = (eyebrow.textContent || "").trim();
          introFragment.appendChild(h3);
        }
        const h2 = document.createElement("h2");
        h2.textContent = titleText;
        introFragment.appendChild(h2);
      }
      if (copy) {
        const copyText = (copy.textContent || "").trim();
        if (copyText) {
          const p = document.createElement("p");
          p.textContent = copyText;
          introFragment.appendChild(p);
        }
      }
    }
    let cards = Array.from(element.querySelectorAll(".scroller-content > .scroll-slider__slide"));
    if (!cards.length) cards = Array.from(element.querySelectorAll(".scroll-slider__slide"));
    if (!cards.length) cards = Array.from(element.querySelectorAll(".card"));
    const cells = [];
    cards.forEach((cardWrap) => {
      const img = cardWrap.querySelector(".responsive-image__media img, .image img, img");
      const titleEl = cardWrap.querySelector(".card__title, h2, h3, .card__text p");
      const linkSrc = cardWrap.querySelector("a.ghost-link, a[href]");
      const href = linkSrc ? linkSrc.getAttribute("href") : null;
      const titleText = titleEl ? (titleEl.textContent || "").trim() : "";
      let imageCell;
      if (img) {
        imageCell = document.createDocumentFragment();
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(img);
      } else {
        imageCell = "";
      }
      let textCell = "";
      if (titleText) {
        textCell = document.createDocumentFragment();
        textCell.appendChild(document.createComment(" field:text "));
        const p = document.createElement("p");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
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
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-scroller", cells });
    if (introFragment.childNodes.length) {
      element.replaceWith(introFragment, block);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/transformers/loreal-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, ["#onetrust-consent-sdk"]);
      element.querySelectorAll("a.skipto, li.cookie-atag").forEach((el) => {
        const list = el.closest("ul");
        if (list) {
          list.remove();
        } else {
          el.remove();
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        ".footer",
        "footer",
        "iframe",
        "link",
        "meta",
        "title"
      ]);
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-hero": parse,
    "search-box": parse2,
    "cards-scroller": parse3
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "L'Or\xE9al Groupe corporate homepage with a hero carousel, search box, and a horizontal 'beautiful stories' card scroller within the main content area.",
    urls: [
      "https://www.loreal.com/en/"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".hero-carousel"]
      },
      {
        name: "search-box",
        instances: ["#search-box-form"]
      },
      {
        name: "cards-scroller",
        instances: ["#content > div.container.container--is-maxwidth > div.container--large .scroll-slider"]
      }
    ]
  };
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
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
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
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
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
  return __toCommonJS(import_homepage_exports);
})();
