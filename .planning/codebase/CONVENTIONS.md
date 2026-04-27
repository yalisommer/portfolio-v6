# Coding Conventions

**Analysis Date:** 2026-04-14

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` — `AquariumLanding.tsx`, `AquariumVideo.tsx`, `DetectionCanvas.tsx`
- React hooks: camelCase with `use` prefix `.ts` — `useFishDetection.ts`, `useVideoStream.ts`
- Utility modules: camelCase `.ts` — `yolo.ts`
- Entry point: camelCase — `main.tsx`, `App.tsx`
- CSS: matches component name — `App.css`

**Functions and Components:**
- All components are named exports via `export default function ComponentName()`
- Custom hooks are named exports via `export function useHookName()`
- Pure utility functions are named exports — `preprocessFrame`, `postprocess`, `iou`, `nms`
- Private/internal helpers are module-scoped (not exported) — `draw()`, `roundRect()`, `iou()`, `nms()`, `getHlsUrl()`
- Async internal functions use simple verbs: `load()`, `init()`, `loop()`

**Variables:**
- camelCase throughout — `sessionRef`, `hlsRef`, `videoRef`, `streamStatus`, `detectionOn`
- Constants use UPPER_SNAKE_CASE — `MIN_INTERVAL_MS`, `HLS_CACHE_TTL`, `YOUTUBE_URL`, `AQUARIUM_CLASSES`, `INPUT_SIZE`
- Boolean flags use descriptive names — `cancelled`, `runningRef`, `canDetect`, `isActive`

**Types:**
- Exported type aliases use PascalCase — `DetectionStatus`, `StreamStatus`
- Interfaces use PascalCase — `Detection`, `Props`, `RawBox`
- Inline prop interfaces are named `Props` within their file scope

## TypeScript Usage

**Compiler settings (strict mode):**
- `"strict": true` — enables all strict checks
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`
- `"noFallthroughCasesInSwitch": true`
- `"noUncheckedSideEffectImports": true`
- Target: `ES2020`, module: `ESNext`

**Type vs Interface:**
- `interface` for object shapes and component props — `interface Props { ... }`, `interface Detection { ... }`, `interface RawBox { ... }`
- `type` alias for union types — `export type DetectionStatus = 'idle' | 'loading' | 'ready' | 'error'`
- `type` alias for imported type re-exports — `export type StreamStatus = 'loading' | 'live' | 'fallback'`

**Type annotation patterns:**
- Props are typed inline with `interface Props` in the same file, destructured in the function signature
- `React.CSSProperties` used for typed style objects — `const fullscreenStyle: React.CSSProperties = { ... }`
- `Record<string, string>` used for lookup maps — `const statusColor: Record<string, string> = { ... }`
- Explicit return types omitted on components (inferred), but specified on complex async functions — `): Promise<Detection[]>`
- Non-null assertion (`!`) used sparingly and only where guaranteed — `document.getElementById('root')!`, `canvas.getContext('2d')!`
- Type casts with `as` used for DOM APIs and external lib types — `output.data as Float32Array`, `upstream.body as any`
- `e instanceof Error` guard pattern for unknown error narrowing

## Component Patterns

**All components are functional** — no class components anywhere.

**Hook usage:**
- `useRef` used for mutable values that should not trigger re-renders (DOM elements, inference session, RAF ID, frame timing flags)
- `useState` used only for values that drive UI updates — `status`, `streamStatus`, `detectionOn`, `error`
- `useEffect` with proper cleanup — all effects return a cleanup function; async operations guarded by `cancelled` boolean flag

**Effect cleanup pattern:**
```typescript
useEffect(() => {
  let cancelled = false
  async function load() {
    // ...
    if (cancelled) return
  }
  load()
  return () => { cancelled = true }
}, [])
```

**Props passing:**
- Refs passed as `RefObject<T>` — `RefObject<HTMLVideoElement | null>`
- Callbacks typed explicitly in the interface — `runDetection: (el: HTMLVideoElement | HTMLImageElement, w: number, h: number) => Promise<Detection[]>`
- No prop spreading; all props named explicitly

**Sub-components:**
- Small, purely presentational components defined as module-scoped functions in the same file — `ScrollHint` in `AquariumLanding.tsx`

**Animation:**
- CSS `@keyframes` injected via inline `<style>` tags inside component JSX when scoped to that component

## Import/Export Patterns

**Import order (observed):**
1. React and React-adjacent — `import { useState } from 'react'`
2. Third-party libraries — `import Hls from 'hls.js'`, `import * as ort from 'onnxruntime-web'`
3. Internal hooks — `import { useVideoStream } from '../hooks/useVideoStream'`
4. Internal components — `import AquariumVideo from './AquariumVideo'`
5. Internal utilities/types — `import { Detection } from '../utils/yolo'`

**Export style:**
- Components use `export default function` — all three component files follow this pattern
- Hooks use named `export function` — `export function useFishDetection()`
- Types use named `export type` — `export type DetectionStatus`, `export type StreamStatus`
- Utilities use named `export function` and `export interface`
- No barrel files (`index.ts`) — all imports use direct paths

**Path style:**
- Relative paths only — `'../hooks/useVideoStream'`, `'./AquariumVideo'`, `'../utils/yolo'`
- No path aliases configured

## Code Style

**Formatting (no config file detected — Vite default project):**
- 2-space indentation
- Single quotes for string literals
- No trailing semicolons in some places; semicolons present in other places (inconsistent — no Prettier config enforced)
- Arrow functions for callbacks; `function` declarations for named helper functions
- Template literals used for dynamic strings — `` `hsl(${det.score * 120}, 80%, 55%)` ``

**Inline styles:**
- All component styling done via inline `style` objects (no CSS modules, no Tailwind, no styled-components)
- Only global/reset CSS in `App.css`
- Style constants extracted to module-level variables when reused — `const fullscreenStyle: React.CSSProperties = { ... }`

**Comments:**
- Section dividers use `// ──` decorators in `vite.config.ts` to visually separate logical blocks
- Inline comments explain non-obvious intent — WASM backend choices, YouTube URL expiry, COEP constraints
- JSDoc not used; comments are prose-style single-liners

**Magic numbers:**
- Extracted to named constants at module scope — `MIN_INTERVAL_MS = 100`, `INPUT_SIZE = 416`, `HLS_CACHE_TTL`
- Threshold values kept as default parameters on utility functions

**Error handling:**
- Async effects use `try/catch` with fallback state transitions
- Errors surfaced via `console.warn()` with `[ModuleName]` prefixed tags — `[HLS proxy]`, `[FishDetection]`, `[DetectionCanvas]`
- Empty `catch` blocks used when errors are expected/irrelevant — `catch {}` in `useVideoStream.ts`

---

*Convention analysis: 2026-04-14*
