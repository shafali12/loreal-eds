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

  // tools/importer/import-brands-portfolio.js
  var import_brands_portfolio_exports = {};
  __export(import_brands_portfolio_exports, {
    default: () => import_brands_portfolio_default
  });

  // tools/importer/parsers/hero-stage.js
  function parse(element, { document }) {
    const img = element.querySelector(
      ".hero__image img, .image--hero img, .responsive-image__media img, img"
    );
    const title = element.querySelector(".hero__title, .hero__content h1, h1, h2");
    const desc = element.querySelector(".hero__desc, .hero__content p, p");
    const ctaLinks = Array.from(
      element.querySelectorAll(".hero__content a[href], a.button, a.cta")
    );
    const titleText = title ? (title.textContent || "").trim() : "";
    const descText = desc ? (desc.textContent || "").trim() : "";
    if (!img && !titleText && !descText && !ctaLinks.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (img) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(img);
      cells.push([imageCell]);
    }
    const textCell = document.createDocumentFragment();
    let hasText = false;
    textCell.appendChild(document.createComment(" field:text "));
    if (titleText) {
      const h1 = document.createElement("h1");
      h1.textContent = titleText;
      textCell.appendChild(h1);
      hasText = true;
    }
    if (descText) {
      const p = document.createElement("p");
      p.textContent = descText;
      textCell.appendChild(p);
      hasText = true;
    }
    ctaLinks.forEach((a) => {
      const href = a.getAttribute("href");
      const text = (a.textContent || "").trim();
      if (href && text) {
        const p = document.createElement("p");
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = text;
        p.appendChild(link);
        textCell.appendChild(p);
        hasText = true;
      }
    });
    if (hasText) {
      cells.push([textCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-stage", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-brands.js
  function buildSlide(img, textNodes, document) {
    let imageCell = "";
    if (img) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:media_image "));
      imageCell.appendChild(img);
    }
    let textCell = "";
    if (textNodes && textNodes.length) {
      textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:content_text "));
      textNodes.forEach((n) => textCell.appendChild(n));
    }
    if (!img && (!textNodes || !textNodes.length)) return null;
    return [imageCell, textCell];
  }
  function parse2(element, { document }) {
    const cells = [];
    const bgImg = element.querySelector(".brand-slider__background img, .image--brandSlider img");
    const copy = element.querySelector(".brand-slider__copy");
    const focusNodes = [];
    if (copy) {
      const suptitle = copy.querySelector(".brand-slider__suptitle");
      const title = copy.querySelector(".brand-slider__title");
      const baseline = copy.querySelector(".brand-slider__baseline");
      const text = copy.querySelector(".brand-slider__text");
      const cta = copy.querySelector(".brand-slider__btn, a[href]");
      if (suptitle && (suptitle.textContent || "").trim()) {
        const p = document.createElement("p");
        p.textContent = (suptitle.textContent || "").trim();
        focusNodes.push(p);
      }
      if (title && (title.textContent || "").trim()) {
        const h = document.createElement("h2");
        h.textContent = (title.textContent || "").trim();
        focusNodes.push(h);
      }
      if (baseline && (baseline.textContent || "").trim()) {
        const h = document.createElement("h3");
        h.textContent = (baseline.textContent || "").trim();
        focusNodes.push(h);
      }
      if (text && (text.textContent || "").trim()) {
        const p = document.createElement("p");
        p.textContent = (text.textContent || "").trim();
        focusNodes.push(p);
      }
      if (cta && cta.getAttribute("href") && (cta.textContent || "").trim()) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", cta.getAttribute("href"));
        a.textContent = (cta.textContent || "").trim();
        p.appendChild(a);
        focusNodes.push(p);
      }
    }
    const focusSlide = buildSlide(bgImg, focusNodes, document);
    if (focusSlide) cells.push(focusSlide);
    let logoSlides = Array.from(
      element.querySelectorAll(".slider__inner > li.brand-slider__slide, li.brand-slider__slide")
    ).filter((li) => !li.className.includes("slide__cloned"));
    const seen = /* @__PURE__ */ new Set();
    logoSlides.forEach((li) => {
      const logo = li.querySelector("img.brand-slider__logo, img");
      if (!logo) return;
      const src = logo.getAttribute("src") || "";
      if (src && seen.has(src)) return;
      if (src) seen.add(src);
      const link = li.querySelector("a[href]");
      const textNodes = [];
      if (link && link.getAttribute("href")) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", link.getAttribute("href"));
        a.textContent = (logo.getAttribute("alt") || link.getAttribute("href")).trim();
        p.appendChild(a);
        textNodes.push(p);
      }
      const slide = buildSlide(logo, textNodes, document);
      if (slide) cells.push(slide);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-brands", cells });
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

  // tools/importer/import-brands-portfolio.js
  var parsers = {
    "hero-stage": parse,
    "carousel-brands": parse2,
    "cards-scroller": parse3
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "brands-portfolio",
    description: "Brand portfolio page: hero stage, intro copy, a filterable brand slider with logo carousel, and a divisions card scroller.",
    urls: [
      "https://www.loreal.com/en/our-global-brands-portfolio"
    ],
    blocks: [
      { name: "hero-stage", instances: ["#content section.hero.hero--stage"] },
      { name: "carousel-brands", instances: ["#content section.brand-slider"] },
      { name: "cards-scroller", instances: ["#content .container--large:nth-of-type(3) .scroll-slider"] }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
  var import_brands_portfolio_default = {
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
  return __toCommonJS(import_brands_portfolio_exports);
})();
