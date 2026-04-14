---
phase: 03-content-sections
plan: 02
subsystem: content-sections
tags: [experience, projects, research, timeline, expandable-cards, lab-layout]
dependency_graph:
  requires:
    - 03-01 (content.ts data file with experienceEntries, projects, researchEntries)
    - 02-design-system-navigation (DS tokens, motifs.css, Section wrapper)
  provides:
    - ExperienceSection: vertical timeline with dot nodes
    - ProjectsSection: expandable card grid with max-height transition
    - ResearchSection: full-width lab-style layout
  affects:
    - src/App.tsx (stubs replaced with real component imports)
tech_stack:
  added: []
  patterns:
    - useState for expandedId toggle in ProjectsSection
    - onMouseEnter/Leave + hoveredIndex state for timeline dot color in ExperienceSection
    - max-height CSS transition for expand/collapse animation
    - stopPropagation on card click + outer div onClick for click-outside collapse
    - CSS grid (1fr 280px) for research entry two-column layout
key_files:
  created:
    - src/components/sections/ExperienceSection.tsx
    - src/components/sections/ProjectsSection.tsx
    - src/components/sections/ResearchSection.tsx
  modified:
    - src/App.tsx
decisions:
  - "ExperienceSection uses hoveredIndex state (not CSS :hover) to precisely control individual dot color; CSS :hover cannot target sibling elements without pseudo-class hacks"
  - "App.tsx stub constants (labelStyle, sectionHeadingStyle, DS) removed after stubs replaced — noUnusedLocals would have failed the build"
  - "ResearchSection layout uses grid (1fr 280px) not flex so image column maintains fixed width regardless of content height"
metrics:
  duration: "~2.5 min"
  completed_date: "2026-04-14"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 03 Plan 02: Experience, Projects, and Research Sections Summary

Experience, Projects, and Research section components created with vertical timeline + dot nodes, expandable card grid with max-height CSS transitions, and full-width lab-style research layout respectively.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | ExperienceSection + ProjectsSection | cf3e53b | src/components/sections/ExperienceSection.tsx, src/components/sections/ProjectsSection.tsx |
| 2 | ResearchSection + App.tsx wiring | 675e6f5 | src/components/sections/ResearchSection.tsx, src/App.tsx |

## What Was Built

### ExperienceSection (EXP-01, EXP-02, EXP-03)

- Vertical timeline: 1px line (`DS.border`) with 8px circle dot nodes at each entry
- Dot hover: `hoveredIndex` state drives color change `DS.textMuted -> DS.textPrimary` via `onMouseEnter/Leave`
- 4 entries from `experienceEntries` in `content.ts`: SMBC (upcoming tag), IturanTech AI/ML, IturanTech DS&BE, GenWell
- Paragraph descriptions (not bullet lists) per D-15 through D-18
- "upcoming" badge for SMBC entry shown inline next to period

### ProjectsSection (PROJ-01, PROJ-02, PROJ-03, PROJ-04)

- `repeat(3, 1fr)` grid with 1.5rem gap — 5 cards over 2 rows, last cell empty
- `expandedId: string | null` state — one card expanded at a time; toggle collapses previous
- `max-height 0px -> 300px` CSS transition with `overflow: hidden` for smooth expand animation
- `motif-corners` bordered placeholder box inside expand region (per D-09)
- Click-outside collapse: outer div `onClick` sets `expandedId=null`; card `onClick` calls `e.stopPropagation()`
- "View" link anchor on ViolenceNet and Confection (only projects with non-null link); link also stops propagation
- Expanded card: `border-color` changes from `DS.border` to `DS.textMuted` for subtle highlight

### ResearchSection (RES-01, RES-02, RES-03, RES-04)

- Full-width entries stacked vertically (NOT a grid of cards — visually distinct from Projects per RES-01)
- Each entry: `grid-template-columns: 1fr 280px` — left content column + right fixed image column
- Lab name in `labelStyle`, Advisor line in JetBrains Mono 0.7rem, status badge (bordered tag, uppercase)
- Catacaustics entry: renders `<img>` from `/images/bvc_cubes_gt.png` (per D-22, RES-04)
- Edinburgh entry: renders `motif-corners` placeholder with "Visual Pending" text (per D-23, RES-04)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused App.tsx stub constants after stubs replaced**
- **Found during:** Task 2
- **Issue:** After replacing ExperienceContent, ProjectsContent, ResearchContent stubs with imported components, the module-level `labelStyle`, `sectionHeadingStyle`, and `DS` constants in App.tsx became unused. `noUnusedLocals: true` in tsconfig.app.json would cause `tsc -p tsconfig.app.json` to fail (though `npx tsc --noEmit` without explicit config was hitting tsconfig.json which delegates to tsconfig.app.json via project references — the error was found by explicitly testing with `-p tsconfig.app.json`).
- **Fix:** Removed the three unused constant declarations and the `DS` import from App.tsx
- **Files modified:** src/App.tsx
- **Commit:** 675e6f5

## Known Stubs

- All project image slots render `motif-corners` placeholder boxes — real project images exist in `portfolio-v5/dist/` (vnet.jpg, realtime.png, raytrace.png, BYVS-Poster.jpg, confec.png) but are not ported yet per D-09. Swap is a one-liner in `content.ts` (set `image` field to the asset path).
- Edinburgh research image is null → renders "Visual Pending" placeholder. User will provide the image.

## Self-Check

Files exist:
- src/components/sections/ExperienceSection.tsx: FOUND
- src/components/sections/ProjectsSection.tsx: FOUND
- src/components/sections/ResearchSection.tsx: FOUND

Commits exist:
- cf3e53b: FOUND
- 675e6f5: FOUND

TypeScript: PASSED (npx tsc -p tsconfig.app.json --noEmit — zero errors)

## Self-Check: PASSED
