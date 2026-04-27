---
phase: quick
plan: 260414-tvn
type: execute
wave: 1
depends_on: []
files_modified:
  - src/App.tsx
  - src/components/AquariumLanding.tsx
  - src/hooks/useMeshBackground.ts
autonomous: true
must_haves:
  truths:
    - "Hero text ('YALI SOMMER') fades out before content sections become visible (~30vh scroll)"
    - "Mesh background objects drift slowly — perceived as ambient, not scroll-driven"
  artifacts:
    - path: "src/App.tsx"
      provides: "Scroll-based heroVisible calculation"
      contains: "window.scrollY"
    - path: "src/components/AquariumLanding.tsx"
      provides: "Simplified props — no onHeroVisibility callback or IntersectionObserver"
    - path: "src/hooks/useMeshBackground.ts"
      provides: "Slower mesh velocity and rotation constants"
      contains: "VELOCITY_MIN = 0.08"
  key_links:
    - from: "src/App.tsx"
      to: "src/components/AquariumLanding.tsx"
      via: "heroVisible prop (no longer onHeroVisibility)"
      pattern: "heroVisible={heroVisible}"
---

<objective>
Fix two visual bugs: (1) hero text remaining visible over content sections due to a slow IntersectionObserver threshold, and (2) mesh background objects appearing to move with scroll due to excessive animation velocity.

Purpose: Both bugs degrade the scroll experience — the hero text overlaps readable content, and the mesh speed creates a distracting visual.
Output: Clean hero fade-out at ~30vh scroll; ambient slow-drifting meshes.
</objective>

<context>
@src/App.tsx
@src/components/AquariumLanding.tsx
@src/hooks/useMeshBackground.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Move hero visibility to scroll listener in App.tsx and clean up AquariumLanding</name>
  <files>src/App.tsx, src/components/AquariumLanding.tsx</files>
  <action>
In `src/App.tsx`:
- Add `useEffect` import (already imports `useState`).
- Add a `useEffect` with a scroll event listener that sets `heroVisible` based on scroll position:
  ```
  useEffect(() => {
    function handleScroll() {
      setHeroVisible(window.scrollY < window.innerHeight * 0.3)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  ```
- Remove the `onHeroVisibility={setHeroVisible}` prop from the `<AquariumLanding>` JSX. The component now only receives `heroVisible`.

In `src/components/AquariumLanding.tsx`:
- Remove `onHeroVisibility` from the `Props` interface. Props becomes `{ heroVisible: boolean }`.
- Remove the `heroRef` useRef declaration (line 24).
- Remove the entire `useEffect` block that creates the IntersectionObserver (lines 26-39).
- Remove `ref={heroRef}` from the root `<div>` on line 45. Keep all other attributes on that div unchanged.
- Remove `useRef` from the React import (line 1) since it is no longer used in this file.
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>TypeScript compiles cleanly. AquariumLanding no longer has onHeroVisibility prop or IntersectionObserver. App.tsx drives heroVisible via scroll position with 0.3 * innerHeight threshold.</done>
</task>

<task type="auto">
  <name>Task 2: Lower mesh animation velocity and rotation constants</name>
  <files>src/hooks/useMeshBackground.ts</files>
  <action>
In `src/hooks/useMeshBackground.ts`, update the four physics constants (lines 26-29):

```
const VELOCITY_MIN = 0.08       // was 0.3
const VELOCITY_MAX = 0.3        // was 1.0
const ROTATION_SPEED_MIN = 0.015  // was 0.05
const ROTATION_SPEED_MAX = 0.07   // was 0.25
```

No other changes to this file.
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && npx tsc --noEmit 2>&1 | head -10</automated>
  </verify>
  <done>Mesh velocity constants lowered. Objects drift slowly enough to appear ambient rather than scroll-driven.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with zero errors
2. `npx vite build` completes successfully
3. Visual: run `npx vite`, scroll down — hero text fades out well before the About section content appears
4. Visual: mesh background objects drift slowly, not distractingly fast
</verification>

<success_criteria>
- Hero text invisible by ~30vh scroll (before content sections at ~35vh)
- No IntersectionObserver or onHeroVisibility callback in AquariumLanding
- Mesh objects move at roughly 1/4 their previous speed
- TypeScript compiles cleanly; build succeeds
</success_criteria>

<output>
After completion, create `.planning/quick/260414-tvn-fix-hero-text-visibility-and-mesh-animat/260414-tvn-SUMMARY.md`
</output>
