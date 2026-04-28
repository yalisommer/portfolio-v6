---
phase: quick
plan: 260428-fjr
type: execute
wave: 1
depends_on: []
files_modified:
  - index.html
  - src/hooks/useFishDetection.ts
  - src/components/AquariumLanding.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Browser starts fetching fish-detector.onnx and ort-wasm-simd-threaded.wasm during HTML parse, before React boots"
    - "ORT thread pool is capped at 4 threads to avoid spin-up overhead"
    - "Detection toggle button displays CV corner brackets instead of pill shape"
  artifacts:
    - path: "index.html"
      provides: "preload hints for ONNX model and WASM binary"
      contains: "rel=\"preload\""
    - path: "src/hooks/useFishDetection.ts"
      provides: "numThreads cap"
      contains: "numThreads"
    - path: "src/components/AquariumLanding.tsx"
      provides: "restyled button with motif-corners"
      contains: "motif-corners"
  key_links:
    - from: "index.html preload"
      to: "browser cache"
      via: "link rel=preload before React hydration"
      pattern: "rel=\"preload\""
    - from: "AquariumLanding button"
      to: "src/styles/motifs.css"
      via: "className motif-corners (already globally imported in main.tsx)"
      pattern: "motif-corners"
---

<objective>
Speed up YOLO/ONNX model loading on production and restyle the detection toggle button with CV-aesthetic corner brackets.

Purpose: On production (GitHub Pages), the ONNX model and WASM binary are fetched only after React boots — introducing a multi-second delay before inference is ready. Preloading these assets during HTML parse eliminates that gap. The button restyle aligns the UI with the YOLOv8 detection-box aesthetic already used throughout the design system.

Output: Faster model load on first visit; detection button with corner brackets.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/260428-fjr-speed-up-yolo-model-load-on-production-a/260428-fjr-PLAN.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add preload hints and cap ORT thread count</name>
  <files>index.html, src/hooks/useFishDetection.ts</files>
  <action>
In `index.html`, add two `<link rel="preload">` tags in `<head>` immediately after the closing `</script>` tag of the SW registration block:

```html
<link rel="preload" href="/fish-detector.onnx" as="fetch" crossorigin="anonymous" />
<link rel="preload" href="/ort-wasm-simd-threaded.wasm" as="fetch" crossorigin="anonymous" />
```

These go AFTER the SW registration `<script>` block (line 25) and BEFORE `</head>`. Using `as="fetch"` with `crossorigin="anonymous"` ensures the preloaded response is reused by ORT's fetch call (same credentials mode). The SW reload does not invalidate the preload cache entry for the second page load.

In `src/hooks/useFishDetection.ts`, add a `numThreads` cap on the line immediately after `ort.env.wasm.wasmPaths = '/'` (currently line 22):

```ts
ort.env.wasm.numThreads = Math.min(navigator.hardwareConcurrency ?? 1, 4)
```

This prevents ORT from spinning up excessive threads on high-core-count machines, reducing warm-up overhead before the first inference frame. Cap is 4 — above 4 the WASM threading overhead exceeds the parallelism gain for a 416-input model.
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && grep -n 'rel="preload"' index.html && grep -n 'numThreads' src/hooks/useFishDetection.ts</automated>
  </verify>
  <done>index.html contains two preload link tags for fish-detector.onnx and ort-wasm-simd-threaded.wasm; useFishDetection.ts contains the numThreads assignment after wasmPaths</done>
</task>

<task type="auto">
  <name>Task 2: Restyle detection toggle button with motif-corners</name>
  <files>src/components/AquariumLanding.tsx</files>
  <action>
The detection toggle `<button>` element (line 89 in AquariumLanding.tsx) currently has `borderRadius: '999px'` and `border: '1px solid rgba(255,255,255,0.1)'`. Replace with CV corner bracket styling:

1. Add `className="motif-corners"` to the `<button>` element — `motifs.css` is already globally imported in `main.tsx`, so the `.motif-corners` pseudo-elements will render immediately.

2. In the inline `style` object:
   - Remove `borderRadius: '999px'` entirely (or set to `0` — corners replace the pill shape)
   - Remove `border: '1px solid rgba(255,255,255,0.1)'` (corners provide the visual boundary)
   - Update padding to `'0.4rem 0.9rem'` (from `'0.3rem 0.75rem'`) to give the corner brackets breathing room

The button already has `position: 'fixed'` which is a positioning context — `::before` and `::after` from `.motif-corners` are `position: absolute` and will position relative to the button correctly. The `position: relative` from `.motif-corners` class is overridden by `position: fixed` but pseudo-elements still anchor to the nearest positioned ancestor (the button itself), so corners render correctly.

Final button JSX (preserve all other existing props unchanged):
```tsx
<button
  className="motif-corners"
  onClick={() => canDetect && setDetectionOn(v => !v)}
  style={{
    position: 'fixed',
    top: '1.25rem',
    right: '1.25rem',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    border: 'none',
    borderRadius: 0,
    padding: '0.4rem 0.9rem',
    fontSize: '0.7rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.85)',
    cursor: canDetect ? 'pointer' : 'default',
    userSelect: 'none',
    opacity: heroVisible ? 1 : 0,
    pointerEvents: heroVisible ? 'auto' as const : 'none' as const,
    transition: 'opacity 0.25s ease',
  }}
>
```
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && grep -n 'motif-corners' src/components/AquariumLanding.tsx && ! grep -n 'borderRadius.*999px' src/components/AquariumLanding.tsx</automated>
  </verify>
  <done>Button has className="motif-corners", no borderRadius pill, no border line; TypeScript compiles without errors (npm run build completes)</done>
</task>

</tasks>

<verification>
Run TypeScript build check after both tasks:

```bash
cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && npx tsc --noEmit
```

No type errors should be introduced. The `numThreads` assignment uses `navigator.hardwareConcurrency` (number | undefined) with `?? 1` fallback — valid TypeScript. The `className` prop on `<button>` is a standard React prop — no type issues.
</verification>

<success_criteria>
- `index.html` has two `<link rel="preload">` tags for fish-detector.onnx and ort-wasm-simd-threaded.wasm, placed in `<head>` after the SW script block
- `useFishDetection.ts` sets `ort.env.wasm.numThreads` immediately after `wasmPaths`
- Detection toggle button renders with green CV corner brackets, no pill border, square corners
- `npx tsc --noEmit` exits 0
</success_criteria>

<output>
After completion, create `.planning/quick/260428-fjr-speed-up-yolo-model-load-on-production-a/260428-fjr-SUMMARY.md` with what was changed and any noteworthy implementation details.
</output>
