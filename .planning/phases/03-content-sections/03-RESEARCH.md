# Phase 3: Content Sections - Research

**Researched:** 2026-04-14
**Domain:** React content components, Three.js WebGL mesh background, CSS expand/collapse animation
**Confidence:** HIGH

## Summary

Phase 3 replaces all 7 stub sections in `App.tsx` with real content data and adds a Three.js wireframe mesh background behind the content zone. The existing design system (DS.* tokens, motif CSS classes, Section wrapper, scroll-reveal) provides all styling primitives -- no new design token work is needed. The Three.js integration is the technically riskiest part: it introduces a new dependency (~155KB gzipped), a WebGL canvas layer with its own RAF loop, and mesh asset files that must be prepared from Stanford 3D models.

Key finding: Three.js has **no COEP/CORP conflict** with onnxruntime-web because Three.js is installed via npm and self-hosted -- all assets are same-origin. The WebGL context and the WASM threading (SharedArrayBuffer) operate on independent browser APIs with no interference. The two RAF loops (DetectionCanvas for inference, Three.js for mesh animation) coexist naturally since `requestAnimationFrame` multiplexes callbacks; performance isolation is achieved by throttling the mesh loop to 30 FPS and pausing it when the hero section is visible (reusing the existing `heroVisible` state).

**Primary recommendation:** Install `three` + `@types/three` via npm. Use OBJLoader from `three/addons/loaders/OBJLoader.js` to load pre-simplified Stanford meshes (bunny, dragon, teapot) committed as `.obj` files in `public/meshes/`. Render wireframe via `MeshBasicMaterial({ wireframe: true, color, opacity })`. Implement DVD-bounce and bounding-sphere collision in a vanilla Three.js animation loop managed by a custom React hook (`useMeshBackground`). Split section content into individual files under `src/components/sections/` for manageability.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use Three.js for the mesh background (npm install, self-hosted)
- **D-02:** Simplified Stanford meshes (bunny, dragon, Lucy) at ~5-15K triangles, committed to `public/meshes/`
- **D-03:** Single WebGL canvas behind all lower content sections (About through Contact)
- **D-04:** Wireframe-only rendering (edges, no polygon fill)
- **D-05:** DVD-logo style bouncing with constant velocity, reflects off canvas bounds, slow axis rotation
- **D-06:** Bounding-sphere inter-mesh elastic collisions
- **D-07:** Each mesh gets a distinct muted tint at 8-15% opacity (cyan, coral, warm yellow, green) -- overrides MESH-03 monochrome spec
- **D-08:** Mesh canvas must not degrade scroll or WASM inference; throttle to 30 FPS; pause when content zone not visible
- **D-09:** Project images use styled placeholders (motif-corners box); real images swapped in later
- **D-10:** Cards expand in-place within grid; one card at a time; click to toggle; click outside collapses
- **D-11:** Expand via React useState + CSS height/max-height transition; no external library
- **D-12:** Vertical line + dot nodes for experience timeline (1px line, 8px circles, DS.border/DS.textMuted colors)
- **D-13:** Bio text adapted from v5 with inline scroll links to other sections
- **D-14:** Photo placeholder with motif-corners border; user provides photos later
- **D-15 through D-18:** Four real experience entries (SMBC, IturanTech AI/ML, IturanTech DS, GenWell) with specific descriptions
- **D-19:** Brown University education with GPA 3.94, TA for Data Structures & Algorithms, Math + CS coursework
- **D-20:** Six skill categories as tag groups (Languages, Vision/Graphics, ML/AI, SWE, Data, Teamwork/Teaching)
- **D-21:** Five projects (ViolenceNet, Realtime Renderer, Raytracer, Alma Metrics, Confection) with v5 descriptions
- **D-22:** Catacaustics research entry (Brown Visual Computing Lab) with bvc_cubes_gt.png image
- **D-23:** Edinburgh Geometry Processing research entry with placeholder image
- **D-24:** Contact: email mailto + LinkedIn new-tab link

### Claude's Discretion
- Number of meshes rendered simultaneously (recommended: 3-5)
- Exact mesh rotation speed and drift velocity
- Three.js canvas z-index and opacity layering
- Font subsets and exact coursework list for Education
- Exact muted tint values for mesh wireframes
- Whether section content stays in App.tsx or splits into src/components/sections/

