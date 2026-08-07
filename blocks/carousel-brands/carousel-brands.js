import { moveInstrumentation, decorateExternalImages } from '../../scripts/scripts.js';

/*
 * Brand-portfolio carousel (L'Oréal "Our global complementary brands").
 * A featured-brand area sits above a horizontally scrollable strip of circular
 * brand-logo chips flanked by round prev/next arrows. Selecting a brand — via a
 * chip or the arrows — updates the featured area and highlights/centres its chip.
 *
 * Authored content per slide is two columns: [image] + [optional richtext].
 * The one slide that carries richtext (image + eyebrow/name/tagline/description/
 * CTA) is the "rich" featured brand shown on load. The remaining image-only
 * slides are logo chips; selecting one shows that brand's logo + name in the
 * featured area (best-effort, since the source only authored one rich brand).
 */

function elem(tag, cls) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  return node;
}

function navButton(dir, label) {
  const btn = elem('button', `carousel-brands-nav carousel-brands-nav-${dir}`);
  btn.type = 'button';
  btn.setAttribute('aria-label', label);
  return btn;
}

/** Smoothly centre a chip within the scrolling rail. */
function centreChip(rail, chip) {
  const railRect = rail.getBoundingClientRect();
  const chipRect = chip.getBoundingClientRect();
  const delta = (chipRect.left + chipRect.width / 2) - (railRect.left + railRect.width / 2);
  rail.scrollBy({ left: delta, behavior: 'smooth' });
}

/**
 * Best-effort brand name from a logo's alt text. Logo alts are noisy
 * ("garnier-logo", "MIUMIU LOGO", "Untitled design (8)", "takami-logoV2"), so
 * strip logo/version cruft and reject anything that still looks like a filename.
 */
