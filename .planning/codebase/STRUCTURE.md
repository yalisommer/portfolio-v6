# Codebase Structure

**Analysis Date:** 2026-04-14

## Directory Layout

```
portfolio-v6/
├── src/                    # All application source code
│   ├── components/         # React components (UI + canvas rendering)
│   ├── hooks/              # Custom hooks (video stream, ONNX inference)
│   ├── utils/              # Pure utility functions (YOLO pre/post-processing)
│   ├── App.tsx             # Root component — renders AquariumLanding
│   ├── App.css             # Global CSS reset + body/html base styles
│   ├── main.tsx            # React DOM entry point
│   └── vite-env.d.ts       # Vite client type declarations
├── public/                 # Static assets served as-is (not bundled)
│   ├── fish-detector.onnx  # Trained YOLOv8n ONNX model (12 MB)
│   ├── aquarium.mp4        # Fallback aquarium video (must be sourced by user)
│   ├── ort-wasm-simd-threaded.wasm           # ONNX Runtime WASM binary
│   ├── ort-wasm-simd-threaded.mjs            # ONNX Runtime WASM loader
│   ├── ort-wasm-simd-threaded.jsep.wasm      # ONNX Runtime WebGPU binary
│   ├── ort-wasm-simd-threaded.jsep.mjs       # ONNX Runtime WebGPU loader
│   ├── ort-wasm-simd-threaded.jspi.wasm      # ONNX Runtime JSPI binary
│   └── ort-wasm-simd-threaded.asyncify.wasm  # ONNX Runtime asyncify binary
├── aquarium_yolo/          # Training dataset (not used at runtime)
│   ├── images/
│   │   ├── train/          # Training images
│   │   └── val/            # Validation images
│   └── labels/
│       ├── train/          # YOLO-format label files for training
│       └── val/            # YOLO-format label files for validation
├── weights/                # Model checkpoint artifacts (not used at runtime)
│   ├── yolov8n_fish_trained.onnx   # Exported ONNX (used as source for public/)
│   └── yolov8n_fish_trained.pt     # PyTorch checkpoint
├── runs/                   # Ultralytics training run outputs
│   └── detect/runs/fish/aquarium/weights/
│       ├── best.onnx       # Best checkpoint exported to ONNX
│       ├── best.pt         # Best checkpoint (PyTorch)
│       └── last.pt         # Last checkpoint (PyTorch)
├── .planning/              # GSD planning documents
│   └── codebase/           # Codebase analysis docs (this directory)
├── index.html              # SPA HTML shell
├── vite.config.ts          # Vite config + dev-server plugins (HLS proxy, ORT mjs serving)
├── package.json            # Dependencies and npm scripts
├── package-lock.json       # Dependency lockfile
├── tsconfig.json           # Root TypeScript config (references app + node configs)
├── tsconfig.app.json       # App TypeScript config (strict, ES2020, react-jsx)
├── tsconfig.node.json      # Node TypeScript config (for vite.config.ts)
├── train_fish_detector.py  # Python training script (Ultralytics YOLOv8, offline)
├── yolov8n.pt              # Base YOLOv8n weights used for fine-tuning
└── PLAN.md                 # Original design plan document
```

## Directory Purposes

**`src/components/`:**
- Purpose: All React UI components
- Contains: `AquariumLanding.tsx` (full-screen layout coordinator), `AquariumVideo.tsx` (video element), `DetectionCanvas.tsx` (canvas overlay with rAF inference loop and draw logic)
- Key files: `AquariumLanding.tsx` — the only component that holds user-facing state and wires all hooks to sub-components

**`src/hooks/`:**
- Purpose: Encapsulate side-effectful logic with clean reactive interfaces
- Contains: `useVideoStream.ts` (YouTube HLS + fallback video lifecycle), `useFishDetection.ts` (ONNX session load + `runDetection` callback)
- Key files: `useFishDetection.ts` — owns the ONNX `InferenceSession` ref

**`src/utils/`:**
- Purpose: Framework-agnostic pure functions; no React imports
- Contains: `yolo.ts` — `preprocessFrame()`, `postprocess()`, `nms()`, `iou()`, and the `Detection` interface
- Key files: `yolo.ts` — the only utility file; all YOLO math lives here

