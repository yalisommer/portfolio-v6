# Phase 1: Layout Skeleton + WASM Gating - Research

**Researched:** 2026-04-14
**Domain:** React scroll layout architecture + IntersectionObserver-based inference gating
**Confidence:** HIGH

## Summary

Phase 1 converts the current single-viewport aquarium page into a two-zone scrollable layout: the aquarium hero (100vh) followed by 7 placeholder content sections. The critical constraint is that the WASM-based fish detection must continue running when the hero is visible and pause when scrolled away, without ever unmounting the video or canvas elements.

The existing codebase already has the exact pause/resume mechanism needed: `DetectionCanvas` accepts an `active` boolean prop that controls the `requestAnimationFrame` inference loop. When `active` becomes `false`, the loop stops and the canvas clears. When it becomes `true`, the loop restarts. Zero changes are needed to the detection or video infrastructure -- the entire phase is about (1) enabling scroll on the page, (2) wiring an IntersectionObserver to detect hero visibility, and (3) piping that visibility boolean into the existing `active` prop.

The main technical subtlety is the interaction between `position: fixed` elements (video, canvas, overlays) and the scrollable container. Fixed elements are positioned relative to the viewport, so they remain visible even when their parent wrapper scrolls away. This is actually the desired behavior for LAYOUT-03 (stay mounted). The IntersectionObserver must target the hero's wrapper div (which scrolls naturally), not the fixed children.

**Primary recommendation:** Change `overflow: hidden` to `overflow-x: hidden` on `html, body, #root` in App.css; add `onHeroVisibility` callback prop to `AquariumLanding`; wire IO on the hero wrapper div; combine `heroVisible && detectionOn` into `active`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** `App.tsx` becomes the page-level scroll container. It wraps `<AquariumLanding onHeroVisibility={setHeroVisible} />` followed by a content zone div. `App.tsx` owns the `heroVisible` boolean state.
- **D-02:** `AquariumLanding`'s outer div drops `overflow: hidden` and stays `position: relative; height: 100vh`. All internal elements (video, canvas, overlays) are already `position: fixed` so this change has no visual impact on the aquarium itself.
- **D-03:** No new component files for layout -- extend `App.tsx` and add a minimal `onHeroVisibility` prop to `AquariumLanding`.
- **D-04:** Use `IntersectionObserver` on the hero root div (`heroRef`) with `threshold: 0.1`. When the hero is >=10% out of viewport, `isIntersecting` becomes false.
- **D-05:** IO is set up inside `AquariumLanding` via a `useEffect`. It calls `onHeroVisibility(entry.isIntersecting)` on each IO callback.
- **D-06:** `App.tsx` combines `heroVisible && detectionOn` into `DetectionCanvas`'s existing `active` prop. No changes needed to `DetectionCanvas` or the inference loop itself.
- **D-07:** The detection toggle button fades out when the hero is off-screen (`heroVisible === false`). Implemented via CSS `opacity` + `pointer-events: none` transition (not conditional unmount).
- **D-08:** `heroVisible` state (from IO callback) is passed down to `AquariumLanding` so the button can read it for fade styling. Alternatively, `AquariumLanding` can hold its own local copy of hero visibility since it owns the IO logic.
- **D-09:** 7 section stubs rendered in the content zone below the aquarium: `about`, `experience`, `education`, `skills`, `projects`, `research`, `contact`. Each has a correct `id` attribute, `minHeight: 100vh`, `background: #0a0a0a`, and a visible `<h2>` placeholder label.
- **D-10:** These stubs establish nav anchor targets so Phase 2 can wire up links immediately without restructuring the DOM.

