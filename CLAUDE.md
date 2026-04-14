<!-- GSD:project-start source:PROJECT.md -->
## Project

**Portfolio v6 — Yali Sommer**

Personal developer portfolio for Yali Sommer, a Brown University junior (Math & CS, 2023–27) targeting both SWE/ML engineering and computer vision/research roles. v6 replaces portfolio-v5 with a continuous-scroll, dark-theme redesign built on top of an existing aquarium landing page featuring real-time in-browser YOLOv8 fish detection. The visual identity is clean black-and-white with subtle CV/graphics-inspired motifs that echo the technical work without cluttering the content.

**Core Value:** A single scrollable page that opens with the aquarium demo (showing technical depth immediately) and flows seamlessly into all portfolio sections — making it both visually memorable and functionally complete.

### Constraints

- **Tech stack**: React + TypeScript + Vite — no framework swap; aquarium code must remain functional
- **WASM headers**: COOP/COEP must stay in place for ORT threading; hosting platform must set these headers in production
- **Performance**: Aquarium inference loop (~10 FPS) must not be degraded by scroll/layout changes
- **No mobile**: Desktop-only for v6; responsive layout is out of scope
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript ~5.7.2 (resolved: 5.7.3) - All frontend source code in `src/`
- TSX - React component files
- Python 3 - ML model training script only (`train_fish_detector.py`)
## Runtime
- Node.js v22.19.0 (no `.nvmrc` or `.node-version` pin — uses system install)
- npm 10.9.3
- Lockfile: `package-lock.json` present (lockfileVersion 3)
## Frameworks
- React 19.2.5 (`react`, `react-dom`) - UI rendering, hooks-based component model
- No router — single-page, single view (`AquariumLanding`)
- Vite 6.4.2 - dev server and production bundler
- `@vitejs/plugin-react` 4.7.0 - Babel-based React Fast Refresh
- `tsc -b && vite build` — TypeScript compile check then Vite bundle
- `vite-plugin-static-copy` 2.3.2 - copies ONNX Runtime WASM/mjs assets from `node_modules/` into the build output
## Key Dependencies
- `onnxruntime-web` 1.24.3 — runs the YOLOv8 fish-detection model in-browser via WebAssembly; WASM artifacts served from `public/` and copied at build time
- `hls.js` 1.6.16 — HLS live-stream playback (YouTube streams proxied through the Vite dev-server plugin)
- `guid-typescript` 1.0.9 - transitive dep (pulled in by onnxruntime-web)
## TypeScript Configuration
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- Target: `ES2020`, module: `ESNext`, moduleResolution: `bundler`
- JSX: `react-jsx`
- Covers `vite.config.ts` only
- Target: `ES2022`, lib: `ES2023`
## Configuration
- No `.env` files detected — no runtime environment variables consumed by the frontend
- The Vite dev-server plugin hardcodes the YouTube stream URL (`YOUTUBE_URL` constant in `vite.config.ts`)
- `vite.config.ts` — single config file; contains three custom Vite plugins:
- COOP/COEP headers required for `SharedArrayBuffer` (used by ORT threaded WASM backend)
## Dev Tooling
- `tsc` via `typescript` 5.7.3 — strict mode, no emit (bundler handles output)
- `eslint` referenced in `package.json` `lint` script but no config file (`eslint.config.*` / `.eslintrc.*`) detected in the repo root — lint script may fail without config
- No Prettier or Biome config detected
## Platform Requirements
- Node.js 22+
- `yt-dlp` CLI installed system-wide (required for the YouTube HLS proxy to serve live video; falls back to local `/aquarium.mp4` if unavailable)
- Static site — output of `vite build` is a directory of static assets
- No server-side runtime required; the YouTube proxy is dev-only (implemented as a Vite plugin)
- Requires COOP/COEP headers set by the hosting platform for ORT threaded WASM to function
## ML Training Stack (offline, not part of the web app)
- Python 3 — `train_fish_detector.py`
- `ultralytics` (YOLOv8) — training and ONNX export
- `Pillow` (PIL) — image preprocessing
- `datasets` (HuggingFace) — dataset download
- Training output: `public/fish-detector.onnx` (model served as a static asset)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- React components: PascalCase `.tsx` — `AquariumLanding.tsx`, `AquariumVideo.tsx`, `DetectionCanvas.tsx`
- React hooks: camelCase with `use` prefix `.ts` — `useFishDetection.ts`, `useVideoStream.ts`
- Utility modules: camelCase `.ts` — `yolo.ts`
- Entry point: camelCase — `main.tsx`, `App.tsx`
- CSS: matches component name — `App.css`
- All components are named exports via `export default function ComponentName()`
- Custom hooks are named exports via `export function useHookName()`
- Pure utility functions are named exports — `preprocessFrame`, `postprocess`, `iou`, `nms`
- Private/internal helpers are module-scoped (not exported) — `draw()`, `roundRect()`, `iou()`, `nms()`, `getHlsUrl()`
- Async internal functions use simple verbs: `load()`, `init()`, `loop()`
- camelCase throughout — `sessionRef`, `hlsRef`, `videoRef`, `streamStatus`, `detectionOn`
- Constants use UPPER_SNAKE_CASE — `MIN_INTERVAL_MS`, `HLS_CACHE_TTL`, `YOUTUBE_URL`, `AQUARIUM_CLASSES`, `INPUT_SIZE`
- Boolean flags use descriptive names — `cancelled`, `runningRef`, `canDetect`, `isActive`
- Exported type aliases use PascalCase — `DetectionStatus`, `StreamStatus`
- Interfaces use PascalCase — `Detection`, `Props`, `RawBox`
- Inline prop interfaces are named `Props` within their file scope
## TypeScript Usage
- `"strict": true` — enables all strict checks
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`
- `"noFallthroughCasesInSwitch": true`
- `"noUncheckedSideEffectImports": true`
- Target: `ES2020`, module: `ESNext`
- `interface` for object shapes and component props — `interface Props { ... }`, `interface Detection { ... }`, `interface RawBox { ... }`
- `type` alias for union types — `export type DetectionStatus = 'idle' | 'loading' | 'ready' | 'error'`
- `type` alias for imported type re-exports — `export type StreamStatus = 'loading' | 'live' | 'fallback'`
- Props are typed inline with `interface Props` in the same file, destructured in the function signature
- `React.CSSProperties` used for typed style objects — `const fullscreenStyle: React.CSSProperties = { ... }`
- `Record<string, string>` used for lookup maps — `const statusColor: Record<string, string> = { ... }`
- Explicit return types omitted on components (inferred), but specified on complex async functions — `): Promise<Detection[]>`
- Non-null assertion (`!`) used sparingly and only where guaranteed — `document.getElementById('root')!`, `canvas.getContext('2d')!`
- Type casts with `as` used for DOM APIs and external lib types — `output.data as Float32Array`, `upstream.body as any`
- `e instanceof Error` guard pattern for unknown error narrowing
## Component Patterns
- `useRef` used for mutable values that should not trigger re-renders (DOM elements, inference session, RAF ID, frame timing flags)
- `useState` used only for values that drive UI updates — `status`, `streamStatus`, `detectionOn`, `error`
- `useEffect` with proper cleanup — all effects return a cleanup function; async operations guarded by `cancelled` boolean flag
- Refs passed as `RefObject<T>` — `RefObject<HTMLVideoElement | null>`
- Callbacks typed explicitly in the interface — `runDetection: (el: HTMLVideoElement | HTMLImageElement, w: number, h: number) => Promise<Detection[]>`
- No prop spreading; all props named explicitly
- Small, purely presentational components defined as module-scoped functions in the same file — `ScrollHint` in `AquariumLanding.tsx`
- CSS `@keyframes` injected via inline `<style>` tags inside component JSX when scoped to that component
## Import/Export Patterns
- Components use `export default function` — all three component files follow this pattern
- Hooks use named `export function` — `export function useFishDetection()`
- Types use named `export type` — `export type DetectionStatus`, `export type StreamStatus`
- Utilities use named `export function` and `export interface`
- No barrel files (`index.ts`) — all imports use direct paths
- Relative paths only — `'../hooks/useVideoStream'`, `'./AquariumVideo'`, `'../utils/yolo'`
- No path aliases configured
## Code Style
- 2-space indentation
- Single quotes for string literals
- No trailing semicolons in some places; semicolons present in other places (inconsistent — no Prettier config enforced)
- Arrow functions for callbacks; `function` declarations for named helper functions
- Template literals used for dynamic strings — `` `hsl(${det.score * 120}, 80%, 55%)` ``
- All component styling done via inline `style` objects (no CSS modules, no Tailwind, no styled-components)
- Only global/reset CSS in `App.css`
- Style constants extracted to module-level variables when reused — `const fullscreenStyle: React.CSSProperties = { ... }`
- Section dividers use `// ──` decorators in `vite.config.ts` to visually separate logical blocks
- Inline comments explain non-obvious intent — WASM backend choices, YouTube URL expiry, COEP constraints
- JSDoc not used; comments are prose-style single-liners
- Extracted to named constants at module scope — `MIN_INTERVAL_MS = 100`, `INPUT_SIZE = 416`, `HLS_CACHE_TTL`
- Threshold values kept as default parameters on utility functions
- Async effects use `try/catch` with fallback state transitions
- Errors surfaced via `console.warn()` with `[ModuleName]` prefixed tags — `[HLS proxy]`, `[FishDetection]`, `[DetectionCanvas]`
- Empty `catch` blocks used when errors are expected/irrelevant — `catch {}` in `useVideoStream.ts`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- One full-screen view: an aquarium video background with a real-time ML inference overlay
- All ML inference runs entirely in the browser via WASM (ONNX Runtime Web)
- A Vite dev-server plugin acts as a Node.js proxy for YouTube HLS streams and ONNX Runtime `.mjs` asset serving — this proxy layer exists only during development
## Layers
- Purpose: Render the full-screen UI — video background, detection overlay canvas, portfolio hero text, and detection toggle button
- Location: `src/components/`
- Contains: `AquariumLanding.tsx` (root layout), `AquariumVideo.tsx` (video element), `DetectionCanvas.tsx` (canvas overlay + draw logic)
- Depends on: hooks layer for state and callbacks
- Used by: `src/App.tsx`
- Purpose: Encapsulate side-effectful logic — video stream lifecycle and ONNX model lifecycle — exposing clean reactive state to components
- Location: `src/hooks/`
- Contains: `useVideoStream.ts` (stream acquisition, HLS negotiation, fallback), `useFishDetection.ts` (ONNX session load, inference dispatch)
- Depends on: `src/utils/yolo.ts`, `onnxruntime-web`, `hls.js`
- Used by: `src/components/AquariumLanding.tsx`
- Purpose: Pure functions for YOLOv8 tensor preprocessing and post-processing (NMS)
- Location: `src/utils/`
- Contains: `yolo.ts` — `preprocessFrame()`, `postprocess()`, `nms()`, `iou()`, `Detection` interface
- Depends on: nothing (DOM canvas API only)
- Used by: `src/hooks/useFishDetection.ts` and the `runDetection` callback passed to `DetectionCanvas`
- Purpose: Two Vite plugins embedded in `vite.config.ts` that run in the Node.js dev server process
- Location: `vite.config.ts`
- Contains:
- Depends on: `yt-dlp` CLI (external, must be installed), `vite-plugin-static-copy` (copies WASM files to `public/`)
- Used by: only the Vite dev server; not included in production build
## Data Flow
- No global store. All state is local React `useState`/`useRef` within hooks and components.
- `useVideoStream` owns: `videoRef`, `hlsRef`, `streamStatus`
- `useFishDetection` owns: `sessionRef` (ONNX session), `status`, `error`
- `AquariumLanding` owns: `detectionOn` (boolean toggle)
- `DetectionCanvas` owns: `canvasRef`, `rafRef`, `lastRunRef`, `runningRef`, `detectionsRef` (all `useRef` — no re-renders during the inference loop)
## Key Abstractions
- Purpose: Represents a single detected object with display-space coordinates
- Definition: `src/utils/yolo.ts` — `{ x, y, w, h, label, score }`
- Coordinates are already scaled to the video element's rendered display size
- Purpose: Tracks video acquisition state across async HLS negotiation
- Definition: `src/hooks/useVideoStream.ts` — `'loading' | 'live' | 'fallback'`
- Purpose: Tracks ONNX session lifecycle
- Definition: `src/hooks/useFishDetection.ts` — `'idle' | 'loading' | 'ready' | 'error'`
- Purpose: The inference interface between the hook layer and the render loop — `useFishDetection` exposes it; `DetectionCanvas` calls it
- Signature: `(el: HTMLVideoElement | HTMLImageElement, displayW: number, displayH: number) => Promise<Detection[]>`
## Entry Points
- Location: `src/main.tsx`
- Triggers: loaded by `index.html` as `<script type="module">`
- Responsibilities: mounts React app into `#root`, wraps in `StrictMode`
- Location: `src/App.tsx`
- Responsibilities: renders `<AquariumLanding />` — currently a thin passthrough; intended as shell for future portfolio sections
- Location: `index.html`
- Responsibilities: sets page title "Yali Sommer", provides `#root` mount point, imports `src/main.tsx`
## Error Handling
- Video stream: any fetch failure or HLS fatal error sets `streamStatus = 'fallback'`, silently switching to local `aquarium.mp4`
- ONNX load: failure sets `status = 'error'`; detection toggle remains disabled (button is non-interactive when `status !== 'ready'`)
- Inference loop: errors in `runDetection` are caught with `console.warn` and the loop continues
- HLS proxy upstream errors return HTTP 502; `hls.js` treats these as fatal and triggers fallback
## Cross-Cutting Concerns
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
