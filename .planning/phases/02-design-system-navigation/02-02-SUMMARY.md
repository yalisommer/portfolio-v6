---
phase: 02-design-system-navigation
plan: 02
subsystem: ui
tags: [navigation, intersection-observer, sticky-nav, css-transitions, motif-corners, react, typescript]

# Dependency graph
requires:
  - phase: 02-design-system-navigation/02-01
    provides: CSS token system, motif-corners class, DS const, Section wrapper, scroll-reveal
provides:
  - Sticky Nav component with CSS-only show/hide driven by heroVisible prop
  - Active section tracking via single IntersectionObserver (rootMargin -40% / -55% midpoint trick)
  - Detection-box bracket motif (.motif-corners) applied to active nav link
  - Smooth scroll via native anchor href + App.css scroll-behavior: smooth
  - Nav visibility wired into App.tsx via heroVisible state
affects: [03-content-sections, 04-production]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Fixed nav bar with CSS opacity/translateY transition (no conditional mount/unmount)
    - IntersectionObserver rootMargin '-40% 0px -55% 0px' for midpoint active-section detection
    - Frosted glass nav: rgba(0,0,0,0.75) background + backdrop-filter blur(12px) with -webkit- prefix
    - Active link wrapped in <span className="motif-corners"> (reusing Phase 01 motif class)
    - pointerEvents: 'none' while hidden to prevent invisible click interception

key-files:
  created:
    - src/components/Nav.tsx
  modified:
    - src/App.tsx

key-decisions:
  - "Nav always stays in the DOM — visibility is CSS-only (opacity + translateY) to avoid remount cost and flash"
  - "Active link wraps <a> inside <span className='motif-corners'> rather than applying motif directly to <a>, preserving motifs.css layout-neutrality assumption"
  - "No onClick scroll handlers — native <a href='#id'> with scroll-behavior: smooth in App.css handles smooth scroll (per plan research guidance)"

patterns-established:
  - "Nav visibility pattern: heroVisible prop drives opacity/transform/pointerEvents via inline style, no conditional render"
  - "Active tracking: single IO observer watching all 7 section elements; first isIntersecting entry wins"

requirements-completed: [NAV-01, NAV-02, NAV-03]

# Metrics
duration: checkpoint (human approved)
completed: 2026-04-14
---

# Phase 02 Plan 02: Navigation Bar Summary

**Sticky nav with frosted glass effect, heroVisible CSS show/hide, IntersectionObserver active-section tracking, and detection-box bracket motif indicator -- completing Phase 2**

## Performance

- **Duration:** Task 1 auto-executed, Task 2 human checkpoint approved
- **Completed:** 2026-04-14
- **Tasks:** 2 (1 auto + 1 human-verify checkpoint)
- **Files modified:** 2

## Accomplishments

- Nav.tsx: 114-line component with `heroVisible` prop driving CSS-only show/hide (opacity 0→1, translateY -100%→0, pointerEvents none→auto, 0.2s ease-out transition)
- Active section tracking: single `IntersectionObserver` with `rootMargin: '-40% 0px -55% 0px'` creates a 5% trigger zone at the top third of the viewport; first intersecting entry sets `activeSection` state
- Bracket motif indicator: active nav link wrapped in `<span className="motif-corners">` — reuses the `.motif-corners` pseudo-element class from Phase 01's `motifs.css`; inactive links dimmed to `rgba(255, 255, 255, 0.45)`
- Frosted glass styling: `rgba(0,0,0,0.75)` background + `backdropFilter: 'blur(12px)'` with `-webkit-` prefix; 52px height; `borderBottom: '1px solid rgba(255,255,255,0.12)'`
- Typography: all nav links use JetBrains Mono, `0.7rem`, uppercase, `0.15em` letter-spacing
- Smooth scroll: native `<a href="#id">` anchors with `scroll-behavior: smooth` already in App.css — no JS scroll handlers needed
- App.tsx updated: `import Nav from './components/Nav'` added; `<Nav heroVisible={heroVisible} />` rendered as first child in fragment, before `<AquariumLanding>`

## Task Commits

1. **Task 1: Create Nav component with active section tracking and bracket motif indicator** - `c651bff` (feat)
2. **Task 2: Visual verification checkpoint** - Human approved (no commit; checkpoint)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/components/Nav.tsx` - Fixed nav bar, 7-section link array, IntersectionObserver active tracking, CSS-only visibility, bracket motif on active link
- `src/App.tsx` - Added Nav import and `<Nav heroVisible={heroVisible} />` render as first fragment child

## Decisions Made

- **Always-mounted nav:** Nav stays in the DOM at all times. CSS opacity + translateY handles show/hide. Conditional mount/unmount would cause flicker and reset IntersectionObserver state.
- **Motif wrapper strategy:** Active link uses `<span className="motif-corners"><a ...>label</a></span>` rather than `<a className="motif-corners">`. The motifs.css class uses `::before`/`::after` pseudo-elements sized for a wrapper span; applying it directly to an `<a>` tag with padding would interfere with link hit-target.
- **Native smooth scroll:** `<a href="#id">` + CSS `scroll-behavior: smooth` (set in Phase 01's App.css) is the correct approach. No `onClick` with `scrollIntoView()` — avoids double-scroll artifacts and keeps the component free of DOM query side effects.

## Checkpoint Flow

Task 2 was a `checkpoint:human-verify` gate. The human approved after visually verifying:
- Nav slides in from top when scrolling past aquarium hero
- Nav disappears when scrolling back to hero (detection toggle reappears)
- All 7 nav links smooth-scroll to their target sections
- Active section bracket indicator tracks correctly while scrolling
- Frosted glass effect visible (blur, semi-transparent background)
- JetBrains Mono uppercase letter-spaced labels rendered correctly

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None.

## Known Stubs

None introduced by this plan. The section stub content from Phase 01 (placeholder headings in App.tsx) remains intentional — Phase 3 will replace it with real content.

## Phase 2 Complete

Both plans delivered:
- **02-01:** CSS token system, self-hosted fonts, CV motif classes, scroll-reveal, Section wrapper
- **02-02:** Sticky nav with active tracking and bracket motif

Phase 3 (content sections) can now build on the complete design system and navigation foundation.

## Self-Check: PASSED

Files verified:
- `src/components/Nav.tsx` — exists, 114 lines
- `src/App.tsx` — contains `<Nav heroVisible={heroVisible} />`

Commit `c651bff` verified in git history.

---
*Phase: 02-design-system-navigation*
*Completed: 2026-04-14*
