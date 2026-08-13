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

  // tools/importer/import-group-overview.js
  var import_group_overview_exports = {};
  __export(import_group_overview_exports, {
    default: () => import_group_overview_default
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

  // tools/importer/parsers/embed-video.js
  function parse2(element, { document }) {
    const iframe = element.querySelector("iframe[src]");
    const linkEl = element.querySelector("a[href]");
    const embedUrl = iframe ? iframe.getAttribute("src") : linkEl ? linkEl.getAttribute("href") : null;
    const poster = element.querySelector("img");
    if (!embedUrl) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const contentCell = document.createDocumentFragment();
    if (poster) {
      contentCell.appendChild(document.createComment(" field:embed_placeholder "));
      contentCell.appendChild(poster);
    }
    contentCell.appendChild(document.createComment(" field:embed_uri "));
    const a = document.createElement("a");
    a.setAttribute("href", embedUrl);
    a.textContent = embedUrl;
    contentCell.appendChild(a);
    const cells = [[contentCell]];
    const block = WebImporter.Blocks.createBlock(document, { name: "embed-video", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function buildCardCells(cardRoot, document) {
    const img = cardRoot.querySelector(
      ".slidercard__figure img, .slidercard__visual img, figure img, img"
    );
    const title = cardRoot.querySelector(".slidercard__title, h1, h2, h3, h4, h5, h6");
    const descWrap = cardRoot.querySelector(".slidercard__description");
    const cta = cardRoot.querySelector("a.btn, a.btn--white, .slidercard__cta a, a[href]");
    const textNodes = [];
    const titleText = title ? (title.textContent || "").trim() : "";
    if (titleText) {
      const tag = /^h[1-6]$/i.test(title.tagName) ? title.tagName.toLowerCase() : "h3";
      const h = document.createElement(tag);
      h.textContent = titleText;
      textNodes.push(h);
    }
    if (descWrap) {
      const paras = descWrap.querySelectorAll("p");
      if (paras.length) {
        paras.forEach((p) => {
          if ((p.textContent || "").trim()) textNodes.push(p.cloneNode(true));
        });
      } else {
        const t = (descWrap.textContent || "").trim();
        if (t) {
          const p = document.createElement("p");
          p.textContent = t;
          textNodes.push(p);
        }
      }
    }
    if (cta) {
      const href = cta.getAttribute("href");
      const text = (cta.textContent || "").trim();
      if (href && text) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.setAttribute("href", href);
        a.textContent = text;
        p.appendChild(a);
        textNodes.push(p);
      }
    }
    if (!img && !textNodes.length) return null;
    let imageCell = "";
    if (img) {
      imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(img);
    }
    let textCell = "";
    if (textNodes.length) {
      textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      textNodes.forEach((n) => textCell.appendChild(n));
    }
    return [imageCell, textCell];
  }
  function parse3(element, { document }) {
    const groupList = element.closest("ul.storyslider__list, .storyslider__list");
    if (groupList) {
      if (groupList.hasAttribute("data-cf-consolidated")) return;
      groupList.setAttribute("data-cf-consolidated", "1");
      let cardRoots = Array.from(groupList.querySelectorAll(".card-grid"));
      if (!cardRoots.length) cardRoots = Array.from(groupList.querySelectorAll(".slidercard"));
      if (!cardRoots.length) cardRoots = [element];
      const cells = [];
      cardRoots.forEach((root) => {
        const row2 = buildCardCells(root, document);
        if (row2) cells.push(row2);
      });
      if (!cells.length) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const block2 = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
      groupList.replaceWith(block2);
      return;
    }
    const row = buildCardCells(element, document);
    if (!row) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells: [row] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-stats.js
  function parse4(element, { document }) {
    let statCols = Array.from(element.querySelectorAll(".key-figure__cols"));
    if (!statCols.length) statCols = Array.from(element.querySelectorAll(".key-figure > div, .key-figure__col"));
    const rowCells = [];
    statCols.forEach((col) => {
      const numberEl = col.querySelector("p.normal, .key-figure__number, p:first-of-type");
      const labelEl = col.querySelector(".key-figure--subtitle, p.key-figure--subtitle, p:last-of-type");
      const cellNodes = [];
      if (numberEl) {
        const numHtml = (numberEl.innerHTML || "").trim();
        const numText = (numberEl.textContent || "").trim();
        if (numText) {
          const h = document.createElement("h2");
          h.innerHTML = numHtml;
          cellNodes.push(h);
        }
      }
      if (labelEl && labelEl !== numberEl) {
        const labelText = (labelEl.textContent || "").trim();
        if (labelText) {
          const p = document.createElement("p");
          p.innerHTML = (labelEl.innerHTML || "").trim();
          cellNodes.push(p);
        }
      }
      if (cellNodes.length) rowCells.push(cellNodes);
    });
    if (!rowCells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [rowCells];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-stats", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-quote.js
  function parse5(element, { document }) {
    const manifesto = element.matches(".manifesto") ? element : element.querySelector(".manifesto");
    const isSignature = element.matches("blockquote.signature") || !manifesto && !!element.querySelector("blockquote.signature");
    const scope = manifesto ? manifesto.querySelector(".manifesto__content-normal") || manifesto : element;
    let portrait = null;
    if (manifesto) {
      const candidate = manifesto.querySelector(".manifesto__image img, .image img, img");
      if (candidate) {
        const src = candidate.getAttribute("src") || "";
        if (!src.startsWith("data:")) portrait = candidate;
      }
    }
    const quoteEls = [];
    if (isSignature) {
      const q = (manifesto ? scope : element).querySelector(
        "p.Medium, blockquote > p, p:first-of-type"
      );
      if (q && (q.textContent || "").trim()) quoteEls.push(q);
    } else {
      const title = scope.querySelector(".manifesto__title, h2, h3");
      if (title && (title.textContent || "").trim()) quoteEls.push(title);
      const copy = scope.querySelector("blockquote.manifesto__copy, .manifesto__copy, blockquote");
      if (copy && (copy.textContent || "").trim()) quoteEls.push(copy);
    }
    const nameEl = scope.querySelector(".manifesto__name, .signature__name");
    const titleEl = scope.querySelector(".manifesto__position, .signature__jobtitle");
    const nameText = nameEl ? (nameEl.textContent || "").trim() : "";
    const roleText = titleEl ? (titleEl.textContent || "").trim() : "";
    const textCell = [];
    quoteEls.forEach((q) => {
      if (/^blockquote$/i.test(q.tagName)) {
        const bq = document.createElement("blockquote");
        bq.innerHTML = (q.innerHTML || "").trim();
        textCell.push(bq);
      } else {
        const bq = document.createElement("blockquote");
        const p = document.createElement("p");
        p.textContent = (q.textContent || "").trim();
        bq.appendChild(p);
        textCell.push(bq);
      }
    });
    if (nameText) {
      const p = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = nameText;
      p.appendChild(strong);
      textCell.push(p);
    }
    if (roleText) {
      const p = document.createElement("p");
      p.textContent = roleText;
      textCell.push(p);
    }
    if (!textCell.length && !portrait) {
      element.replaceWith(...element.childNodes);
      return;
    }
    let cells;
    if (portrait) {
      cells = [[[portrait], textCell]];
    } else {
      cells = [[textCell]];
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-quote", cells });
    element.replaceWith(block);
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

  // tools/importer/import-group-overview.js
  var parsers = {
    "hero-stage": parse,
    "embed-video": parse2,
    "cards-feature": parse3,
    "columns-stats": parse4,
    "columns-quote": parse5
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "group-overview",
    description: "Group/about overview page: hero stage, intro copy with embedded video, 3-up feature cards, key-figures stats row, and a leadership quote with portrait.",
    urls: [
      "https://www.loreal.com/en/groupe"
    ],
    blocks: [
      { name: "hero-stage", instances: ["#content section.hero.hero--stage"] },
      { name: "embed-video", instances: ["#content .flowplayer-embed-container"] },
      { name: "cards-feature", instances: ["#content .card-grid"] },
      { name: "columns-stats", instances: ["#content .container--large.keycontainer-bg"] },
      { name: "columns-quote", instances: ["#content .container--large.--margin-large"] }
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
  var import_group_overview_default = {
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
  return __toCommonJS(import_group_overview_exports);
})();
