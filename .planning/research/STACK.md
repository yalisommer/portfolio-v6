# Technology Stack

**Project:** Portfolio v6 — Yali Sommer
**Researched:** 2026-04-14
**Overall confidence:** HIGH

## Existing Stack (Preserved)

| Technology | Version | Purpose | Status |
|------------|---------|---------|--------|
| React | ^19.0.0 | UI framework | Locked — aquarium depends on it |
| TypeScript | ~5.7.2 (strict) | Type safety | Locked |
| Vite | ^6.0.5 | Build tool, dev server, HLS proxy | Locked — custom plugins for ORT/HLS |
| onnxruntime-web | ^1.20.1 | YOLOv8 WASM inference | Locked — do not upgrade without testing |
| hls.js | ^1.6.16 | YouTube live stream playback | Locked |
| vite-plugin-static-copy | ^2.2.0 | Copy ORT WASM binaries to public | Locked |

**Critical constraint:** COOP/COEP headers (`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp`) are required for SharedArrayBuffer (ORT threading). Every new dependency that loads external resources (fonts from CDN, analytics scripts, iframe embeds) must either be self-hosted or served with `Cross-Origin-Resource-Policy: cross-origin`. This rules out Google Fonts CDN in production unless proxied or self-hosted.

## Recommended Additions

### Animation: Motion (formerly Framer Motion)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| motion | ^12.38.0 | Scroll-triggered section reveals, layout animations, exit animations | React-native API (declarative JSX props), hardware-accelerated `useScroll` in v12, `whileInView` for scroll reveals with zero config, tree-shakeable (~5KB for basic usage) |

**Why Motion over GSAP:**
- **React-first API.** `<motion.div whileInView={{ opacity: 1 }} />` is one line. GSAP requires `useRef` + `useEffect` + `useLayoutEffect` + cleanup + ScrollTrigger registration. For a personal portfolio with 8-10 section reveal animations, Motion's DX advantage is decisive.
- **No cleanup footguns.** GSAP ScrollTrigger in React requires manual `.kill()` in cleanup functions and careful handling of React 19 strict mode double-mounts. Motion handles lifecycle automatically.
- **Bundle efficiency.** Motion v12 tree-shakes aggressively. For the animations this portfolio needs (fade-in-up on scroll, staggered children, smooth opacity transitions), you'll pull ~5-8KB gzipped. GSAP core + ScrollTrigger is ~25KB gzipped.
- **GSAP is overkill here.** GSAP excels at complex timelines, SVG morphing, and pixel-perfect sequencing. This portfolio needs entrance animations on scroll. Motion is the right tool.
- **License simplicity.** Motion is MIT. GSAP is free but uses a custom Webflow license with restrictions on animation builder tools — irrelevant here, but MIT is cleaner.

**Why not CSS-only scroll-driven animations:**
- Browser support is incomplete. Safari 26 (beta) just added support; Firefox still requires a flag. For a portfolio that needs to work reliably today, JavaScript-driven scroll detection with CSS transforms (which is what Motion does internally) is the pragmatic choice.
- CSS `animation-timeline: scroll()` will be the future, but it's not production-ready across browsers yet. Motion v12 already uses native ScrollTimeline under the hood when available and falls back to JS, giving you the best of both worlds automatically.

**COOP/COEP compatibility:** HIGH confidence — no issues. Motion operates entirely on DOM elements via transforms and opacity. It loads no external resources, creates no iframes, and does not use SharedArrayBuffer. Fully compatible with the existing header setup.

### Animation Utilities: No Additional Library Needed

| Decision | Rationale |
|----------|-----------|
| Skip react-intersection-observer | Motion's `whileInView` and `useInView` use IntersectionObserver internally. Adding a separate package is redundant. |
| Skip react-scroll or react-scroll-into-view | Native `element.scrollIntoView({ behavior: 'smooth' })` handles nav-to-section jumping. Zero dependencies. |
| Skip Lenis/Locomotive Scroll | Smooth-scroll libraries hijack native scroll, cause accessibility issues, and conflict with the aquarium's fixed-position detection canvas. The browser's native scroll is correct here. |

### Visual Effects: CSS-Only (No WebGL Library)

| Decision | Rationale |
|----------|-----------|
| Skip Three.js / react-three-fiber | The aquarium already occupies a full `<canvas>` at z-index 1 running a 10 FPS inference loop. Adding another WebGL context would compete for GPU resources and risk frame drops on the detection overlay. |
| Skip REACT-VFX / PixiJS | Same GPU contention concern. The visual direction calls for "subtle CV motifs" — bounding-box borders, scan-line textures, grid overlays. These are CSS patterns, not WebGL shaders. |
| Use CSS for all motifs | `background-image: repeating-linear-gradient()` for scan lines, `border` with dashed/corner-only styles for bounding-box aesthetics, `radial-gradient` dots for feature points, CSS `backdrop-filter: blur()` for glassmorphism panels. Zero runtime cost, no GPU contention. |

