# External Integrations

**Analysis Date:** 2026-04-14

## APIs & External Services

**YouTube (via yt-dlp CLI):**
- Purpose: Fetches live aquarium/fish-tank video streams for the portfolio landing page background
- Integration point: `vite.config.ts` — `youtubeHlsProxy` Vite plugin
- Mechanism: Calls `yt-dlp` via `child_process.execSync` to extract direct stream URLs; streams are proxied through a local `/proxy/hls` endpoint
- Stream URL: Hardcoded constant `YOUTUBE_URL` in `vite.config.ts`
- Cache TTL: 5 hours (YouTube URLs expire in ~6 hours)
- Dev-only: This proxy runs only in the Vite dev server; there is no equivalent production proxy
- Fallback: If `yt-dlp` fails, the frontend falls back to `/aquarium.mp4` (local static asset in `public/`)

**HuggingFace Datasets (offline/training only):**
- Dataset: `EduardoPacheco/aquarium` — used by `train_fish_detector.py` to train the ONNX model
- SDK: `datasets` Python library
- Not present at runtime; only used during ML training

## Data Storage

**Databases:**
- None — no database of any kind

**File Storage:**
- Local filesystem only
  - `public/fish-detector.onnx` — YOLOv8n ONNX model served as static asset
  - `public/aquarium.mp4` — fallback video (served as static asset)
  - `public/ort-wasm-simd-threaded.*` — ONNX Runtime WASM binaries served from `public/`

**Caching:**
- In-memory only: `cachedHlsUrl` variable in `vite.config.ts` caches the resolved YouTube stream URL for 5 hours during the dev server session

## Authentication & Identity

**Auth Provider:** None — no authentication layer of any kind

## ONNX Runtime Web (in-browser ML inference)

- Package: `onnxruntime-web` 1.24.3
- Purpose: Loads and runs `fish-detector.onnx` in the browser for real-time fish detection
- Execution provider: `wasm` only (WebGPU disabled; see comment in `src/hooks/useFishDetection.ts`)
- WASM paths configured via `ort.env.wasm.wasmPaths = '/'` — files served from `public/`
- Cross-Origin isolation headers (COOP/COEP) required for `SharedArrayBuffer` used by threaded WASM backend

## HLS Video Streaming

- Package: `hls.js` 1.6.16
- Purpose: Plays HLS live streams proxied from YouTube in browsers that do not support native HLS
- Safari fallback: Uses native `video.canPlayType('application/vnd.apple.mpegurl')` for Safari's built-in HLS support
- Worker disabled: `enableWorker: false` set in `src/hooks/useVideoStream.ts` due to COEP `require-corp` policy breaking hls.js inline workers

## Monitoring & Observability

**Error Tracking:** None

**Analytics:** None

**Logs:** `console.warn` / `console.log` only — no structured logging or external log sink

## CI/CD & Deployment

**Hosting:** Not determined — no deployment config files detected (no `netlify.toml`, `vercel.json`, `Dockerfile`, `.github/workflows/`, etc.)

**CI Pipeline:** None detected

## Environment Configuration

**Required env vars:** None — no `.env` files and no `import.meta.env` references in source code

**Secrets location:** None — the only external dependency URL (`YOUTUBE_URL`) is a plain hardcoded public YouTube URL in `vite.config.ts`

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

## External URLs Referenced in Source

- YouTube stream URL: hardcoded in `vite.config.ts` (public video, no API key required)
- Google Search link: `window.open('https://www.google.com/search?q=Carassius+auratus', '_blank')` triggered on clicking a detected fish in `src/components/DetectionCanvas.tsx`

---

*Integration audit: 2026-04-14*
