# Roadmap: Portfolio v6

## Overview

Portfolio v6 transforms the existing aquarium demo into a full single-page portfolio through four phases: first proving the two-zone scroll layout works without breaking WASM inference, then locking a design system and navigation scaffold, then building all seven content sections against that system, and finally hardening for production deployment with proper COOP/COEP headers.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Layout Skeleton + WASM Gating** - Two-zone scroll layout with IntersectionObserver-gated inference pause/resume (completed 2026-04-14)
- [x] **Phase 2: Design System + Navigation** - Monochrome token system, self-hosted fonts, CV motifs, sticky nav with active section tracking (completed 2026-04-14)
- [ ] **Phase 3: Content Sections** - All 7 portfolio sections (About, Experience, Education, Skills, Projects, Research, Contact)
- [ ] **Phase 4: Deployment + QA** - Production build, COOP/COEP headers, fallback video verification

## Phase Details

### Phase 1: Layout Skeleton + WASM Gating
**Goal**: Users can scroll past the aquarium hero into a content zone without breaking the existing WASM fish detection, and inference automatically pauses/resumes based on hero visibility
**Depends on**: Nothing (first phase)
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-03, LAYOUT-04, LAYOUT-05
**Success Criteria** (what must be TRUE):
  1. The aquarium hero fills the entire viewport when the page first loads
  2. User can scroll down past the aquarium into a dark content area (continuous scroll, no snap)
  3. Scrolling back up to the aquarium shows fish detection still running (canvas and video never unmounted)
  4. Fish detection bounding boxes stop rendering within seconds of scrolling away from the hero (inference paused)
  5. Fish detection bounding boxes resume rendering when user scrolls back to the hero (inference resumed)
**Plans**: 1 plan
Plans:
- [x] 01-01-PLAN.md — Enable scroll layout, add 7 section stubs, wire IntersectionObserver inference gating

### Phase 2: Design System + Navigation
**Goal**: A locked visual foundation (colors, typography, motifs, animations) and a sticky nav that lets users jump to any section and see where they are
**Depends on**: Phase 1
**Requirements**: DS-01, DS-02, DS-03, DS-04, DS-05, NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. All text on the page uses Inter or JetBrains Mono loaded from self-hosted WOFF2 files (no external font requests)
  2. A sticky nav bar appears once the user scrolls past the aquarium hero, with links for all 7 sections
  3. Clicking a nav link scrolls to the corresponding section
  4. The nav highlights the currently visible section as the user scrolls
  5. Placeholder sections fade/slide into view as the user scrolls down (IntersectionObserver + CSS transitions)
**Plans**: 2 plans
Plans:
- [x] 02-01-PLAN.md — Design token files, self-hosted fonts, CV motifs, scroll-reveal hook, Section wrapper component
- [x] 02-02-PLAN.md — Sticky nav bar with active section tracking and bracket motif indicator
**UI hint**: yes

### Phase 3: Content Sections
**Goal**: All seven portfolio sections are built with real content, each visually distinct and using the established design system, with animated 3D research mesh backgrounds bringing the graphics identity into the scroll experience
**Depends on**: Phase 2
**Requirements**: ABOUT-01, ABOUT-02, ABOUT-03, EXP-01, EXP-02, EXP-03, EDU-01, EDU-02, EDU-03, SKILLS-01, SKILLS-02, SKILLS-03, PROJ-01, PROJ-02, PROJ-03, PROJ-04, RES-01, RES-02, RES-03, RES-04, CONTACT-01, CONTACT-02, MESH-01, MESH-02, MESH-03
**Success Criteria** (what must be TRUE):
  1. About Me section displays bio text with photo(s) and inline links to other portfolio sections
  2. Experience section shows 4 entries in a visually distinct timeline layout (not a plain list) with title, company, date, and description per entry
  3. Education section shows Brown University details including GPA 3.94, coursework for both Math and CS, and TA role
  4. Skills section displays six categorized tag groups that are scannable at a glance
  5. Projects section shows a grid of 5 project cards, each with title, tech stack tags, description, link, and expandable image
  6. Research section is visually distinct from Projects with lab/institution presentation style, showing both Catacaustics and Edinburgh entries with group name, description, and visual/thumbnail
  7. Contact section shows a clickable email link (mailto:) and a LinkedIn link that opens in a new tab
  8. Iconic 3D research meshes (Stanford bunny, dragon, Lucy, etc.) rendered as low-poly wireframes or flat-shaded polygons drift slowly in the background of the lower content sections (MESH-01)
  9. The mesh background runs on a WebGL canvas layer at low opacity and does not degrade scroll performance or the WASM inference loop (MESH-02)
  10. Meshes are visually coherent with the monochrome design system — white/grey wireframe or flat-shaded at low opacity (MESH-03)
**Plans**: TBD
**UI hint**: yes

### Phase 4: Deployment + QA
**Goal**: The portfolio builds cleanly, runs in production with proper cross-origin isolation headers, and never shows a black screen in the aquarium section
**Depends on**: Phase 3
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03
**Success Criteria** (what must be TRUE):
  1. `vite build` completes with zero errors and zero warnings that indicate broken functionality
  2. The production build serves pages with COOP/COEP headers that enable SharedArrayBuffer (ORT threading works)
  3. If the YouTube HLS stream is unavailable, the aquarium section falls back to a local MP4 video (no black screen)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Layout Skeleton + WASM Gating | 1/1 | Complete   | 2026-04-14 |
| 2. Design System + Navigation | 2/2 | Complete   | 2026-04-14 |
| 3. Content Sections | 0/? | Not started | - |
| 4. Deployment + QA | 0/? | Not started | - |