**Rationale:** The aquarium IS the visual showpiece. Below-the-fold sections should look sharp but not compete for GPU cycles. CSS-only motifs are performant, maintainable, and perfectly suited to the B&W aesthetic.

### Typography

| Font | Weight Range | Purpose | Why |
|------|-------------|---------|-----|
| Inter (variable) | 300–700 | Body text, UI, navigation | Already in use (referenced in App.css and DetectionCanvas). Variable font covers all needed weights in one file (~100KB). Designed for screens, excellent at small sizes, widely recognized as the standard for modern UI. |
| JetBrains Mono | 400, 700 | Code snippets, terminal-style accents, section labels | Free, open-source, designed for developer tooling. Excellent monospace companion to Inter. Supports ligatures if desired. Reinforces the "developer portfolio" identity without being gimmicky. |

**Font loading strategy:** Self-host both fonts as WOFF2 files in `/public/fonts/`. Do NOT use Google Fonts CDN — it will be blocked by COEP (`require-corp`) unless the CDN serves `Cross-Origin-Resource-Policy: cross-origin`, which it does not reliably do. Self-hosting also eliminates the external network request and gives full cache control.

```css
/* Example: src/styles/fonts.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/InterVariable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}
```

**Why not Geist/Geist Mono:** Vercel's Geist is excellent but optimized for Next.js integration. Inter is already in the codebase and is the safer, more universally recognized choice. Adding a third font family increases load time for marginal aesthetic gain.

### CSS Approach: CSS Modules (Keep Current Pattern)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| CSS Modules | Built into Vite | Scoped component styles | Already the implicit pattern (App.css imported globally, component styles inline). Formalizing with `.module.css` files gives scoped class names, zero runtime overhead, native Vite support, no config needed. |

**Why not switch to Tailwind:**
- **Existing code uses inline styles and plain CSS.** Introducing Tailwind mid-project means either migrating existing styles (pointless churn on working aquarium code) or running two systems (confusing).
- **This is a solo developer portfolio, not a team SaaS app.** Tailwind's value is consistency at scale across teams. For one developer building 8-10 sections, CSS Modules with a shared `variables.css` or `tokens.css` file provides the same consistency without the utility-class learning curve.
- **Bundle overhead.** Tailwind's JIT compiler is efficient but adds build complexity (PostCSS plugin, config file, purge setup). CSS Modules work with zero additional config in Vite.
- **Design system tokens in CSS custom properties** (e.g., `--color-bg`, `--color-text`, `--font-mono`, `--space-section`) accomplish the same goal as Tailwind's design tokens but with native CSS.

**What to formalize:**
```
src/
  styles/
    fonts.css          -- @font-face declarations
    tokens.css         -- CSS custom properties (colors, spacing, typography scale)
    global.css         -- Reset, base styles (evolved from current App.css)
  components/
    AboutMe/
      AboutMe.tsx
      AboutMe.module.css
    Experience/
      Experience.tsx
      Experience.module.css
    ...
```

### Design Tokens (CSS Custom Properties)

```css
/* src/styles/tokens.css */
:root {
  /* Colors */
  --color-bg: #0a0a0a;
  --color-bg-elevated: #141414;
  --color-bg-surface: #1a1a1a;
  --color-text: #f0f0f0;
  --color-text-muted: rgba(240, 240, 240, 0.6);
  --color-text-dim: rgba(240, 240, 240, 0.35);
  --color-accent: #f0f0f0;           /* monochrome — accent IS white */
  --color-border: rgba(240, 240, 240, 0.12);
  --color-border-strong: rgba(240, 240, 240, 0.25);

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 2rem;      /* 32px */
  --text-4xl: 3rem;      /* 48px */

  /* Spacing */
  --space-section: clamp(4rem, 10vh, 8rem);
  --space-content: clamp(1.5rem, 4vw, 3rem);
  --max-width: 1100px;

  /* Effects */
  --blur-panel: 12px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --transition-base: 200ms ease;
}
```

### Component Libraries: None

| Decision | Rationale |
|----------|-----------|
| Skip shadcn/ui | Requires Tailwind CSS. Also, this portfolio has no forms, data tables, or complex UI widgets that justify a component library. |
| Skip Radix UI | Excellent for accessible primitives, but the only interactive element is the nav. A `<nav>` with anchor links does not need an abstraction layer. |
| Skip Chakra UI / MUI | Heavy runtime, opinionated theming that would fight the custom B&W design system. Massive bundle overhead for a portfolio. |
| Skip Aceternity UI / Magic UI | Trendy "copy-paste component" libraries with flashy animations. They look impressive in demos but produce samey portfolios. The aquarium demo IS the differentiator — the sections below should be clean and readable, not competing for visual attention. |

