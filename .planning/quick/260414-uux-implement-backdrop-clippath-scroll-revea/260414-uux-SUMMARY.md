---
phase: quick
plan: 260414-uux
subsystem: ui
tags: [clipPath, scroll, CSS-variable, Three.js, camera-tracking, sticky-nav]

provides:
  - clipPath-based backdrop wipe driven by scroll-derived CSS variable
  - Sticky nav inside content zone (no heroVisible dependency)
  - Camera scroll-tracking with homeY-based mesh placement and bounded Y-bounce
affects: [03-content-sections, mesh-background, navigation]

tech-stack:
  added: []
  patterns: [CSS variable driven clipPath for scroll-reveal, sticky nav in scroll container, Three.js camera Y scroll-tracking]

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/components/Nav.tsx
    - src/hooks/useMeshBackground.ts

key-decisions:
  - "clipPath inset with CSS variable --backdrop-clip replaces opacity-based backdrop fade for smoother wipe-up effect"
  - "Nav moved from fixed positioning outside content zone to sticky inside content zone -- appears naturally as user scrolls into content"
  - "Mesh objects placed at homeY factors [-1.5, -4.0, -7.0] * bounds.h with camera.position.y tracking scroll offset"

requirements-completed: []

duration: 3min
completed: 2026-04-14
---

# Quick Task 260414-uux: Backdrop clipPath Scroll Reveal Summary

**clipPath inset wipe replaces opacity fade for backdrop, Nav made sticky inside content zone, mesh background uses camera scroll-tracking with deep homeY placement**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-14T20:15:16Z
- **Completed:** 2026-04-14T20:18:25Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Replaced opacity-based black backdrop with clipPath inset driven by --backdrop-clip CSS variable, creating a physical wipe-up effect on scroll
- Moved Nav from fixed-position outside content zone to sticky-position inside content zone, removing heroVisible prop dependency entirely
- Reworked mesh background: meshes placed at deep Y positions (homeY factors -1.5, -4.0, -7.0 times bounds.h), camera Y tracks scroll offset, each mesh bounces within its own homeY +/- bounceHalfY range

## Task Commits

Note: This project is not a git repository. No commits were created.

1. **Task 1: App.tsx backdrop clipPath + Nav relocation** - App.tsx clipPath + CSS variable, Nav.tsx sticky + no props
2. **Task 2: Mesh background camera scroll-tracking and homeY placement** - useMeshBackground.ts homeY placement, camera scroll, bounded bounce

## Files Created/Modified

- `src/App.tsx` - Scroll handler computes --backdrop-clip CSS variable; backdrop div uses clipPath inset instead of opacity; Nav moved inside content zone
- `src/components/Nav.tsx` - Removed Props interface and heroVisible dependency; changed position from fixed to sticky; removed visibilityStyle object
- `src/hooks/useMeshBackground.ts` - Added homeY/bounceHalfY to BouncingMesh interface; HOME_Y_FACTORS/BOUNCE_HALF_Y_FACTOR constants; camera.position.y scroll-tracking; per-mesh Y-bounce ranges; removed unused hh variable

## Decisions Made

- clipPath inset with CSS variable --backdrop-clip provides a physical wipe-up transition rather than an opacity crossfade
- Nav sticky positioning inside the content zone div means it naturally appears only when the user scrolls past the hero, without needing visibility logic
- HOME_Y_FACTORS [-1.5, -4.0, -7.0] distribute meshes across approximately 7x the viewport height of scroll depth
- BOUNCE_HALF_Y_FACTOR 0.4 gives each mesh a full 80% of bounds.h vertical range to bounce within

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `hh` variable in updatePhysics**
- **Found during:** Task 2
- **Issue:** After replacing Y-bounce with per-mesh homeY/bounceHalfY ranges, the `hh` variable (half-height of bounds) was no longer referenced, which would fail `noUnusedLocals` strict check
- **Fix:** Removed the `const hh = bounds.h / 2` declaration
- **Files modified:** src/hooks/useMeshBackground.ts
- **Verification:** `tsc --noEmit` passes clean

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Trivial cleanup required by TypeScript strict mode. No scope creep.

## Issues Encountered

- Pre-existing TypeScript build error in `src/data/content.ts` (TS18046: 'data.about' is of type 'unknown') causes `npm run build` (`tsc -b && vite build`) to fail at the `tsc -b` step. This is unrelated to the changes in this task. `vite build` alone succeeds and produces correct output. The `tsc --noEmit` check (used in plan verification) passes clean for all modified files.

## User Setup Required

None - no external service configuration required.

## Self-Check: PASSED

- [x] src/App.tsx exists and contains clipPath with --backdrop-clip CSS variable
- [x] src/components/Nav.tsx exists with sticky position, no heroVisible prop
- [x] src/hooks/useMeshBackground.ts exists with homeY, bounceHalfY, camera scroll-tracking
- [x] TypeScript compiles clean (tsc --noEmit)
- [x] Vite build succeeds

---
*Quick task: 260414-uux*
*Completed: 2026-04-14*
