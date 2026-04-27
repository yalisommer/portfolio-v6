# Phase 2: Design System + Navigation - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Lock the visual foundation for the entire portfolio: a monochrome design token system (colors, typography, spacing), self-hosted fonts, CV/graphics-inspired motif CSS classes, and a scroll-reveal animation pattern. Then wire a sticky nav bar that appears after the aquarium hero, links to all 7 sections, and brackets the active section in a detection-box style. Phase 3 builds all real content on top of this system — Phase 2 must deliver reusable building blocks, not placeholder aesthetics.

</domain>

<decisions>
## Implementation Decisions

### Navigation style
- **D-01:** Full-width sticky top bar across the viewport — not a floating pill, not a side rail.
- **D-02:** Background: `rgba(0, 0, 0, 0.75)` + `backdrop-filter: blur(12px)`. Bottom border: 1px `rgba(255, 255, 255, 0.12)`. Appears frosted over scrolling content.
- **D-03:** Links are uppercase, JetBrains Mono, letter-spaced. All 7 sections: ABOUT · EXPERIENCE · EDUCATION · SKILLS · PROJECTS · RESEARCH · CONTACT.
- **D-04:** Nav slides in (or fades in) when `heroVisible === false` (already available in App.tsx state from Phase 1). Nav disappears again when user scrolls back to the top.

### Active section indicator
- **D-05:** Detection-box bracket motif applied to the active nav link. Corner brackets wrap the link text (`:before` / `:after` pseudo-elements forming the top-left and bottom-right bracket corners). Matches the YOLOv8 bounding-box aesthetic from the aquarium demo.
- **D-06:** Inactive links: `rgba(255, 255, 255, 0.45)`. Active link text: `#e0e0e0`. No underline.
- **D-07:** Active section tracked via IntersectionObserver on the 7 section roots (same IO pattern used in Phase 1 for hero gating). Whichever section has `isIntersecting === true` at the top of the viewport wins.

### CV/graphics motifs (CSS classes)
- **D-08:** Implement two motifs as reusable CSS classes in a `motifs.css` file (imported globally):
  1. `.motif-corners` — Bounding-box corner brackets only (no full border). `::before` + `::after` with `border-color: rgba(255, 255, 255, 0.6)`. Size: 12px arms, 2px weight. Directly references the YOLOv8 detection-box aesthetic.
  2. `.motif-dots` — Feature-point dots at corners (small filled circles, ~5px diameter, `rgba(255, 255, 255, 0.5)`). Applies as `::before` + `::after` on a wrapper element. Like keypoint markers in feature detection.
- **D-09:** Scan-line texture and grid overlay deferred — will revisit during Phase 3 if the two motifs feel insufficient.
- **D-10:** Both motifs are purely additive (CSS pseudo-elements on the decorated element). They do not change layout, padding, or z-index of content.

### Scroll reveal animation
- **D-11:** Fade + slide up: opacity `0 → 1`, `translateY(30px → 0)`. Duration: 0.6s. Easing: `ease-out`.
- **D-12:** Trigger: IntersectionObserver with `threshold: 0.1` on each section root. One-shot (observer disconnects after first trigger — no re-animation on scroll back up).
- **D-13:** Implemented as a `useScrollReveal` hook that returns a `ref` and a `revealed` boolean. Phase 3 sections import this hook and apply the transition styles. Phase 2 applies it to the existing 7 section stubs as proof-of-concept.
- **D-14:** No animation library — pure CSS transitions driven by React state. Consistent with COEP constraint + bundle size decision.

### Design tokens
- **D-15:** CSS custom properties defined in `src/styles/tokens.css`, imported in `main.tsx`. This enables both CSS class-based motifs (DS-03) and TypeScript component access via `var(--ds-*)` in inline styles.
- **D-16:** Core token set:
  - `--ds-bg: #000000` (matches Phase 1 section background decision)
  - `--ds-surface: #121212`
  - `--ds-border: rgba(255, 255, 255, 0.12)`
  - `--ds-text-primary: #e0e0e0`
  - `--ds-text-secondary: rgba(255, 255, 255, 0.55)`
  - `--ds-text-muted: rgba(255, 255, 255, 0.3)`
  - `--ds-accent: #ffffff`
- **D-17:** TypeScript constants in `src/styles/tokens.ts` mirror the CSS variables for use in inline style objects where `var()` is awkward (e.g., computed values). Both files must stay in sync.

### Typography
- **D-18:** Self-hosted fonts in `public/fonts/`. Declared via `@font-face` in `src/styles/fonts.css` (imported in `main.tsx`). No external CDN requests (DS-02).
- **D-19:** Two typefaces:
  - **Inter Variable** (WOFF2) — body text, nav links, section headings.
  - **JetBrains Mono** (WOFF2) — monospaced elements (nav links, code, timestamps, CV motif labels).
