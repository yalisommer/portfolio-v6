# Plan: Aquarium Landing Page with Real-Time Fish Detection

## Context

The user is a graphics/vision-focused engineer who wants to demo a new portfolio concept: a full-screen aquarium video background with YOLO-based fish detection running live in the browser — bounding boxes, labels, and confidence scores overlaid on the fish as they swim. This is being built in `portfolio-v6` (currently empty). The goal is a working demo to validate the concept before building out the rest of the portfolio.

Key constraints from prior attempts:
- Generic YOLO (COCO-trained) is bad at detecting fish — need a fish-specific model
- Live aquarium streams are hard to access for canvas processing — most are YouTube iframes, which are cross-origin locked

---

## Approach

### Video Source Strategy
1. **Primary (demo)**: A bundled high-quality aquarium `.mp4` (royalty-free from Pexels — user sources this)
2. **Live stream attempt**: Try loading an MJPEG stream URL as an `<img>` tag — if it loads and is cross-origin accessible, use it for inference too. Fallback to local video silently.
3. YouTube/iframe live cams cannot be used for canvas frame extraction due to cross-origin restrictions — not worth attempting for inference

### Fish YOLO Model
Use `keremberke/yolov8m-fish-detection` from HuggingFace — a YOLOv8m model fine-tuned specifically on fish detection datasets. Export to ONNX via Ultralytics (`model.export(format="onnx")`), place in `public/fish-detector.onnx`. Alternatively, download a pre-exported ONNX directly from Roboflow Universe fish detection projects.

**YOLOv8 ONNX output format**: `[1, 84, 8400]` — 8400 anchor boxes × (4 bbox coords xywh + 80 class scores). Needs transpose + NMS post-processing.

### Inference Runtime
`onnxruntime-web` — most direct path for running YOLOv8 ONNX in browser. Uses WASM backend (fallback to WebGPU where available). Target 5–10 FPS (infer every 100–200ms) to avoid blocking the main thread.

### Architecture

```
portfolio-v6/
├── src/
│   ├── components/
│   │   ├── AquariumLanding.tsx     # Full-screen landing page layout
│   │   ├── AquariumVideo.tsx       # <video> element + stream fallback logic
│   │   └── DetectionCanvas.tsx     # Canvas overlay — draws bboxes + labels
│   ├── hooks/
│   │   ├── useFishDetection.ts     # ONNX model load + inference loop
│   │   └── useVideoStream.ts       # Manages video source (stream vs file)
│   ├── utils/
│   │   └── yolo.ts                 # Tensor preprocessing + NMS post-processing
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── public/
│   ├── fish-detector.onnx          # Fish-specific YOLO model (user must source)
│   └── aquarium.mp4                # High-quality aquarium video (user must source)
├── package.json
└── vite.config.ts
```

---

## Implementation Steps

### Step 1: Initialize project
```bash
cd portfolio-v6
npm create vite@latest . -- --template react-ts
npm install onnxruntime-web
```

Add to `vite.config.ts`: set `optimizeDeps.exclude: ['onnxruntime-web']` and configure COOP/COEP headers (required for SharedArrayBuffer used by WASM multi-threading):
```ts
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  }
}
```

### Step 2: Asset sourcing (user action required)
- **Video**: Download a 4K aquarium `.mp4` from [Pexels](https://www.pexels.com/search/videos/aquarium/) → save as `public/aquarium.mp4`
- **Model**: Export `keremberke/yolov8m-fish-detection` to ONNX:
  ```bash
  pip install ultralytics huggingface_hub
  python -c "from ultralytics import YOLO; m=YOLO('keremberke/yolov8m-fish-detection'); m.export(format='onnx')"
  ```
  → save as `public/fish-detector.onnx`

### Step 3: `utils/yolo.ts` — Preprocessing + NMS
- `preprocessFrame(canvas, inputSize=640)`: Draw video frame → resize to 640×640 → normalize [0,1] → return Float32Array tensor `[1,3,640,640]`
- `postprocess(output, confThresh=0.4, iouThresh=0.45, origW, origH)`: Transpose `[1,84,8400]` → `[8400,84]`, extract bbox + class scores, apply confidence filter, scale boxes back to original video dimensions, run NMS
- `nms(boxes, scores, iouThresh)`: Standard IoU-based non-maximum suppression

### Step 4: `hooks/useFishDetection.ts`
```ts
// Loads ONNX session from /fish-detector.onnx on mount
// Exposes runDetection(videoEl) → Detection[]
// Caller drives the inference loop with requestAnimationFrame + throttle
```
- Use `InferenceSession.create('/fish-detector.onnx', { executionProviders: ['webgpu', 'wasm'] })`
- `runDetection`: create hidden canvas, draw video frame, preprocess, `session.run()`, postprocess, return detections

### Step 5: `hooks/useVideoStream.ts`
- Attempts to load MJPEG stream URL as `<img>` — checks `onload` within 3s timeout
- If successful and CORS allows canvas draw: uses stream
- Otherwise: sets `src` on `<video>` element to `/aquarium.mp4` and plays looped
- Exposes `{ videoRef, streamStatus }` — 'loading' | 'stream' | 'fallback'

### Step 6: `components/AquariumVideo.tsx`
- Renders `<video autoPlay loop muted playsInline>` for the fallback
- If stream mode active, shows the stream `<img>` instead
- Both positioned `position: fixed; inset: 0; object-fit: cover; z-index: 0`

### Step 7: `components/DetectionCanvas.tsx`
- Renders a `<canvas>` positioned absolute over the video (same size, `z-index: 1`)
- Uses `useRef` for the canvas
- Runs inference loop via `requestAnimationFrame` + `Date.now()` throttle (100ms min between frames)
- On each detection result: clear canvas, draw bounding boxes with label + confidence
- Box style: thin colored stroke + semi-transparent fill, label in top-left of box
- Color by confidence: green (high) → yellow (medium) — no red (avoids alarming look)

### Step 8: `components/AquariumLanding.tsx`
- Full-screen layout with three z-index layers:
  - `z-0`: `<AquariumVideo />`
  - `z-1`: `<DetectionCanvas />`
  - `z-2`: Portfolio UI — name, title, brief tagline, scroll-down indicator
- Dark gradient overlay (bottom 30%) for text legibility
- Content: "YALI SOMMER" large, subtitle, minimal nav links

### Step 9: `App.tsx`
- Just renders `<AquariumLanding />` for now
- Scroll-down → placeholder for rest of portfolio (to be built later)

---

## Visual Design Notes
- Dark theme, minimal UI on top — the aquarium is the star
- Font: clean mono or sans — consistent with engineering aesthetic  
- Detection boxes: thin, glowing strokes (CSS glow via canvas shadow blur)
- Label chips: semi-transparent dark pill with white text + confidence %
- Keep text content minimal on landing — name, role, one line, scroll hint

---

## Verification
1. Run `npm run dev` — page loads, video autoplays full-screen
2. ONNX model loads in console (no errors), inference starts
3. Bounding boxes appear on fish in the video, update at ~5-10 FPS
4. Boxes scale correctly to the video element's rendered size
5. Stream attempt: test with a real MJPEG URL if available; confirm fallback works without it
6. Test on a mobile viewport — video covers screen, detection still runs
7. Check browser console for WASM/ONNX errors

---

## Open Questions / User Actions Required
- User needs to source `aquarium.mp4` (Pexels recommended)
- User needs to export or download the fish ONNX model — the Ultralytics CLI command above handles this
- Fish species class names: if the Roboflow/keremberke model has named classes (e.g. "clownfish", "tang"), those will show in labels; if it's a single "fish" class, labels show "Fish 94%"
