# Codebase Concerns

**Analysis Date:** 2026-04-14

---

## Missing Critical Assets

**`public/aquarium.mp4` does not exist:**
- Problem: The fallback video path `/aquarium.mp4` is referenced in `src/components/AquariumVideo.tsx` line 29, but no `aquarium.mp4` file exists in `public/`. When the YouTube HLS stream fails (or in any production context), the video element will have `src=undefined` while in live mode and will silently show nothing in fallback mode.
- Files: `src/components/AquariumVideo.tsx:29`, `src/hooks/useVideoStream.ts:23–25`
- Impact: Entire page is a black screen if HLS stream is unavailable and no fallback video exists.
- Fix approach: Source and commit an `aquarium.mp4` to `public/`, or document this as a required manual step with a clearer runtime error message.

---

## Tech Debt

**YouTube HLS stream is a dev-only feature:**
- Issue: The `youtubeHlsProxy` plugin in `vite.config.ts` registers via `configureServer()` which is the Vite dev server only. The production build (`vite build` + static hosting) will have no `/api/hls-stream` or `/proxy/hls` endpoints. The frontend's `useVideoStream.ts` `fetch('/api/hls-stream')` will 404 in production, triggering fallback — but since `aquarium.mp4` is also missing, the result is a blank page.
- Files: `vite.config.ts:44–153`, `src/hooks/useVideoStream.ts:17`
- Impact: The live-stream feature is currently dev-server-only with no production deployment path.
- Fix approach: Either document this as intentionally dev-only (with the fallback video being the production experience), or implement a backend proxy service and deploy it separately.

**`yt-dlp` is an undocumented external system dependency:**
- Issue: `vite.config.ts` line 54 calls `execSync('yt-dlp ...')` at dev-server request time. `yt-dlp` is not in `package.json`, not in `devDependencies`, and not mentioned in any setup docs. Any developer without `yt-dlp` installed will silently fall back to local video with only a console warning.
- Files: `vite.config.ts:53–65`
- Impact: Onboarding friction; the live-stream feature silently degrades with no explanation.
- Fix approach: Add a `README.md` noting `yt-dlp` as a prerequisite, or check for `yt-dlp` at server start and log a clear installation message.

**YOUTUBE_URL is hardcoded in `vite.config.ts`:**
- Issue: `vite.config.ts` line 15 hardcodes `const YOUTUBE_URL = 'https://www.youtube.com/watch?v=zZD-7o97ugk'`. Swapping the stream source requires editing the build config directly.
- Files: `vite.config.ts:15`
- Impact: Minimal for a single-developer project, but conflates content configuration with build configuration.
- Fix approach: Read from an environment variable (`VITE_YOUTUBE_URL` or a `.env.local` value) so the stream source can change without touching build infrastructure.

**WebGPU backend disabled with a workaround comment:**
- Issue: `src/hooks/useFishDetection.ts` lines 24–26 contain a comment explaining that WebGPU is disabled because it "corrupts the WASM runtime state when WebGPU is unavailable." The executionProvider is forced to `['wasm']` only. This is a known workaround, not a resolved issue.
- Files: `src/hooks/useFishDetection.ts:24–29`
- Impact: Inference runs on WASM CPU-only. On supported hardware, WebGPU would provide significantly faster inference. Users on high-end GPUs get no acceleration benefit.
- Fix approach: Monitor `onnxruntime-web` releases for a fix to the JSEP initialization crash; re-enable `['webgpu', 'wasm']` once resolved.

**Training script output path does not match the path it expects:**
- Issue: `train_fish_detector.py` specifies `project="runs/fish"` (line 85), which should create output at `runs/fish/aquarium/`. However, YOLO's default behavior on this machine resulted in the actual output landing at `runs/detect/runs/fish/aquarium/`. The script's `best = Path("runs/fish/aquarium/weights/best.pt")` (line 93) would fail on a fresh run because the actual output is at `runs/detect/runs/fish/aquarium/weights/best.pt`.
- Files: `train_fish_detector.py:85–98`, `runs/detect/runs/fish/aquarium/weights/`
- Impact: The training script will fail to copy the ONNX model to `public/` if re-run from scratch on another machine.
- Fix approach: Either fix the `project` path to match actual YOLO behavior, or use `Path("runs").glob("**/best.onnx")` for robustness.

---

## Security Considerations

