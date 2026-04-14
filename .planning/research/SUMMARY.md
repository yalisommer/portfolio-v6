# Project Research Summary

**Project:** Portfolio v6 -- Yali Sommer
**Domain:** Developer portfolio website (single-page scroll, dark theme, WASM/Canvas hero)
**Researched:** 2026-04-14
**Confidence:** HIGH

## Executive Summary

Portfolio v6 is a single-page developer portfolio built on a brownfield codebase: a working aquarium demo that runs YOLOv8 fish detection via ONNX Runtime WASM with SharedArrayBuffer threading, HLS video streaming, and COOP/COEP cross-origin isolation headers. The redesign adds 7 scrollable content sections (About, Experience, Education, Skills, Projects, Research, Contact) below this fixed-position hero. The dominant architectural constraint is that the existing aquarium code must remain functional throughout -- the WASM inference loop, video stream, and detection canvas cannot break at any point during development.

The recommended approach is a two-zone layout: the aquarium stays `position: fixed` at z-index 0, and a new `<main>` block with `margin-top: 100vh` and an opaque dark background scrolls over it at z-index 1. IntersectionObserver gates the WASM inference loop so it pauses when the hero leaves the viewport, reclaiming CPU for scroll interactions. All entrance animations use IntersectionObserver + CSS transitions on `transform` and `opacity` only -- no animation library is needed. Self-hosted WOFF2 fonts (Inter variable + JetBrains Mono) and CSS Modules with a design token system provide the styling foundation. The stack adds zero new runtime dependencies.

The top risks are: (1) the WASM inference loop running off-screen and causing battery drain / scroll jank, mitigated by the IntersectionObserver gating pattern; (2) COOP/COEP headers missing in production deployments, breaking SharedArrayBuffer and the entire demo; (3) COEP blocking any external resource that lacks CORP headers, requiring strict self-hosting of fonts and all assets; and (4) dark-theme contrast failures (halation, gray-on-gray illegibility), requiring a WCAG-checked contrast scale locked in before any component work begins.

## Key Findings

### Recommended Stack

The existing stack (React 19, TypeScript 5.7, Vite 6, onnxruntime-web, hls.js) is locked and must not change. The aquarium demo depends on every piece. No new runtime dependencies are added.

**Resolution -- Motion vs. pure CSS/IntersectionObserver:** Stack research recommended Motion v12 for scroll-triggered animations. Architecture research recommends pure IntersectionObserver + CSS transitions. **Architecture wins.** The project already avoids animation libraries; Motion's `whileInView` is syntactic sugar over IntersectionObserver + CSS transforms, which is exactly what the architecture proposes to do directly. Adding Motion introduces a ~5-8KB dependency, a new API surface to learn, and a package that must be vetted against COEP constraints -- all for entrance animations that are 15 lines of custom hook + CSS. The IntersectionObserver approach also aligns with the architecture's explicit anti-pattern: "no animation libraries."

**Additions:**

- **Self-hosted fonts (Inter variable WOFF2 + JetBrains Mono WOFF2):** Inter is already referenced in the codebase. JetBrains Mono adds a monospace face for code snippets and terminal-style accents. Both must be self-hosted in `public/fonts/` because Google Fonts CDN is blocked by COEP `require-corp`. Use `font-display: swap`.
- **CSS Modules (formalized):** Already implicit in the codebase. Formalize with `.module.css` files per component. Zero config needed -- Vite handles it natively.
- **Design tokens via CSS custom properties:** A `tokens.css` file defining colors, typography scale, spacing, and effect values. This replaces scattered inline styles with a coherent system.

**Explicitly not adding:** Motion/Framer Motion, GSAP, Three.js/R3F, Tailwind CSS, any component library (shadcn, Radix, Chakra, Aceternity), Lenis/Locomotive Scroll, react-intersection-observer (redundant -- using the native API directly).

### Expected Features

