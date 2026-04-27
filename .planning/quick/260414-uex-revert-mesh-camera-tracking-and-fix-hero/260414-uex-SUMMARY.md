---
phase: quick
plan: 260414-uex
subsystem: mesh-background, hero-transition
tags: [revert, physics, UX]
dependency_graph:
  requires: []
  provides: [dvd-bounce-physics, 100vh-hero-threshold]
  affects: [useMeshBackground, App]
tech_stack:
  added: []
  patterns: [bouncing-mesh-physics, elastic-collision-resolution]
key_files:
  modified:
    - src/hooks/useMeshBackground.ts
    - src/App.tsx
decisions:
  - Used addScaledVector-based physics from critical_implementation_notes for cleaner THREE.js idiom
metrics:
  duration: 72s
  completed: 2026-04-14
---

# Quick Task 260414-uex: Revert Mesh Camera Tracking and Fix Hero Summary

Restored DVD-bounce physics with wall reflections and elastic bounding-sphere collisions in useMeshBackground.ts, removing scroll-camera tracking; fixed hero visibility threshold from 80vh to 100vh in App.tsx.

## Tasks Completed

| # | Task | Files |
|---|------|-------|
| 1 | Restore DVD-bounce physics in useMeshBackground.ts | src/hooks/useMeshBackground.ts |
| 2 | Fix hero-gone threshold to 100vh in App.tsx | src/App.tsx |

## Changes Made

### Task 1: Restore DVD-bounce physics

**src/hooks/useMeshBackground.ts** -- 8 distinct changes:

1. Added `VELOCITY_MIN` (0.05) and `VELOCITY_MAX` (0.15) constants for bounce speed
2. Replaced `SceneMesh` interface with `BouncingMesh` (adds `velocity: THREE.Vector3` and `radius: number`)
3. Added `randomSign()` helper for random direction assignment
4. Added `updatePhysics()` function implementing:
   - Position integration via `addScaledVector`
   - Wall-bounce reflections with position clamping
   - Bounding-sphere elastic collision with overlap separation
   - Per-frame rotation updates
5. Changed `objects` array type from `SceneMesh[]` to `BouncingMesh[]`
6. Replaced fixed Y-position placement (`yPositions` array based on content depth) with random viewport placement using padding-aware bounds
7. Updated `objects.push` to include `velocity` (randomSign * randomInRange), `radius` (1.5), and `rotationSpeed` with randomSign for direction variation
8. Replaced camera scroll-tracking block (`camera.position.y` assignment + manual rotation loop) with single `updatePhysics(objects, dt, bounds)` call

### Task 2: Fix hero-gone threshold

**src/App.tsx** line 30:
- Changed `window.scrollY < window.innerHeight * 0.8` to `window.scrollY < window.innerHeight`
- Nav, black backdrop, and mesh canvas now appear only after the hero is fully scrolled out of view (100vh)

## Deviations from Plan

None -- plan executed exactly as written.

## Verification Results

All 6 checks passed:
1. `npx tsc --noEmit` -- zero errors
2. `grep 'camera.position.y'` -- no matches (camera tracking removed)
3. `grep 'updatePhysics'` -- matches found (bounce physics restored)
4. `grep 'BouncingMesh'` -- matches found (interface renamed)
5. `grep 'VELOCITY_MIN'` -- matches found (velocity constants present)
6. `grep 'innerHeight * 0.8'` -- no matches (old threshold gone)

## Known Stubs

None.

## Self-Check: PASSED

- [x] src/hooks/useMeshBackground.ts -- modified, contains BouncingMesh, updatePhysics, randomSign, VELOCITY_MIN/MAX, no camera.position.y tracking
- [x] src/App.tsx -- modified, hero threshold at 100vh
- [x] TypeScript compiles clean