**No `.gitignore` exists:**
- Risk: The repository has no `.gitignore`. The following should not be committed: `node_modules/` (238 MB), `aquarium_yolo/` (132 MB, 1153 files — full training dataset), `runs/` (30 MB — ML training artifacts including `.pt` and `.onnx` model weights), `weights/` (18 MB), `yolov8n.pt` (root-level 6.5 MB base model), `public/fish-detector.onnx` (12 MB), and all WASM files in `public/` (~81 MB copied from `node_modules`). A `git add .` without a `.gitignore` would commit ~500+ MB of binaries.
- Files: Repository root
- Current mitigation: None — there is no `.gitignore` file.
- Recommendations: Create `.gitignore` immediately. Exclude `node_modules/`, `aquarium_yolo/`, `runs/`, `weights/`, `*.pt`, `public/*.wasm`, `public/*.mjs`, `public/*.onnx`, and `dist/`.

**CORS headers set to wildcard in dev proxy:**
- Risk: `vite.config.ts` lines 79 and 113 set `'Access-Control-Allow-Origin': '*'` on the proxy endpoints. This is appropriate for a dev server but worth noting if the proxy pattern is ever ported to a production server.
- Files: `vite.config.ts:79,113`
- Current mitigation: Only active in dev server context.

---

## Performance Concerns

**New off-screen canvas allocated on every inference frame:**
- Problem: `src/utils/yolo.ts` line 15 calls `document.createElement('canvas')` inside `preprocessFrame()`, which is called every inference cycle (~10 FPS). This allocates a new canvas element and its backing bitmap store on every call without reuse or cleanup.
- Files: `src/utils/yolo.ts:15–21`
- Impact: Continuous GC pressure at 10 FPS. The canvas and its pixel buffer are abandoned after each call.
- Fix approach: Move the canvas into a module-level singleton or pass a reusable canvas reference into `preprocessFrame`. A single 416×416 canvas reused across frames would eliminate the per-frame allocation.

**All 7 YOLO classes run through full NMS, then all non-fish are discarded:**
- Problem: `src/hooks/useFishDetection.ts` runs `postprocess()` for all 7 classes (fish, jellyfish, penguin, puffin, shark, starfish, stingray) including full NMS per class, then filters the results to `label === 'fish'` only (line 75). Six classes worth of NMS computation is discarded immediately.
- Files: `src/hooks/useFishDetection.ts:64–75`
- Impact: Minor CPU waste per inference frame. NMS is O(n²) per class but n is small after confidence filtering.
- Fix approach: Pass a `classFilter = [0]` parameter to `postprocess` and skip NMS for unwanted classes, or filter candidates before NMS.

**WASM inference runs on the main thread:**
- Problem: `ort.InferenceSession.create()` and `session.run()` execute synchronously on the main thread within an async function. With `enableWorker: false` set in hls.js (line 49 of `useVideoStream.ts`) to work around COEP issues, all computation shares the main thread.
- Files: `src/hooks/useFishDetection.ts:27`, `src/hooks/useVideoStream.ts:49`
- Impact: Inference frames can cause visible jank/stutter in the video playback if WASM execution takes >16ms. At 10 FPS cap this is partially mitigated, but heavier frames will still block rendering.
- Fix approach: Long-term: move inference into a Web Worker. Short-term: the `runningRef` guard in `DetectionCanvas.tsx` already prevents queuing — this is partially addressed.

**Large initial asset payload:**
- Problem: On first page load, the browser must fetch: `fish-detector.onnx` (12 MB) + `ort-wasm-simd-threaded.wasm` (12 MB) = ~24 MB minimum before inference can start. Additionally, `public/` contains multiple WASM variants (`asyncify.wasm` at 27 MB, `jsep.wasm` at 25 MB, `jspi.wasm` at 17 MB) that are served but only one is used at runtime.
- Files: `public/` directory
- Impact: Cold load on a slow connection will show the detection toggle in "Loading…" state for an extended period. The extra WASM variants add unnecessary bytes to the `public/` directory.
- Fix approach: Prune unused WASM variants from `public/` (keep only `ort-wasm-simd-threaded.wasm` and `.mjs` for the current `wasm`-only backend). Consider lazy-loading the ONNX model after the video starts playing to prioritize perceived performance.

---

## Missing Infrastructure