**Build the 8-10 sections from scratch.** Each section is a `<section>` with a heading, some content, and a Motion entrance animation. This is 50-100 lines of TSX per section. A component library adds more complexity than it removes.

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Animation | Motion ^12.38.0 | GSAP + ScrollTrigger | Overkill API surface for entrance animations; cleanup complexity in React 19; larger bundle |
| Animation | Motion ^12.38.0 | CSS scroll-driven animations | Incomplete browser support (Safari 26 beta, Firefox flag-only); Motion uses native ScrollTimeline when available anyway |
| Animation | Motion ^12.38.0 | react-spring | Inferior scroll integration; physics-based springs are wrong mental model for scroll-reveals; declining community momentum |
| Visual FX | CSS-only | Three.js / R3F | GPU contention with aquarium canvas; overkill for scan-line/grid textures |
| Visual FX | CSS-only | Canvas 2D particles | Adds a second canvas competing with DetectionCanvas; subtle CSS gradients achieve similar ambient effect |
| Fonts | Inter + JetBrains Mono | Geist + Geist Mono | Geist is Vercel-ecosystem-oriented; Inter already in codebase |
| Fonts | Inter + JetBrains Mono | Space Grotesk + Fira Code | Space Grotesk is distinctive but less readable at small sizes; Inter is proven |
| CSS | CSS Modules | Tailwind CSS | Migration churn, build complexity, two styling systems in one project |
| CSS | CSS Modules | styled-components / Emotion | Runtime CSS-in-JS adds JS overhead; incompatible with React 19 streaming if ever adopted; CSS Modules have zero runtime cost |
| Components | None (hand-built) | shadcn/ui | Requires Tailwind; portfolio sections are too simple to justify |
| Components | None (hand-built) | Aceternity / Magic UI | Produces generic-looking portfolios; conflicts with the unique aquarium identity |

## Installation

```bash
# Animation library (the only new runtime dependency)
npm install motion

# Dev: no new dev dependencies needed
# Vite handles CSS Modules natively
# TypeScript types included in motion package
```

**Font files (manual download):**
```bash
mkdir -p public/fonts

# Inter Variable — download from https://github.com/rsms/inter/releases
# Place InterVariable.woff2 in public/fonts/

# JetBrains Mono — download from https://github.com/JetBrains/JetBrainsMono/releases
# Place JetBrainsMono-Regular.woff2 and JetBrainsMono-Bold.woff2 in public/fonts/
```

Total new runtime dependencies: **1** (`motion`).
Total new dev dependencies: **0**.

## Architecture Note: Scroll Unlock

The current `App.css` sets `overflow: hidden` on `html, body, #root` — this locks the viewport to the aquarium. To enable scrolling to new sections:

1. Change `overflow: hidden` to `overflow-x: hidden` (keep horizontal locked, enable vertical scroll).
2. The aquarium section keeps `position: fixed; height: 100vh` so it stays pinned as a "hero".
3. New sections render after a `<div style={{ height: '100vh' }}/>` spacer so they appear below the fold.
4. The DetectionCanvas (z-index 1) and video (z-index 0) remain `position: fixed` — they stay in place while the user scrolls past. This is the standard "scroll-past-hero" pattern.

This architectural change is CSS-only and does not affect the aquarium code's functionality.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| COEP blocks Google Fonts CDN | HIGH | Self-host fonts as WOFF2 (already recommended) |
| Motion animations cause frame drops during ORT inference | LOW | Motion uses CSS transforms/opacity (GPU-composited, off main thread). ORT inference runs on WASM threads. No contention. Test on mid-range hardware. |
| Two canvases (detection + any new canvas) cause GPU contention | MEDIUM | Avoided entirely by choosing CSS-only for visual motifs |
| Scroll unlock breaks aquarium layout | LOW | Aquarium uses `position: fixed` — immune to scroll position. Verify video and canvas remain viewport-pinned after CSS change. |
| Motion v12 breaking changes | LOW | v12 is stable (released months ago, minor patches only). The migration from `framer-motion` to `motion/react` is a one-line import change. |

## Sources

- [Motion official docs — React scroll animations](https://motion.dev/docs/react-scroll-animations) — HIGH confidence
- [Motion changelog](https://motion.dev/changelog) — HIGH confidence (v12.38.0 confirmed)
- [Motion npm](https://www.npmjs.com/package/motion) — HIGH confidence (version verified)
- [GSAP npm](https://www.npmjs.com/package/gsap) — HIGH confidence (v3.14.2 confirmed)
- [GSAP free license announcement (Webflow)](https://webflow.com/updates/gsap-becomes-free) — HIGH confidence
- [CSS scroll-driven animations MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) — HIGH confidence
- [CSS animation-timeline browser support (Can I Use)](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) — HIGH confidence
- [Inter font GitHub](https://github.com/rsms/inter) — HIGH confidence
- [JetBrains Mono GitHub](https://github.com/JetBrains/JetBrainsMono) — HIGH confidence
- [COOP/COEP guide (web.dev)](https://web.dev/articles/coop-coep) — HIGH confidence
- [Semaphore: Framer Motion vs GSAP comparison](https://semaphore.io/blog/react-framer-motion-gsap) — MEDIUM confidence
- [Motion: GSAP vs Motion comparison](https://motion.dev/docs/gsap-vs-motion) — MEDIUM confidence (vendor comparison, inherently biased toward Motion)