### Claude's Discretion
- Exact transition duration for the detection toggle fade (suggested: 200-300ms, consistent with subtle motion intent).
- Whether `heroVisible` is lifted to `App.tsx` state or kept as a local ref inside `AquariumLanding` -- either works since `AquariumLanding` owns the IO and the button.
- Exact placeholder label styling (font size, color, alignment) -- not design-system work yet, just something visible enough to verify scroll.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| LAYOUT-01 | Aquarium hero section fills the full viewport at the top of the page | Hero wrapper div uses `height: 100vh` (already exists); removing `overflow: hidden` from body/root enables scrolling without changing hero sizing |
| LAYOUT-02 | Content sections scroll continuously below the aquarium (no page-snap) | Standard document flow -- 7 section stubs with `minHeight: 100vh` below the hero div; no `scroll-snap` needed |
| LAYOUT-03 | Aquarium video/canvas stays mounted (not unmounted) as user scrolls away | `position: fixed` elements (video, canvas, overlays) remain viewport-attached regardless of scroll; hero wrapper scrolls but fixed children persist |
| LAYOUT-04 | Fish detection inference pauses automatically when aquarium hero is not in viewport | IntersectionObserver on hero wrapper div triggers `heroVisible=false` when <10% visible; `active={heroVisible && detectionOn}` stops the RAF loop in DetectionCanvas |
| LAYOUT-05 | Fish detection inference resumes when aquarium hero re-enters viewport | IO triggers `heroVisible=true` when >=10% visible; `active` becomes `true`; DetectionCanvas `useEffect` restarts the RAF loop automatically |
</phase_requirements>

## Standard Stack

### Core (already installed -- no new dependencies)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.5 | UI rendering, hooks, state management | Already installed; provides `useState`, `useEffect`, `useRef` |
| TypeScript | 5.7.3 | Type safety | Already installed; strict mode enforced |
| Vite | 6.4.2 | Dev server + bundler | Already installed |

### Supporting
No new dependencies needed. This phase uses only browser-native `IntersectionObserver` API and existing React hooks.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native IntersectionObserver | `react-intersection-observer` npm package | Adds a dependency for ~15 lines of code; codebase convention is zero third-party UI libraries; native IO is sufficient |
| React 19 callback ref cleanup | `useEffect` + `useRef` pattern | Callback ref cleanup is newer React 19 feature, but codebase consistently uses `useEffect` cleanup pattern; follow existing convention |

**Installation:** No new packages needed.

## Architecture Patterns

### Current Structure (before this phase)
```
src/
  App.tsx              # Thin passthrough: renders <AquariumLanding />
  App.css              # Global reset: overflow: hidden on html/body/#root
  main.tsx             # Entry: mounts App into #root
  components/
    AquariumLanding.tsx  # Hero: video + canvas + overlays + button
    AquariumVideo.tsx    # Video element (position: fixed)
    DetectionCanvas.tsx  # Canvas overlay + inference loop (position: fixed)
  hooks/
    useFishDetection.ts  # ONNX session lifecycle + runDetection
    useVideoStream.ts    # HLS/fallback video lifecycle
  utils/
    yolo.ts              # Preprocessing + postprocessing
```

### After This Phase
```
src/
  App.tsx              # Scroll root: heroVisible state + <AquariumLanding> + content zone
  App.css              # Updated: overflow-x: hidden (allows vertical scroll)
  main.tsx             # Unchanged
  components/
    AquariumLanding.tsx  # Hero: adds onHeroVisibility prop + IO setup + button fade
    AquariumVideo.tsx    # Unchanged
    DetectionCanvas.tsx  # Unchanged
  hooks/                 # All unchanged
  utils/                 # All unchanged
```

### Pattern 1: IntersectionObserver with useEffect Cleanup
**What:** Set up IO inside `AquariumLanding` to detect hero visibility.
**When to use:** When you need to detect element visibility relative to the viewport.
**Example:**
```typescript
// Source: MDN IntersectionObserver API + codebase useEffect pattern
const heroRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const el = heroRef.current
  if (!el) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      onHeroVisibility(entry.isIntersecting)
    },
    { threshold: 0.1 }
  )

  observer.observe(el)
  return () => observer.disconnect()
}, [onHeroVisibility])
```

### Pattern 2: State Lifting for Cross-Component Visibility Gating
**What:** `App.tsx` owns `heroVisible` state; passes it down as both a prop to `AquariumLanding` (for button fade) and combines it with `detectionOn` to compute `active`.
**When to use:** When a visibility signal from one component needs to affect behavior in a sibling or parent scope.
**Example:**
```typescript
// App.tsx
const [heroVisible, setHeroVisible] = useState(true)

// AquariumLanding receives onHeroVisibility={setHeroVisible}
// detectionOn and active computation happen in App.tsx or AquariumLanding
```

