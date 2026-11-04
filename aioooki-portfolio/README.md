# AIOOOKI® — 3D Character Designer & Sculptor Portfolio 2026

An editorial portfolio for **AIOOOKI**, an independent 3D character designer and digital sculptor. Built as a single static site with hand-written HTML, CSS and vanilla JavaScript — no framework, no build step, no third-party UI.

The art direction combines cyber-editorial aesthetics and high-end 3D production: oversized display typography, acid gradients, grain texture, custom interactive cursor, PBR material shift comparison, and production-ready mesh turnaround analysis.

## Run it

```bash
npm start
```

Or if you don't want to use npm:

```bash
node serve.mjs
```

Open **http://localhost:4173**. On Windows, you can also double-click **`preview.cmd`** to start the server and open the site in your browser.

To choose another port:

```bash
node serve.mjs --port=8080
```

Because the site is fully static, it can also be deployed to GitHub Pages, Netlify, Vercel, Cloudflare Pages or any static host. The only server-side piece is the tiny local preview server in `serve.mjs`.

## Structure

```
index.html                  All page content and SVG artwork
css/
  base.css                  Fonts, tokens, reset, chrome, header, menu, footer
  home.css                  Hero, ticker, manifesto, work index
  case-aioooki.css          AIOOOKI case study, film player, design system
  case-ghost.css            Ghost V-47 case study and material comparison
  playground.css            Generative fan machine and experiments
  studio-contact.css        Studio, services, process, contact
  responsive.css            Responsive layouts and touch behaviour
js/
  app.js                    All interactions, no dependencies
assets/
  fonts/                    Locally hosted WOFF2 files
  img/                      Brand boards, character renders, crops, favicon
  video/                    AIOOOKI identity film
serve.mjs                   Dependency-free local static server
```

## What's interactive

- **Identity film** — autoplays muted in view, with pause, sound and progress controls.
- **Design system tabs** — mark, colour, typography and motion panels, keyboard accessible.
- **Colour library** — click a pigment to recolour the panel; copy any hex.
- **Type tester** — type your own word and switch between display, sans and mono registers.
- **Ghost V-47 material shift** — drag the split handle to move between beauty and chrome.
- **Fan machine** — tune tension, change colourways and remix the geometry. Exports nothing; makes a little generative chaos instead.
- **Custom cursor, magnetic buttons, work previews, scroll reveals, lightbox, clock and mobile menu.**
- **Accessibility** — skip link, focus styles, keyboard tabs, focus-trapped menu and lightbox, reduced-motion support, and no-JS fallbacks for reveals and the loader.

## Contact details

The site currently uses a fictional studio address, **hello@aioooki.studio**, plus generic Instagram, Behance and Dribbble URLs. Replace them in `index.html` with the real ones before publishing:

- email: search for `hello@aioooki.studio`
- social links: search for `instagram.com`, `behance.net`, `dribbble.com`
- domain references: `aioooki.studio`

## Notes on the assets

- The logo, identity boards, character turnarounds and renders are adapted from the supplied AIOOOKI brand material.
- The crops in `assets/img/merch-*.webp` are detail extractions from the retro-gaming identity board, used as applications rather than separate projects.
- Image files are optimised WebP copies; the original PNG/JPG sources are retained alongside them for convenience.
- The identity film is the supplied 8-second MP4, served locally from `assets/video/`.
- Fonts are locally hosted WOFF2 files: Bebas Neue, Archivo, Instrument Serif and Space Mono.

## Browser support

Built for current Chrome, Edge, Safari and Firefox. It uses modern CSS such as `color-mix()`, `:has()` and `clip-path`, so very old browsers will get a simpler but still readable page.

---

© 2026 AIOOOKI®. Built with intent — no templates were harmed.
