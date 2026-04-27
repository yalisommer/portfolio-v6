# Phase 3: Content Sections - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace all 7 stub sections in `App.tsx` with real content using the Phase 2 design system, add an in-place expandable project card with image support, and implement a Three.js 3D mesh background (Stanford meshes, DVD-style bouncing, bounding-sphere collisions, muted tinted wireframes) covering all lower content sections. All content data is real — no placeholder copy in the final output except where assets are explicitly noted as pending.

</domain>

<decisions>
## Implementation Decisions

### 3D Mesh Background (MESH-01, MESH-02, MESH-03)

- **D-01:** Use **Three.js** for the mesh background. PLY/OBJ loading, WebGL abstraction, and animation loop are all provided. Bundle addition (~150KB gzipped) is acceptable. Three.js is self-hosted (no CDN), so COEP is not an issue.
- **D-02:** Mesh data: **simplified Stanford meshes** (bunny, dragon, Lucy, and similar iconic geometry). Download from the Stanford 3D Scanning Repository or pre-simplified sources, reduce to ~5-15K triangles each, convert to JSON or GLB, and commit to `public/meshes/`. Target ~2-3MB total mesh data.
- **D-03:** **All lower content sections** (About through Contact) share one Three.js WebGL canvas layer behind the content zone. Single canvas is simpler than per-section instances.
- **D-04:** Rendering style: **wireframe only** (edges, no polygon fill). Consistent with the YOLOv8 bounding-box aesthetic.
- **D-05:** Motion: **DVD-logo style bouncing** — each mesh translates at a constant velocity and reflects off the canvas bounds. Meshes also slowly rotate on their own axes for visual interest.
- **D-06:** **Bounding-sphere inter-mesh collisions**: each mesh has a sphere radius. On overlap, velocities are exchanged (elastic bounce). Simple and cheap per frame.
- **D-07:** **Color**: each mesh gets a distinct muted tint — e.g., soft cyan `rgba(100,220,255,0.12)`, coral `rgba(255,120,100,0.12)`, warm yellow `rgba(255,210,100,0.12)`, soft green `rgba(120,255,180,0.12)`. Low opacity (8-15%) so tints read against black without overwhelming content. **Note: this overrides MESH-03 (monochrome spec)** — colors are muted enough to stay coherent with the dark theme.
- **D-08:** Performance constraint (MESH-02): mesh canvas must not degrade scroll performance or WASM inference. Run Three.js `requestAnimationFrame` loop independently; pause or throttle to 30 FPS when the content zone is not visible (reuse the `heroVisible` IntersectionObserver pattern from Phase 1 in reverse).

### Project Card Expand (PROJ-04)

- **D-09:** Project images use **styled placeholders** for now (motif-corners bordered box with project name). Real images will be swapped in manually after Phase 3 — the image slot structure must be in place so swapping is a one-liner. Images from `portfolio-v5/dist/` (`vnet.jpg`, `realtime.png`, `raytrace.png`, `BYVS-Poster.jpg`, `confec.png`) exist and can be ported, but are not required for Phase 3 acceptance.
- **D-10:** Expand interaction: **card expands in-place** within the grid. Clicking a card (or its image area) toggles an expanded state. In the expanded state the card grows vertically to reveal the image at a readable size; title, tech tags, and description remain below. Second click or click outside collapses it. One card expanded at a time (expanding a new card collapses the previous one).
- **D-11:** Expand is implemented with React `useState` (expanded card ID) on the Projects section component. CSS `height` transition or `max-height` transition handles the animation — no external library.

### Experience Timeline (EXP-03)

- **D-12:** **Vertical line + dot nodes**: a 1px vertical line on the left edge of the timeline, with a small circle (`~8px`) at each entry's left-align point. Line color: `DS.border`. Dot color: `DS.textMuted` default, `DS.textPrimary` on hover. Consistent with the monochrome design system.

### Content: About

- **D-13:** Bio text: **adapt from v5** — rewrite the v5 "Welcome to my website" paragraph into v6 tone (more technical, less casual, matches the "I build systems that see" voice already in the stub). Include inline scroll links to Experience, Education, Skills, Projects, Research, Contact.
- **D-14:** Photos: **placeholder** — user will provide new photos. Use a styled bordered placeholder (motif-corners, aspect ratio preserved) with accessible alt text. Do not port v5 photos.

### Content: Experience

All 4 entries are real. Use descriptions below verbatim or condensed — do not invent bullets.

- **D-15:** **SMBC — Data Strategy Intern, AI team — Summer 2026 (upcoming)**
  Description: Incoming data strategy intern on SMBC's AI team. Working to rework internal systems to be AI-forward and integrate modern machine learning approaches across their data infrastructure.