**Must have (table stakes):**
- Fixed sticky nav with active section indicator (IntersectionObserver-based)
- About Me: concise bio (2-4 sentences), professional photo, links (GitHub/LinkedIn/resume PDF/email), availability line
- Experience: reverse-chronological entries with role, company, dates, 2-3 outcome-focused bullets, tech tags
- Education: compact block with university, degree, GPA (3.94), relevant coursework
- Skills: categorized tag grid (Languages, Frameworks, ML/CV, Graphics, Tools) -- no skill bars
- Projects: 2-column grid with thumbnails, title, one-liner, tech tags, demo + source links
- Research: separate section from Projects with lab/institution, advisor, description, visual results
- Contact: heading, one-sentence CTA, email/LinkedIn/GitHub links
- Scroll-triggered fade-in reveals on all sections (IntersectionObserver + CSS transitions)

**Should have (differentiators):**
- CV-motif design language: bounding-box borders, scan-line textures, feature-point dots as subtle accents
- Left-aligned vertical timeline for Experience
- Featured project highlight (first card full-width)
- Dual-audience framing in About and Research (SWE hiring managers + research PIs)
- Problem-approach-impact structure per project card
- Section dividers with CV-motif personality

**Defer (v2+):**
- Hover video previews on project cards
- Skills-to-projects cross-referencing
- Expand/collapse on Experience and Education entries
- Mobile/responsive layout (explicitly out of scope per PROJECT.md)

**Anti-features (do not build):**
- Skill bars / percentage ratings
- Contact form
- Project carousel
- Parallax scrolling
- Light/dark theme toggle
- Interactive skills visualization (3D graph, force-directed network)
- Typing animation intro text

### Architecture Approach

Two-zone layout. Zone 1 is the aquarium hero (`position: fixed`, z-index 0). Zone 2 is a `<main>` block (`position: relative`, z-index 1, `margin-top: 100vh`, opaque `#0a0a0a` background) containing the sticky nav and all 7 content sections. As the user scrolls, content slides over the fixed hero. The WASM inference loop is gated by a `useHeroVisibility` hook (IntersectionObserver on a sentinel div at the hero bottom) -- when the hero leaves the viewport, `active` becomes `false` and the rAF loop + ORT inference stop entirely. Resume is instant when the user scrolls back up because the ORT session stays warm in memory.

**Major components:**
1. **App** -- root layout, owns the two-zone structure
2. **AquariumHero** -- fixed hero wrapper, owns visibility state via `useHeroVisibility`
3. **DetectionCanvas** -- unchanged, receives `active` prop gated by both user toggle AND hero visibility
4. **StickyNav** -- `position: sticky; top: 0` inside the content zone, highlights active section via `useSectionObserver`
5. **Section (generic wrapper)** -- consistent padding, id anchor, entrance animation via `useSectionReveal` hook
6. **7 content section components** -- each self-contained in `src/sections/`, owns its own content and layout
7. **sectionData.ts** -- single source of truth for section ids, labels, ordering

**Key patterns:**
- IntersectionObserver for everything: hero visibility, active section tracking, entrance animations. Zero scroll event listeners.
- Only animate `transform` and `opacity` (compositor-only, no layout thrashing).
- One-shot reveals (disconnect observer after first intersection).
- Section data as a single source of truth (prevents id mismatches between nav and sections).

### Critical Pitfalls

1. **WASM inference running off-screen** -- Gate `DetectionCanvas.active` with `useHeroVisibility` IntersectionObserver. Must be implemented in the same phase that introduces scrollable content. The existing `active` prop already handles pause/resume correctly.

2. **COOP/COEP headers missing in production** -- Vite `server.headers` is dev-only. Production deployment must configure `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` at the hosting level (Netlify `_headers` file, Vercel `vercel.json`, etc.). Test with `vite build && vite preview` before any deployment.

3. **COEP blocking external resources** -- Every external resource must be same-origin or served with `Cross-Origin-Resource-Policy: cross-origin`. Self-host all fonts. Do not add Google Fonts CDN, external analytics scripts, or CDN-hosted images without vetting headers first. This is a standing constraint for every phase.

4. **Dark theme contrast failures** -- Soften primary text to ~#e0e0e0 (13:1 ratio) instead of #f0f0f0 (17.4:1, causes halation). Establish a WCAG-checked gray scale: primary text #e0e0e0, secondary #a0a0a0, muted #707070 (AA floor), borders #333. Lock in during design system phase. Never use font-weight below 400 on dark backgrounds.

