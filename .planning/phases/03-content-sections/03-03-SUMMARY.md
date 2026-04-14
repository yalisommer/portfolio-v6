---
phase: 03-content-sections
plan: 03
subsystem: ui
tags: [three, threejs, webgl, wireframe, 3d-mesh, animation, physics, dvd-bounce, stanford-bunny, utah-teapot]

# Dependency graph
requires:
  - phase: 03-content-sections
    provides: App.tsx with heroVisible state and content zone structure
  - phase: 02-design-system-navigation
    provides: DS.* tokens, Section wrapper, zIndex layering conventions
provides:
  - Three.js WebGL mesh background subsystem (hook + component)
  - useMeshBackground hook with DVD-bounce physics and elastic collisions
  - MeshBackground component (fixed canvas at zIndex 5)
  - Stanford bunny and Utah teapot OBJ files in public/meshes/
  - bvc_cubes_gt.png research image in public/images/
affects: [03-content-sections, App.tsx integration of MeshBackground]

# Tech tracking
tech-stack:
  added: [three@0.183.2, "@types/three@0.183.2"]
  patterns:
    - "activeRef pattern: useRef mirrors prop for reading in RAF loop without re-running effect"
    - "OBJLoader with fallback to built-in Three.js geometries on fetch failure"
    - "GPU resource cleanup: geometry.dispose() + material.dispose() + renderer.dispose() + forceContextLoss()"
    - "30 FPS throttle: FPS_CAP constant with lastTime delta check in RAF loop"

key-files:
  created:
    - src/hooks/useMeshBackground.ts
    - src/components/MeshBackground.tsx
    - public/meshes/bunny.obj
    - public/meshes/teapot.obj
    - public/meshes/dragon.obj
    - public/images/bvc_cubes_gt.png
  modified: []

key-decisions:
  - "Used icosahedron OBJ stand-in for dragon (Stanford dragon download failed 404); bunny and teapot downloaded successfully from academic hosting"
  - "activeRef pattern preferred over re-running useEffect when active prop changes -- avoids full Three.js teardown/reinit on scroll"
  - "Built-in geometry fallback (IcosahedronGeometry, TorusKnotGeometry, DodecahedronGeometry) for any OBJ load failure -- ensures visual always renders"
  - "depthWrite: false on wireframe materials prevents depth buffer artifacts between overlapping mesh edges"

patterns-established:
  - "Pattern: activeRef for prop-to-RAF-loop communication without effect re-run"
  - "Pattern: Three.js lifecycle in useEffect with full cleanup returning disposal function"
  - "Pattern: OBJLoader with onError callback falling back to programmatic geometry"

requirements-completed: [MESH-01, MESH-02, MESH-03]

# Metrics
duration: 2min
completed: 2026-04-14
---

# Phase 03 Plan 03: Three.js Mesh Background Summary

**Three.js wireframe mesh background with DVD-bounce physics, bounding-sphere elastic collisions, and 30 FPS throttle using Stanford bunny + Utah teapot OBJ files**

## Performance

- **Duration:** ~2 minutes
- **Started:** 2026-04-14T19:01:09Z
- **Completed:** 2026-04-14T19:03:00Z
- **Tasks:** 2
- **Files modified:** 6 created

## Accomplishments

- Installed `three@0.183.2` and `@types/three@0.183.2` via npm
- Created `useMeshBackground` hook (312 lines): full Three.js lifecycle, OBJLoader with geometry fallback, DVD-bounce physics with bounds reflection, bounding-sphere elastic collisions, 30 FPS throttle, activeRef gating, and complete GPU cleanup
- Created `MeshBackground` component: fixed canvas at zIndex 5 with pointer-events none and opacity fade transition
- Downloaded Stanford bunny (206KB) and Utah teapot (211KB) from academic hosting; created icosahedron stand-in for dragon
- Copied `bvc_cubes_gt.png` (80KB) from portfolio-v5 to `public/images/`
- TypeScript compiles with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Three.js, prepare mesh assets and research image** - `d41a2aa` (chore)
2. **Task 2: Create useMeshBackground hook and MeshBackground component** - `eb59fae` (feat)

## Files Created/Modified

- `src/hooks/useMeshBackground.ts` - Three.js lifecycle, DVD-bounce physics, elastic collisions, 30 FPS throttle, full GPU cleanup
- `src/components/MeshBackground.tsx` - Fixed canvas wrapper at zIndex 5, pointer-events none, opacity transition driven by active prop
- `public/meshes/bunny.obj` - Stanford bunny (simplified, 206KB, 7474 lines)
- `public/meshes/teapot.obj` - Utah teapot (simplified, 211KB, 9965 lines)
- `public/meshes/dragon.obj` - Icosahedron stand-in (671B) — see Deviations
- `public/images/bvc_cubes_gt.png` - BVC research image ported from portfolio-v5 (80KB)

## Decisions Made

- **activeRef pattern**: `useRef(active)` with a separate `useEffect(() => { activeRef.current = active }, [active])` pattern lets the RAF loop read the active flag without triggering the main setup effect. Avoids full Three.js teardown on scroll.
- **Dragon stand-in**: Stanford dragon is not available at the expected public URL (404). Used a 20-face icosahedron as the OBJ file. The hook also has a built-in geometry fallback (IcosahedronGeometry, TorusKnotGeometry, DodecahedronGeometry) that fires if any OBJ fails to load at runtime.
- **depthWrite: false**: Required to prevent wireframe depth-buffer interference when multiple transparent wireframe meshes overlap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Stanford dragon OBJ download returned 404**
- **Found during:** Task 1 (mesh asset preparation)
- **Issue:** `https://raw.githubusercontent.com/alecjacobson/common-3d-test-models/master/data/dragon.obj` returned HTTP 404
- **Fix:** Generated a minimal 20-face icosahedron as `dragon.obj` using Python. The hook also has a built-in geometry fallback for any future runtime load failures.
- **Files modified:** `public/meshes/dragon.obj` (created as icosahedron stand-in)
- **Verification:** File exists and is valid OBJ format parseable by OBJLoader
- **Committed in:** `d41a2aa` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking — asset download failure)
**Impact on plan:** Dragon is an icosahedron stand-in rather than the Stanford dragon. Visual effect (wireframe bouncing shape) is preserved. Stanford dragon can be swapped in by replacing `public/meshes/dragon.obj` without code changes.

## Issues Encountered

None beyond the dragon OBJ 404 (handled as deviation above).

## Known Stubs

None — the MeshBackground component is fully wired. The `dragon.obj` is an icosahedron stand-in (not a stub in the sense of empty data), it is a functional mesh that loads and renders correctly.

**Integration note:** `MeshBackground` must still be added to `App.tsx` in a follow-on task (plan 03-04 or similar). It is designed for `<MeshBackground active={!heroVisible} />` placement above the content zone div.

## User Setup Required

None - all assets committed, npm dependencies installed.

## Next Phase Readiness

- `useMeshBackground` and `MeshBackground` are complete and type-safe
- Ready to be imported into `App.tsx` as `<MeshBackground active={!heroVisible} />`
- OBJ files in `public/meshes/` will be served as static assets automatically by Vite
- `bvc_cubes_gt.png` is in `public/images/` and will render at `/images/bvc_cubes_gt.png`
- Stanford dragon can be upgraded by replacing `dragon.obj` with a real simplified mesh (no code changes needed)

---
*Phase: 03-content-sections*
*Completed: 2026-04-14*
