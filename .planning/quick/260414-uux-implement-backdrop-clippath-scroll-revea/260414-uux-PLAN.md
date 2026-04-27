---
phase: quick
plan: 260414-uux
type: execute
wave: 1
depends_on: []
files_modified:
  - src/App.tsx
  - src/components/Nav.tsx
  - src/hooks/useMeshBackground.ts
autonomous: true
requirements: []
must_haves:
  truths:
    - "Backdrop wipes up from bottom as user scrolls past the hero, using clipPath inset rather than opacity"
    - "Nav appears as a sticky bar at the top of the content zone, no longer using fixed positioning or heroVisible-driven visibility"
    - "Mesh background objects are placed at deep Y positions and camera scroll-tracks so meshes appear at different scroll depths"
  artifacts:
    - path: "src/App.tsx"
      provides: "clipPath-based backdrop reveal and Nav repositioned inside content zone"
    - path: "src/components/Nav.tsx"
      provides: "Sticky nav without heroVisible prop or visibility logic"
    - path: "src/hooks/useMeshBackground.ts"
      provides: "Camera scroll-tracking and homeY-based mesh placement with bounded Y-bounce"
  key_links:
    - from: "src/App.tsx"
      to: "scroll handler"
      via: "CSS variable --backdrop-clip updated on scroll"
      pattern: "clipPath.*inset.*var.*backdrop-clip"
    - from: "src/App.tsx"
      to: "src/components/Nav.tsx"
      via: "Nav rendered inside content zone div as first sticky child"
      pattern: "<Nav"
    - from: "src/hooks/useMeshBackground.ts"
      to: "scroll event"
      via: "camera.position.y tracks scroll offset"
      pattern: "camera\\.position\\.y"
---

<objective>
Implement three coordinated scroll-reveal and layout changes: (1) replace the opacity-based black backdrop with a clipPath inset wipe driven by a CSS variable in the scroll handler, (2) move Nav inside the content zone as a sticky element and remove its heroVisible dependency, (3) rework mesh background to use camera scroll-tracking with meshes placed at deep homeY positions that bounce within bounded Y ranges.

Purpose: Creates a smoother hero-to-content transition where the black backdrop physically wipes upward, the nav naturally appears as you scroll into content, and mesh objects are distributed across the full scroll depth rather than bouncing in a single viewport.
Output: Updated App.tsx, Nav.tsx, and useMeshBackground.ts
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/App.tsx
@src/components/Nav.tsx
@src/hooks/useMeshBackground.ts
@src/components/MeshBackground.tsx
</context>

<interfaces>
<!-- Current interfaces the executor needs to understand -->

From src/components/Nav.tsx (WILL CHANGE):
```typescript
interface Props {
  heroVisible: boolean  // REMOVING this prop entirely
}
```

From src/components/MeshBackground.tsx (unchanged):
```typescript
interface Props {
  active: boolean  // true when content zone is visible (!heroVisible)
}
// Canvas is fixed, fullscreen, zIndex 5, pointerEvents none
```

