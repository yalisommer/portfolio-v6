# Portfolio v6 — Yali Sommer

## What This Is

Personal developer portfolio for Yali Sommer, a Brown University junior (Math & CS, 2023–27) targeting both SWE/ML engineering and computer vision/research roles. v6 replaces portfolio-v5 with a continuous-scroll, dark-theme redesign built on top of an existing aquarium landing page featuring real-time in-browser YOLOv8 fish detection. The visual identity is clean black-and-white with subtle CV/graphics-inspired motifs that echo the technical work without cluttering the content.

## Core Value

A single scrollable page that opens with the aquarium demo (showing technical depth immediately) and flows seamlessly into all portfolio sections — making it both visually memorable and functionally complete.

## Requirements

### Validated

- ✓ Aquarium landing page with full-screen YouTube video background — existing
- ✓ Real-time YOLOv8 fish detection overlay via ONNX Runtime Web (WASM) — existing
- ✓ HLS stream proxy (yt-dlp) with fallback to local mp4 — existing
- ✓ React 19 + TypeScript + Vite SPA — existing
- ✓ COOP/COEP headers for SharedArrayBuffer (ORT threading) — existing

### Active

- [ ] Dark-theme design system (near-black bg, white text, monochrome palette)
- [ ] Continuous-scroll layout: aquarium hero → About Me → Experience → Education → Skills → Projects → Research → Contact Me
- [ ] Fixed/sticky nav or scroll indicator so users can jump to sections
- [ ] About Me section (migrated + refreshed from v5)
- [ ] Experience timeline (4 entries: SMBC, IturanTech ×2, GenWell)
- [ ] Education section (Brown 2023–27, Math & CS dual, GPA 3.94, coursework)
- [ ] Skills visualization (reimagined from v5 skills graph — B&W compatible)
- [ ] Projects carousel/grid (ViolenceNet, Realtime Renderer, Raytracer, Alma Metrics, Confection)
- [ ] Research section (two entries: Brown BVC catacaustics neural network, Uni Edinburgh geometry processing / DROK-inspired mesh manipulation)
- [ ] Contact Me section (email + LinkedIn)
- [ ] Subtle CV/graphics-inspired visual motifs in section design (detection-box aesthetics, scan lines, feature-point overlays, or similar — not dominating)

### Out of Scope

- Mobile-optimized layout — v5 had "coming soon"; defer to v7 or a future milestone
- Light mode / theme toggle — single dark identity for v6
- CMS or headless content management — hardcoded content is fine for a personal portfolio
- GitHub Actions / CI deployment pipeline — manual deploy acceptable for now
- Blog or writing section — not requested, would add scope

## Context

**Existing codebase (brownfield):** The aquarium landing page (`src/components/AquariumLanding.tsx`) is fully functional. All WASM/ORT plumbing, HLS proxy, and detection logic should be preserved as-is. New sections scroll below it.

**v5 migration:** Content (bio text, experience descriptions, education, skills, projects) is verbatim-ready from portfolio-v5. The projects terminal/matrix aesthetic from v5 is a design reference but v6 should evolve it into the B&W system.

**Research entries:**
1. *Catacaustics* — Brown Visual Computing group, neural network approach to recreating caustic light reflections on curved surfaces
2. *Edinburgh Geometry Processing* — Uni Edinburgh group, mesh manipulation project inspired by Data-Free Reduced Order Kinematics (DROK), with constraints baked into training, targeting architectural software workflows

**Tech stack:** React 19, TypeScript (strict), Vite 6, onnxruntime-web 1.24, hls.js. No global state manager — keep local state pattern.

**Visual direction:** Dark (#0a0a0a bg / #f0f0f0 text), monochrome. Subtle nods to computer vision and graphics as UI motifs: bounding-box-style borders, grid overlays, scan-line textures, feature-point dots, typographic terminal cues — present but not loud.

## Constraints

- **Tech stack**: React + TypeScript + Vite — no framework swap; aquarium code must remain functional
- **WASM headers**: COOP/COEP must stay in place for ORT threading; hosting platform must set these headers in production
- **Performance**: Aquarium inference loop (~10 FPS) must not be degraded by scroll/layout changes
- **No mobile**: Desktop-only for v6; responsive layout is out of scope

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Dark theme throughout | Aquarium landing is already dark; forces visual coherence | — Pending |
| Continuous scroll (no snap/slide) | Simpler UX than v5's page-snap, more standard portfolio pattern | — Pending |
| Keep ORT/WASM code untouched | Fragile COOP/COEP + WASM plumbing — no reason to touch it | — Pending |
| Hardcode content (no CMS) | Personal portfolio, infrequent updates, no operational overhead | — Pending |
| Subtle CV motifs, not interactive demos | Additional demos would compete with the aquarium's visual impact | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-14 after initialization*
