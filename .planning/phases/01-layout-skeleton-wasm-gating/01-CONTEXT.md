# Phase 1: Layout Skeleton + WASM Gating - Context

**Gathered:** 2026-04-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Prove the two-zone scroll architecture works without touching the WASM inference path. The aquarium hero fills the full viewport; a content zone with 7 section stubs scrolls below it; IntersectionObserver gates inference pause/resume based on hero visibility. No real content, no design system, no nav — just the structural foundation that all subsequent phases build on.

</domain>

<decisions>
## Implementation Decisions

### Layout Structure
- **D-01:** `App.tsx` becomes the page-level scroll container. It wraps `<AquariumLanding onHeroVisibility={setHeroVisible} />` followed by a content zone div. `App.tsx` owns the `heroVisible` boolean state.
- **D-02:** `AquariumLanding`'s outer div drops `overflow: hidden` and stays `position: relative; height: 100vh`. All internal elements (video, canvas, overlays) are already `position: fixed` so this change has no visual impact on the aquarium itself.
- **D-03:** No new component files for layout — extend `App.tsx` and add a minimal `onHeroVisibility` prop to `AquariumLanding`.

### Inference Pause Trigger
- **D-04:** Use `IntersectionObserver` on the hero root div (`heroRef`) with `threshold: 0.1`. When the hero is ≥10% out of viewport, `isIntersecting` becomes false.
- **D-05:** IO is set up inside `AquariumLanding` via a `useEffect`. It calls `onHeroVisibility(entry.isIntersecting)` on each IO callback.
- **D-06:** `App.tsx` combines `heroVisible && detectionOn` into `DetectionCanvas`'s existing `active` prop. No changes needed to `DetectionCanvas` or the inference loop itself.

### Detection Toggle Visibility
- **D-07:** The detection toggle button fades out when the hero is off-screen (`heroVisible === false`). Implemented via CSS `opacity` + `pointer-events: none` transition (not conditional unmount).
- **D-08:** `heroVisible` state (from IO callback) is passed down to `AquariumLanding` so the button can read it for fade styling. Alternatively, `AquariumLanding` can hold its own local copy of hero visibility since it owns the IO logic.

### Placeholder Content
- **D-09:** 7 section stubs rendered in the content zone below the aquarium: `about`, `experience`, `education`, `skills`, `projects`, `research`, `contact`. Each has a correct `id` attribute, `minHeight: 100vh`, `background: #0a0a0a`, and a visible `<h2>` placeholder label.
- **D-10:** These stubs establish nav anchor targets so Phase 2 can wire up links immediately without restructuring the DOM.

### Claude's Discretion
- Exact transition duration for the detection toggle fade (suggested: 200–300ms, consistent with subtle motion intent).
- Whether `heroVisible` is lifted to `App.tsx` state or kept as a local ref inside `AquariumLanding` — either works since `AquariumLanding` owns the IO and the button.
- Exact placeholder label styling (font size, color, alignment) — not design-system work yet, just something visible enough to verify scroll.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Source Files (read before touching)
- `src/components/AquariumLanding.tsx` — hero component; outer div gets `overflow:hidden` removed; receives new `onHeroVisibility` prop; IO added here
- `src/components/DetectionCanvas.tsx` — inference loop; `active` prop is the pause/resume hook; DO NOT modify the inference logic
- `src/App.tsx` — becomes the scroll root; owns `heroVisible` state and content zone
- `src/hooks/useFishDetection.ts` — ONNX session lifecycle; do not touch
- `src/hooks/useVideoStream.ts` — HLS/video lifecycle; do not touch

### Requirements (Phase 1)
- `.planning/REQUIREMENTS.md` §Layout — LAYOUT-01 through LAYOUT-05 are the acceptance criteria for this phase

### Project Constraints
- `.planning/PROJECT.md` §Constraints — COOP/COEP headers, WASM performance, no mobile, stack immutability

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `DetectionCanvas.tsx` `active` prop: already controls the inference loop on/off — zero changes needed to use it as the pause gate
- `App.tsx`: currently a 5-line passthrough; becomes the scroll container with minimal additions
- `AquariumLanding.tsx` `useRef` + `useEffect` pattern: already established — IO follows the same shape

### Established Patterns
- All mutable-but-non-rendering values use `useRef` (e.g., `rafRef`, `runningRef`) — IO ref follows this
- Boolean state that drives UI uses `useState` (e.g., `detectionOn`) — `heroVisible` should be `useState` since it drives toggle visibility
- Effects return cleanup functions — IO `disconnect()` must be in the cleanup
- `position: fixed` is the existing pattern for all overlay layers — no change needed

### Integration Points
- `App.tsx` → `AquariumLanding`: add `onHeroVisibility: (visible: boolean) => void` prop
- `App.tsx` → `AquariumLanding`: move `detectionOn` state up to `App.tsx` so `active={heroVisible && detectionOn}` can be computed at the parent
- `App.tsx` → `DetectionCanvas` (via `AquariumLanding`): `active` prop already threaded through; no new prop drilling needed beyond the existing path

</code_context>

<specifics>
## Specific Ideas

- The IO threshold of `0.1` means detection stops as soon as 90% of the hero has scrolled out — gives a small buffer so detection doesn't flicker on/off at the exact boundary.
- Section stub IDs must match the nav link targets Phase 2 will use: `about`, `experience`, `education`, `skills`, `projects`, `research`, `contact`.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-layout-skeleton-wasm-gating*
*Context gathered: 2026-04-14*
