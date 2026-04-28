---
phase: quick-260428-ff7
plan: 01
subsystem: mesh-background
tags: [interaction, physics, three-js, animation]
key-files:
  modified:
    - src/hooks/useMeshBackground.ts
decisions:
  - Used distSq comparison (< REPULSION_RADIUS^2) before taking sqrt to keep the inner loop branch-friendly; only pay the sqrt cost when within radius
  - applyMouseRepulsion is module-scope (not inside useEffect) so it remains a pure, testable function per project conventions
  - mousePos stored as plain object inside useEffect (not useRef) — no React state or ref needed since it is only read inside the RAF loop
  - VELOCITY_MAX_REPULSION = VELOCITY_MAX * 3 (1.35 world-units/s) gives responsive scatter without meshes flying off-screen
metrics:
  completed: 2026-04-28
  tasks: 1
  files_modified: 1
---

# Quick Task 260428-ff7: Add Mouse Repulsion to Background Meshes — Summary

**One-liner:** Mouse-proximity repulsion added to the Nine bouncing wireframe meshes via `applyMouseRepulsion` called each physics tick in the RAF loop, with per-mesh impulse proportional to inverse distance and clamped velocity.

## What Was Done

Single file modified: `src/hooks/useMeshBackground.ts`.

### Changes

**Constants added** (lines 47-49):
- `REPULSION_RADIUS = 3.5` — world-unit threshold for repulsion activation
- `REPULSION_STRENGTH = 6.0` — impulse scale factor
- `VELOCITY_MAX_REPULSION = VELOCITY_MAX * 3` — clamped max speed during repulsion (1.35 wu/s)

**`applyMouseRepulsion` function** (module-scope, after `buildFallbackGeometry`):
- Converts mouse screen coords to Three.js world coords using camera Y position and viewport frustum size
- Uses `distSq` pre-check to avoid `Math.sqrt` for objects outside radius
- Applies an impulse scaled by `(1 - dist/radius) / dist` — closer meshes get a stronger, normalized push
- Clamps via `THREE.Vector3.length()` + `multiplyScalar()` to `VELOCITY_MAX_REPULSION`

**Mouse tracking** (inside `useEffect`):
- `mousePos = { x: -9999, y: -9999 }` — off-screen default ensures no repulsion fires before first mouse event
- `onMouseMove` listener registered on `window` immediately after `disposed = false`
- Cleanup: `window.removeEventListener('mousemove', onMouseMove)` added alongside existing resize cleanup

**RAF loop** (`animate` function):
- `applyMouseRepulsion(objects, mousePos.x, mousePos.y, camera, bounds)` called inside the `if (time - lastTime >= FPS_CAP)` block, immediately before `updatePhysics` — repulsion is applied before wall-bounce physics so impulses are resolved in the same tick

## Verification

`npx tsc --noEmit` — 0 errors, 0 warnings.

## Deviations from Plan

None — plan executed exactly as specified. The prompt provided two slightly different implementations; the version using `THREE.Vector3` methods (`velocity.length()`, `velocity.multiplyScalar()`) was used as it is idiomatic Three.js and `velocity` is already typed as `THREE.Vector3`.

## Self-Check

- [x] `src/hooks/useMeshBackground.ts` exists and is modified
- [x] `mousemove` listener registered and cleaned up
- [x] `applyMouseRepulsion` called before `updatePhysics` each physics tick
- [x] `tsc --noEmit` passes with zero errors
