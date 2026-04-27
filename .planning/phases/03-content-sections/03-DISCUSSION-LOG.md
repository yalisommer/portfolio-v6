# Phase 3: Content Sections - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.

**Session:** 2026-04-14
**Areas discussed:** 3D Mesh Background, Project images + lightbox, Content accuracy, Experience timeline visual

---

## 3D Mesh Background

**Q: How should the 3D mesh background be implemented?**
Selected: Three.js (Recommended)
Reason: Built-in OBJ/PLY loaders, clean WebGL abstraction, self-hosted so no COEP issue, significantly less code than raw WebGL.

**Q: Where should the mesh data come from?**
Selected: Simplified Stanford meshes (Recommended)
Reason: Download low-poly versions (~5-15K triangles), convert to JSON/GLB, commit to public/meshes/. Iconic shapes recognizable at low res.

**Q: Which sections should have the mesh background?**
Selected: All lower sections (Recommended)
Reason: Unified atmosphere across the whole portfolio.

**Q: Wireframe or flat-shaded polygons?**
Selected: Wireframe (Recommended)
Reason: Edges only, no fill. Echoes YOLOv8 bounding-box aesthetic. Very subtle at low opacity.

**User note (unprompted):** "I want it multiple to bounce around ala dvd logo style, different colored meshes, and they should be able to bump into one another"
→ Captured as: DVD-style bouncing with wall reflection, bounding-sphere inter-mesh collisions, muted tinted palette per mesh.

**Q: Different colored meshes — how vibrant vs. the monochrome portfolio?**
Selected: Muted palette, low opacity (Recommended)
Reason: Tinted wireframes (soft cyan, coral, warm yellow) at 8-15% opacity. Reads as tints, stays coherent with dark theme. Overrides MESH-03 monochrome spec.

**Q: How should the collision/bounce physics work?**
Selected: Bounding-sphere collisions (Recommended)
Reason: Each mesh has a sphere radius; on overlap velocities exchange. Simple, cheap, convincing for small objects at low opacity.

---

## Project Images + Lightbox

**Q: Do project image assets exist for the 5 projects?**
Selected: Placeholders for now
User note: "Have some, but we'll provide later. for now placeholders."
→ Use styled placeholder boxes (motif-corners bordered). v5 images exist in `../portfolio-v5/dist/` and can be ported later.

**Q: What should happen when a user clicks to expand a project image?**
Selected: Expanded card in-place
Reason: Card expands inline within the grid. No overlay.

**Q: When a project card expands in-place, what does it show?**
Selected: Image only, larger (Recommended)
Reason: Card grows to reveal image at readable size. Title, tech tags, description remain below.

---

## Content Accuracy

**Q: How should the planner handle real content for Experience, Research, and Projects?**
Selected: I'll provide it now
→ All real content gathered in this session (see CONTEXT.md decisions D-15 through D-24).

**Experience entries provided:**
- SMBC Summer 2026: Data Strategy Intern, AI team, reworking systems to be AI-forward (upcoming — forward tense)
- IturanTech AI/ML Summer 2025: LSTM anomaly detection for 1M units vehicle theft; LLM-based solution presented to VP
- IturanTech DS Spring 2025: Built pipelines, trained models on ship anomaly detection (South China Sea), prep role
- GenWell PM Spring 2025: PM intern with CEO, user interviews, personas, MVP scoping, UI/UX

**Research entries provided (from conversation, NOT from v5):**
- Catacaustics (Brown VC Lab): Prof. Tompkin + Joel Salzman; synthetic scenes in BlenderPy/Mitsuba3; inverse optimization via PyTorch with finite-difference gradients + MS-SSIM loss; recovering parabolic mirror coefficients
- Edinburgh Geometry Processing: Prof. Amir Vaxman; extended DROK paper; low-dim kinematics with quad planarity + piecewise edge stretch constraints; classical + Lagrangian methods; architect mesh manipulation tool

**Projects:** Use v5 descriptions (same titles, same tech tags, same links as v5).

**Q: About bio?**
Selected: Adapt from v5 bio
→ Rewrite v5 "Welcome to my website..." paragraph in v6 tone (more technical, retains inline scroll links).

**Q: About photos?**
Selected: I'll provide new photos
→ Use styled placeholder boxes. Do not port v5 photos (about_1.jpg, about_me2.png, about_3.jpg).

---

## Experience Timeline Visual

**Q: How should the Experience timeline look?**
Selected: Vertical line + dot nodes (Recommended)
Reason: 1px vertical line on the left, small circle (~8px) at each entry. Line color: DS.border. Dot color: DS.textMuted default, DS.textPrimary on hover. Same concept as v5 but restyled with DS tokens.

---

*Discussion completed: 2026-04-14*
