const fs = require('fs');

const data = JSON.parse(fs.readFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/assets/catalogue_extracted.json', 'utf8'));

// Clean up titles
function cleanTitle(t) {
  if (!t) return '';
  return t.replace(/\/\s*$/, '').replace(/&\s*$/, '').replace(/\s+/g, ' ').trim();
}

let html = `<!-- ============================================
     02 / 3D CHARACTER CATALOGUE
     ============================================ -->
<section class="catalogue-section section" id="work" data-nav="ink">
  <div class="container">
    <div class="section-line">
      <span class="mono">02 / Character Catalogue</span>
      <span class="mono">@ai.ooo.ki · ${data.length} Works</span>
    </div>

    <div class="catalogue__head">
      <div class="catalogue__head-main">
        <p class="case__eyebrow"><span class="live-dot"></span> Digital Atelier / Production Archive</p>
        <h2 class="catalogue__title" data-reveal>THE CHARACTER <span class="serif">CATALOGUE.</span></h2>
        <p class="catalogue__lead" data-reveal>Original 3D character designs, sculpt breakdowns, turnaround reels and lookdev studies — direct from the studio of <strong>@ai.ooo.ki</strong>.</p>
      </div>
      <div class="catalogue__head-aside" data-reveal>
        <a class="catalogue__ig-btn" href="https://www.instagram.com/ai.ooo.ki/" target="_blank" rel="noopener">
          <svg class="catalogue__ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <div class="catalogue__ig-text">
            <span class="mono">Follow on Instagram</span>
            <strong>@ai.ooo.ki ↗</strong>
          </div>
        </a>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="catalogue__toolbar" data-reveal>
      <div class="catalogue__filters" role="tablist" aria-label="Filter character catalogue">
        <button class="catalogue__filter-btn is-active" type="button" data-filter="all" role="tab" aria-selected="true">
          <span>All Works</span>
          <span class="catalogue__filter-count mono">${data.length}</span>
        </button>
        <button class="catalogue__filter-btn" type="button" data-filter="reel" role="tab" aria-selected="false">
          <span>Reels</span>
          <span class="catalogue__filter-count mono">${data.filter(d => d.type === 'reel').length}</span>
        </button>
        <button class="catalogue__filter-btn" type="button" data-filter="post" role="tab" aria-selected="false">
          <span>Stills</span>
          <span class="catalogue__filter-count mono">${data.filter(d => d.type === 'post').length}</span>
        </button>
      </div>
      <div class="catalogue__status mono">
        <span class="catalogue__status-dot"></span>
        <span data-catalogue-status>Showing 6 of ${data.length} pieces</span>
      </div>
    </div>

    <!-- Grid -->
    <div class="catalogue__grid" id="catalogue-grid">
`;

data.forEach((item, i) => {
  const num = String(i + 1).padStart(2, '0');
  const title = cleanTitle(item.cleanTitle) || `Character #${num}`;
  const isReel = item.type === 'reel';
  const visible = i < 6;

  html += `      <article class="cat-card${visible ? '' : ' is-collapsed'}" data-cat="${item.type}" data-index="${i}" data-cat-open>
        <div class="cat-card__media">
          <img class="cat-card__img" src="${item.localImage}" alt="${title}" loading="lazy">
          ${isReel ? '<span class="cat-card__play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg></span>' : ''}
          <div class="cat-card__overlay">
            <span class="cat-card__title">${title}</span>
            <span class="cat-card__num mono">#${num}</span>
          </div>
        </div>
      </article>
`;
});

html += `    </div>

    <!-- Load More -->
    <div class="catalogue__actions" data-reveal>
      <button class="btn btn--outline catalogue__load-more" id="catalogue-load-more" type="button">
        <span>Load More</span>
        <span class="mono" id="catalogue-remaining-count">(+${data.length - 6})</span>
        <span class="btn__arrow">↓</span>
      </button>
      <button class="btn btn--ghost catalogue__show-all" id="catalogue-show-all" type="button">
        <span>Show All ${data.length}</span>
      </button>
    </div>
  </div>
</section>

<!-- Catalogue Lightbox -->
<div class="cat-lightbox" id="cat-lightbox" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Character preview">
  <div class="cat-lightbox__backdrop" data-cat-close></div>
  <div class="cat-lightbox__content">
    <img class="cat-lightbox__img" src="" alt="">
    <div class="cat-lightbox__info">
      <span class="cat-lightbox__title"></span>
      <a class="cat-lightbox__link" href="#" target="_blank" rel="noopener">View on Instagram ↗</a>
    </div>
    <button class="cat-lightbox__close" type="button" data-cat-close aria-label="Close">✕</button>
    <button class="cat-lightbox__prev" type="button" data-cat-prev aria-label="Previous">‹</button>
    <button class="cat-lightbox__next" type="button" data-cat-next aria-label="Next">›</button>
  </div>
</div>
`;

fs.writeFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/scripts/catalogue_section.html', html, 'utf8');
console.log('Generated new clean catalogue HTML');