From src/hooks/useMeshBackground.ts (WILL CHANGE):
```typescript
interface BouncingMesh {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  radius: number
  rotationSpeed: THREE.Vector3
  // ADDING: homeY: number, bounceHalfY: number
}

interface Bounds {
  w: number
  h: number
}

export function useMeshBackground(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  active: boolean,
): void
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: App.tsx backdrop clipPath + Nav relocation</name>
  <files>src/App.tsx, src/components/Nav.tsx</files>
  <action>
**src/App.tsx changes:**

1. In the scroll handler, compute a clip percentage: `const clipPct = Math.min(100, (window.scrollY / window.innerHeight) * 100)`. Update the backdrop div's clip via a CSS variable on `document.documentElement`: `document.documentElement.style.setProperty('--backdrop-clip', clipPct + '%')`. Keep `setHeroVisible(window.scrollY < window.innerHeight)` for AquariumLanding and MeshBackground.

2. Replace the existing black backdrop div (the one with `opacity: heroVisible ? 0 : 1`). New backdrop div:
   ```
   position: 'fixed',
   inset: 0,
   zIndex: 1,
   background: '#000000',
   clipPath: 'inset(var(--backdrop-clip, 100%) 0 0 0)',
   pointerEvents: 'none',
   ```
   Remove the `transition: 'opacity 0.6s ease'` and `opacity` property — the clipPath driven by the scroll handler provides the animation.

3. Remove `heroVisible` prop from `<Nav />` — render it as `<Nav />` with no props.

4. Move `<Nav />` from its current position (before AquariumLanding, outside the content zone) to INSIDE the content zone div (the `div` with `style={{ position: 'relative', zIndex: 10, paddingTop: '100vh' }}`) as the FIRST child, before the gradient overlay div. Nav needs to be sticky so it sticks to the top as you scroll within this container.

**src/components/Nav.tsx changes:**

1. Remove the `interface Props { heroVisible: boolean }` — the component takes no props now.

2. Change function signature from `export default function Nav({ heroVisible }: Props)` to `export default function Nav()`.

3. In `navStyle`, change `position: 'fixed'` to `position: 'sticky'`. Keep `top: 0`. Keep `zIndex: 100`.

4. Remove the entire `visibilityStyle` object that merges navStyle with opacity/transform/pointerEvents driven by heroVisible.

5. Apply `navStyle` directly to the `<nav>` element: `<nav style={navStyle}>`.

6. Remove the `useState` import if no longer needed (activeSection still uses it, so keep it). Remove `heroVisible` from everywhere.
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>Backdrop uses clipPath inset driven by --backdrop-clip CSS variable. Nav is a sticky element inside the content zone with no heroVisible prop. TypeScript compiles clean.</done>
</task>

<task type="auto">
  <name>Task 2: Mesh background camera scroll-tracking and homeY placement</name>
  <files>src/hooks/useMeshBackground.ts</files>
  <action>
Rework useMeshBackground.ts to place mesh objects at deep Y positions and scroll-track the camera:

1. **Update BouncingMesh interface** — add two fields:
   ```typescript
   interface BouncingMesh {
     mesh: THREE.Mesh
     velocity: THREE.Vector3
     radius: number
     rotationSpeed: THREE.Vector3
     homeY: number        // center Y position in world space
     bounceHalfY: number  // max distance from homeY the mesh can bounce
   }
   ```

2. **Add homeY placement constants** — define the three home positions relative to bounds height:
   ```typescript
   const HOME_Y_FACTORS = [-1.5, -4.0, -7.0]  // multiplied by bounds.h
   const BOUNCE_HALF_Y_FACTOR = 0.4  // each mesh bounces within homeY +/- (0.4 * bounds.h)
   ```

3. **Update addMeshToScene** — accept `homeY` and `bounceHalfY` parameters instead of placing meshes randomly within the viewport. Set `mesh.position.y = homeY` (random X within bounds as before, Z stays 0). Push the new fields into the BouncingMesh object.

4. **Update the mesh loading section** — when calling `addMeshToScene`, compute `homeY` and `bounceHalfY` from the constants:
   ```typescript
   const homeY = HOME_Y_FACTORS[index] * bounds.h
   const bounceHalfY = BOUNCE_HALF_Y_FACTOR * bounds.h
   addMeshToScene(geometry, index, bounds, homeY, bounceHalfY)
   ```

5. **Update updatePhysics** — replace the Y-boundary bounce logic. Instead of bouncing off the viewport edges (`-hh` to `+hh`), each mesh bounces within its own `homeY - bounceHalfY` to `homeY + bounceHalfY` Y range. X-boundary logic stays the same (full bounds width). Remove or keep inter-mesh collision — since meshes are now spread across different Y depths, collisions are unlikely, but keeping the code is fine.

   Specifically, replace the Y bounce section:
   ```typescript
   const yMin = obj.homeY - obj.bounceHalfY
   const yMax = obj.homeY + obj.bounceHalfY
   if (p.y - r < yMin || p.y + r > yMax) {
     obj.velocity.y *= -1
     p.y = Math.max(yMin + r, Math.min(yMax - r, p.y))
   }
   ```

6. **Add scroll event listener for camera tracking** — inside the main useEffect (the one that sets up the scene), add a scroll handler that moves the camera's Y position based on scroll offset:
   ```typescript
   function onScroll() {
     camera.position.y = -(window.scrollY / window.innerHeight) * bounds.h
   }
   window.addEventListener('scroll', onScroll, { passive: true })
   ```
   Add cleanup in the return: `window.removeEventListener('scroll', onScroll)`.

7. **Update computeBounds** — the bounds computation currently uses `camera.position.z` for depth. This stays the same since camera only moves on Y axis, not Z. Bounds represent the visible area width/height at z=0 which is correct.

8. **Update onResize** — after recomputing bounds, also call `onScroll()` to reposition camera if bounds changed.
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && npx tsc --noEmit 2>&1 | head -30 && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Mesh objects placed at homeY positions [-1.5, -4.0, -7.0] * bounds.h. Camera Y tracks scroll offset. Each mesh bounces within its homeY +/- bounceHalfY range. Full build succeeds.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` — no type errors
2. `npm run build` — production build succeeds
3. Visual: backdrop wipes up from bottom on scroll (not opacity fade)
4. Visual: Nav appears as sticky at top of content sections, not during hero
5. Visual: mesh objects visible at different scroll depths as you scroll down
</verification>

<success_criteria>
- Backdrop uses clipPath inset with CSS variable driven by scroll handler
- Nav is sticky inside the content zone, no heroVisible prop
- Mesh background camera scroll-tracks; objects at deep Y positions with bounded bounce
- TypeScript compiles clean, production build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/260414-uux-implement-backdrop-clippath-scroll-revea/260414-uux-SUMMARY.md`
</output>