### Deferred Ideas (OUT OF SCOPE)
- Porting project images from v5 (placeholders for now)
- About section photos (placeholders for now)
- Scan-line and grid overlay CSS motifs
- Feature-point dot motif forced usage
- Resume/CV PDF download link
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ABOUT-01 | Bio text with Brown University, Math & CS, Visual Computing focus | D-13: Adapt from v5 bio; existing stub has good structure to replace |
| ABOUT-02 | One or more photos | D-14: Styled placeholder with motif-corners; slot for future image swap |
| ABOUT-03 | Inline links to other portfolio sections | D-13: Use `<a href="#experience">` etc., matching existing section IDs |
| EXP-01 | 4 experience entries (SMBC, IturanTech x2, GenWell) | D-15 through D-18: All real data provided verbatim |
| EXP-02 | Each entry: title, company, date, description | D-15 through D-18: Structured in CONTEXT.md |
| EXP-03 | Visually distinct timeline (not plain list) | D-12: Vertical line + dot nodes pattern |
| EDU-01 | Brown University, 2023-27, Math & CS, GPA 3.94 | D-19: All data specified |
| EDU-02 | Coursework lists for both Math and CS | D-19 + v5 source: v5 has full course lists; update for v6 |
| EDU-03 | TA role shown | D-19: TA for CSCI 0200 Data Structures & Algorithms |
| SKILLS-01 | Categorized tag groups (not bars) | D-20: Tags with border style, grouped by category |
| SKILLS-02 | Six categories | D-20: Languages, Vision/Graphics, ML/AI, SWE, Data, Teamwork/Teaching |
| SKILLS-03 | Visually scannable categories | D-20: Label + tag column layout from stub can be refined |
| PROJ-01 | Grid layout (all visible, no carousel) | Existing stub uses grid; expand to 5 projects |
| PROJ-02 | Five projects shown | D-21: ViolenceNet, Realtime Renderer, Raytracer, Alma Metrics, Confection |
| PROJ-03 | Each card: title, tech tags, description, link | D-21: All data from v5; links for ViolenceNet + Confection only |
| PROJ-04 | Expandable project images | D-09/D-10/D-11: Placeholder images, in-place expand, CSS transition |
| RES-01 | Section distinct from Projects (lab presentation style) | D-22/D-23: Grid layout with lab/supervisor metadata |
| RES-02 | Brown Visual Computing: Catacaustics entry | D-22: Full description provided |
| RES-03 | Edinburgh: DROK-inspired mesh manipulation | D-23: Full description provided |
| RES-04 | Each entry: group/lab, description, visual/thumbnail | D-22: bvc_cubes_gt.png for BVC; D-23: placeholder for Edinburgh |
| CONTACT-01 | Email link (mailto:) | D-24: yali_sommer@brown.edu |
| CONTACT-02 | LinkedIn link (new tab) | D-24: linkedin.com/in/yalisommer |
| MESH-01 | 3D research meshes as wireframes drifting in background | D-01 through D-07: Three.js, Stanford meshes, wireframe, tinted |
| MESH-02 | WebGL canvas at low opacity, no scroll/inference degradation | D-08: Throttle 30 FPS, pause when hero visible |
| MESH-03 | Visually coherent with design system | D-07: Muted tints at 8-15% opacity (overrides monochrome spec per user) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | 0.183.2 | WebGL rendering, OBJ loading, wireframe materials, animation loop | Industry standard 3D library; addons include OBJLoader; self-hosted avoids COEP issues |
| @types/three | 0.183.1 | TypeScript type definitions for three | Strict mode compliance; types track three.js releases |

### Supporting
Already installed (no additions needed):
| Library | Version | Purpose |
|---------|---------|---------|
| react | 19.2.5 | Component rendering |
| onnxruntime-web | 1.24.3 | WASM inference (existing, unchanged) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| three (npm) | CDN-loaded three.js | CDN requires `crossorigin` attribute + CORP headers; npm is simpler under COEP |
| OBJLoader | GLTFLoader for .glb files | GLB includes materials/textures we don't need; OBJ is vertex+face only, smaller |
| OBJLoader | Inline JSON vertex arrays | Removes loader dependency but requires custom conversion pipeline; OBJ is universal |
| react-three-fiber | Vanilla Three.js + useRef | R3F adds ~30KB and abstracts away the render loop we need manual control over for DVD-bounce; vanilla is lighter and gives direct control |

**Installation:**
```bash
npm install three @types/three
```

**Version verification:** `npm view three version` returned `0.183.2`, `npm view @types/three version` returned `0.183.1` (confirmed 2026-04-14).

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    sections/
      AboutSection.tsx          # ABOUT-01, ABOUT-02, ABOUT-03
      ExperienceSection.tsx     # EXP-01, EXP-02, EXP-03
      EducationSection.tsx      # EDU-01, EDU-02, EDU-03
      SkillsSection.tsx         # SKILLS-01, SKILLS-02, SKILLS-03
      ProjectsSection.tsx       # PROJ-01, PROJ-02, PROJ-03, PROJ-04
      ResearchSection.tsx       # RES-01, RES-02, RES-03, RES-04
      ContactSection.tsx        # CONTACT-01, CONTACT-02
    MeshBackground.tsx          # MESH-01, MESH-02, MESH-03 (Three.js canvas wrapper)
    Section.tsx                 # Unchanged
    Nav.tsx                     # Unchanged
    AquariumLanding.tsx         # Unchanged
  hooks/
    useMeshBackground.ts        # Three.js lifecycle, animation loop, DVD-bounce logic
  data/
    content.ts                  # All section content data (experience entries, projects, skills, etc.)
  styles/
    tokens.ts                   # Unchanged
    tokens.css                  # Unchanged
    motifs.css                  # Unchanged
    fonts.css                   # Unchanged
