(() => {
  "use strict";

  const doc = document;
  const body = doc.body;
  const $ = (selector, context = doc) => context.querySelector(selector);
  const $$ = (selector, context = doc) => Array.from(context.querySelectorAll(selector));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const safe = (label, run) => {
    try {
      run();
    } catch (error) {
      console.error(`[AIOOOKI] ${label}:`, error);
    }
  };

  let revealStarted = false;

  function initReveal() {
    if (revealStarted) return;
    revealStarted = true;

    const items = $$("[data-reveal]");
    if (!items.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((item) => observer.observe(item));
  }

  function initClock() {
    const clocks = $$("[data-clock]");
    if (!clocks.length) return;

    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    const tick = () => {
      const time = formatter.format(new Date());
      clocks.forEach((clock) => {
        clock.textContent = time;
      });
    };

    tick();
    let clockId = setInterval(tick, 1000);

    doc.addEventListener("visibilitychange", () => {
      if (doc.hidden) {
        clearInterval(clockId);
      } else {
        tick();
        clockId = setInterval(tick, 1000);
      }
    });
  }

  function initLoader(onDone) {
    const loader = $("[data-loader]");
    if (!loader) {
      body.classList.remove("is-loading");
      onDone();
      return;
    }

    const count = $("[data-loader-count]", loader);
    const bar = $("[data-loader-bar]", loader);
    const duration = reduceMotion ? 240 : 1750;
    const start = performance.now();
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;

      if (count) count.textContent = "100";
      if (bar) bar.style.width = "100%";
      loader.classList.add("is-done");
      body.classList.remove("is-loading");

      setTimeout(() => {
        loader.setAttribute("hidden", "");
      }, 1200);

      setTimeout(onDone, reduceMotion ? 0 : 260);
    };

    const step = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * 100);

      if (count) count.textContent = String(value).padStart(3, "0");
      if (bar) bar.style.width = `${value}%`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        finish();
      }
    };

    requestAnimationFrame(step);
    setTimeout(finish, 5000);
  }

  function initHeader() {
    const header = $("[data-header]");
    if (!header) return;

    const progress = $("[data-scroll-progress]");
    const sections = $$("[data-nav]");
    let ticking = false;

    const update = () => {
      const scrollY = window.scrollY || doc.documentElement.scrollTop;
      header.classList.toggle("is-scrolled", scrollY > 18);

      if (progress) {
        const travel = doc.documentElement.scrollHeight - window.innerHeight;
        const ratio = travel > 0 ? clamp(scrollY / travel, 0, 1) : 0;
        progress.style.width = `${ratio * 100}%`;
      }

      let mode = null;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 96 && rect.bottom > 96) {
          mode = section.dataset.nav;
          break;
        }
      }

      header.classList.toggle("site-header--ink", mode === "ink");
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(requestUpdate);

    update();
  }

  function initMenu() {
    const menu = $("[data-menu]");
    const openButton = $("[data-menu-open]");
    const closeButton = $("[data-menu-close]");
    if (!menu || !openButton || !closeButton) return;

    const links = $$("[data-menu-link]", menu);
    let lastTrigger = null;

    const focusables = () =>
      $$("a[href], button:not([disabled])", menu).filter(
        (element) => element.offsetParent !== null
      );

    const openMenu = () => {
      lastTrigger = doc.activeElement;
      body.classList.add("menu-open");
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      openButton.setAttribute("aria-expanded", "true");
      setTimeout(() => closeButton.focus({ preventScroll: true }), 60);
    };

    const closeMenu = (restoreFocus = true) => {
      body.classList.remove("menu-open");
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      openButton.setAttribute("aria-expanded", "false");

      if (restoreFocus && lastTrigger instanceof HTMLElement) {
        lastTrigger.focus({ preventScroll: true });
      }
    };

    openButton.addEventListener("click", openMenu);
    closeButton.addEventListener("click", () => closeMenu());

    doc.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (menu.classList.contains("is-open")) closeMenu();
    });

    menu.addEventListener("keydown", (event) => {
      if (event.key !== "Tab" || !menu.classList.contains("is-open")) return;

      const items = focusables();
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && doc.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && doc.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");
        const target = hash && hash.startsWith("#") ? $(hash) : null;
        if (!target) return;

        event.preventDefault();
        closeMenu(false);

        setTimeout(() => {
          target.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
            block: "start"
          });
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, "", hash);
          }
        }, 40);
      });
    });
  }

  function initCursor() {
    if (!finePointer) return;

    const wrap = $("[data-cursor-wrap]");
    if (!wrap) return;

    const dot = $(".cursor__dot", wrap);
    const ring = $(".cursor__ring", wrap);
    const label = $("[data-cursor-label]", wrap);
    if (!dot || !ring) return;

    body.classList.add("cursor-enabled");
    wrap.style.opacity = "0";
    wrap.style.transition = "opacity .25s ease";

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let visible = false;

    const onMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (!visible) {
        visible = true;
        ringX = mouseX;
        ringY = mouseY;
        wrap.style.opacity = "1";
      }

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    let cursorRAF = 0;
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      if (visible) cursorRAF = requestAnimationFrame(animateRing);
    };

    doc.addEventListener("pointermove", onMove, { passive: true });
    doc.addEventListener("pointerdown", () => wrap.classList.add("is-down"));
    doc.addEventListener("pointerup", () => wrap.classList.remove("is-down"));

    doc.documentElement.addEventListener("pointerleave", () => {
      wrap.style.opacity = "0";
      cancelAnimationFrame(cursorRAF);
    });
    doc.documentElement.addEventListener("pointerenter", () => {
      if (visible) wrap.style.opacity = "1";
      cursorRAF = requestAnimationFrame(animateRing);
    });

    const interactiveSelector =
      "[data-cursor], a, button, input, textarea, select, .swatch, .work-card";
    let currentTrigger = null;

    doc.addEventListener("pointerover", (event) => {
      const trigger = event.target.closest(interactiveSelector);
      if (!trigger || trigger === currentTrigger) return;

      currentTrigger = trigger;
      wrap.classList.add("is-link");

      if (trigger.dataset.cursor) {
        wrap.classList.add("is-active");
        if (label) label.textContent = trigger.dataset.cursor;
      }
    });

    doc.addEventListener("pointerout", (event) => {
      if (!currentTrigger) return;
      if (event.relatedTarget && currentTrigger.contains(event.relatedTarget)) return;

      currentTrigger = null;
      wrap.classList.remove("is-link", "is-active");
      if (label) label.textContent = "";
    });

    cursorRAF = requestAnimationFrame(animateRing);
  }

  function initMagnetic() {
    if (!finePointer) return;

    $$("[data-magnetic]").forEach((element) => {
      const strength = 0.2;

      element.style.willChange = "transform";

      element.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;

        const rect = element.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) * strength;
        const y = (event.clientY - (rect.top + rect.height / 2)) * strength;

        element.style.transition = "transform .12s ease-out";
        element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      });

      element.addEventListener("pointerleave", () => {
        element.style.transition = "transform .55s cubic-bezier(.16, 1, .3, 1)";
        element.style.transform = "translate3d(0, 0, 0)";
      });
    });
  }

  function initHeroTilt() {
    if (!finePointer || reduceMotion) return;

    const hero = $(".hero");
    const wrap = $("[data-tilt]");
    const tilt = wrap && $(".hero__mark-tilt", wrap);
    if (!hero || !wrap || !tilt) return;

    let targetX = 0;
    let targetY = 0;
    let queued = false;

    const render = () => {
      tilt.style.setProperty("--tilt-x", `${(targetX * 7).toFixed(2)}deg`);
      tilt.style.setProperty("--tilt-y", `${(-targetY * 7).toFixed(2)}deg`);
      queued = false;
    };

    hero.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch") return;

        const rect = wrap.getBoundingClientRect();
        targetX = clamp((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2), -1, 1);
        targetY = clamp((event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2), -1, 1);

        if (!queued) {
          queued = true;
          requestAnimationFrame(render);
        }
      },
      { passive: true }
    );

    hero.addEventListener("pointerleave", () => {
      targetX = 0;
      targetY = 0;
      tilt.style.transition = "transform .9s cubic-bezier(.16, 1, .3, 1)";
      render();
      setTimeout(() => {
        tilt.style.transition = "";
      }, 950);
    });
  }

  function initCatalogue() {
    const section = $(".catalogue-section");
    if (!section) return;

    const cards = $$(".cat-card", section);
    const filterBtns = $$(".catalogue__filter-btn", section);
    const loadMoreBtn = $("#catalogue-load-more");
    const showAllBtn = $("#catalogue-show-all");
    const statusLabel = $("[data-catalogue-status]", section);
    const remainingCount = $("#catalogue-remaining-count");
    const actionsWrap = $(".catalogue__actions", section);

    /* -- Lightbox refs -- */
    const lb = $("#cat-lightbox");
    const lbEmbed = lb && $("#cat-lightbox-embed");
    const lbTitle = lb && $(".cat-lightbox__title", lb);
    const lbLink = lb && $(".cat-lightbox__link", lb);

    /* -- Catalogue data embedded in the cards -- */
    const catalogueData = [
      { permalink: "https://www.instagram.com/p/DZ6EiQzDL6A/" },
      { permalink: "https://www.instagram.com/reel/DZlbh70SfUk/" },
      { permalink: "https://www.instagram.com/reel/DZgLiVtypme/" },
      { permalink: "https://www.instagram.com/reel/DZdzdPfMN8A/" },
      { permalink: "https://www.instagram.com/reel/DZQbjNFsHQK/" },
      { permalink: "https://www.instagram.com/p/DZOFrJKjDz7/" },
      { permalink: "https://www.instagram.com/p/DZGkuDPjEN3/" },
      { permalink: "https://www.instagram.com/p/DZDwxoojPQz/" },
      { permalink: "https://www.instagram.com/p/DY_J2s7DNTU/" },
      { permalink: "https://www.instagram.com/reel/DXIVDLQjFmo/" },
      { permalink: "https://www.instagram.com/p/DXG7hnODH1V/" },
      { permalink: "https://www.instagram.com/p/DXF0Tg-jHcT/" },
      { permalink: "https://www.instagram.com/p/DXFxPZgDIlr/" },
      { permalink: "https://www.instagram.com/p/DXDKvOEDM6u/" },
      { permalink: "https://www.instagram.com/reel/DXAX6DCkoXE/" },
      { permalink: "https://www.instagram.com/reel/DW7kxOUEl3x/" },
      { permalink: "https://www.instagram.com/reel/DWSS9ECkoYW/" },
      { permalink: "https://www.instagram.com/reel/DWPAlH1kpZj/" },
      { permalink: "https://www.instagram.com/reel/DWIR0x_khLi/" },
      { permalink: "https://www.instagram.com/reel/DWFdvNVkgOk/" },
      { permalink: "https://www.instagram.com/reel/DWCzDkWEnDl/" },
      { permalink: "https://www.instagram.com/reel/DWCQSxtEiyR/" },
      { permalink: "https://www.instagram.com/reel/DV0ZVU7DBXl/" },
    ];

    let currentFilter = "all";
    let visibleCount = 6;
    let lbCurrentIndex = -1;

    /* ── helpers ───────────────────────────────── */

    const getVisibleCards = () =>
      cards.filter((c) => {
        if (currentFilter === "all") return true;
        return c.dataset.cat === currentFilter;
      });

    const updateDisplay = () => {
      const matching = getVisibleCards();
      const total = matching.length;

      matching.forEach((card, idx) => {
        card.classList.remove("is-filtered-out");
        card.classList.toggle("is-collapsed", idx >= visibleCount);
      });

      cards.forEach((card) => {
        if (currentFilter !== "all" && card.dataset.cat !== currentFilter) {
          card.classList.add("is-filtered-out");
          card.classList.add("is-collapsed");
        }
      });

      const shown = Math.min(visibleCount, total);
      if (statusLabel) statusLabel.textContent = `Showing ${shown} of ${total} pieces`;

      const left = total - shown;
      if (remainingCount) remainingCount.textContent = left > 0 ? `(+${left})` : "";

      if (actionsWrap) actionsWrap.classList.toggle("is-all-loaded", shown >= total);
    };

    /* ── lightbox ──────────────────────────────── */

    const openLightbox = (index) => {
      if (!lb) return;
      lbCurrentIndex = index;
      const card = cards[index];
      const title = $(".cat-card__title", card);

      /* Build Instagram embed iframe */
      if (lbEmbed && catalogueData[index]) {
        const url = catalogueData[index].permalink;
        /* Strip trailing slash, append /embed/ */
        const embedUrl = url.replace(/\/+$/, "") + "/embed/";
        lbEmbed.innerHTML =
          '<iframe src="' + embedUrl + '" ' +
          'frameborder="0" scrolling="no" allowtransparency="true" ' +
          'allow="encrypted-media" allowfullscreen ' +
          'style="width:100%;height:100%;border:none;"></iframe>';
      }

      if (lbTitle) lbTitle.textContent = title ? title.textContent : "";
      if (lbLink && catalogueData[index]) lbLink.href = catalogueData[index].permalink;

      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      body.classList.add("lightbox-open");
    };

    const closeLightbox = () => {
      if (!lb) return;
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      body.classList.remove("lightbox-open");
      lbCurrentIndex = -1;
      /* Destroy iframe to stop video playback */
      if (lbEmbed) lbEmbed.innerHTML = "";
    };

    const navigateLightbox = (dir) => {
      const visible = getVisibleCards().filter(
        (c) => !c.classList.contains("is-collapsed")
      );
      if (visible.length === 0) return;

      const currentCard = cards[lbCurrentIndex];
      let pos = visible.indexOf(currentCard);
      if (pos === -1) pos = 0;

      pos += dir;
      if (pos < 0) pos = visible.length - 1;
      if (pos >= visible.length) pos = 0;

      const nextIndex = parseInt(visible[pos].dataset.index, 10);
      openLightbox(nextIndex);
    };

    /* ── wire events ──────────────────────────── */

    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const idx = parseInt(card.dataset.index, 10);
        openLightbox(idx);
      });
    });

    if (lb) {
      $$("[data-cat-close]", lb).forEach((el) =>
        el.addEventListener("click", closeLightbox)
      );
      const prevBtn = $("[data-cat-prev]", lb);
      const nextBtn = $("[data-cat-next]", lb);
      if (prevBtn) prevBtn.addEventListener("click", () => navigateLightbox(-1));
      if (nextBtn) nextBtn.addEventListener("click", () => navigateLightbox(1));

      doc.addEventListener("keydown", (e) => {
        if (!lb.classList.contains("is-open")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") navigateLightbox(-1);
        if (e.key === "ArrowRight") navigateLightbox(1);
      });
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => {
          b.classList.remove("is-active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-active");
        btn.setAttribute("aria-selected", "true");
        currentFilter = btn.dataset.filter || "all";
        visibleCount = 6;
        updateDisplay();
      });
    });

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        visibleCount += 6;
        updateDisplay();
      });
    }

    if (showAllBtn) {
      showAllBtn.addEventListener("click", () => {
        visibleCount = cards.length;
        updateDisplay();
      });
    }

    updateDisplay();
  }

  function initTabs() {
    const tabs = $$("[data-tab]");
    if (!tabs.length) return;

    const panels = $$(".panel");

    const activate = (tab, focusTab) => {
      const targetId = tab.getAttribute("aria-controls");
      const target = targetId ? doc.getElementById(targetId) : null;

      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => {
        if (panel === target) {
          panel.hidden = false;
          panel.classList.remove("is-active");
          void panel.offsetWidth;
          panel.classList.add("is-active");
        } else {
          panel.hidden = true;
          panel.classList.remove("is-active");
        }
      });

      if (focusTab) tab.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab, false));

      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        activate(tabs[nextIndex], true);
      });
    });
  }

  function initPalette() {
    const panel = $("#panel-color");
    const name = $("[data-palette-name]");
    const hex = $("[data-palette-hex]");
    const copyButton = panel && $("[data-copy]", panel);
    const swatches = $$(".swatch");
    if (!panel || !name || !hex || !swatches.length) return;

    const setColour = (swatch) => {
      const colour = swatch.dataset.color;
      const ink = swatch.dataset.ink || "#080B0F";
      const label = swatch.dataset.name || "Custom";

      panel.style.setProperty("--swatch", colour);
      panel.style.setProperty("--swatch-ink", ink);
      name.textContent = label;
      hex.textContent = colour;

      if (copyButton) copyButton.dataset.copy = colour;

      swatches.forEach((item) => {
        item.classList.toggle("is-active", item === swatch);
      });
    };

    swatches.forEach((swatch) => {
      swatch.addEventListener("click", () => setColour(swatch));
    });
  }

  function initTypeTester() {
    const input = $("#type-preview-input");
    if (!input) return;

    const label = $("[data-type-font]");
    const chips = $$("[data-font]");
    if (!chips.length) return;

    const fonts = {
      display: { className: "", label: "Bebas Neue / Display" },
      sans: { className: "is-sans", label: "Archivo / Sans" },
      mono: { className: "is-mono", label: "Space Mono / Data" }
    };

    const apply = (key) => {
      const font = fonts[key] || fonts.display;
      input.classList.remove("is-sans", "is-mono");
      if (font.className) input.classList.add(font.className);
      if (label) label.textContent = font.label;
      chips.forEach((chip) => {
        chip.classList.toggle("is-active", chip.dataset.font === key);
      });
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => apply(chip.dataset.font));
    });
  }

  function initCompare() {
    const compare = $("[data-compare]");
    if (!compare) return;

    const range = $(".compare__range", compare);
    let isDragging = false;

    const setSplit = (value, animate = false) => {
      const pct = clamp(value, 0, 100);
      if (range) range.value = Math.round(pct);

      if (animate && !reduceMotion) {
        compare.style.transition = "--split 0.35s cubic-bezier(0.16, 1, 0.3, 1)";
        setTimeout(() => { compare.style.transition = ""; }, 380);
      } else {
        compare.style.transition = "";
      }

      compare.style.setProperty("--split", `${pct.toFixed(2)}%`);
      compare.classList.add("has-interacted");
    };

    const updateFromPointer = (clientX) => {
      const rect = compare.getBoundingClientRect();
      if (!rect.width) return;
      const offsetX = clientX - rect.left;
      const pct = (offsetX / rect.width) * 100;
      setSplit(pct, false);
    };

    const onPointerDown = (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      isDragging = true;
      compare.classList.add("is-dragging");
      try {
        compare.setPointerCapture(event.pointerId);
      } catch (_) {}
      updateFromPointer(event.clientX);
    };

    const onPointerMove = (event) => {
      if (!isDragging) return;
      updateFromPointer(event.clientX);
    };

    const onPointerUp = (event) => {
      if (!isDragging) return;
      isDragging = false;
      compare.classList.remove("is-dragging");
      try {
        compare.releasePointerCapture(event.pointerId);
      } catch (_) {}
    };

    compare.addEventListener("pointerdown", onPointerDown);
    compare.addEventListener("pointermove", onPointerMove);
    compare.addEventListener("pointerup", onPointerUp);
    compare.addEventListener("pointercancel", onPointerUp);

    if (range) {
      range.addEventListener("input", () => {
        setSplit(Number(range.value), false);
      });
      range.addEventListener("change", () => {
        setSplit(Number(range.value), false);
      });
    }

    const tagLeft = $(".compare__tag--left", compare);
    const tagRight = $(".compare__tag--right", compare);
    if (tagLeft) {
      tagLeft.addEventListener("click", (e) => {
        e.stopPropagation();
        setSplit(12, true);
      });
    }
    if (tagRight) {
      tagRight.addEventListener("click", (e) => {
        e.stopPropagation();
        setSplit(88, true);
      });
    }

    $$("[data-material-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.materialTarget;
        if (target === "beauty") setSplit(10, true);
        else if (target === "chrome") setSplit(90, true);
        else if (target === "turnaround") {
          const sheet = $("#turnarounds");
          if (sheet) sheet.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        }
      });
    });

    setSplit(range ? Number(range.value) || 50 : 50, false);
  }

  function initServices() {
    const services = $$(".service");
    if (!services.length) return;

    services.forEach((service) => {
      const trigger = $(".service__trigger", service);
      const panel = $(".service__panel", service);
      if (!trigger || !panel) return;

      trigger.addEventListener("click", () => {
        const wasOpen = service.classList.contains("is-open");

        services.forEach((item) => {
          const itemTrigger = $(".service__trigger", item);
          const itemPanel = $(".service__panel", item);
          item.classList.remove("is-open");
          if (itemTrigger) itemTrigger.setAttribute("aria-expanded", "false");
          if (itemPanel) itemPanel.hidden = true;
        });

        if (!wasOpen) {
          service.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  }

  let toastTimer = 0;

  function showToast(message) {
    const toast = $("[data-toast]");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  async function copyText(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch (_) {
      // Clipboard API unavailable or denied.
    }
    return false;
  }

  function initCopy() {
    const buttons = $$("[data-copy]");
    if (!buttons.length) return;

    const timers = new WeakMap();

    const resetButton = (button) => {
      if (button.dataset.originalHtml === undefined) return;
      button.innerHTML = button.dataset.originalHtml;
      button.classList.remove("is-copied");
      delete button.dataset.originalHtml;
    };

    const onCopy = async (button) => {
      const value = button.dataset.copy;
      if (!value) return;

      if (button.dataset.originalHtml === undefined) {
        button.dataset.originalHtml = button.innerHTML;
      }

      clearTimeout(timers.get(button));

      const copied = await copyText(value);

      if (copied) {
        button.classList.add("is-copied");
        button.innerHTML = 'Copied <span aria-hidden="true">✓</span>';
        showToast(`${value} copied to clipboard`);
      } else {
        showToast("Could not copy — please select the text manually");
      }

      timers.set(
        button,
        setTimeout(() => resetButton(button), 1900)
      );
    };

    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        onCopy(button);
      });
    });
  }

  safe("clock", initClock);
  safe("header", initHeader);
  safe("menu", initMenu);
  safe("cursor", initCursor);
  safe("magnetic", initMagnetic);
  safe("hero tilt", initHeroTilt);
  safe("catalogue", initCatalogue);
  safe("tabs", initTabs);
  safe("palette", initPalette);
  safe("type tester", initTypeTester);
  safe("compare", initCompare);
  safe("services", initServices);
  safe("copy", initCopy);
  safe("loader", () => initLoader(initReveal));
})();
