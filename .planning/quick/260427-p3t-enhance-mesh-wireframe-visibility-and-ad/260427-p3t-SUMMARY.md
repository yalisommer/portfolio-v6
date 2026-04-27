---
phase: quick
plan: 260427-p3t
subsystem: mesh-background
tags: [visual-enhancement, three.js, parametric-geometry]

dependency_graph:
  requires: []
  provides: [enhanced-mesh-visibility, mobius-geometry, hyperboloid-geometry, enneper-geometry]
  affects: [useMeshBackground]

tech_stack:
  added: []
  patterns: [parametric-surface-generation, lathe-geometry]

key_files:
  modified:
    - src/hooks/useMeshBackground.ts

decisions:
  - "Mobius strip uses 96x10 parametric grid for smooth wireframe rendering"
  - "Hyperboloid uses THREE.LatheGeometry with 24-point profile curve and 48 radial segments"
  - "Enneper surface uses 40x40 parametric grid over [-1.3, 1.3] range"

metrics:
  duration: ~1min
  completed: "2026-04-27"
  tasks_completed: 2
  tasks_total: 2
---

# Quick Task 260427-p3t: Enhance Mesh Wireframe Visibility and Add New Geometries Summary

Increased wireframe mesh opacity from 0.12 to 0.3 and scale from 1.5 to 2.0, and added three parametric surface geometries (Mobius strip, hyperboloid, Enneper minimal surface) bringing total mesh count from 6 to 9.

## Changes Made

### Task 1: Increase wireframe visibility constants
- Changed `MESH_OPACITY` from `0.12` to `0.3`
- Changed mesh scale divisor from `1.5` to `2.0` in `addMeshToScene`
- Updated collision `radius` from `1.5` to `2.0` and horizontal margin from `1.5` to `2.0` for consistency with new scale

### Task 2: Add 3 new geometry builders and extend MESH_CONFIGS
- Added `buildMobiusGeometry()`: parametric Mobius strip (96x10 grid, half-twist surface)
- Added `buildHyperboloidGeometry()`: one-sheet hyperboloid via LatheGeometry (24-point profile, 48 radial segments)
- Added `buildEnneperGeometry()`: Enneper minimal surface (40x40 grid, self-intersecting algebraic surface)
- Extended `MESH_CONFIGS` array from 6 to 9 entries
- Extended `buildFallbackGeometry` variants array from 6 to 9 entries
- Updated comment from "6 distinct" to "9 distinct"

## Verification Results

- TypeScript (`npx tsc --noEmit`): passed with zero errors
- MESH_CONFIGS: 9 entries confirmed
- Variants array: 9 entries confirmed
- Physics/camera/scroll logic: unchanged

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED
- [x] src/hooks/useMeshBackground.ts modified with all changes
- [x] MESH_OPACITY = 0.3
- [x] Scale = 2.0, radius = 2.0, margin = 2.0
- [x] 3 new builder functions present
- [x] MESH_CONFIGS has 9 entries
- [x] Variants array has 9 entries
- [x] TypeScript compiles cleanly