public/
  meshes/
    bunny.obj                   # ~5-15K triangles
    dragon.obj                  # ~5-15K triangles
    teapot.obj                  # ~5-15K triangles (or Lucy)
  images/
    bvc_cubes_gt.png            # Ported from portfolio-v5/dist/
```

### Pattern 1: Section Content Extraction
**What:** Move each section's content from inline functions in `App.tsx` into individual files under `src/components/sections/`.
**When to use:** When App.tsx exceeds ~200 lines or has 7+ distinct content blocks (current state: ~450 lines).
**Why:** Each section file is independently editable without merge conflicts. App.tsx becomes a clean shell that maps section IDs to components. The `Section` wrapper is still used for consistent layout.

**Example (App.tsx after extraction):**
```typescript
import AboutSection from './components/sections/AboutSection'
import ExperienceSection from './components/sections/ExperienceSection'
// ... etc

const SECTIONS: Record<string, () => JSX.Element> = {
  about: AboutSection,
  experience: ExperienceSection,
  // ...
}

// In the render:
{Object.entries(SECTIONS).map(([id, Content]) => (
  <Section key={id} id={id}>
    <Content />
  </Section>
))}
```

### Pattern 2: Three.js Canvas as Fixed Background Layer
**What:** A single `<canvas>` element positioned `fixed` behind the content zone, managed by a dedicated React component + hook.
**When to use:** When 3D content must appear behind scrollable HTML content without z-fighting.

**Example (MeshBackground.tsx):**
```typescript
import { useRef, useEffect } from 'react'
import { useMeshBackground } from '../hooks/useMeshBackground'

interface Props {
  active: boolean  // true when content zone visible (!heroVisible)
}

export default function MeshBackground({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useMeshBackground(canvasRef, active)

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 5,          // Above aquarium (0) but below content zone (10)
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
    />
  )
}
```

### Pattern 3: DVD-Bounce Physics in useMeshBackground Hook
**What:** Each mesh object has position (Vector3), velocity (Vector3), radius (bounding sphere), and rotation speed. On each frame: update position += velocity * dt, check bounds reflection, check inter-mesh sphere collisions with elastic bounce.

**Example (physics core):**
```typescript
interface BouncingMesh {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  radius: number
  rotationSpeed: THREE.Vector3
}

function updatePhysics(objects: BouncingMesh[], dt: number, bounds: { w: number; h: number }) {
  // 1. Update positions
  for (const obj of objects) {
    obj.mesh.position.addScaledVector(obj.velocity, dt)
    obj.mesh.rotation.x += obj.rotationSpeed.x * dt
    obj.mesh.rotation.y += obj.rotationSpeed.y * dt
  }

  // 2. Reflect off bounds
  for (const obj of objects) {
    const p = obj.mesh.position
    const r = obj.radius
    if (p.x - r < -bounds.w / 2 || p.x + r > bounds.w / 2) obj.velocity.x *= -1
    if (p.y - r < -bounds.h / 2 || p.y + r > bounds.h / 2) obj.velocity.y *= -1
  }

  // 3. Bounding-sphere collisions (elastic)
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i], b = objects[j]
      const dist = a.mesh.position.distanceTo(b.mesh.position)
      const minDist = a.radius + b.radius
      if (dist < minDist) {
        // Swap velocity components along collision normal
        const normal = new THREE.Vector3().subVectors(b.mesh.position, a.mesh.position).normalize()
        const relVel = new THREE.Vector3().subVectors(a.velocity, b.velocity)
        const impulse = relVel.dot(normal)
        a.velocity.addScaledVector(normal, -impulse)
        b.velocity.addScaledVector(normal, impulse)
        // Separate overlapping meshes
        const overlap = minDist - dist
        a.mesh.position.addScaledVector(normal, -overlap / 2)
        b.mesh.position.addScaledVector(normal, overlap / 2)
      }
    }
  }
}
```

### Pattern 4: Expandable Project Card
**What:** A grid of project cards where clicking one expands it vertically to reveal an image. Use `max-height` CSS transition for the expandable region.

**Key implementation:**
```typescript
const [expandedId, setExpandedId] = useState<string | null>(null)

// Click handler
const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id)