### Pattern 3: CSS Opacity Fade (No Unmount)
**What:** Toggle button remains in DOM but fades via CSS transition when hero is off-screen.
**When to use:** When a fixed-position element should visually disappear without unmounting.
**Example:**
```typescript
// Source: codebase inline style convention
style={{
  ...existingButtonStyles,
  opacity: heroVisible ? 1 : 0,
  pointerEvents: heroVisible ? 'auto' : 'none',
  transition: 'opacity 0.25s ease',
}}
```

### Anti-Patterns to Avoid
- **Conditional rendering for pause:** Do NOT use `{heroVisible && <DetectionCanvas ... />}` -- this unmounts the canvas, losing RAF state and causing the ONNX session to need reattachment. The `active` prop already handles pause/resume.
- **Scroll event listener for visibility:** Do NOT use `window.addEventListener('scroll', ...)` -- IntersectionObserver is asynchronous and far more performant. Scroll listeners fire on every pixel and block the main thread.
- **Removing `position: fixed` from video/canvas:** These elements MUST stay `position: fixed` so they remain visible while the user scrolls. Changing to `position: absolute` would cause them to scroll with the hero wrapper.
- **Using `display: none` for button hide:** This removes the element from layout flow and can cause flash-of-content when it reappears. Use `opacity: 0` + `pointer-events: none` instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Visibility detection | Scroll position math | `IntersectionObserver` API | IO is async, battery-efficient, handles edge cases (resize, zoom); scroll math runs on main thread and degrades inference FPS |
| Inference pause/resume | New pause mechanism | Existing `DetectionCanvas.active` prop | Already implemented -- setting `active=false` stops the RAF loop and clears the canvas |

**Key insight:** The entire WASM gating mechanism already exists. `DetectionCanvas` has a fully working pause/resume system via its `active` boolean prop. This phase only needs to wire a new signal source (IO hero visibility) into that existing mechanism.

## Common Pitfalls

### Pitfall 1: Breaking WASM Inference with Layout Changes
**What goes wrong:** Changing DOM structure or CSS that affects the video/canvas layout causes ONNX inference to fail or degrade.
**Why it happens:** The inference loop reads `video.getBoundingClientRect()` every frame to size the canvas. If the video element's layout changes unexpectedly, detection coordinates become wrong.
**How to avoid:** Do NOT change anything inside `DetectionCanvas.tsx`, `useFishDetection.ts`, `useVideoStream.ts`, or `AquariumVideo.tsx`. The only changes are to `App.tsx`, `App.css`, and `AquariumLanding.tsx` (prop interface + IO setup + button fade).
**Warning signs:** Bounding boxes appear at wrong positions; canvas dimensions don't match video dimensions.

### Pitfall 2: IO Observing a Fixed Element Instead of the Wrapper
**What goes wrong:** If IO is set up on a `position: fixed` element, it never fires because fixed elements are always in the viewport (by definition).
**Why it happens:** Fixed elements have coordinates relative to the viewport regardless of scroll position.
**How to avoid:** Observe `heroRef` which points to the hero wrapper div (the one with `position: relative; height: 100vh`). This div scrolls with the page and correctly triggers IO callbacks.
**Warning signs:** `onHeroVisibility` callback never fires when scrolling.

### Pitfall 3: `overflow: hidden` on Body Preventing Scroll
**What goes wrong:** Page cannot scroll at all.
**Why it happens:** Current `App.css` sets `overflow: hidden` on `html, body, #root`. This must be changed to allow vertical scrolling.
**How to avoid:** Change `overflow: hidden` to `overflow-x: hidden` (prevents horizontal scroll but allows vertical) on `html, body`. For `#root`, remove `overflow: hidden` entirely or also use `overflow-x: hidden`. Also remove `height: 100%` from `#root` since it constrains the scroll container.
**Warning signs:** Content below the hero is present in DOM but not reachable by scrolling.

