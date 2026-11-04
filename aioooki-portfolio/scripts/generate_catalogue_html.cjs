const fs = require('fs');

const catData = JSON.parse(fs.readFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/assets/catalogue.json', 'utf8'));

let html = `<!-- ============================================
     02 / 3D CHARACTER CATALOGUE (INSTAGRAM EMBEDS)
     ============================================ -->
<section class="catalogue-section section" id="work" data-nav="ink">
  <div class="container">
    <div class="section-line">
      <span class="mono">02 / Official Character Catalogue</span>
      <span class="mono">@ai.ooo.ki · 23 Production Works</span>
    </div>

    <div class="catalogue__head">
      <div class="catalogue__head-main">
        <p class="case__eyebrow"><span class="live-dot"></span> Digital Atelier / Production Archive</p>
        <h2 class="catalogue__title" data-reveal>THE 3D CHARACTER <span class="serif">CATALOGUE.</span></h2>
        <p class="catalogue__lead" data-reveal>Explore verified character turnarounds, high-poly clay sculpt timelapses, Unreal Engine 5 lookdev studies, and production renders direct from the studio feed of <strong>@ai.ooo.ki</strong>.</p>
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
          <span class="catalogue__filter-count mono">23</span>
        </button>
        <button class="catalogue__filter-btn" type="button" data-filter="reel" role="tab" aria-selected="false">
          <span>Reels &amp; Turnarounds</span>
          <span class="catalogue__filter-count mono">14</span>
        </button>
        <button class="catalogue__filter-btn" type="button" data-filter="post" role="tab" aria-selected="false">
          <span>Stills &amp; Renders</span>
          <span class="catalogue__filter-count mono">9</span>
        </button>
      </div>

      <div class="catalogue__status mono">
        <span class="catalogue__status-dot"></span>
        <span data-catalogue-status>Showing 6 of 23 pieces</span>
      </div>
    </div>

    <!-- Catalogue Cards Grid -->
    <div class="catalogue__grid" id="catalogue-grid">
`;

catData.items.forEach((item, i) => {
  const isReel = item.type === 'reel';
  const numStr = String(i + 1).padStart(2, '0');
  const badgeClass = isReel ? 'catalogue-badge--reel' : 'catalogue-badge--post';
  const badgeLabel = isReel ? '3D Turnaround Reel' : 'Character Render Post';
  const block = catData.blocks[i];
  const isInitiallyVisible = i < 6;

  html += `      <!-- Card ${numStr} -->
      <article class="catalogue-card${isInitiallyVisible ? '' : ' is-collapsed'}" data-cat="${item.type}" data-index="${i}">
        <header class="catalogue-card__header">
          <div class="catalogue-card__tag-wrap">
            <span class="catalogue-badge ${badgeClass}"><span class="live-dot"></span> ${badgeLabel}</span>
            <span class="catalogue-card__id mono">#${numStr}</span>
          </div>
          <a class="catalogue-card__link mono" href="${item.permalink}" target="_blank" rel="noopener" aria-label="Open post #${numStr} on Instagram">
            <span>View</span> ↗
          </a>
        </header>

        <div class="catalogue-card__media">
          <div class="catalogue-card__skeleton" aria-hidden="true">
            <div class="skeleton-shimmer"></div>
            <span class="mono">Loading 3D asset #${numStr}...</span>
          </div>
          ${block}
        </div>

        <footer class="catalogue-card__footer">
          <span class="mono">@ai.ooo.ki</span>
          <span class="mono">${isReel ? '3D Reel' : 'High-Res Still'} · 2026</span>
        </footer>
      </article>
`;
});

html += `    </div>

    <!-- Catalogue Actions / Load More -->
    <div class="catalogue__actions" data-reveal>
      <button class="btn btn--outline catalogue__load-more" id="catalogue-load-more" type="button">
        <span>Load More Character Sculpts</span>
        <span class="mono" id="catalogue-remaining-count">(+17 Remaining)</span>
        <span class="btn__arrow">↓</span>
      </button>
      <button class="btn btn--ghost catalogue__show-all" id="catalogue-show-all" type="button">
        <span>Expand All 23</span>
      </button>
    </div>
  </div>
</section>
`;

fs.writeFileSync('C:/Users/pc/OneDrive/Bureau/Dev/aioooki-portfolio/scripts/catalogue_section.html', html, 'utf8');
console.log('Successfully generated scripts/catalogue_section.html');