// Expandable region style
const expandStyle: React.CSSProperties = {
  maxHeight: isExpanded ? '400px' : '0px',
  overflow: 'hidden',
  transition: 'max-height 0.4s ease-in-out',
}
```

**Grid behavior:** When a card expands via max-height, it pushes sibling cards in subsequent rows downward naturally (CSS grid auto-rows). Cards in the same row are unaffected unless they also expand. This is the correct behavior per D-10.

### Anti-Patterns to Avoid
- **Don't use `height: auto` transitions:** CSS cannot transition to `height: auto`. Use `max-height` with a generous upper bound (e.g., 500px) instead.
- **Don't create multiple WebGL renderers:** One renderer, one canvas, one scene for all meshes. Multiple renderers leak GPU contexts.
- **Don't use `transform: scaleY(0)` for collapse:** It preserves layout space -- siblings don't move. Use `max-height: 0` with `overflow: hidden`.
- **Don't import from `three/examples/jsm/`:** Use `three/addons/` which is the current canonical import path (r150+).
- **Don't forget Three.js cleanup:** Failing to call `renderer.dispose()`, `geometry.dispose()`, `material.dispose()` in useEffect cleanup leaks GPU memory.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 3D mesh rendering | Custom WebGL shaders | Three.js `WebGLRenderer` + `MeshBasicMaterial({ wireframe: true })` | WebGL boilerplate is ~200 lines; Three.js handles context management, resize, and material compilation |
| OBJ file parsing | Custom OBJ parser | `OBJLoader` from `three/addons/loaders/OBJLoader.js` | OBJ format has edge cases (groups, materials, normals); loader handles all |
| Mesh simplification | Manual vertex decimation | pymeshlab / MeshLab (offline, pre-build) | Quadric edge collapse decimation preserves shape; hand-rolling is a research project |
| Scroll-reveal animation | Custom IntersectionObserver per section | Existing `useScrollReveal` hook + `Section` wrapper | Already built in Phase 2 and working |
| Bounding sphere computation | Manual radius calculation | `geometry.computeBoundingSphere()` after load | Three.js computes tight bounding sphere from vertex data |

## Common Pitfalls

### Pitfall 1: Three.js GPU Memory Leak on Component Unmount
**What goes wrong:** WebGL geometries, materials, and textures are not garbage-collected by JavaScript. If the MeshBackground component unmounts (or hot-reloads in dev), GPU memory accumulates.
**Why it happens:** Three.js allocates GPU buffers via WebGL APIs that exist outside the JS heap.
**How to avoid:** In the cleanup function of `useEffect`, traverse the scene and call `.dispose()` on every geometry and material, then call `renderer.dispose()` and `renderer.forceContextLoss()`.
**Warning signs:** Browser console warnings about "too many WebGL contexts" or increasing GPU memory in devtools.

### Pitfall 2: React StrictMode Double-Mount in Dev
**What goes wrong:** React 18/19 StrictMode calls useEffect twice in development. Two WebGL renderers are created, one is leaked.
**Why it happens:** StrictMode intentionally remounts to surface cleanup bugs.
**How to avoid:** Ensure the cleanup function fully disposes the renderer. The second mount then creates a fresh context. This is correct behavior -- if cleanup is thorough, StrictMode causes no issues.
**Warning signs:** Two canvases visible in the DOM, or "WebGL: CONTEXT_LOST" errors in dev.

### Pitfall 3: max-height Transition Timing Mismatch
**What goes wrong:** Collapsing a card with `max-height: 500px` transitioning to `max-height: 0` has a perceived delay because the transition starts from 500px even if actual content is only 200px tall.
**Why it happens:** CSS transitions interpolate the declared max-height, not the actual rendered height.
**How to avoid:** Set `max-height` to a value close to the actual expanded content height (e.g., 350-400px for an image + padding). The slight overshoot on expand is invisible; the collapse delay is minimal. Alternatively, use `grid-template-rows: 0fr -> 1fr` transition (Chromium-only as of 2025, but desktop-only site so this is acceptable).
**Warning signs:** Noticeable pause before collapse animation visually starts.

### Pitfall 4: OBJ Files Too Large for Web
**What goes wrong:** Stanford meshes at full resolution (bunny = 69K triangles, dragon = 871K triangles) are multi-MB OBJ files that block page load.
**Why it happens:** Original Stanford scans are high-resolution research data.
**How to avoid:** Pre-simplify to 5-15K triangles using pymeshlab before committing to `public/meshes/`. Target < 300KB per OBJ file. Load asynchronously after page paint.
**Warning signs:** Network waterfall shows large mesh downloads competing with ONNX model download.

### Pitfall 5: Two RAF Loops Competing for Frame Budget
**What goes wrong:** DetectionCanvas inference loop and Three.js mesh animation loop both call requestAnimationFrame, potentially exceeding the 16ms frame budget and causing jank.
**Why it happens:** Both loops run on the main thread and share the same frame callback queue.
**How to avoid:** The existing design already handles this: `heroVisible` gates inference (pauses when scrolled away), and mesh canvas should throttle to 30 FPS and pause when hero IS visible. The two loops are mutually exclusive in the typical scroll flow. Additionally, mesh rendering (wireframe, 3-5 objects, <50K total triangles) is trivially cheap for modern GPUs -- well under 1ms per frame.
**Warning signs:** FPS drops below 30 when both aquarium and content zone are partially visible simultaneously.

### Pitfall 6: noUnusedLocals / noUnusedParameters Build Failure
**What goes wrong:** `tsc -b` fails because a variable or parameter is declared but not used.
**Why it happens:** The project has `noUnusedLocals: true` and `noUnusedParameters: true` in tsconfig.
**How to avoid:** Prefix unused parameters with `_` (e.g., `_event`). Do not declare variables speculatively. This is especially relevant when extracting content functions -- ensure all imports are used.
**Warning signs:** `tsc -b` red errors before `vite build` even starts.

## Code Examples

### Three.js Wireframe Mesh with Tint Color
```typescript
// Source: Three.js official docs (MeshBasicMaterial, WireframeGeometry)
import * as THREE from 'three'