### Pitfall 4: `height: 100%` on #root Preventing Content Overflow
**What goes wrong:** Content zone stubs don't extend the page beyond the viewport.
**Why it happens:** `#root` has `height: 100%` which constrains it to exactly the viewport height. Children that exceed this won't extend the scrollable area.
**How to avoid:** Change `#root` from `height: 100%` to `min-height: 100%` (or remove the height constraint entirely). This allows the content to flow naturally beyond the viewport.
**Warning signs:** Section stubs exist in DOM but page height matches viewport height exactly.

### Pitfall 5: `detectionOn` State Ownership During Refactor
**What goes wrong:** The `detectionOn` toggle state and the `heroVisible` state end up in different components, making the `active = heroVisible && detectionOn` computation impossible without extra prop drilling.
**Why it happens:** Currently `detectionOn` lives in `AquariumLanding`. If `heroVisible` is lifted to `App.tsx` but `detectionOn` stays in `AquariumLanding`, neither component has both values.
**How to avoid:** Either (A) lift `detectionOn` to `App.tsx` alongside `heroVisible`, or (B) keep both in `AquariumLanding` by having it compute `active` internally while calling `onHeroVisibility` for any parent-level needs. Option A is cleaner per D-01/D-06 (App.tsx owns `heroVisible` and computes `active`). With option A, `AquariumLanding` needs `detectionOn`, `setDetectionOn`, and `heroVisible` as props -- or `App.tsx` passes the computed `active` and the button state separately.
**Warning signs:** TypeScript compilation error about missing variables; toggle button doesn't work.

### Pitfall 6: Initial heroVisible State Mismatch
**What goes wrong:** On page load, `heroVisible` defaults to `false`, causing detection to be paused for a moment until IO fires.
**Why it happens:** `useState(false)` would start with hero hidden even though it's fully visible on load.
**How to avoid:** Initialize `heroVisible` to `true` since the hero is always visible at the top of the page on initial load.
**Warning signs:** Brief flash of "Detection off" or no bounding boxes for a moment after page load.

## Code Examples

### Example 1: App.tsx Scroll Root Pattern
```typescript
// Source: Codebase conventions (inline styles, named exports, useState)
import { useState } from 'react'
import AquariumLanding from './components/AquariumLanding'

const SECTION_IDS = ['about', 'experience', 'education', 'skills', 'projects', 'research', 'contact'] as const

export default function App() {
  const [heroVisible, setHeroVisible] = useState(true)

  return (
    <>
      <AquariumLanding onHeroVisibility={setHeroVisible} heroVisible={heroVisible} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {SECTION_IDS.map(id => (
          <section
            key={id}
            id={id}
            style={{
              minHeight: '100vh',
              background: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <h2 style={{
              fontSize: '2rem',
              color: 'rgba(255,255,255,0.15)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}>
              {id}
            </h2>
          </section>
        ))}
      </div>
    </>
  )
}
```

### Example 2: IntersectionObserver Setup in AquariumLanding
```typescript
// Source: MDN IO API + codebase useEffect/useRef convention
import { useRef, useEffect } from 'react'

// Inside AquariumLanding component:
const heroRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  const el = heroRef.current
  if (!el) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      onHeroVisibility(entry.isIntersecting)
    },
    { threshold: 0.1 }
  )

  observer.observe(el)
  return () => observer.disconnect()
}, [onHeroVisibility])

// Attach ref to the hero wrapper div:
// <div ref={heroRef} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
```

### Example 3: App.css Changes
```css
/* Before */
html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #fff;
}

/* After */
html, body {
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
  background: #000;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #fff;
}

#root {
  width: 100%;
  min-height: 100%;
}
```

### Example 4: Content Zone z-index Layering
```
z-index stacking (from back to front):
  0 - AquariumVideo (position: fixed, z-index: 0)
  1 - DetectionCanvas (position: fixed, z-index: 1)
  2 - Bottom gradient (position: fixed, z-index: 2)
  3 - Hero text + button (position: fixed, z-index: 3)
 10 - Content zone sections (position: relative, z-index: 10)
```
The content zone must have a higher z-index than the fixed aquarium layers so it visually covers the aquarium as the user scrolls down. The content sections need `position: relative` (or any non-static position) for `z-index` to take effect in normal flow.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `scroll` event listeners | `IntersectionObserver` | Broadly supported since ~2019; full support across modern browsers | Async, off-main-thread visibility detection; no performance impact on inference loop |
| React 18 ref cleanup via useEffect | React 19 callback ref cleanup | React 19 (Dec 2024) | Simplifies IO setup, but codebase uses useEffect pattern consistently -- follow convention |

