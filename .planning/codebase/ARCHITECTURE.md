# Architecture

**Analysis Date:** 2026-04-14

## Pattern Overview

**Overall:** Single-Page Application (SPA) — React 19 + Vite, client-side only, no server-side rendering.

**Key Characteristics:**
- One full-screen view: an aquarium video background with a real-time ML inference overlay
- All ML inference runs entirely in the browser via WASM (ONNX Runtime Web)
- A Vite dev-server plugin acts as a Node.js proxy for YouTube HLS streams and ONNX Runtime `.mjs` asset serving — this proxy layer exists only during development

## Layers

**Presentation Layer:**
- Purpose: Render the full-screen UI — video background, detection overlay canvas, portfolio hero text, and detection toggle button
- Location: `src/components/`
- Contains: `AquariumLanding.tsx` (root layout), `AquariumVideo.tsx` (video element), `DetectionCanvas.tsx` (canvas overlay + draw logic)
- Depends on: hooks layer for state and callbacks
- Used by: `src/App.tsx`

**Hooks Layer:**
- Purpose: Encapsulate side-effectful logic — video stream lifecycle and ONNX model lifecycle — exposing clean reactive state to components
- Location: `src/hooks/`
- Contains: `useVideoStream.ts` (stream acquisition, HLS negotiation, fallback), `useFishDetection.ts` (ONNX session load, inference dispatch)
- Depends on: `src/utils/yolo.ts`, `onnxruntime-web`, `hls.js`
- Used by: `src/components/AquariumLanding.tsx`

**Utilities Layer:**
- Purpose: Pure functions for YOLOv8 tensor preprocessing and post-processing (NMS)
- Location: `src/utils/`
- Contains: `yolo.ts` — `preprocessFrame()`, `postprocess()`, `nms()`, `iou()`, `Detection` interface
- Depends on: nothing (DOM canvas API only)
- Used by: `src/hooks/useFishDetection.ts` and the `runDetection` callback passed to `DetectionCanvas`

**Dev-Server Middleware (build-time only):**
- Purpose: Two Vite plugins embedded in `vite.config.ts` that run in the Node.js dev server process
- Location: `vite.config.ts`
- Contains:
  - `youtubeHlsProxy`: resolves a YouTube live stream URL via `yt-dlp`, caches it for 5 hours, exposes `/api/hls-stream` JSON endpoint and `/proxy/hls?url=` streaming proxy with CORS headers
  - `serveOrtMjsRaw`: intercepts requests for `ort-wasm*.mjs` files and streams them with correct CORS headers, bypassing Vite's transformer
- Depends on: `yt-dlp` CLI (external, must be installed), `vite-plugin-static-copy` (copies WASM files to `public/`)
- Used by: only the Vite dev server; not included in production build

## Data Flow

**Video Stream Acquisition:**

1. `useVideoStream` fetches `/api/hls-stream` on mount
2. Dev-server `youtubeHlsProxy` plugin calls `yt-dlp` (with 5-hour cache) and returns `{ url, type }` — either an HLS m3u8 or mp4 URL proxied through `/proxy/hls`
3. If `type === 'hls'`, `hls.js` loads the proxied manifest and attaches to the `<video>` element via `videoRef`; if `type === 'mp4'`, src is set directly
4. If `/api/hls-stream` fails or returns `null`, `useVideoStream` falls back to `streamStatus = 'fallback'`
5. `AquariumVideo` renders `src="/aquarium.mp4"` only when `streamStatus === 'fallback'`

**ML Inference Loop:**

1. `useFishDetection` loads `InferenceSession` from `/fish-detector.onnx` on mount (WASM execution provider); sets `status = 'ready'` on success
2. `AquariumLanding` passes `runDetection` callback and `active` flag into `DetectionCanvas`
3. `DetectionCanvas` runs a `requestAnimationFrame` loop throttled to ≥100ms intervals (~10 FPS max)
4. Each iteration: reads the `<video>` element via `videoRef`, calls `runDetection(video, displayW, displayH)`
5. `runDetection` calls `preprocessFrame()` (draw video frame to off-screen canvas → normalize → Float32Array NCHW tensor), creates an `ort.Tensor`, calls `session.run()`, calls `postprocess()` (confidence threshold 0.20, IoU NMS 0.45), filters to class `fish` only
6. Detections returned as `Detection[]`; `DetectionCanvas.draw()` renders bounding boxes, glow strokes, label chips on the overlay canvas