const material = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: new THREE.Color(100 / 255, 220 / 255, 255 / 255), // soft cyan
  transparent: true,
  opacity: 0.12,
  depthWrite: false,  // prevent wireframe from occluding other wireframes
})

const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
```

### Loading OBJ with Three.js Addons
```typescript
// Source: Three.js docs (OBJLoader)
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

const loader = new OBJLoader()
const group = await loader.loadAsync('/meshes/bunny.obj')
// OBJLoader returns a Group; extract the first child's geometry
const geometry = (group.children[0] as THREE.Mesh).geometry
geometry.computeBoundingSphere()
```

### Three.js Cleanup in React useEffect
```typescript
// Source: Three.js discourse + official disposal docs
useEffect(() => {
  const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current!, alpha: true, antialias: true })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100)

  // ... setup meshes, start animation loop ...

  return () => {
    // Cancel animation
    cancelAnimationFrame(rafId)
    // Dispose all geometries and materials
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.Material) obj.material.dispose()
      }
    })
    // Release WebGL context
    renderer.dispose()
    renderer.forceContextLoss()
  }
}, [])
```

### Experience Timeline with Vertical Line + Dots
```typescript
// Inline style approach matching project conventions
const timelineLineStyle: React.CSSProperties = {
  position: 'absolute',
  left: '3px',
  top: 0,
  bottom: 0,
  width: '1px',
  background: DS.border,
}

const dotStyle = (isHovered: boolean): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: isHovered ? DS.textPrimary : DS.textMuted,
  transition: 'background 0.2s ease',
  flexShrink: 0,
})
```

### Expandable Project Card
```typescript
const expandRegionStyle = (isExpanded: boolean): React.CSSProperties => ({
  maxHeight: isExpanded ? '400px' : '0px',
  overflow: 'hidden',
  transition: 'max-height 0.4s ease-in-out',
})

