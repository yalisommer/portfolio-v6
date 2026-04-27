# Technology Stack

**Analysis Date:** 2026-04-14

## Languages

**Primary:**
- TypeScript ~5.7.2 (resolved: 5.7.3) - All frontend source code in `src/`
- TSX - React component files

**Secondary:**
- Python 3 - ML model training script only (`train_fish_detector.py`)

## Runtime

**Environment:**
- Node.js v22.19.0 (no `.nvmrc` or `.node-version` pin — uses system install)

**Package Manager:**
- npm 10.9.3
- Lockfile: `package-lock.json` present (lockfileVersion 3)

## Frameworks

**Core:**
- React 19.2.5 (`react`, `react-dom`) - UI rendering, hooks-based component model
- No router — single-page, single view (`AquariumLanding`)

**Build/Dev:**
- Vite 6.4.2 - dev server and production bundler
- `@vitejs/plugin-react` 4.7.0 - Babel-based React Fast Refresh

**Build:**
- `tsc -b && vite build` — TypeScript compile check then Vite bundle
- `vite-plugin-static-copy` 2.3.2 - copies ONNX Runtime WASM/mjs assets from `node_modules/` into the build output

## Key Dependencies

**Critical:**
- `onnxruntime-web` 1.24.3 — runs the YOLOv8 fish-detection model in-browser via WebAssembly; WASM artifacts served from `public/` and copied at build time
- `hls.js` 1.6.16 — HLS live-stream playback (YouTube streams proxied through the Vite dev-server plugin)

**Infrastructure:**
- `guid-typescript` 1.0.9 - transitive dep (pulled in by onnxruntime-web)

## TypeScript Configuration

**Strictness (app, `tsconfig.app.json`):**
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- Target: `ES2020`, module: `ESNext`, moduleResolution: `bundler`
- JSX: `react-jsx`

**Node config (`tsconfig.node.json`):**
- Covers `vite.config.ts` only
- Target: `ES2022`, lib: `ES2023`

## Configuration

**Environment:**
- No `.env` files detected — no runtime environment variables consumed by the frontend
- The Vite dev-server plugin hardcodes the YouTube stream URL (`YOUTUBE_URL` constant in `vite.config.ts`)

**Build:**
- `vite.config.ts` — single config file; contains three custom Vite plugins:
  1. `serveOrtMjsRaw` — serves ORT `.mjs` WASM loader files with correct MIME type and COOP/COEP headers
  2. `youtubeHlsProxy` — dev-only proxy that calls `yt-dlp` CLI and proxies YouTube HLS/mp4 streams
  3. `viteStaticCopy` — copies WASM binaries at build time
- COOP/COEP headers required for `SharedArrayBuffer` (used by ORT threaded WASM backend)

## Dev Tooling

**Type Checking:**
- `tsc` via `typescript` 5.7.3 — strict mode, no emit (bundler handles output)

**Linting:**
- `eslint` referenced in `package.json` `lint` script but no config file (`eslint.config.*` / `.eslintrc.*`) detected in the repo root — lint script may fail without config

**Formatting:**
- No Prettier or Biome config detected

## Platform Requirements

**Development:**
- Node.js 22+
- `yt-dlp` CLI installed system-wide (required for the YouTube HLS proxy to serve live video; falls back to local `/aquarium.mp4` if unavailable)

**Production:**
- Static site — output of `vite build` is a directory of static assets
- No server-side runtime required; the YouTube proxy is dev-only (implemented as a Vite plugin)
- Requires COOP/COEP headers set by the hosting platform for ORT threaded WASM to function

## ML Training Stack (offline, not part of the web app)

- Python 3 — `train_fish_detector.py`
- `ultralytics` (YOLOv8) — training and ONNX export
- `Pillow` (PIL) — image preprocessing
- `datasets` (HuggingFace) — dataset download
- Training output: `public/fish-detector.onnx` (model served as a static asset)

---

*Stack analysis: 2026-04-14*