**No error boundaries in the React tree:**
- Problem: There are no React error boundaries anywhere in the component tree. An unhandled runtime error in `DetectionCanvas.tsx` or `AquariumLanding.tsx` will crash the entire page and show React's default white error screen.
- Files: `src/main.tsx`, `src/App.tsx`, `src/components/AquariumLanding.tsx`
- Impact: Any unexpected error during detection or canvas rendering kills the entire portfolio page.
- Fix approach: Wrap `<App />` in an error boundary in `src/main.tsx`, or wrap the detection canvas layer specifically so a detection crash degrades gracefully without killing the video and portfolio UI.

**No CI/CD pipeline:**
- Problem: No `.github/workflows/`, no `vercel.json`, no `netlify.toml`, no `Dockerfile`. There is no automated build, test, or deployment pipeline.
- Files: Repository root
- Impact: No lint-on-push, no build validation, no automated deployment.
- Fix approach: Minimal addition would be a GitHub Actions workflow running `npm run build` to catch type errors and broken imports on each push.

**No tests of any kind:**
- Problem: No test files exist (`*.test.*`, `*.spec.*`). No test framework is installed or configured. The `yolo.ts` preprocessing and NMS logic, which involves non-trivial math, has no unit test coverage.
- Files: `src/utils/yolo.ts` (NMS, IOU, preprocessing — all untested)
- Impact: Changes to `postprocess()`, `nms()`, or `preprocessFrame()` can silently break detection accuracy with no safety net.
- Fix approach: Add Vitest (already compatible with Vite projects) and unit tests for `iou()`, `nms()`, and the bounding-box scaling math in `postprocess()`.

**No README or setup documentation:**
- Problem: There is no `README.md`. A new developer has no documented path to get the project running. The required steps (install `yt-dlp`, source `aquarium.mp4`, run training script or copy ONNX model) are only discoverable by reading `vite.config.ts`, `train_fish_detector.py`, and `PLAN.md`.
- Files: Repository root
- Impact: High onboarding friction; the project is effectively undocumented.

---

## Architectural Inconsistencies / Code Smells

**Canvas always has `cursor: pointer` regardless of whether fish are present:**
- Problem: `src/components/DetectionCanvas.tsx` line 89 sets `cursor: 'pointer'` unconditionally. The entire viewport appears clickable even when no fish are detected. The click handler only opens a URL if a detection is hit (line 76).
- Files: `src/components/DetectionCanvas.tsx:73–77,89`
- Impact: Misleading UX — the cursor implies the full canvas is interactive.
- Fix approach: Dynamically set cursor based on whether the mouse is hovering over a detection bounding box, using the same hit-test logic already in `handleClick`.

**Click handler only works for goldfish (`Carassius auratus`), hardcoded URL:**
- Problem: `DetectionCanvas.tsx` line 76: `window.open('https://www.google.com/search?q=Carassius+auratus', '_blank')`. The search query is hardcoded to the goldfish species regardless of which class was detected. The model supports 7 classes but only `fish` is displayed, and even then the link is species-specific with no relation to the actual detection label.
- Files: `src/components/DetectionCanvas.tsx:76`
- Impact: The click interaction is effectively a stub — the label shown is `"fish"` but the link is for `Carassius auratus`.
- Fix approach: Either use `hit.label` to construct a dynamic search URL, or remove the click behavior until the portfolio content for each species is defined.

**`ScrollHint` component renders a `<style>` tag inline on every render:**
- Problem: `src/components/AquariumLanding.tsx` lines 139–143 inject a `<style>` block containing a keyframe animation inside a React component's JSX. This injects a new `<style>` tag into the DOM on every render of `ScrollHint`.
- Files: `src/components/AquariumLanding.tsx:139–143`
- Impact: Minor DOM pollution; the animation works correctly but the pattern is non-idiomatic. The `scrollBounce` keyframe should live in `App.css`.
- Fix approach: Move the `@keyframes scrollBounce` block to `src/App.css` and remove the inline `<style>` tag.

**All layout uses inline `style={{}}` objects — no design system or CSS:**
- Problem: All styling across `AquariumLanding.tsx` (147 lines), `AquariumVideo.tsx`, and `DetectionCanvas.tsx` uses inline React style objects. There are no CSS classes, CSS Modules, or CSS-in-JS library. `App.css` only contains a global reset (14 lines).
- Files: `src/components/AquariumLanding.tsx`, `src/components/AquariumVideo.tsx`, `src/components/DetectionCanvas.tsx`
- Impact: As the portfolio grows beyond the landing page, inline styles will become increasingly difficult to maintain, share, and keep consistent. No design tokens or shared values.
- Fix approach: Not urgent for a single-page demo. If more pages are added, migrate to CSS Modules or a utility class approach. At minimum, extract repeated magic values (colors, z-indices, spacings) into shared constants.