function cleanBrandName(alt) {
  if (!alt) return '';
  const name = alt
    .replace(/[-_]+/g, ' ')
    .replace(/\blogos?\b/gi, '')
    .replace(/\bv\d+\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (name.length < 2) return '';
  if (/untitled|design|\d{3}|x\d/i.test(name)) return '';
  return name.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
}

// The four L'Oréal divisions, keyed by the slug used in brand-page URLs.
const DIVISIONS = [
  { key: 'all', label: 'All' },
  { key: 'consumer-products-division', label: 'Consumer Products Division' },
  { key: 'luxe-division', label: 'Luxe Division' },
  { key: 'professional-products-division', label: 'Professional Products Division' },
  { key: 'dermatological-beauty-division', label: 'Dermatological Beauty Division' },
];

/**
 * The migrated brand logos carry no division metadata of their own, but the page
 * keeps a sibling default-content list of brand links immediately after the block
 * — one <a href="/en/{division}/{slug}/"> per slide, in the SAME order as the
 * slides. We read each link's division from its href and pair it positionally to
 * the chips (skipping the single link that corresponds to the rich/featured brand,
 * which is not rendered as a chip). Returns an array aligned to chipSlides, plus
 * the sibling wrapper so the caller can hide the now-redundant raw link list.
 */
function extractDivisions(block, chipCount, richHref) {
  const main = block.closest('main') || document;
  // The brand-link list is a paragraph of per-brand division anchors that the
  // page keeps as default content near the block. Find the <p> that holds the
  // most brand-page links (deep links of the form /en/{division}/{slug}/) — this
  // is specific enough to skip the division-root links and the divisions cards.
  const brandLink = (a) => /\/en\/[a-z-]+-division\/[^/]+\//.test(a.getAttribute('href') || '');
  let linkList = null;
  let best = 0;
  main.querySelectorAll('p').forEach((p) => {
    const n = [...p.querySelectorAll('a[href]')].filter(brandLink).length;
    if (n > best) { best = n; linkList = p; }
  });
  if (!linkList || best < chipCount) return { divisions: null, linkList: null };

  const richSlug = richHref ? (richHref.match(/\/([^/]+)\/?$/) || [])[1] : null;
  const parsed = [...linkList.querySelectorAll('a[href]')].filter(brandLink).map((a) => {
    const m = (a.getAttribute('href') || '').match(/\/en\/([a-z-]+-division)\/([^/]+)\//);
    return m ? { division: m[1], slug: m[2] } : null;
  }).filter(Boolean);

  // Drop the anchor for the rich brand so the remaining list aligns 1:1 with chips.
  let aligned = parsed;
  if (richSlug) {
    const richIdx = parsed.findIndex((p) => p.slug === richSlug);
    if (richIdx >= 0) aligned = parsed.filter((_, i) => i !== richIdx);
  }
  if (aligned.length !== chipCount) return { divisions: null, linkList };
  return { divisions: aligned.map((p) => p.division), linkList };
}

export default function decorate(block) {
  // AEM delivers image fields as <a href="…jpg"> rather than <picture>; convert
  // them first so the picture-based slide detection below works on author/publish.
  decorateExternalImages(block);
  const rows = [...block.querySelectorAll(':scope > div')];
  const parsed = rows.map((row) => {
    const cols = [...row.children];
    const imageCol = cols[0] || null;
    const contentCol = cols[1] || null;
    const hasContent = !!contentCol && contentCol.textContent.trim().length > 0;
    const picture = imageCol ? imageCol.querySelector('picture') : null;
    const img = picture ? picture.querySelector('img') : null;
    return {
      row, picture, img, contentCol, hasContent,
    };
  });

  const rich = parsed.find((s) => s.hasContent && s.picture) || null;
  const chipSlides = parsed.filter((s) => s !== rich && s.picture);

  // Detach the rich brand's authored content so it can be re-rendered on demand.
  let richContent = null;
  if (rich) {
    richContent = document.createDocumentFragment();
    while (rich.contentCol.firstChild) richContent.append(rich.contentCol.firstChild);
  }

  // Pair each chip with its division (from the sibling brand-link list), so the
  // hero filter tabs can show/hide chips per division like the live site.
  // Read the rich brand's CTA href from the detached fragment (its content was
  // just moved out of rich.contentCol above, so query the fragment, not the cell).
  const richHref = richContent
    ? (richContent.querySelector('a[href]')?.getAttribute('href') || '')
    : '';
  const { divisions, linkList } = extractDivisions(block, chipSlides.length, richHref);
  if (divisions) {
    chipSlides.forEach((s, i) => { s.division = divisions[i]; });
    // The raw link list has served its purpose (division source); hide it so it
    // does not duplicate the carousel as a wall of empty logo links.
    if (linkList) linkList.hidden = true;
  }

  block.textContent = '';

  const hero = elem('div', 'carousel-brands-hero');
  const bg = elem('div', 'carousel-brands-hero-bg');
  const content = elem('div', 'carousel-brands-hero-content');
  hero.append(bg, content);

  // --- Division filter tabs (only when we resolved divisions) ---
  const presentDivisions = divisions
    ? DIVISIONS.filter((d) => d.key === 'all' || divisions.includes(d.key))
    : [];
  let filterList = null;
  if (presentDivisions.length > 1) {
    filterList = elem('ul', 'carousel-brands-filters');
    presentDivisions.forEach((d) => {
      const li = elem('li', 'carousel-brands-filter');
      const btn = elem('button');
      btn.type = 'button';
      btn.dataset.division = d.key;
      btn.textContent = d.label;
      if (d.key === 'all') btn.classList.add('is-active');
      li.append(btn);
      filterList.append(li);
    });
  }

  // --- Brand-logo selector strip ---
  const selector = elem('div', 'carousel-brands-selector');
  const prev = navButton('prev', 'Previous brand');
  const next = navButton('next', 'Next brand');
  const rail = elem('ul', 'carousel-brands-rail');

  chipSlides.forEach((s, idx) => {
    const li = elem('li', 'carousel-brands-chip');
    if (s.division) li.dataset.division = s.division;
    moveInstrumentation(s.row, li);
    const btn = elem('button');
    btn.type = 'button';
    if (s.picture) btn.append(s.picture);
    s.name = cleanBrandName(s.img && s.img.alt);
    btn.setAttribute('aria-label', s.name || `Brand ${idx + 1}`);
    // eslint-disable-next-line no-use-before-define
    btn.addEventListener('click', () => select(idx));
    li.append(btn);
    rail.append(li);
  });

  selector.append(prev, rail, next);
  if (filterList) hero.append(filterList);
  hero.append(selector);
  block.append(hero);

  const chips = [...rail.querySelectorAll('.carousel-brands-chip')];

  function renderRich() {
    hero.classList.remove('carousel-brands-hero-logomode');
    bg.textContent = '';
    content.textContent = '';
    if (rich.picture) bg.append(rich.picture.cloneNode(true));
    content.append(richContent.cloneNode(true));
    const eyebrow = content.querySelector('p');
    if (eyebrow && !eyebrow.querySelector('a')) eyebrow.classList.add('carousel-brands-eyebrow');
    const cta = content.querySelector('a');
    if (cta) {
      cta.classList.add('button');
      const wrapper = cta.closest('p');
      if (wrapper) wrapper.classList.add('button-wrapper');
    }
  }

  function renderLogo(idx) {
    const s = chipSlides[idx];
    hero.classList.add('carousel-brands-hero-logomode');
    bg.textContent = '';
    content.textContent = '';
    const eyebrow = elem('p', 'carousel-brands-eyebrow');
    eyebrow.textContent = 'Focus On';
    const logoWrap = elem('div', 'carousel-brands-hero-logo');
    if (s.picture) logoWrap.append(s.picture.cloneNode(true));
    content.append(eyebrow, logoWrap);
    if (s.name) {
      const h2 = elem('h2');
      h2.textContent = s.name;
      content.append(h2);
    }
  }

  function select(idx) {
    let i = idx;
    if (i < 0) {
      if (rich) {
        chips.forEach((c) => c.classList.remove('is-active'));
        renderRich();
        return;
      }
      i = 0;
    }
    if (!chipSlides.length) return;
    if (i >= chipSlides.length) i = chipSlides.length - 1;
    chips.forEach((c, ci) => c.classList.toggle('is-active', ci === i));
    if (chips[i]) centreChip(rail, chips[i]);
    renderLogo(i);
  }

  // Track the active index (-1 = rich featured brand) so the arrows advance the
  // featured brand — cycling through the rich hero and the currently-visible chips.
  let active = rich ? -1 : 0;
  let currentFilter = 'all';
  const visibleIndexes = () => chipSlides
    .map((s, i) => i)
    .filter((i) => currentFilter === 'all' || chipSlides[i].division === currentFilter);

  // Step to the previous/next brand within the visible set (arrows). The rich
  // featured brand (index -1) is part of the cycle only under the "All" filter.
  const step = (dir) => {
    const vis = visibleIndexes();
    if (!vis.length) return;
    const includeRich = rich && currentFilter === 'all';
    const ring = includeRich ? [-1, ...vis] : vis;
    const pos = ring.indexOf(active);
    let nextPos;
    if (pos === -1) nextPos = dir > 0 ? 0 : ring.length - 1;
    else nextPos = (pos + dir + ring.length) % ring.length;
    active = ring[nextPos];
    select(active);
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  chips.forEach((chip, i) => chip.querySelector('button').addEventListener('click', () => { active = i; }));

  // Division filter: show only matching chips, reset the featured brand to the
  // first visible one (or the rich hero under "All").
  if (filterList) {
    filterList.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.division;
        filterList.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === btn));
        chips.forEach((c, i) => {
          const show = currentFilter === 'all' || chipSlides[i].division === currentFilter;
          c.hidden = !show;
        });
        const vis = visibleIndexes();
        if (currentFilter === 'all' && rich) {
          active = -1;
          select(-1);
        } else if (vis.length) {
          [active] = vis;
          select(active);
        }
      });
    });
  }

  // Initial state: show the rich featured brand if present, else the first chip.
  if (rich) renderRich();
  else select(0);
}
