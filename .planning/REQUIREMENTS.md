# Requirements: Portfolio v6

**Defined:** 2026-04-14
**Core Value:** A single scrollable page that opens with the aquarium demo and flows into all portfolio sections — visually memorable and functionally complete.

## v1 Requirements

### Layout

- [x] **LAYOUT-01**: Aquarium hero section fills the full viewport at the top of the page
- [x] **LAYOUT-02**: Content sections scroll continuously below the aquarium (no page-snap)
- [x] **LAYOUT-03**: Aquarium video/canvas stays mounted (not unmounted) as user scrolls away
- [x] **LAYOUT-04**: Fish detection inference pauses automatically when aquarium hero is not in viewport
- [x] **LAYOUT-05**: Fish detection inference resumes when aquarium hero re-enters viewport

### Navigation

- [ ] **NAV-01**: Sticky navigation bar appears after user scrolls past the aquarium hero
- [ ] **NAV-02**: Nav links allow jumping to any section (About Me, Experience, Education, Skills, Projects, Research, Contact Me)
- [ ] **NAV-03**: Active section is highlighted in the nav as user scrolls

### Design System

- [ ] **DS-01**: Design token file defines monochrome color scale (#121212 bg, #e0e0e0 primary text, grays hierarchy)
- [ ] **DS-02**: Self-hosted Inter (variable) and JetBrains Mono (WOFF2) fonts, no external CDN
- [ ] **DS-03**: CV/graphics-inspired motifs defined (bounding-box borders, scan-line textures, feature-point dots, grid overlays) as reusable CSS classes
- [ ] **DS-04**: Scroll-reveal animation pattern: sections fade/slide in via IntersectionObserver + CSS transitions (no animation library)
- [ ] **DS-05**: Section wrapper component provides consistent vertical padding and max-width constraints

### About Me

- [ ] **ABOUT-01**: Section displays bio text (Yali Sommer, Brown University junior, Math & CS, Visual Computing focus)
- [ ] **ABOUT-02**: Section includes one or more photos
- [ ] **ABOUT-03**: Section links inline to other portfolio sections

### Experience

- [ ] **EXP-01**: Timeline displays 4 experience entries (SMBC Summer 2026, IturanTech AI/ML Summer 2025, IturanTech DS Spring 2025, GenWell PM Spring 2025)
- [ ] **EXP-02**: Each entry shows: title, company, date, description
- [ ] **EXP-03**: Timeline is visually distinct from a plain list (vertical line, nodes, or similar)

### Education

- [ ] **EDU-01**: Section shows Brown University (2023–27), dual concentration Math & CS, GPA 3.94
- [ ] **EDU-02**: Coursework lists for both Math and CS concentrations are visible
- [ ] **EDU-03**: Teaching assistant role (Data Structures & Algorithms) is shown

### Skills

- [ ] **SKILLS-01**: Skills are displayed as categorized tag groups (not bars or graph nodes)
- [ ] **SKILLS-02**: Six categories represented: Languages, Vision/Graphics, ML/AI, Software Engineering, Data, Teamwork/Teaching
- [ ] **SKILLS-03**: Category labels or groupings are visually scannable at a glance

### Projects

- [ ] **PROJ-01**: Projects are displayed in a grid (not carousel) so all are visible without interaction
- [ ] **PROJ-02**: Five projects shown: ViolenceNet, Realtime Renderer, Raytracer, Alma Metrics, Confection
- [ ] **PROJ-03**: Each project card shows: title, tech stack tags, description, and link (where available)
- [ ] **PROJ-04**: Project images are shown and expandable (lightbox or similar)

### Research

- [ ] **RES-01**: Section is distinct from Projects — paper/lab presentation style
- [ ] **RES-02**: Brown Visual Computing entry: Catacaustics neural network reconstruction of caustic light on curved surfaces
- [ ] **RES-03**: University of Edinburgh Geometry Processing entry: DROK-inspired mesh manipulation with training-time constraints, targeting architectural software
- [ ] **RES-04**: Each entry shows: group/lab name, topic description, and visual/thumbnail if available

### Contact

- [ ] **CONTACT-01**: Email link (yali_sommer@brown.edu) displayed and clickable (mailto:)
- [ ] **CONTACT-02**: LinkedIn profile link displayed and opens in new tab

### Deployment Readiness

- [ ] **DEPLOY-01**: `vite build` completes without errors
- [ ] **DEPLOY-02**: COOP/COEP headers configured for production hosting (not just dev server)
- [ ] **DEPLOY-03**: Fallback video (`/public/aquarium.mp4`) present so aquarium section is never a black screen

## v2 Requirements

### Polish & Interaction

- **POL-01**: Dark/light mode toggle
- **POL-02**: Keyboard navigation between sections
- **POL-03**: Animated section transitions beyond fade-in (parallax, morph effects)

### Mobile

- **MOB-01**: Responsive layout for mobile viewports
- **MOB-02**: Touch gestures for project browsing
- **MOB-03**: Mobile-optimized nav (hamburger menu or drawer)

### Content Extensions

- **EXT-01**: Resume / CV PDF download link
- **EXT-02**: Blog or writing section
- **EXT-03**: GitHub activity feed or contribution graph
- **EXT-04**: Research publications with DOI links

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile-optimized layout | Out of scope for v6; v5 had "coming soon" — defer to v7 |
| Light mode / theme toggle | Single dark identity for v6; no toggle |
| Contact form | Spam magnet, needs backend; direct mailto + LinkedIn is cleaner |
| CMS / headless content | Personal portfolio, infrequent updates, hardcoded is fine |
| GitHub Actions / CI pipeline | Manual deploy acceptable for personal portfolio |
| Blog / writing section | Not requested; would expand scope significantly |
| Framer Motion / GSAP | COEP self-hosting friction + bundle cost; CSS transitions sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | Phase 1 | Complete |
| LAYOUT-02 | Phase 1 | Complete |
| LAYOUT-03 | Phase 1 | Complete |
| LAYOUT-04 | Phase 1 | Complete |
| LAYOUT-05 | Phase 1 | Complete |
| DS-01 | Phase 2 | Pending |
| DS-02 | Phase 2 | Pending |
| DS-03 | Phase 2 | Pending |
| DS-04 | Phase 2 | Pending |
| DS-05 | Phase 2 | Pending |
| NAV-01 | Phase 2 | Pending |
| NAV-02 | Phase 2 | Pending |
| NAV-03 | Phase 2 | Pending |
| ABOUT-01 | Phase 3 | Pending |
| ABOUT-02 | Phase 3 | Pending |
| ABOUT-03 | Phase 3 | Pending |
| EXP-01 | Phase 3 | Pending |
| EXP-02 | Phase 3 | Pending |
| EXP-03 | Phase 3 | Pending |
| EDU-01 | Phase 3 | Pending |
| EDU-02 | Phase 3 | Pending |
| EDU-03 | Phase 3 | Pending |
| SKILLS-01 | Phase 3 | Pending |
| SKILLS-02 | Phase 3 | Pending |
| SKILLS-03 | Phase 3 | Pending |
| PROJ-01 | Phase 3 | Pending |
| PROJ-02 | Phase 3 | Pending |
| PROJ-03 | Phase 3 | Pending |
| PROJ-04 | Phase 3 | Pending |
| RES-01 | Phase 3 | Pending |
| RES-02 | Phase 3 | Pending |
| RES-03 | Phase 3 | Pending |
| RES-04 | Phase 3 | Pending |
| CONTACT-01 | Phase 3 | Pending |
| CONTACT-02 | Phase 3 | Pending |
| DEPLOY-01 | Phase 4 | Pending |
| DEPLOY-02 | Phase 4 | Pending |
| DEPLOY-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38/38
- Unmapped: 0

---
*Requirements defined: 2026-04-14*
*Last updated: 2026-04-14 after roadmap creation*