**`error` state from `useFishDetection` is never surfaced to the user:**
- Problem: `src/hooks/useFishDetection.ts` line 13 tracks an `error` state and populates it on ONNX load failure, but `src/components/AquariumLanding.tsx` never reads or displays the error. The detection toggle shows a grey dot labeled "Detection off" — indistinguishable from a user-disabled state.
- Files: `src/hooks/useFishDetection.ts:13,36–38,78`, `src/components/AquariumLanding.tsx:16`
- Impact: Silent failure when the model fails to load (e.g., 404 on `fish-detector.onnx`, WASM init error).
- Fix approach: `useFishDetection` already returns `{ status, error, runDetection }`. In `AquariumLanding.tsx`, show a tooltip or different label when `status === 'error'`, ideally including the error message for debugging.

**COEP headers block hls.js Web Worker, requiring `enableWorker: false`:**
- Problem: `src/hooks/useVideoStream.ts` line 48 disables the hls.js web worker because the `Cross-Origin-Embedder-Policy: require-corp` header (required for WASM SharedArrayBuffer) prevents the inline worker blob from loading. This is a known COEP/CORP conflict.
- Files: `src/hooks/useVideoStream.ts:48–49`, `vite.config.ts:175–179`
- Impact: HLS segment parsing and buffering runs on the main thread instead of a worker, increasing main-thread congestion alongside WASM inference.
- Fix approach: Serve hls.js worker script from a same-origin URL with appropriate CORP headers rather than using an inline blob. This is a known workaround documented in the hls.js repository.

---

## Dependencies at Risk

**`onnxruntime-web` version `^1.20.1` — JSEP/WebGPU known broken:**
- Risk: The project comment in `useFishDetection.ts` acknowledges WebGPU backend initialization corrupts WASM state. This is a known upstream issue in the 1.x range. The package is pinned to `^1.20.1` which will auto-update on `npm install` to any `1.x` release.
- Impact: A future `ort` patch release could change WASM initialization behavior; the workaround comment may become stale.
- Migration plan: Pin to an exact version (`"1.20.1"`) once stability is confirmed, or upgrade to a version that resolves the JSEP crash.

**`hls.js ^1.6.16` — COEP worker conflict unresolved:**
- Risk: The COEP/CORP conflict disabling hls.js's web worker is a known upstream issue. Future versions may or may not resolve it. The current workaround (`enableWorker: false`) will persist silently across hls.js updates.
- Impact: Main-thread HLS processing continues indefinitely unless the worker issue is revisited.

**`yt-dlp` — external unversioned binary:**
- Risk: `yt-dlp` is invoked via `execSync` in `vite.config.ts` but is not listed in any dependency manifest. YouTube URL formats change frequently; `yt-dlp` requires regular updates to stay functional.
- Impact: The live-stream feature will silently break whenever `yt-dlp` becomes outdated relative to YouTube's current URL format.

---

## Test Coverage Gaps

**`src/utils/yolo.ts` — zero test coverage:**
- What's not tested: `preprocessFrame()` (tensor layout, normalization), `postprocess()` (output tensor parsing, coordinate scaling, confidence filtering), `iou()` (intersection-over-union math), `nms()` (suppression logic, edge cases with overlapping/identical boxes)
- Files: `src/utils/yolo.ts`
- Risk: Silent regression in detection accuracy if any coordinate math is changed. The scale factors `scaleX = origW / inputSize` and `scaleY = origH / inputSize` are straightforward but the output tensor layout parsing (transposed `[1, numAttrs, numDets]` format) is subtle and error-prone.
- Priority: High

**`src/hooks/useFishDetection.ts` — ONNX session lifecycle untested:**
- What's not tested: Session initialization, cancellation on unmount, error state propagation, `runDetection` return shape
- Files: `src/hooks/useFishDetection.ts`
- Risk: Refactoring the initialization logic or inference path has no safety net.
- Priority: Medium

---

*Concerns audit: 2026-04-14*
