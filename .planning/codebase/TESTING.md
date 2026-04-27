# Testing Patterns

**Analysis Date:** 2026-04-14

## Test Framework

**Runner:** None — no test framework is installed or configured.

**Assertion Library:** None.

**Test config files:** None present (`jest.config.*`, `vitest.config.*`, `playwright.config.*` are all absent).

**Run Commands:** None defined in `package.json`. The only scripts are:
```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint (no config file found — likely default Vite scaffold)
npm run preview    # Preview production build
```

## Test File Organization

**Test files found:** None. No `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx` files exist anywhere in the project.

## Types of Tests Present

- **Unit tests:** None
- **Integration tests:** None
- **E2E tests:** None
- **Snapshot tests:** None
- **Visual regression tests:** None

## Coverage

**Requirements:** None enforced — no coverage configuration or thresholds defined.

**Coverage command:** Not available (no test runner installed).

## Testing Gaps

The entire codebase has zero test coverage. Key areas that carry the most risk with no testing:

**`src/utils/yolo.ts` — High priority**
- Contains pure functions (`preprocessFrame`, `postprocess`, `iou`, `nms`) with well-defined inputs and outputs
- Logic is algorithmic and numerically sensitive (bounding box scaling, IoU computation, NMS suppression)
- These are the highest-value unit test targets in the codebase — no DOM or async dependencies
- Risk: silent regressions in detection accuracy if thresholds, scaling math, or NMS logic are changed

**`src/hooks/useFishDetection.ts` — Medium priority**
- Manages ONNX session lifecycle (load, run, error, cancelled-flag cleanup)
- `runDetection` function constructs tensors and calls `postprocess` — testable with a mocked `ort.InferenceSession`
- Risk: model loading errors or output format changes would go undetected

**`src/hooks/useVideoStream.ts` — Medium priority**
- Handles three code paths: HLS via hls.js, native HLS (Safari), and mp4 fallback
- The `cancelled` cleanup guard is critical to prevent state updates on unmounted components
- Risk: stream fallback logic or HLS error handling could silently break across browser targets

**`src/components/DetectionCanvas.tsx` — Lower priority**
- Primarily canvas drawing and RAF loop orchestration
- The `handleClick` hit-test logic (`x >= d.x && x <= d.x + d.w`) is a candidate for unit testing
- Risk: clicking behavior is currently untested

**`vite.config.ts` proxy logic — Lower priority**
- The YouTube HLS proxy, URL rewriting, and mp4 Range forwarding are complex server-side logic
- No integration tests validate that the proxy correctly rewrites manifest URLs or forwards headers
- Risk: edge cases in the `m3u8` content-type detection or URL-rewrite regex could silently fail

## Recommended Setup (if tests are added)

**Framework:** Vitest is the natural fit for this Vite + TypeScript project.

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event
```

**Config addition to `vite.config.ts`:**
```typescript
// vitest.config.ts (separate file recommended)
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

**Suggested test file locations:**
- Utilities: `src/utils/yolo.test.ts` (co-located with `yolo.ts`)
- Hooks: `src/hooks/useFishDetection.test.ts`, `src/hooks/useVideoStream.test.ts`
- Components: `src/components/DetectionCanvas.test.tsx`

**Highest-ROI first test to write:**
```typescript
// src/utils/yolo.test.ts
import { describe, it, expect } from 'vitest'
import { postprocess } from './yolo'

describe('postprocess', () => {
  it('returns empty array when all scores are below threshold', () => {
    // Build synthetic output tensor with all zeros
    const dims = [1, 5, 8400]  // 1 class
    const output = new Float32Array(dims[1] * dims[2])
    expect(postprocess(output, dims, 0.5, 0.45, 640, 480)).toEqual([])
  })
})
```

---

*Testing analysis: 2026-04-14*