- **D-20:** Font sourcing: download WOFF2 files from Fontsource npm packages (`@fontsource-variable/inter`, `@fontsource/jetbrains-mono`) — extract WOFF2 subset files from `node_modules/` and commit to `public/fonts/`. Keeps fonts in the repo and off CDN.

### Section wrapper component
- **D-21:** `Section` component in `src/components/Section.tsx`. Props: `id` (string, required), `children` (ReactNode). Applies `useScrollReveal`, consistent vertical padding (`6rem 2rem`), max-width (`1200px auto`), and base token styles.
- **D-22:** App.tsx section stubs are replaced by `<Section id="about">` etc. wrapping placeholder `<h2>` text. Real content added in Phase 3 by swapping children.

### Claude's Discretion
- Exact nav height (suggested: 48–56px)
- Nav slide-in animation duration and easing (suggested: 200ms ease-out opacity/transform)
- Whether `useScrollReveal` is a custom hook or a component wrapper — hook preferred for flexibility
- Font subset strategy (subset to Latin-only to reduce file size)
- Exact IO threshold for active section detection (0.5 or `rootMargin: '-50% 0px'` pattern may give better results than 0.1 for active tracking)

</decisions>

<specifics>
## Specific Ideas

- The bracket corners in the nav active indicator should match the YOLOv8 bounding-box style from the aquarium — this is the deliberate design callback.
- Feature-point dots are tentative: build them but Phase 3 will decide if/where they're applied. Don't force them into sections if they feel noisy.
- Scan-line texture and grid overlay deferred to Phase 3 review — not blocking for design system delivery.
- The frosted nav glass effect (backdrop-blur) is a deliberate premium touch — avoid reducing to solid black if possible.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design System Requirements
- `.planning/REQUIREMENTS.md` §Design System — DS-01 through DS-05 are the acceptance criteria for this phase
- `.planning/REQUIREMENTS.md` §Navigation — NAV-01 through NAV-03 are the acceptance criteria for the nav

### Project Constraints
- `.planning/PROJECT.md` §Constraints — COOP/COEP headers, no mobile, stack immutability, WASM performance (scroll/layout must not degrade inference)
- `.planning/PROJECT.md` §Visual direction — Monochrome, B&W, CV motifs: "present but not loud"

### Phase 1 Implementation (read before touching existing files)
- `.planning/phases/01-layout-skeleton-wasm-gating/01-CONTEXT.md` — Documents the IntersectionObserver pattern, heroVisible state in App.tsx, section stub IDs, and established coding patterns (useRef, useEffect cleanup, etc.)

No external specs — requirements fully captured in REQUIREMENTS.md and decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `App.tsx` `heroVisible` state: already tracks whether the hero is in view — nav trigger is `!heroVisible`, no new state needed
- `App.tsx` section stubs: 7 `<section>` elements with correct IDs (`about`, `experience`, `education`, `skills`, `projects`, `research`, `contact`) — Section wrapper replaces these stubs
- `AquariumLanding.tsx` IO pattern: `useRef` + `useEffect` with `IntersectionObserver` + cleanup via `disconnect()` — `useScrollReveal` and active-section tracking follow this identical pattern
- `src/App.css`: currently minimal reset — token system and font declarations go in new `src/styles/` files imported in `main.tsx`

### Established Patterns
- All mutable-but-non-rendering values use `useRef` (rafRef, runningRef, etc.)
- Boolean state that drives UI uses `useState`
- Effects return cleanup functions — all IOs must call `disconnect()` in cleanup
- All styling via inline style objects; new CSS classes (motifs) are additive and don't conflict

### Integration Points
- `src/main.tsx`: import `src/styles/tokens.css` and `src/styles/fonts.css` here so tokens and fonts are globally available
- `src/App.tsx`: Nav component renders above the section zone; receives `heroVisible` prop or reads from a shared context
- `src/App.tsx` section stubs → replaced by `<Section id="...">` wrapper components
- `src/styles/motifs.css`: imported globally — classes available to any component in Phase 3

</code_context>

<deferred>
## Deferred Ideas

- **Scan-line texture CSS class** — Was discussed but deferred. Implement if Phase 3 sections feel like they need more texture. Not a Phase 2 deliverable.
- **Grid overlay CSS class** — Same deferral as scan-lines. May be useful for Research or Skills sections in Phase 3. Not blocking Phase 2.

</deferred>

---

*Phase: 02-design-system-navigation*
*Context gathered: 2026-04-14*
