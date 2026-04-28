---
phase: quick
plan: 260428-fjr
subsystem: aquarium/detection-ui
tags: [performance, ort, preload, ui, motif-corners]
dependency_graph:
  requires: []
  provides: [faster-model-load, capped-ort-threads, motif-corners-button]
  affects: [index.html, useFishDetection, AquariumLanding]
tech_stack:
  added: []
  patterns: [rel=preload as=fetch, navigator.hardwareConcurrency, motif-corners className]
key_files:
  created: []
  modified:
    - index.html
    - src/hooks/useFishDetection.ts
    - src/components/AquariumLanding.tsx
decisions:
  - "Used as=fetch with crossorigin=anonymous for preload links so ORT's fetch call hits the same cache entry (credentials-mode match)"
  - "numThreads capped at 4 — above 4 WASM threading overhead exceeds parallelism gain for a 416-input model"
  - "border:none + borderRadius:0 rather than removing the style keys, for explicit reset semantics"
metrics:
  duration: "2min"
  completed: "2026-04-28"
  tasks: 2
  files: 3
---

# Quick Task 260428-fjr: Speed Up YOLO Model Load on Production Summary

**One-liner:** Preload ONNX model and WASM binary during HTML parse, cap ORT thread pool at 4, and swap detection button from pill to CV corner brackets.

## What Was Done

### Task 1: Preload hints + ORT thread cap

**index.html** — Added two `<link rel="preload">` tags immediately after the SW registration `</script>` block (lines 26-27):

```html
<link rel="preload" href="/fish-detector.onnx" as="fetch" crossorigin="anonymous" />
<link rel="preload" href="/ort-wasm-simd-threaded.wasm" as="fetch" crossorigin="anonymous" />
```

`as="fetch"` with `crossorigin="anonymous"` matches the credentials mode ORT uses when fetching these assets at runtime, so the preloaded response is actually reused (mismatched `as` or missing `crossorigin` would cause a double-fetch).

**src/hooks/useFishDetection.ts** — Added `numThreads` cap on the line immediately after `wasmPaths`:

```ts
ort.env.wasm.numThreads = Math.min(navigator.hardwareConcurrency ?? 1, 4)
```

`navigator.hardwareConcurrency` is `number | undefined` in TypeScript; `?? 1` provides a safe fallback for environments where it is undefined (e.g., some older browsers).

### Task 2: Detection toggle button restyle

**src/components/AquariumLanding.tsx** — Updated the detection toggle `<button>`:

- Added `className="motif-corners"` — the `.motif-corners` class is globally imported via `main.tsx → motifs.css` and renders CV-aesthetic corner brackets via `::before`/`::after` pseudo-elements
- Removed `border: '1px solid rgba(255,255,255,0.1)'` → replaced with `border: 'none'`
- Removed `borderRadius: '999px'` pill → replaced with `borderRadius: 0`
- Padding updated from `'0.3rem 0.75rem'` to `'0.4rem 0.9rem'` for corner bracket breathing room

The button retains `position: 'fixed'` which is a positioning context; `::before`/`::after` from `.motif-corners` are `position: absolute` and anchor to the button correctly despite the override of `position: relative` from the class.

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- index.html contains two `rel="preload"` lines (verified line 26-27)
- useFishDetection.ts contains `numThreads` assignment (verified line 23)
- AquariumLanding.tsx contains `className="motif-corners"` and no `borderRadius.*999px` (verified)
- `npx tsc --noEmit` exited 0 with no output
