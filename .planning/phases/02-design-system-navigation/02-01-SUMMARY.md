---
phase: 02-design-system-navigation
plan: 01
subsystem: ui
tags: [css-tokens, woff2-fonts, intersection-observer, scroll-reveal, react, typescript]

# Dependency graph
requires:
  - phase: 01-layout-skeleton-wasm-gating
    provides: Continuous-scroll layout with section stubs and heroVisible state
provides:
  - CSS custom property design token system (--ds-* on :root)
  - TypeScript DS const mirror for inline style objects
  - Self-hosted Inter Variable and JetBrains Mono fonts (4 WOFF2 files)
  - Two CV-inspired motif CSS classes (.motif-corners, .motif-dots)
  - useScrollReveal hook (one-shot IntersectionObserver with reduced-motion support)
  - Section wrapper component with scroll-reveal, consistent padding, and max-width
affects: [02-02-navigation, 03-content-sections, 04-production]

# Tech tracking
tech-stack:
  added:
    - "@fontsource-variable/inter@5.2.8 (devDependency, WOFF2 source)"
    - "@fontsource/jetbrains-mono@5.2.8 (devDependency, WOFF2 source)"
  patterns:
    - CSS custom properties for monochrome design system (--ds-bg, --ds-surface, --ds-border, --ds-text-*, --ds-accent)
    - Self-hosted WOFF2 @font-face with font-display swap and Latin unicode-range subset
    - useScrollReveal hook pattern with one-shot IO disconnect and prefers-reduced-motion guard
    - Section wrapper component applying scroll-reveal, 6rem vertical padding, 1200px max-width

key-files:
  created:
    - src/styles/tokens.css
    - src/styles/tokens.ts
    - src/styles/fonts.css
    - src/styles/motifs.css
    - src/hooks/useScrollReveal.ts
    - src/components/Section.tsx
    - public/fonts/inter-latin-wght-normal.woff2
    - public/fonts/inter-latin-wght-italic.woff2
    - public/fonts/jetbrains-mono-latin-400-normal.woff2
    - public/fonts/jetbrains-mono-latin-700-normal.woff2
  modified:
    - src/main.tsx
    - src/App.css
    - src/App.tsx

key-decisions:
  - "Initialize useScrollReveal revealed=true when prefers-reduced-motion matches, skipping animation entirely"
  - "Gradient overlay preserved as separate absolute-positioned div rather than on the first Section, keeping Section component uniform"
  - "Section ref cast to React.RefObject<HTMLElement> to satisfy section element ref typing"

patterns-established:
  - "Design token access: CSS var(--ds-*) in CSS classes/inline styles, DS.* in TypeScript computed values"
  - "Section wrapper: all portfolio sections use <Section id='...'> for consistent layout and scroll-reveal"
  - "Font loading: self-hosted WOFF2 from public/fonts/ with @font-face swap and Latin subset"
  - "CV motifs: .motif-corners and .motif-dots are pure CSS pseudo-element decorations, layout-neutral"

requirements-completed: [DS-01, DS-02, DS-03, DS-04, DS-05]

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 02 Plan 01: Design System Foundation Summary

**Monochrome CSS token system, self-hosted Inter Variable + JetBrains Mono fonts, two CV motif classes, one-shot scroll-reveal hook, and Section wrapper replacing raw section stubs**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-14T16:59:34Z
- **Completed:** 2026-04-14T17:01:50Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Design token system: 7 CSS custom properties (--ds-bg through --ds-accent) on :root with TypeScript DS const mirror
- Self-hosted typography: 4 WOFF2 files (Inter Variable normal/italic, JetBrains Mono 400/700) with @font-face declarations, font-display swap, Latin unicode-range subset
- Two CV-inspired motif CSS classes (.motif-corners for bounding-box brackets, .motif-dots for feature-point markers) using pseudo-elements without layout impact
- useScrollReveal hook with one-shot IntersectionObserver that disconnects after first trigger and respects prefers-reduced-motion
- Section wrapper component with scroll-reveal animation (fade + slide up, 0.6s ease-out), 6rem vertical padding, and 1200px max-width
- App.tsx refactored from raw section stubs to Section components with gradient overlay preserved

## Task Commits

Each task was committed atomically:

1. **Task 1: Design tokens, self-hosted fonts, and CV motif CSS classes** - `b04a757` (feat)
2. **Task 2: useScrollReveal hook, Section wrapper, refactored App.tsx stubs** - `8eebecf` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/styles/tokens.css` - 7 --ds-* CSS custom properties on :root
- `src/styles/tokens.ts` - DS const object mirroring CSS token values for inline styles
- `src/styles/fonts.css` - 4 @font-face declarations (Inter Variable normal/italic, JetBrains Mono 400/700)
- `src/styles/motifs.css` - .motif-corners and .motif-dots CSS classes with pseudo-elements
- `src/hooks/useScrollReveal.ts` - One-shot IO hook returning ref + revealed boolean
- `src/components/Section.tsx` - Section wrapper with scroll-reveal, padding, max-width
- `src/main.tsx` - Added style imports (tokens, fonts, motifs) before App.css
- `src/App.css` - Updated font-family to Inter Variable, added scroll-behavior: smooth
- `src/App.tsx` - Replaced raw section stubs with Section components, added gradient overlay div
- `public/fonts/inter-latin-wght-normal.woff2` - Inter Variable normal (48KB)
- `public/fonts/inter-latin-wght-italic.woff2` - Inter Variable italic (52KB)
- `public/fonts/jetbrains-mono-latin-400-normal.woff2` - JetBrains Mono 400 (21KB)
- `public/fonts/jetbrains-mono-latin-700-normal.woff2` - JetBrains Mono 700 (22KB)

## Decisions Made

- **Reduced-motion handling:** useScrollReveal initializes `revealed = true` when prefers-reduced-motion matches, avoiding animation entirely rather than setting a near-zero transition duration
- **Gradient preservation strategy:** The transparent-to-black gradient at the content zone top is rendered as a separate absolute-positioned div before the Section components, rather than modifying the first Section's background. This keeps Section component uniform across all 7 sections.
- **Section ref typing:** Cast ref to `React.RefObject<HTMLElement>` on the section element to satisfy TypeScript strict mode with the generic ref from useScrollReveal

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Known Stubs

Seven section stubs remain with placeholder `<h2>` headings showing the section id. These are intentional per Phase 2 scope -- real content will be wired in Phase 3.

| File | Stub | Reason |
|------|------|--------|
| src/App.tsx | Each `<Section id={id}>` renders only a styled `<h2>{id}</h2>` | Placeholder for Phase 03 content sections |

## Next Phase Readiness

- Design system fully operational: tokens, fonts, motifs, scroll-reveal, and Section wrapper all in place
- Plan 02 (navigation) can build on top of these foundations: Section IDs for anchor links, token values for nav styling, motif-corners class for active section indicator
- Phase 3 content sections will use `<Section>` wrapper and design tokens directly

## Self-Check: PASSED

All 10 created files verified on disk. Both task commits (b04a757, 8eebecf) verified in git history.

---
*Phase: 02-design-system-navigation*
*Completed: 2026-04-14*