- **D-16:** **IturanTech — AI/ML Intern — Summer 2025**
  Description: Honed an existing LSTM-based system to detect anomalies for vehicle theft detection across 1 million units. Researched and prototyped an LLM-based detection solution that was presented to the VP of Engineering and forwarded for further development after the internship concluded.

- **D-17:** **IturanTech — Data Science & Backend Intern — Spring 2025**
  Description: Built the data pipelines used in the subsequent summer role. Trained ML models on ship movement anomaly detection data (South China Sea) as preparation for the summer's confidential telematics work. Gained hands-on experience with large-scale streaming data and early anomaly-detection algorithms.

- **D-18:** **GenWell — Product Management Intern — Spring 2025**
  Description: Worked directly with the CEO at an early-stage wellness AI startup to help shape product direction. Led user interviews and synthesized insights into user personas that informed key product decisions. Contributed to feature definition, MVP scoping, and UI/UX design to align the experience with user needs.

### Content: Education

- **D-19:** Brown University, Providence RI, 2023–2027. Dual concentration Mathematics & Computer Science. GPA: **3.94**. Teaching Assistant for **Data Structures & Algorithms** (CSCI 0200). Course list must include coursework for both Math and CS concentrations (see REQUIREMENTS §EDU-02).

### Content: Skills

- **D-20:** Six categories as specified in SKILLS-02: Languages, Vision/Graphics, ML/AI, Software Engineering, Data, Teamwork/Teaching. Displayed as categorized tag groups (SKILLS-01 — not bars or graph nodes).

### Content: Projects

- **D-21:** Five projects in order: ViolenceNet, Realtime Renderer, Raytracer, Alma Metrics, Confection. Descriptions from v5 (see canonical refs for file paths). Tech tags from v5.
  - **ViolenceNet**: 3D CNN-based violence detection for automated security and content moderation. [GitHub link]
  - **Realtime Renderer**: Extensive OpenGL-based real-time renderer with screen-space DoF, real-time shadow mapping, and more. [no link]
  - **Raytracer**: Phong-based C++ raytracer with multi-bounce rays and anti-aliasing. [no link]
  - **Alma Metrics**: ML-based prediction of college admissions trends. [no link]
  - **Confection**: Cellular automata epidemiological simulation with formal methods (Forge) for discovering interesting emergent cases. [GitHub link]

### Content: Research

- **D-22:** **Catacaustics — Brown Visual Computing Lab**
  Supervisor: Prof. James Tompkin and PhD candidate Joel Salzman.
  Description: Studying rendering and inverse optimization of mirror-reflection scenes. Builds synthetic scenes in BlenderPy and Mitsuba 3 featuring planar and parabolic mirrors. Develops inverse methods in PyTorch that recover mirror geometry (parabolic coefficient) via finite-difference gradients and MS-SSIM loss. Analyzes optimization behavior and robustness across scene configurations. Broader goal: reconstruct 3D scenes where geometry is only visible indirectly through curved reflective surfaces.
  Image: `bvc_cubes_gt.png` exists in `portfolio-v5/dist/` — port to `public/images/` for use.

- **D-23:** **Geometry Processing — University of Edinburgh**
  Supervisor: Prof. Amir Vaxman.
  Description: Extended work inspired by the DROK (Data-Free Reduced Order Kinematics) paper. Trains low-dimensional kinematics representations with additional geometric constraints such as quad planarity and piecewise edge stretch conditions. Applies classical penalty methods and Lagrangian training approaches. End goal: an interactive tool for architects to manipulate meshes within a defined constraint-space rather than post-correcting unconstrained deformations.
  Image: placeholder (no image from v5).

### Content: Contact

- **D-24:** Email: `yali_sommer@brown.edu` (mailto link). LinkedIn: `linkedin.com/in/yalisommer` (opens new tab). GitHub link is acceptable as a third entry but not required by CONTACT-01/02.

### Claude's Discretion

- Number of meshes rendered simultaneously (suggested: 3-5 — enough to feel alive without visual clutter)
- Exact mesh rotation speed and drift velocity (suggested: slow enough that content is readable at any scroll position)
- Three.js canvas z-index and opacity layering relative to content (canvas behind content zone, pointer-events: none)
- Whether Three.js is a direct `npm install three` or included as an ES module — npm install preferred for type safety
- Font subsets and exact coursework list for Education (use best judgment from v5 or standard Brown course codes)
- Exact muted tint values for mesh wireframes — stay in the 8-15% opacity range

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 2 Design System (read before writing any styles)
- `.planning/phases/02-design-system-navigation/02-CONTEXT.md` — Design token decisions, typography, motif classes, Section wrapper contract
- `src/styles/tokens.ts` — DS.* constants used in inline styles
- `src/styles/tokens.css` — CSS custom properties (--ds-*)
- `src/styles/motifs.css` — `.motif-corners`, `.motif-dots` classes