**State Management:**

- No global store. All state is local React `useState`/`useRef` within hooks and components.
- `useVideoStream` owns: `videoRef`, `hlsRef`, `streamStatus`
- `useFishDetection` owns: `sessionRef` (ONNX session), `status`, `error`
- `AquariumLanding` owns: `detectionOn` (boolean toggle)
- `DetectionCanvas` owns: `canvasRef`, `rafRef`, `lastRunRef`, `runningRef`, `detectionsRef` (all `useRef` — no re-renders during the inference loop)

## Key Abstractions

**Detection:**
- Purpose: Represents a single detected object with display-space coordinates
- Definition: `src/utils/yolo.ts` — `{ x, y, w, h, label, score }`
- Coordinates are already scaled to the video element's rendered display size

**StreamStatus:**
- Purpose: Tracks video acquisition state across async HLS negotiation
- Definition: `src/hooks/useVideoStream.ts` — `'loading' | 'live' | 'fallback'`

**DetectionStatus:**
- Purpose: Tracks ONNX session lifecycle
- Definition: `src/hooks/useFishDetection.ts` — `'idle' | 'loading' | 'ready' | 'error'`

**runDetection callback:**
- Purpose: The inference interface between the hook layer and the render loop — `useFishDetection` exposes it; `DetectionCanvas` calls it
- Signature: `(el: HTMLVideoElement | HTMLImageElement, displayW: number, displayH: number) => Promise<Detection[]>`

## Entry Points

**Browser Entry:**
- Location: `src/main.tsx`
- Triggers: loaded by `index.html` as `<script type="module">`
- Responsibilities: mounts React app into `#root`, wraps in `StrictMode`

**Root Component:**
- Location: `src/App.tsx`
- Responsibilities: renders `<AquariumLanding />` — currently a thin passthrough; intended as shell for future portfolio sections

**HTML Shell:**
- Location: `index.html`
- Responsibilities: sets page title "Yali Sommer", provides `#root` mount point, imports `src/main.tsx`

## Error Handling

**Strategy:** Graceful degradation at each layer. No error boundaries are defined; errors surface as status strings or console warnings.

**Patterns:**
- Video stream: any fetch failure or HLS fatal error sets `streamStatus = 'fallback'`, silently switching to local `aquarium.mp4`
- ONNX load: failure sets `status = 'error'`; detection toggle remains disabled (button is non-interactive when `status !== 'ready'`)
- Inference loop: errors in `runDetection` are caught with `console.warn` and the loop continues
- HLS proxy upstream errors return HTTP 502; `hls.js` treats these as fatal and triggers fallback

## Cross-Cutting Concerns

**Logging:** `console.warn` for non-fatal issues (HLS proxy failures, WASM load failure, inference errors). `console.log` for HLS stream URL refresh confirmation.

**Validation:** None formalized. Confidence threshold (0.20) and IoU threshold (0.45) in `useFishDetection.ts` serve as output quality filters.

**Authentication:** None.

**Security Headers:** COOP (`same-origin`) and COEP (`require-corp`) are required for `SharedArrayBuffer` used by ONNX Runtime WASM multi-threading. Set in `vite.config.ts` for the dev server. Production deployment must also set these headers.

**WASM Asset Handling:** `vite-plugin-static-copy` copies `onnxruntime-web` WASM and `.mjs` files from `node_modules` to `public/` at build time. The `serveOrtMjsRaw` Vite plugin intercepts `.mjs` file requests in dev to bypass Vite transformation and set correct CORS headers. `optimizeDeps.exclude: ['onnxruntime-web']` prevents Vite from pre-bundling the ORT package.

---

*Architecture analysis: 2026-04-14*
