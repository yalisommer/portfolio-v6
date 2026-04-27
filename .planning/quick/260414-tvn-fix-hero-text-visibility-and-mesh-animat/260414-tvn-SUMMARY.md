---
phase: quick
plan: 260414-tvn
subsystem: scroll-ux
tags: [bugfix, hero-text, mesh-background, scroll]
dependency_graph:
  requires: []
  provides: [scroll-based-hero-fade, ambient-mesh-velocity]
  affects: [App.tsx, AquariumLanding.tsx, useMeshBackground.ts]
tech_stack:
  added: []
  patterns: [scroll-event-driven-visibility]
key_files:
  created: []
  modified:
    - src/App.tsx
    - src/components/AquariumLanding.tsx
    - src/hooks/useMeshBackground.ts
decisions:
  - Replaced IntersectionObserver with scroll listener (0.3 * innerHeight threshold) for deterministic hero fade timing
  - Reduced mesh velocity by ~73% and rotation speed by ~72% for ambient drift perception
metrics:
  duration: 1min
  completed: "2026-04-14T19:33:24Z"
---

# Quick Task 260414-tvn: Fix Hero Text Visibility and Mesh Animation Summary

Scroll-driven hero fade-out at 30vh threshold replacing IntersectionObserver; mesh physics constants reduced to ~1/4 original values for ambient drift.

## Changes Made

### Task 1: Move hero visibility to scroll listener in App.tsx and clean up AquariumLanding

**App.tsx:**
- Added `useEffect` import alongside existing `useState`
- Added scroll event listener (`passive: true`) that sets `heroVisible = false` when `window.scrollY >= window.innerHeight * 0.3`
- Removed `onHeroVisibility={setHeroVisible}` prop from `<AquariumLanding>` -- component now only receives `heroVisible`

**AquariumLanding.tsx:**
- Removed `useRef` and `useEffect` from React import (only `useState` remains)
- Removed `onHeroVisibility` from `Props` interface -- now just `{ heroVisible: boolean }`
- Removed `heroRef` useRef declaration
- Removed the entire IntersectionObserver useEffect block (was lines 26-39)
- Removed `ref={heroRef}` from root `<div>` element

### Task 2: Lower mesh animation velocity and rotation constants

**useMeshBackground.ts:**
- `VELOCITY_MIN`: 0.3 -> 0.08 (73% reduction)
- `VELOCITY_MAX`: 1.0 -> 0.3 (70% reduction)
- `ROTATION_SPEED_MIN`: 0.05 -> 0.015 (70% reduction)
- `ROTATION_SPEED_MAX`: 0.25 -> 0.07 (72% reduction)

## Deviations from Plan

None -- plan executed exactly as written.

## Verification

1. `npx tsc --noEmit` -- passed with zero errors (both after Task 1 and Task 2)
2. `npx vite build` -- completed successfully (59 modules, 1.93s)

## Known Stubs

None.

## Self-Check: PASSED

- All 3 modified files exist on disk
- SUMMARY.md created at expected path
- TypeScript compiles cleanly (0 errors)
- Vite build succeeds