5. **Hero-to-content scroll transition** -- The boundary between fixed hero and scrolling content can feel jarring. Use a fade-to-black gradient at the hero bottom (already partially exists), ensure the content zone background is opaque, and test with both trackpad and mouse wheel. Avoid `scroll-snap-type` at this boundary.

## Implications for Roadmap

Based on combined research, here is the suggested phase structure:

### Phase 1: Layout Skeleton + WASM Gating

**Rationale:** This is the architectural foundation. Everything else depends on having a scrollable page where the aquarium still works. The WASM gating is the single most important performance optimization and must be proven before any content is added.
**Delivers:** Two-zone layout (fixed hero + scrollable content zone), `useHeroVisibility` hook, `margin-top: 100vh` content wrapper, scroll unlock (`overflow-x: hidden` replacing `overflow: hidden`), verified WASM pause/resume.
**Addresses:** Layout architecture, scroll unlock, hero-to-content transition
**Avoids:** Pitfall 1 (off-screen WASM), Pitfall 7 (broken scroll transition)

### Phase 2: Design System + Nav

**Rationale:** The design system (tokens, typography, contrast scale, CV motifs) must be locked before any content sections are built. Changing token values after sections exist means touching every component. The nav is included here because it depends on the section data structure and IntersectionObserver patterns that inform all subsequent work.
**Delivers:** `tokens.css` with WCAG-checked contrast scale, `fonts.css` with self-hosted Inter + JetBrains Mono, `global.css` base reset, `StickyNav` component with active section highlighting, `sectionData.ts`, `useSectionObserver` hook, `Section` wrapper component with `useSectionReveal` entrance animations, CV-motif border/divider CSS patterns.
**Addresses:** Typography, color system, nav, scroll reveals, CV motif design language
**Avoids:** Pitfall 4 (contrast failures), Pitfall 6 (over-engineered motifs -- establish "one trick per section" rule here), Pitfall 11 (`prefers-reduced-motion` pattern established here)

### Phase 3: Content Sections (Core)

**Rationale:** With the design system and scaffolding in place, content sections can be built one by one. Each section is independent and follows the established patterns. Order matches scroll order for testability.
**Delivers:** All 7 content section components: About, Experience, Education, Skills, Projects, Research, Contact. Each uses the `Section` wrapper, design tokens, and shared tag/card patterns.
**Addresses:** All table-stakes features from FEATURES.md
**Avoids:** Pitfall 6 (motif restraint), Pitfall 5 (only animate transform/opacity)

### Phase 4: Polish + Differentiators

**Rationale:** With all sections functional, polish adds the features that elevate from "complete" to "memorable." The aquarium hero already provides the wow factor; these refinements add depth to the content sections.
**Delivers:** Featured project highlight, vertical timeline styling for Experience, problem-approach-impact copywriting, CV-motif section dividers, scroll hint refinement, transition timing polish.
**Addresses:** Differentiator features from FEATURES.md
**Avoids:** Pitfall 6 (scope creep -- each addition must pass the "one trick per section" test)

### Phase 5: Deployment + QA

**Rationale:** Deployment is a distinct phase because the COOP/COEP header requirement, YouTube proxy absence in static hosting, and Safari ORT issues all require specific configuration and testing that is unrelated to feature development.
**Delivers:** Production build that works on the target hosting platform, COOP/COEP headers configured, fallback video baked into build (replacing YouTube proxy), Safari testing and graceful degradation, accessibility pass (canvas ARIA, keyboard navigation, focus indicators).
**Addresses:** Production readiness, accessibility
**Avoids:** Pitfall 2 (missing COOP/COEP in prod), Pitfall 3 (COEP blocking resources), Pitfall 8 (Safari ORT failure), Pitfall 9 (YouTube proxy absent), Pitfall 10 (canvas accessibility), Pitfall 12 (untested production build)

### Phase Ordering Rationale