### Existing Component Architecture (read before touching)
- `src/App.tsx` — Current stub implementations for all 7 sections; Phase 3 replaces fake data in-place
- `src/components/Section.tsx` — Section wrapper component (scroll-reveal, padding, max-width)
- `src/components/Nav.tsx` — Nav component; do not modify
- `src/components/AquariumLanding.tsx` — Hero component; do not modify

### Requirements (acceptance criteria for this phase)
- `.planning/REQUIREMENTS.md` §About Me (ABOUT-01 through ABOUT-03)
- `.planning/REQUIREMENTS.md` §Experience (EXP-01 through EXP-03)
- `.planning/REQUIREMENTS.md` §Education (EDU-01 through EDU-03)
- `.planning/REQUIREMENTS.md` §Skills (SKILLS-01 through SKILLS-03)
- `.planning/REQUIREMENTS.md` §Projects (PROJ-01 through PROJ-04)
- `.planning/REQUIREMENTS.md` §Research (RES-01 through RES-04)
- `.planning/REQUIREMENTS.md` §Contact (CONTACT-01 through CONTACT-02)
- `.planning/REQUIREMENTS.md` §Mesh (MESH-01 through MESH-03)

### v5 Content Source (port descriptions, check for asset files)
- `../portfolio-v5/src/components/HomePage.tsx` — Project descriptions, tech tags, links, experience entries, about bio
- `../portfolio-v5/dist/` — Image assets: `vnet.jpg`, `realtime.png`, `raytrace.png`, `BYVS-Poster.jpg`, `confec.png`, `bvc_cubes_gt.png`

### Project Constraints
- `.planning/PROJECT.md` §Constraints — COOP/COEP headers, WASM performance, stack immutability, no animation libraries (Framer Motion / GSAP out of scope)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Section.tsx`: wraps content with scroll-reveal, consistent padding, max-width — all 7 sections use this unchanged
- `DS.*` tokens: all color and typography values; use everywhere for inline styles
- `.motif-corners`: available for photo placeholders and any decorative borders
- `useScrollReveal`: already wired into Section; Phase 3 content benefits automatically
- `heroVisible` state in `App.tsx`: already tracks aquarium visibility — mesh canvas can invert this to pause when hero is visible (fish detection + mesh don't compete)

### Established Patterns
- All styling via inline `style` objects using `DS.*` constants — no new CSS files unless necessary
- `useRef` for mutable-non-rendering values; `useState` for UI-driving state
- Effects return cleanup functions; all timers/observers must call disconnect/cancel in cleanup
- Section content is currently all in `App.tsx` as module-level functions — can stay there or be split into `src/components/sections/` for manageability at Claude's discretion

### Integration Points
- Three.js canvas: rendered as a fixed-position layer behind the content zone (below `zIndex: 10`). Must set `pointerEvents: none` so scroll events pass through to content.
- Project card expand state: local to the Projects section component; no global state needed
- Mesh canvas lifecycle: mount when `!heroVisible` (or unconditionally with opacity 0 while hero is visible); unmount or freeze on tab hide

</code_context>

<specifics>
## Specific Ideas

- **DVD bounce aesthetic**: meshes should feel alive and playful — not purely decorative drift. The collision behavior is intentional and visible, not hidden.
- **Mesh color assignment**: assign one tint per mesh instance at initialization and keep it fixed for that mesh's lifetime. Don't cycle or animate colors.
- **Research section visual**: `bvc_cubes_gt.png` exists in v5 for the Brown VC Lab entry — consider porting it. Edinburgh entry gets a placeholder.
- **IturanTech Spring context note**: the ship anomaly detection work (South China Sea) is public context and worth mentioning — it makes the prep role concrete.
- **SMBC tone**: since the role is upcoming, write in present/future tense ("will be working on...") rather than past tense.
- **About inline links**: the bio should contain `<a href="#experience">`, `<a href="#projects">`, etc. — use native anchor links matching the section IDs established in Phase 1.

</specifics>

<deferred>
## Deferred Ideas

- Porting project images from v5 — user will provide new images. Placeholder structure must be in place for easy swap-in.
- About section photos — user will provide new photos. Placeholder must use `motif-corners` border style.
- Scan-line and grid overlay CSS motifs (deferred from Phase 2) — revisit after seeing rendered sections; not a Phase 3 deliverable.
- Feature-point dot motif application — `.motif-dots` class exists; use only if a specific section needs it (no forced usage).
- Resume/CV PDF download link (v2 requirement EXT-01) — out of scope for v6.

</deferred>

---

*Phase: 03-content-sections*
*Context gathered: 2026-04-14*