**`public/`:**
- Purpose: Assets served verbatim at runtime — not transformed by Vite
- Contains: ONNX model, fallback video, ORT WASM binaries and loaders
- Note: The four `ort-wasm-simd-threaded.*` files are auto-copied from `node_modules/onnxruntime-web/dist/` by `vite-plugin-static-copy` during dev startup and build

**`aquarium_yolo/`:**
- Purpose: Roboflow Aquarium dataset used to fine-tune the fish detector (offline, not referenced by the web app)
- Generated: No (manually downloaded)
- Committed: Partially (labels and small images may be included)

**`weights/` and `runs/`:**
- Purpose: Model training artifacts — intermediate and final ONNX/PT checkpoints
- Generated: Yes (by `train_fish_detector.py` and Ultralytics export)
- Used at runtime: No — `public/fish-detector.onnx` is the deployed copy

## Key File Locations

**Entry Points:**
- `index.html`: HTML shell — sets title, provides `#root`, imports `src/main.tsx`
- `src/main.tsx`: React DOM `createRoot` + `StrictMode` mount
- `src/App.tsx`: Root component — passthrough to `AquariumLanding`

**Configuration:**
- `vite.config.ts`: Build config + two dev-only Vite plugins (HLS proxy, ORT mjs serving) + COOP/COEP headers
- `tsconfig.app.json`: Strict TypeScript config for all `src/` code
- `package.json`: Dependencies — `react@19`, `onnxruntime-web@1.20`, `hls.js@1.6`

**Core Logic:**
- `src/components/AquariumLanding.tsx`: Layout root, state orchestration, detection toggle UI
- `src/components/DetectionCanvas.tsx`: rAF loop, throttle logic, canvas draw functions
- `src/hooks/useVideoStream.ts`: HLS negotiation, `hls.js` attachment, fallback logic
- `src/hooks/useFishDetection.ts`: ONNX session management, inference pipeline
- `src/utils/yolo.ts`: Tensor preprocessing, YOLOv8 output decoding, NMS

**Model and Assets:**
- `public/fish-detector.onnx`: YOLOv8n fine-tuned on Roboflow Aquarium dataset, 7 classes (fish/jellyfish/penguin/puffin/shark/starfish/stingray), exported at `imgsz=416`
- `public/aquarium.mp4`: Local fallback video (user must provide — not in repo)

**Training:**
- `train_fish_detector.py`: Python script using Ultralytics `YOLO` API to fine-tune YOLOv8n on `aquarium_yolo/` dataset, exports ONNX to `runs/`

## Naming Conventions

**Files:**
- Components: PascalCase matching the component name — `AquariumLanding.tsx`, `DetectionCanvas.tsx`
- Hooks: camelCase prefixed with `use` — `useFishDetection.ts`, `useVideoStream.ts`
- Utilities: camelCase by domain — `yolo.ts`

**Directories:**
- Lowercase plural by type — `components/`, `hooks/`, `utils/`

## Where to Add New Code

**New React component:**
- Implementation: `src/components/MyComponent.tsx`

**New custom hook:**
- Implementation: `src/hooks/useMyHook.ts`

**New utility/pure function:**
- Implementation: `src/utils/myUtil.ts` (or add to `yolo.ts` if YOLO-specific)

**New static asset needed at runtime:**
- Place in `public/` — accessible at `/<filename>` in the browser
- Large binaries (models, videos) go here, not in `src/`

**New portfolio page/section:**
- Add component in `src/components/`, wire routing or scroll logic in `src/App.tsx`
- `App.tsx` is intentionally minimal — it is the intended extension point for the full portfolio

## Special Directories

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by GSD map-codebase)
- Committed: Yes

**`node_modules/`:**
- Generated: Yes (npm install)
- Committed: No

**`runs/`:**
- Purpose: Ultralytics training output (model weights, metrics)
- Generated: Yes (by `train_fish_detector.py`)
- Committed: Partially (weights only, not full run logs)

**`public/` (WASM files):**
- The `ort-wasm-*` files are copied by `vite-plugin-static-copy` from `node_modules/onnxruntime-web/dist/` at dev/build time. They are checked in to `public/` for convenience but could be regenerated by running `npm install` and a Vite build.

---

*Structure analysis: 2026-04-14*