**Deprecated/outdated:**
- `scroll` event listener for visibility: Replaced by IntersectionObserver; scroll listeners block the main thread and would degrade the ~10 FPS inference loop.

## Open Questions

1. **Content zone covering the aquarium visually**
   - What we know: Fixed elements (video, canvas) stay behind content sections if content has higher z-index. Content needs `position: relative` + `z-index: 10` (or similar value above 3) plus an opaque background.
   - What's unclear: Whether the hero's fixed gradient overlay (z-index 2) should fade out when scrolling into the content zone, or if the content zone's opaque `#0a0a0a` background is sufficient to cover it.
   - Recommendation: Content zone's opaque background at z-index 10 will naturally cover all fixed layers. The gradient and hero text will be hidden behind the content. No special fade needed for Phase 1 -- this is a Phase 2 design concern.

2. **Whether `detectionOn` should be lifted to App.tsx or stay in AquariumLanding**
   - What we know: D-01 says App.tsx owns `heroVisible`. D-06 says App.tsx combines `heroVisible && detectionOn` into `active`. This implies `detectionOn` needs to be accessible in App.tsx.
   - What's unclear: Whether to physically lift `detectionOn` state to App.tsx (and pass down setter + value), or have AquariumLanding compute `active` locally and just report `heroVisible` upward.
   - Recommendation: Keep it simple -- `AquariumLanding` already owns `detectionOn`. Have `AquariumLanding` also hold a local `heroVisible` state (set by its own IO callback), compute `active = heroVisible && detectionOn` internally, and call `onHeroVisibility` to inform App.tsx for any parent-level use. This avoids lifting `detectionOn` and minimizes prop changes. D-08 explicitly allows this approach.

## Project Constraints (from CLAUDE.md)

- **Tech stack immutable:** React + TypeScript + Vite only; no new frameworks
- **No new dependencies:** IntersectionObserver is a native browser API
- **WASM headers untouched:** COOP/COEP configuration in vite.config.ts must not be modified
- **Performance:** Inference loop (~10 FPS) must not be degraded; IO is async and off-main-thread
- **No mobile:** Desktop-only; no responsive breakpoints needed
- **Strict TypeScript:** All new code must pass `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- **Inline styles only:** No CSS modules, Tailwind, or styled-components; all styling via inline `style` objects
- **Naming conventions:** PascalCase components (`export default function`), camelCase hooks/variables, UPPER_SNAKE_CASE constants
- **useEffect cleanup:** All effects must return cleanup functions
- **2-space indentation, single quotes** for string literals

## Sources

### Primary (HIGH confidence)
- MDN IntersectionObserver API (https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) - IO constructor options, threshold behavior, callback entry shape
- Codebase source files (`DetectionCanvas.tsx`, `AquariumLanding.tsx`, `App.tsx`, `App.css`) - Existing `active` prop mechanism, current layout structure, style conventions

### Secondary (MEDIUM confidence)
- MDN CSS position:fixed documentation (https://developer.mozilla.org/en-US/docs/Web/CSS/position) - Fixed positioning relative to viewport, interaction with overflow containers
- React 19 ref cleanup feature (https://blog.saeloun.com/2025/03/24/react-19-ref-as-prop/) - Callback ref cleanup support in React 19; not used because codebase follows useEffect pattern

### Tertiary (LOW confidence)
- None -- all findings verified against official sources or codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; entire phase uses existing React hooks + native IO API
- Architecture: HIGH - All integration points verified by reading source; `active` prop mechanism confirmed working
- Pitfalls: HIGH - CSS overflow/fixed/z-index interactions verified against MDN; IO targeting verified against API spec

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable -- no fast-moving dependencies; browser APIs and React 19 are well-established)