// Image placeholder with motif-corners
<div className="motif-corners" style={{
  width: '100%',
  aspectRatio: '16 / 9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: DS.surface,
  marginTop: '1rem',
}}>
  <span style={{ color: DS.textMuted, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}>
    {projectName}
  </span>
</div>
```

## Asset Inventory

### Existing in Repository
| Asset | Location | Status |
|-------|----------|--------|
| DS tokens (JS) | `src/styles/tokens.ts` | Ready -- DS.bg, DS.surface, DS.border, DS.textPrimary, DS.textSecondary, DS.textMuted, DS.accent |
| DS tokens (CSS) | `src/styles/tokens.css` | Ready -- :root custom properties |
| Motif classes | `src/styles/motifs.css` | Ready -- `.motif-corners`, `.motif-dots` |
| Fonts | `public/fonts/` + `src/styles/fonts.css` | Ready -- Inter Variable (2 files) + JetBrains Mono (2 files) |
| Section wrapper | `src/components/Section.tsx` | Ready -- scroll-reveal, padding, max-width |
| Nav | `src/components/Nav.tsx` | Ready -- do not modify |
| Scroll reveal hook | `src/hooks/useScrollReveal.ts` | Ready |
| heroVisible state | `src/App.tsx` line 421 | Ready -- `useState(true)` passed to AquariumLanding |
| Content zone | `src/App.tsx` lines 432-448 | Ready -- `zIndex: 10`, gradient overlay, Section map |
| Stub sections | `src/App.tsx` lines 31-416 | To be replaced -- all 7 section content functions |

### Available in portfolio-v5/dist/ (to port)
| Asset | v5 Path | v6 Destination | Action |
|-------|---------|----------------|--------|
| bvc_cubes_gt.png | `../portfolio-v5/dist/bvc_cubes_gt.png` | `public/images/bvc_cubes_gt.png` | Copy (79KB) -- research section visual |
| vnet.jpg | `../portfolio-v5/dist/vnet.jpg` | Not needed Phase 3 | Deferred (placeholder per D-09) |
| realtime.png | `../portfolio-v5/dist/realtime.png` | Not needed Phase 3 | Deferred |
| raytrace.png | `../portfolio-v5/dist/raytrace.png` | Not needed Phase 3 | Deferred |
| confec.png | `../portfolio-v5/dist/confec.png` | Not needed Phase 3 | Deferred |
| BYVS-Poster.jpg | `../portfolio-v5/dist/BYVS-Poster.jpg` | Not needed Phase 3 | Deferred |

### Must Be Created
| Asset | Target | How to Create |
|-------|--------|---------------|
| Stanford bunny OBJ (~10K tri) | `public/meshes/bunny.obj` | Download from alecjacobson/common-3d-test-models, simplify with pymeshlab |
| Stanford dragon OBJ (~10K tri) | `public/meshes/dragon.obj` | Same source, simplify |
| Utah teapot OBJ (~5K tri) | `public/meshes/teapot.obj` | Same source (already low-poly) or Three.js built-in |
| Section component files (7) | `src/components/sections/*.tsx` | Extract from App.tsx stubs, replace content |
| MeshBackground component | `src/components/MeshBackground.tsx` | New file |
| useMeshBackground hook | `src/hooks/useMeshBackground.ts` | New file |
| Content data file | `src/data/content.ts` | New file -- experience entries, projects, skills, courses |

### v5 Content Data to Port
From `../portfolio-v5/src/components/HomePage.tsx`:
- **Projects:** ViolenceNet, Realtime Renderer, Raytracer, Alma Metrics, Confection (titles, tech tags, descriptions, links) -- lines 91-132
- **Experience:** SMBC, IturanTech x2, GenWell (titles, companies, dates, descriptions) -- lines 436-486
- **Education:** Math courses (Number Theory, Abstract Algebra, Complex Analysis, Statistics & Probability, Linear Algebra, Applied ODEs, Multivariable Calculus), CS courses (OOP, Data Structures & Algorithms, Systems Programming, Logic for Systems, Computer Graphics, Computer Vision, Data Science, Software Engineering), TA role -- lines 498-538
- **About bio:** Existing text structure with inline scroll links -- lines 384-397
- **Contact:** Email + LinkedIn links -- lines 714-733

## Technical Findings

### 1. Three.js + COEP: No Conflict (HIGH confidence)
Three.js installed via `npm install three` is bundled by Vite and served as same-origin JavaScript. The WebGL context it creates uses same-origin canvas -- no cross-origin resource loading occurs. The COOP (`same-origin`) and COEP (`require-corp`) headers set in `vite.config.ts` server config affect cross-origin fetches, not same-origin WebGL operations. Confirmed: Three.js has no `SharedArrayBuffer` dependency and does not interfere with ORT's use of it.

The OBJ mesh files in `public/meshes/` are also same-origin static assets -- they are served by Vite's dev server with the correct headers automatically.

### 2. Stanford Mesh Preparation (HIGH confidence)
**Source:** The `alecjacobson/common-3d-test-models` GitHub repo contains Stanford bunny, dragon (XYZ Dragon), teapot, and more as ~10MB OBJ files. These are full-resolution and must be simplified.

**Simplification workflow:**
1. Download full-res OBJ files from the repo
2. Use pymeshlab (Python, installed locally) to decimate:
   ```python
   import pymeshlab
   ms = pymeshlab.MeshSet()
   ms.load_new_mesh('bunny.obj')
   ms.meshing_decimation_quadric_edge_collapse(targetfacenum=10000)
   ms.save_current_mesh('bunny_simplified.obj')
   ```
3. Target: 5,000-15,000 faces per mesh, resulting in ~100-300KB OBJ files
4. Commit simplified OBJ files to `public/meshes/`

pymeshlab is available on this system (Python 3.10, pymeshlab 2025.7). Alternatively, if pymeshlab has issues, the executor can use Three.js built-in parametric geometries (IcosahedronGeometry, TorusKnotGeometry, etc.) as stand-ins that visually evoke "research mesh" aesthetics, though real Stanford meshes are strongly preferred per D-02.

### 3. Three.js RAF Coexistence (HIGH confidence)
`requestAnimationFrame` is a browser API that accepts multiple callbacks per frame. Two independent RAF loops (DetectionCanvas + MeshBackground) will both fire on the same frame, sharing the ~16ms budget. Since:
- DetectionCanvas is paused when `heroVisible === false` (user scrolled to content)
- MeshBackground should be paused when `heroVisible === true` (user at aquarium)

The two loops are effectively **mutually exclusive** during normal scrolling. In the edge case where both are briefly active (hero partially visible), the mesh rendering workload (~3-5 wireframe objects, <50K total triangles) completes in <1ms on any modern GPU, leaving ample budget for inference.

**Implementation:** Use `setInterval` or manual timestamp tracking in the RAF callback to throttle mesh rendering to 30 FPS:
```typescript
let lastFrame = 0
function animate(time: number) {
  rafId = requestAnimationFrame(animate)
  if (time - lastFrame < 33) return  // ~30 FPS cap
  lastFrame = time
  updatePhysics(objects, 0.016, bounds)
  renderer.render(scene, camera)
}
```

### 4. Three.js Cleanup in React (HIGH confidence)
The correct cleanup sequence in `useEffect` return:
1. `cancelAnimationFrame(rafId)` -- stop the loop
2. `scene.traverse()` -- dispose every geometry and material
3. `renderer.dispose()` -- release the WebGL context
4. `renderer.forceContextLoss()` -- ensures GPU memory is freed immediately

React StrictMode will double-mount in dev; thorough cleanup ensures no leak. The `canvas` element ref survives unmount/remount because it's a DOM element managed by React's reconciler.

### 5. Expandable Card: max-height Transition (HIGH confidence)
**Recommended approach:** `max-height` transition from `0` to `400px` with `overflow: hidden`.

**Why max-height over grid-template-rows:**
- `grid-template-rows: 0fr -> 1fr` transition works in Chromium 2024+ but is not universally supported. Since this is a desktop-only site and the user likely tests in Chrome, it would work -- but `max-height` is more battle-tested and has zero browser compatibility risk.
- The collapse delay issue (transitioning from 400px when content is 200px) is negligible for a ~400px image region. A 0.4s transition on max-height with ease-in-out produces acceptable visual results.

**Grid push behavior:** When a card expands via max-height, CSS grid auto-placement handles row growth naturally. Cards in subsequent rows shift down. Cards in the same row are not affected (they keep their own height). This is correct per D-10.

### 6. Section Splitting Recommendation (MEDIUM confidence)
**Recommend splitting** into `src/components/sections/*.tsx` files for these reasons:
- App.tsx is already 450 lines of stub content; with real content + Three.js integration it would exceed 800 lines
- Each section is a self-contained component with no cross-section state (except Projects' expandedId which is local)
- The executor agent benefits from editing individual files without needing to hold all 7 sections in context
- The `Section` wrapper remains in `src/components/Section.tsx` unchanged

**Trade-off:** More files means more imports in App.tsx. This is a net positive for a 7-section portfolio.

### 7. Three.js Canvas Z-Index Layering (HIGH confidence)
The current layering:
- Aquarium video: `position: fixed`, implicitly z-index 0
- Content zone: `position: relative`, z-index 10
- Nav: `position: fixed`, z-index 100

The mesh canvas should be:
- `position: fixed`, z-index 5 (above aquarium, below content zone)
- `pointerEvents: 'none'` so scroll and click events pass through
- `opacity: 0/1` transition based on `heroVisible`

This means the mesh background is **visible through the transparent/semi-transparent areas of the content zone** but **behind all text and interactive elements**. The Section wrapper has `background: var(--ds-bg)` (#000000), so the mesh is visible only in the gaps between sections or where background is not fully opaque. If the user wants the mesh visible behind section content, the Section background should be made semi-transparent (e.g., `rgba(0,0,0,0.85)`). This is a design decision the executor should present visually.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build + dev server | Yes | v22.19.0 | -- |
| npm | Package install | Yes | 10.9.3 | -- |
| Python 3 | Mesh simplification (offline) | Yes | 3.10.11 | Use built-in Three.js geometries |
| pymeshlab | Mesh simplification (offline) | Yes | 2025.7 | Manual download of pre-simplified meshes |
| three (npm) | WebGL rendering | Not yet installed | 0.183.2 (latest) | -- |
| @types/three (npm) | TypeScript types | Not yet installed | 0.183.1 (latest) | -- |

**Missing dependencies with no fallback:** None -- `three` and `@types/three` are installable via npm.

**Missing dependencies with fallback:** pymeshlab availability confirmed. If mesh simplification fails, Three.js built-in parametric geometries (IcosahedronGeometry, TorusKnotGeometry) serve as visual stand-ins.

## Open Questions

1. **Section background opacity for mesh visibility**
   - What we know: Section wrapper uses `background: var(--ds-bg)` which is `#000000` (fully opaque). Mesh canvas at zIndex 5 is behind content zone at zIndex 10.
   - What's unclear: Should the mesh be visible *behind* section content (requiring semi-transparent section backgrounds), or only in the gradient transition zone between aquarium and first section?
   - Recommendation: Start with semi-transparent section backgrounds (`rgba(0,0,0,0.9)`) so mesh wireframes are subtly visible. If too distracting, make opaque. This is a visual tuning decision best resolved during execution with a screenshot review.

2. **Lucy mesh availability**
   - What we know: CONTEXT.md mentions Lucy as a candidate mesh. The common-3d-test-models repo has Lucy but it's split across multiple archive segments and is very high-poly (~28M triangles).
   - What's unclear: Whether pymeshlab can decimate Lucy to 10K triangles while retaining recognizable silhouette.
   - Recommendation: Use bunny + dragon + teapot as the three meshes. These are universally recognizable Stanford/Utah models and are simpler to prepare. If a fourth mesh is desired, use Happy Buddha from the same repo. Skip Lucy -- too high-poly for the payoff.

3. **Exact coursework list**
   - What we know: v5 has 7 math courses and 8 CS courses. D-19 says "use both Math and CS coursework."
   - What's unclear: Whether the v5 list is current (courses taken since v5 was built).
   - Recommendation: Use the v5 list as-is (it's the most recent authoritative source) and note in the code that it can be updated. Add "Deep Learning" to CS if not present (mentioned in v6 stubs).

## Project Constraints (from CLAUDE.md)

- **Tech stack:** React + TypeScript + Vite only -- no framework swap. Three.js is an additive dependency, not a framework change.
- **WASM headers:** COOP/COEP must stay in `vite.config.ts` server headers. Three.js does not conflict.
- **Performance:** Aquarium inference loop (~10 FPS) must not be degraded. Mesh canvas throttled to 30 FPS and paused when hero visible.
- **No mobile:** Desktop-only. No responsive breakpoints needed for section layouts.
- **Inline styles:** All styling via inline `style` objects using `DS.*` constants. No new CSS files unless necessary. `motifs.css` is an existing exception.
- **Strict TypeScript:** `noUnusedLocals`, `noUnusedParameters` -- all code must compile cleanly.
- **No animation libraries:** Framer Motion, GSAP are out of scope. CSS transitions + Three.js RAF only.
- **GSD workflow:** Changes should go through GSD commands; research is part of the workflow.

## Sources

### Primary (HIGH confidence)
- Three.js official docs: [MeshBasicMaterial](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial), [WireframeGeometry](https://threejs.org/docs/pages/WireframeGeometry.html), [BufferGeometry](https://threejs.org/docs/pages/BufferGeometry.html), [OBJLoader](https://threejs.org/docs/pages/OBJLoader.html), [PLYLoader](https://threejs.org/docs/pages/PLYLoader.html)
- npm registry: `three@0.183.2`, `@types/three@0.183.1` (verified 2026-04-14)
- [alecjacobson/common-3d-test-models](https://github.com/alecjacobson/common-3d-test-models) - Stanford mesh OBJ files
- [Stanford 3D Scanning Repository](http://graphics.stanford.edu/data/3Dscanrep/) - Original mesh data
- Project source code: `vite.config.ts`, `App.tsx`, `Section.tsx`, `tokens.ts` (read directly)
- portfolio-v5 source: `HomePage.tsx` (content data), `dist/` (image assets)

### Secondary (MEDIUM confidence)
- [Three.js multiple scenes on same canvas](https://threejs.org/manual/en/multiple-scenes.html) - Multiple RAF loop guidance
- [Three.js memory leak prevention](https://discourse.threejs.org/t/memory-leak-with-new-scenes/29917) - Disposal patterns
- [Three.js renderer disposal PR #17588](https://github.com/mrdoob/three.js/pull/17588) - forceContextLoss in dispose
- [Vite static asset handling](https://vite.dev/guide/assets) - public/ folder serving
- [web.dev COOP/COEP guide](https://web.dev/articles/coop-coep) - Cross-origin isolation details

### Tertiary (LOW confidence)
- [CSS max-height transition patterns](https://jdsteinbach.com/css/holy-grail-css-animation/) - Various approaches
- [CSS grid-template-rows 0fr/1fr transition](https://medium.com/@carmeladi/solving-dynamic-height-animations-with-native-css-tools-c96723db4382) - Newer approach, Chromium-only

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Three.js is the definitive WebGL library; version verified on npm
- Architecture: HIGH -- patterns are well-established (Three.js + React without R3F is a common pattern)
- Content data: HIGH -- all content provided verbatim in CONTEXT.md or available in v5 source
- Mesh preparation: HIGH -- pymeshlab available and tested; OBJ files from known source
- Pitfalls: HIGH -- drawn from Three.js community knowledge and project-specific constraints

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (Three.js releases monthly; current patterns stable)