- **Phase 1 before everything** because the two-zone layout is a structural change to `App.tsx` and `App.css` that affects all subsequent work. If the scroll unlock or WASM gating breaks, nothing else matters.
- **Phase 2 before Phase 3** because building sections without a design system leads to inconsistent styles that require rework. The nav and section wrapper patterns established here are consumed by every section in Phase 3.
- **Phase 3 sections are independent** of each other and could theoretically be built in parallel or any order. Scroll order (About first, Contact last) is suggested for consistent top-down testing.
- **Phase 4 after Phase 3** because polish requires complete sections to refine. You cannot add a featured project highlight until the projects grid exists.
- **Phase 5 last** because deployment configuration is best done against the final build. However, running `vite build && vite preview` should be done periodically throughout all phases to catch issues early.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1:** Needs careful verification that scroll unlock does not break existing aquarium positioning. The existing code uses `overflow: hidden` on `html, body, #root` -- changing this requires testing all aquarium interaction (click-to-search, detection toggle, video sizing). Standard pattern, but brownfield risk.
- **Phase 5:** Deployment platform choice affects header configuration, video hosting strategy, and build pipeline. If the hosting platform is not yet decided, research is needed.

Phases with standard patterns (skip additional research):
- **Phase 2:** Design tokens, CSS custom properties, sticky nav, IntersectionObserver -- all well-documented with established patterns. The architecture research provides implementation-ready code.
- **Phase 3:** Content sections are straightforward React components with no novel technical challenges. The patterns are established in Phase 2.
- **Phase 4:** Polish is iterative and design-driven, not research-driven.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Existing stack is locked and tested. No new runtime dependencies. Font self-hosting is straightforward. |
| Features | MEDIUM-HIGH | Strong consensus on table-stakes features from multiple portfolio analysis sources. Differentiator features are opinion-based but well-reasoned. |
| Architecture | HIGH | Two-zone layout, IntersectionObserver gating, sticky nav are all established patterns with implementation-ready code provided. The existing `DetectionCanvas` already supports the `active` prop pattern. |
| Pitfalls | HIGH | COOP/COEP issues are well-documented. WASM gating is a known pattern. Dark theme contrast is validated against WCAG. Safari ORT issue has a GitHub issue trail. |

**Overall confidence:** HIGH

### Gaps to Address

- **Hosting platform not decided:** COOP/COEP header configuration differs by platform. This must be chosen before Phase 5 planning.
- **Production video fallback:** The YouTube HLS proxy only works in dev. A pre-recorded aquarium video must be sourced, compressed, and placed in `public/` for production. The video file itself does not exist yet.
- **Safari ORT status:** The `DataCloneError` issue may or may not be fixed in current ORT versions. Needs a real Safari test before deployment.
- **Content copywriting:** Research defines the structure and tone for each section but actual content (bio text, project descriptions, research summaries) must be written. This is not a technical gap but a content gap that affects Phase 3 timeline.
- **Project thumbnails and research visuals:** Visual assets (project screenshots, research result images, profile photo) need to be prepared. These are dependencies for Phase 3.

## Sources

### Primary (HIGH confidence)
- [IntersectionObserver API -- MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [COOP/COEP guide -- web.dev](https://web.dev/articles/coop-coep)
- [WCAG 2.2 Contrast Requirements](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [ONNX Runtime Web docs](https://onnxruntime.ai/docs/tutorials/web/env-flags-and-session-options.html)
- [CSS scroll-driven animations -- MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [Inter font GitHub](https://github.com/rsms/inter)
- [JetBrains Mono GitHub](https://github.com/JetBrains/JetBrainsMono)

### Secondary (MEDIUM confidence)
- [Brittany Chiang portfolio](https://brittanychiang.com/) -- canonical dark-theme dev portfolio reference
- [Inclusive Dark Mode -- Smashing Magazine](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/)
- [ONNX Runtime Safari issue #11567](https://github.com/microsoft/onnxruntime/issues/11567)
- [Setting COOP/COEP on static hosting](https://blog.tomayac.com/2025/03/08/setting-coop-coep-headers-on-static-hosting-like-github-pages/)
- [Netlify COOP/COEP forum thread](https://answers.netlify.com/t/react-website-getting-sharedarraybuffer-error-due-to-coop-and-coep/41705)

### Tertiary (LOW confidence)
- Portfolio design trend articles (Colorlib, Hostinger, Designmodo) -- general pattern validation, not authoritative

---
*Research completed: 2026-04-14*
*Ready for roadmap: yes*
