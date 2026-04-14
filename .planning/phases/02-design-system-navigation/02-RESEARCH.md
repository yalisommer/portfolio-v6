# Phase 2: Design System + Navigation - Research

**Researched:** 2026-04-14
**Domain:** CSS design tokens, self-hosted WOFF2 fonts, IntersectionObserver, sticky navigation, scroll-reveal
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Navigation style**
- D-01: Full-width sticky top bar across the viewport — not a floating pill, not a side rail.
- D-02: Background: `rgba(0, 0, 0, 0.75)` + `backdrop-filter: blur(12px)`. Bottom border: 1px `rgba(255, 255, 255, 0.12)`. Appears frosted over scrolling content.
- D-03: Links are uppercase, JetBrains Mono, letter-spaced. All 7 sections: ABOUT · EXPERIENCE · EDUCATION · SKILLS · PROJECTS · RESEARCH · CONTACT.
- D-04: Nav slides in (or fades in) when `heroVisible === false` (already available in App.tsx state from Phase 1). Nav disappears again when user scrolls back to the top.

**Active section indicator**
- D-05: Detection-box bracket motif applied to the active nav link. Corner brackets wrap the link text (`:before` / `:after` pseudo-elements forming the top-left and bottom-right bracket corners). Matches the YOLOv8 bounding-box aesthetic from the aquarium demo.
- D-06: Inactive links: `rgba(255, 255, 255, 0.45)`. Active link text: `#e0e0e0`. No underline.
- D-07: Active section tracked via IntersectionObserver on the 7 section roots (same IO pattern used in Phase 1 for hero gating). Whichever section has `isIntersecting === true` at the top of the viewport wins.

**CV/graphics motifs (CSS classes)**
- D-08: Implement two motifs as reusable CSS classes in a `motifs.css` file (imported globally):
  1. `.motif-corners` — Bounding-box corner brackets only (no full border). `::before` + `::after` with `border-color: rgba(255, 255, 255, 0.6)`. Size: 12px arms, 2px weight.
  2. `.motif-dots` — Feature-point dots at corners (~5px diameter, `rgba(255, 255, 255, 0.5)`). Applies as `::before` + `::after` on a wrapper element.
- D-09: Scan-line texture and grid overlay deferred — NOT a Phase 2 deliverable.
- D-10: Both motifs are purely additive (CSS pseudo-elements on the decorated element). They do not change layout, padding, or z-index of content.

**Scroll reveal animation**
- D-11: Fade + slide up: opacity `0 → 1`, `translateY(30px → 0)`. Duration: 0.6s. Easing: `ease-out`.
- D-12: Trigger: IntersectionObserver with `threshold: 0.1` on each section root. One-shot (observer disconnects after first trigger).
- D-13: Implemented as a `useScrollReveal` hook that returns a `ref` and a `revealed` boolean.
- D-14: No animation library — pure CSS transitions driven by React state.

**Design tokens**
- D-15: CSS custom properties defined in `src/styles/tokens.css`, imported in `main.tsx`.
- D-16: Core token set:
  - `--ds-bg: #000000`
  - `--ds-surface: #121212`
  - `--ds-border: rgba(255, 255, 255, 0.12)`
  - `--ds-text-primary: #e0e0e0`
  - `--ds-text-secondary: rgba(255, 255, 255, 0.55)`
  - `--ds-text-muted: rgba(255, 255, 255, 0.3)`
  - `--ds-accent: #ffffff`
- D-17: TypeScript constants in `src/styles/tokens.ts` mirror the CSS variables for use in inline style objects.

**Typography**
- D-18: Self-hosted fonts in `public/fonts/`. Declared via `@font-face` in `src/styles/fonts.css` (imported in `main.tsx`). No external CDN requests.
- D-19: Inter Variable (WOFF2) — body text. JetBrains Mono (WOFF2) — monospaced elements.
- D-20: Font sourcing: download WOFF2 files from Fontsource npm packages (`@fontsource-variable/inter`, `@fontsource/jetbrains-mono`) — extract WOFF2 subset files from `node_modules/` and commit to `public/fonts/`.

**Section wrapper component**
- D-21: `Section` component in `src/components/Section.tsx`. Props: `id` (string, required), `children` (ReactNode). Applies `useScrollReveal`, consistent vertical padding (`6rem 2rem`), max-width (`1200px auto`), and base token styles.
- D-22: App.tsx section stubs are replaced by `<Section id="about">` etc. wrapping placeholder `<h2>` text.

### Claude's Discretion
- Exact nav height (suggested: 48–56px)
- Nav slide-in animation duration and easing (suggested: 200ms ease-out opacity/transform)
- Whether `useScrollReveal` is a custom hook or a component wrapper — hook preferred for flexibility
- Font subset strategy (subset to Latin-only to reduce file size)
- Exact IO threshold for active section detection (0.5 or `rootMargin: '-50% 0px'` pattern may give better results than 0.1 for active tracking)

### Deferred Ideas (OUT OF SCOPE)
- Scan-line texture CSS class
- Grid overlay CSS class
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DS-01 | Design token file defines monochrome color scale (#121212 bg, #e0e0e0 primary text, grays hierarchy) | Tokens defined in D-16; CSS custom properties in `src/styles/tokens.css` + TS mirror in `src/styles/tokens.ts` |
| DS-02 | Self-hosted Inter (variable) and JetBrains Mono (WOFF2) fonts, no external CDN | Fontsource 5.2.8 verified available; WOFF2 files identified; `@font-face` pattern researched |
| DS-03 | CV/graphics-inspired motifs defined (bounding-box borders, feature-point dots) as reusable CSS classes | Two motifs in `motifs.css`; pseudo-element technique researched |
| DS-04 | Scroll-reveal animation pattern: sections fade/slide in via IntersectionObserver + CSS transitions (no animation library) | `useScrollReveal` hook pattern researched; one-shot IO disconnect confirmed; `prefers-reduced-motion` guard identified |
| DS-05 | Section wrapper component provides consistent vertical padding and max-width constraints | `Section.tsx` component spec in D-21; integrates `useScrollReveal` |
| NAV-01 | Sticky navigation bar appears after user scrolls past the aquarium hero | `heroVisible` state in App.tsx already available; nav show/hide pattern researched |
| NAV-02 | Nav links allow jumping to any section | `scrollIntoView({behavior:'smooth'})` or `scroll-behavior:smooth` + anchor `href="#id"` researched |
| NAV-03 | Active section is highlighted in the nav as user scrolls | `rootMargin: '-40% 0px -55% 0px'` IO technique researched for midpoint-crossing detection |
</phase_requirements>

---

## Summary

Phase 2 is a CSS/React architecture phase with no new npm runtime dependencies. All the hard problems (IntersectionObserver lifecycle, WASM threading headers, inference pause/resume) were solved in Phase 1. This phase layers a token system, self-hosted fonts, a sticky nav, and scroll-reveal animations on top of the established scaffold.

The highest-risk item is the `rootMargin` strategy for active section tracking — the standard `threshold: 0.1` used in Phase 1 fires too early/late for "which section am I reading?" semantics. The `rootMargin: '-40% 0px -55% 0px'` trick (shrinks the intersection root to a 5% horizontal band near viewport center) is the correct approach and is verified HIGH confidence.

Font sourcing via Fontsource npm packages is straightforward. Install `@fontsource-variable/inter` and `@fontsource/jetbrains-mono` as devDependencies, extract the Latin-only WOFF2 files (~47KB + ~51KB for Inter Variable normal+italic, ~21KB per JetBrains Mono weight), commit them to `public/fonts/`, write custom `@font-face` declarations in `src/styles/fonts.css`. Total font payload is under 140KB for the recommended subset.

The detection toggle button at `top: 1.25rem, right: 1.25rem` will be occluded by the nav when the nav is visible. Since the nav is only visible when `heroVisible === false` and the button is hidden when `heroVisible === false` (already implemented), there is no conflict — they are mutually exclusive. No layout changes needed.

**Primary recommendation:** Use the `rootMargin: '-40% 0px -55% 0px'` IO pattern for active section tracking; install Fontsource as devDependencies and copy WOFF2 files to `public/fonts/`; keep all styling as inline style objects (component) + CSS classes (motifs only).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@fontsource-variable/inter` | 5.2.8 (verified) | WOFF2 source for Inter Variable | Fontsource is the canonical self-hosted font distribution; variable subset pre-built |
| `@fontsource/jetbrains-mono` | 5.2.8 (verified) | WOFF2 source for JetBrains Mono | Same; weight-specific subsets available |

Both are devDependencies — they are only used during setup to extract WOFF2 files into `public/fonts/`. They are not imported at runtime.

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native `IntersectionObserver` | Browser API | Section visibility tracking for nav active state and scroll-reveal | Already established in Phase 1; no polyfill needed for desktop target |
| CSS Custom Properties | Browser API | Design token system | All modern desktop browsers; ES2020 target confirmed compatible |
| `scroll-behavior: smooth` | CSS property | Anchor link smooth scrolling | Set on `html` element in App.css; works with native `<a href="#id">` links |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Fontsource npm + extract | Google Fonts CDN | CDN violates DS-02; Fontsource is the correct approach |
| CSS custom properties (tokens.css) | CSS-in-JS / Tailwind | Project uses inline style objects + plain CSS; no CSS-in-JS; Tailwind not in stack |
| Native IO for active section | scroll event listener | IO is more performant (no main-thread firing); established pattern in this codebase |
| `rootMargin` trick for active tracking | `threshold: 0.5` | threshold fires at 50% visible area; rootMargin trick fires when element center crosses viewport center — far more accurate for long sections |

**Installation (devDependencies only — for WOFF2 extraction):**
```bash
npm install --save-dev @fontsource-variable/inter @fontsource/jetbrains-mono
```

After extracting WOFF2 files to `public/fonts/`, these packages are only needed if fonts need to be re-extracted. Commit the extracted WOFF2 files to the repo.

**Version verification (2026-04-14):**
```
@fontsource-variable/inter  → 5.2.8
@fontsource/jetbrains-mono  → 5.2.8
```

---

## Architecture Patterns

### Recommended Project Structure (new files/dirs this phase)
```
src/
├── styles/
│   ├── tokens.css         # CSS custom properties (--ds-*)
│   ├── tokens.ts          # TS mirror of token values
│   ├── fonts.css          # @font-face declarations
│   └── motifs.css         # .motif-corners, .motif-dots classes
├── components/
│   ├── Nav.tsx            # sticky nav bar component
│   └── Section.tsx        # section wrapper with scroll-reveal
├── hooks/
│   └── useScrollReveal.ts # IO-based reveal hook
└── main.tsx               # import tokens.css, fonts.css, motifs.css here

public/
└── fonts/
    ├── inter-latin-wght-normal.woff2      # ~47KB
    ├── inter-latin-wght-italic.woff2      # ~51KB
    ├── jetbrains-mono-latin-400-normal.woff2  # ~21KB
    └── jetbrains-mono-latin-700-normal.woff2  # ~21KB
```

### Pattern 1: CSS Custom Properties Token System
**What:** All design values declared as `--ds-*` custom properties on `:root` in `tokens.css`. TypeScript mirror in `tokens.ts` uses the same values as string literals for inline style objects.
**When to use:** Anywhere a design value is referenced in CSS classes or inline styles.

```css
/* src/styles/tokens.css */
:root {
  --ds-bg: #000000;
  --ds-surface: #121212;
  --ds-border: rgba(255, 255, 255, 0.12);
  --ds-text-primary: #e0e0e0;
  --ds-text-secondary: rgba(255, 255, 255, 0.55);
  --ds-text-muted: rgba(255, 255, 255, 0.3);
  --ds-accent: #ffffff;
}
```

```typescript
// src/styles/tokens.ts — mirror for inline style objects
export const DS = {
  bg: '#000000',
  surface: '#121212',
  border: 'rgba(255, 255, 255, 0.12)',
  textPrimary: '#e0e0e0',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textMuted: 'rgba(255, 255, 255, 0.3)',
  accent: '#ffffff',
} as const
```

### Pattern 2: Self-Hosted WOFF2 @font-face
**What:** Declare both typefaces in `fonts.css` pointing to `/fonts/` in `public/`. Use `font-display: swap` for load performance. Use `format('woff2-variations')` for the variable font.
**When to use:** Applied once in `main.tsx`; fonts are globally available.

```css
/* src/styles/fonts.css */

/* Inter Variable — normal weight range 100-900 */
@font-face {
  font-family: 'Inter Variable';
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url('/fonts/inter-latin-wght-normal.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
    U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
    U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* Inter Variable — italic weight range 100-900 */
@font-face {
  font-family: 'Inter Variable';
  font-style: italic;
  font-display: swap;
  font-weight: 100 900;
  src: url('/fonts/inter-latin-wght-italic.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
    U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
    U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* JetBrains Mono — 400 */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-display: swap;
  font-weight: 400;
  src: url('/fonts/jetbrains-mono-latin-400-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
    U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
    U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

/* JetBrains Mono — 700 */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-display: swap;
  font-weight: 700;
  src: url('/fonts/jetbrains-mono-latin-700-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
    U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
    U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
```

### Pattern 3: useScrollReveal Hook (one-shot IntersectionObserver)
**What:** Returns a `{ ref, revealed }` tuple. On first intersection, sets `revealed = true` and immediately disconnects the observer. Component applies CSS transition inline.
**When to use:** Every section wrapped by `Section.tsx`.

```typescript
// src/hooks/useScrollReveal.ts
import { useRef, useState, useEffect, RefObject } from 'react'

export function useScrollReveal(threshold = 0.1): {
  ref: RefObject<HTMLElement | null>
  revealed: boolean
} {
  const ref = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, revealed }
}
```

Usage in Section.tsx:
```typescript
// D-11: opacity 0→1, translateY(30px→0), 0.6s ease-out
const style: React.CSSProperties = {
  opacity: revealed ? 1 : 0,
  transform: revealed ? 'translateY(0)' : 'translateY(30px)',
  transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
}
```

### Pattern 4: Active Section Detection (rootMargin Trick)
**What:** A single IntersectionObserver with `rootMargin: '-40% 0px -55% 0px'` watches all 7 section elements. This shrinks the intersection root to a 5% horizontal band near the top third of the viewport. Whichever section intersects that band is considered "active".
**When to use:** Inside `Nav.tsx` or a `useActiveSection` hook consumed by Nav.

```typescript
// useActiveSection hook pattern
useEffect(() => {
  const sectionEls = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    },
    { rootMargin: '-40% 0px -55% 0px' }
  )
  sectionEls.forEach(el => observer.observe(el!))
  return () => observer.disconnect()
}, [])
```

**Why `-40% 0px -55% 0px`:** Top margin of -40% means the IO root starts 40% down from viewport top. Bottom margin of -55% means the IO root ends 55% up from viewport bottom. This creates a 5% trigger zone at approximately the viewport's top third — a natural "reading position". Any section scrolling through that band fires `isIntersecting = true`.

### Pattern 5: Sticky Nav Visibility with Transition
**What:** Nav renders unconditionally; CSS `opacity` and `transform` toggle based on `heroVisible` prop. Use `pointer-events: none` when hidden.
**When to use:** Inside `Nav.tsx`.

```typescript
// Nav renders always; visibility driven by heroVisible
const navStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  height: '52px',  // Claude's discretion: 48–56px range
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 2rem',
  background: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',  // Safari
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  opacity: heroVisible ? 0 : 1,
  transform: heroVisible ? 'translateY(-100%)' : 'translateY(0)',
  pointerEvents: heroVisible ? 'none' : 'auto',
  transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
}
```

### Pattern 6: Detection-Box Bracket Motif (CSS ::before / ::after)
**What:** `.motif-corners` uses `::before` for top-left corner and `::after` for bottom-right corner. Each pseudo-element draws two sides of a corner using `border-top`+`border-left` or `border-bottom`+`border-right`. The element must have `position: relative`.

```css
/* src/styles/motifs.css */

/* Bounding-box corner brackets — YOLOv8 aesthetic */
.motif-corners {
  position: relative;
}
.motif-corners::before,
.motif-corners::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border-color: rgba(255, 255, 255, 0.6);
  border-style: solid;
}
.motif-corners::before {
  top: 0;
  left: 0;
  border-width: 2px 0 0 2px;  /* top-left corner */
}
.motif-corners::after {
  bottom: 0;
  right: 0;
  border-width: 0 2px 2px 0;  /* bottom-right corner */
}

/* Feature-point dots — keypoint marker aesthetic */
.motif-dots {
  position: relative;
}
.motif-dots::before,
.motif-dots::after {
  content: '';
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
}
.motif-dots::before {
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
}
.motif-dots::after {
  bottom: 0;
  right: 0;
  transform: translate(50%, 50%);
}
```

**Nav active link variant** — the active bracket in the nav applies the same pattern with a wrapper `span`:

```typescript
// In Nav.tsx — the active link gets a bracket span wrapper
<span className={isActive ? 'motif-corners' : ''} style={{ padding: '4px 6px', display: 'inline-block' }}>
  {label}
</span>
```

### Anti-Patterns to Avoid

- **`threshold: 0.1` for active section tracking:** This fires when 10% of a section enters the viewport — for a 100vh section, that's when just 10vh is visible. This makes the nav change active state far too early. Use `rootMargin` trick instead.
- **Conditional unmount for nav hide/show:** Don't `{heroVisible ? null : <Nav />}`. The nav should always be mounted so its IO observer setup doesn't re-run on every hero-boundary crossing. Use opacity/transform transitions.
- **Importing Fontsource CSS directly at runtime:** Do NOT `import '@fontsource-variable/inter'` in source files — this would add the npm package as a runtime dependency and import all Unicode ranges (including Cyrillic, Greek, Vietnamese). Extract WOFF2 files manually and write custom `@font-face`.
- **`font-display: block` or omitting font-display:** Without `font-display: swap`, the browser holds a blank invisible text period before showing the font. Use `swap` for instant fallback visibility.
- **Setting `position: relative` on the section stubs in App.tsx before Section.tsx is created:** The Section wrapper will set its own `position: relative`; the existing section stubs are replaced, not wrapped.
- **Multiple IntersectionObservers for scroll-reveal:** Create one IO per section via `useScrollReveal`, but do NOT create a single shared IO for all sections — the hook pattern creates one IO per hook call, which is correct and has minimal overhead (one IO per section root).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Font file hosting | Custom font subsetting pipeline (pyftsubset, glyphhanger) | Fontsource npm package + manual WOFF2 extraction | Fontsource already ships Latin-only subsets; ~47–51KB per Inter Variable file is acceptable |
| Smooth scroll on nav click | `window.scrollTo()` with requestAnimationFrame loop | `element.scrollIntoView({ behavior: 'smooth' })` or CSS `scroll-behavior: smooth` on `html` + native anchor hrefs | Native scroll API handles easing, cancellation, and accessibility |
| Active section detection via scroll events | `window.addEventListener('scroll', ...)` with `getBoundingClientRect()` in rAF | `IntersectionObserver` with `rootMargin` | IO fires off main thread; scroll listeners fire synchronously on every pixel; existing codebase uses IO exclusively |
| CSS-in-JS token access | Runtime CSS variable reading with `getComputedStyle` | Static constants in `tokens.ts` | `getComputedStyle` requires a DOM element reference; static TS constants are simpler for inline style objects |

**Key insight:** The IntersectionObserver API eliminates the need for any scroll-position arithmetic. The `rootMargin` technique compresses the entire "what section am I in?" problem into a 3-line observer config.

---

## Common Pitfalls

### Pitfall 1: Safari backdrop-filter without -webkit- prefix
**What goes wrong:** `backdrop-filter: blur(12px)` has no effect on Safari without the `-webkit-backdrop-filter` prefix. The nav glassmorphism effect disappears.
**Why it happens:** Safari required the vendor prefix until Safari 15.4 (2022) and still benefits from it for robustness.
**How to avoid:** Always set both `backdropFilter` and `WebkitBackdropFilter` in inline style objects.
**Warning signs:** Nav appears fully opaque black instead of frosted glass when tested in Safari.

### Pitfall 2: rootMargin percentages reference the scroll container, not the document
**What goes wrong:** If the scroll container is not `document.body` / `null` (the default root), rootMargin percentages reference the container's dimensions, not the viewport. In this project, the scroll container IS the body (App.tsx uses `<>` fragment, not a scroll container div), so `root: null` (default) is correct.
**Why it happens:** Confusion between `root: null` (viewport) and `root: someElement` (element-relative).
**How to avoid:** Use `root: null` (or omit the option) in all IO constructors. This is already the pattern from Phase 1.
**Warning signs:** Active section jumps erratically, or all sections show as active simultaneously.

### Pitfall 3: Detection toggle button z-index conflicts with sticky nav
**What goes wrong:** The detection toggle at `top: 1.25rem, right: 1.25rem, zIndex: 3` (in AquariumLanding.tsx) would be occluded by the nav at `zIndex: 100`.
**Why it happens:** The nav has higher z-index than the existing button.
**How to avoid:** This is NOT actually a problem — the detection toggle is only visible when `heroVisible === true` (it transitions to `opacity: 0` otherwise), and the nav is only visible when `heroVisible === false`. They are mutually exclusive and never overlap. No code change needed.
**Warning signs:** If someone tries to show both simultaneously (wrong state logic), the button would be hidden behind the nav.

### Pitfall 4: WOFF2 files served with wrong Content-Type in Vite dev server
**What goes wrong:** Fonts load in production but not in dev, or vice versa.
**Why it happens:** Vite dev server correctly serves static files from `public/` with proper MIME types. Since the fonts go in `public/fonts/`, Vite will serve them as `font/woff2` automatically.
**How to avoid:** Place WOFF2 files in `public/fonts/` (not `src/assets/`). Reference them with absolute paths `/fonts/...` in `@font-face` `src:` declarations, not relative paths.
**Warning signs:** `Failed to decode downloaded font` or `OTS parsing error` in dev tools console.

### Pitfall 5: TypeScript `noUnusedLocals` rejects empty CSS import
**What goes wrong:** `import './styles/tokens.css'` may trigger a lint warning or compile issue depending on tsconfig.
**Why it happens:** TypeScript with `noUncheckedSideEffectImports: true` (present in this project's tsconfig) treats CSS imports as side-effect-only imports and requires them to be explicitly declared.
**How to avoid:** CSS imports for side effects are valid in Vite's bundler module resolution. The `noUncheckedSideEffectImports` flag in this project's tsconfig does NOT block CSS imports — Vite handles them via its own module graph, and TypeScript sees them as non-type imports. The existing `import './App.css'` in `main.tsx` confirms this pattern works.
**Warning signs:** TypeScript error on CSS import lines; solve by checking that Vite config does not set `noUncheckedSideEffectImports` incorrectly (it's a TS flag, not a Vite flag).

### Pitfall 6: `position: relative` missing on motif-corners host element
**What goes wrong:** Pseudo-element corners appear in wrong positions relative to the page, not the element.
**Why it happens:** `::before`/`::after` with `position: absolute` are positioned relative to the nearest `position: relative/absolute/fixed/sticky` ancestor, not the element itself unless the element has `position: relative`.
**How to avoid:** `.motif-corners` CSS must set `position: relative` on the host. The Section.tsx wrapper already needs `position: relative` for scroll-reveal; ensure Nav link spans also get it.
**Warning signs:** Bracket corners appear at the top-left corner of the viewport instead of wrapping the link text.

### Pitfall 7: Inter Variable font-family name mismatch
**What goes wrong:** CSS `font-family: 'Inter'` doesn't match the `font-family: 'Inter Variable'` declared in `@font-face`.
**Why it happens:** The Fontsource package names the variable font `'Inter Variable'`, not `'Inter'`. Mismatched names cause fallback to system fonts.
**How to avoid:** Use `font-family: 'Inter Variable', system-ui, -apple-system, sans-serif` everywhere. Update `App.css` body declaration from `font-family: 'Inter', ...` to `font-family: 'Inter Variable', ...`.
**Warning signs:** Font appears wrong weight — system font fallback is used instead of the loaded variable font.

---

## Code Examples

### Verified pattern: main.tsx imports
```typescript
// src/main.tsx — add these imports before App.css
import './styles/tokens.css'
import './styles/fonts.css'
import './styles/motifs.css'
import './App.css'
// ... existing imports
```

### Verified pattern: Section component
```typescript
// src/components/Section.tsx
import { useScrollReveal } from '../hooks/useScrollReveal'

interface Props {
  id: string
  children: React.ReactNode
}

export default function Section({ id, children }: Props) {
  const { ref, revealed } = useScrollReveal(0.1)

  return (
    <section
      id={id}
      ref={ref}
      style={{
        minHeight: '100vh',
        background: 'var(--ds-bg)',
        padding: '6rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(30px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </div>
    </section>
  )
}
```

### Verified pattern: App.tsx after Phase 2
```typescript
// src/App.tsx
import { useState } from 'react'
import AquariumLanding from './components/AquariumLanding'
import Nav from './components/Nav'
import Section from './components/Section'

const SECTION_IDS = ['about', 'experience', 'education', 'skills', 'projects', 'research', 'contact'] as const

export default function App() {
  const [heroVisible, setHeroVisible] = useState(true)

  return (
    <>
      <Nav heroVisible={heroVisible} />
      <AquariumLanding onHeroVisibility={setHeroVisible} heroVisible={heroVisible} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {SECTION_IDS.map((id, i) => (
          <Section key={id} id={id}>
            <h2 style={{
              fontSize: '2rem',
              color: 'var(--ds-text-secondary)',
              fontFamily: "'JetBrains Mono', monospace",
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}>
              {id}
            </h2>
          </Section>
        ))}
      </div>
    </>
  )
}
```

Note: The first section (about) must handle the transparent-to-black gradient. Currently set via inline `background` on the section stub. In Phase 2 this moves inside Section.tsx: accept an optional `gradientTop` boolean prop, or handle it as the first child of the content zone div in App.tsx with a separate overlay div. The simplest approach: keep the gradient in App.tsx as a wrapper div around `<Section id="about">`.

### Verified pattern: smooth scroll in App.css
```css
/* Add to App.css — enables native smooth scroll for anchor hrefs */
html {
  scroll-behavior: smooth;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `font-display: auto` (blocking) | `font-display: swap` | CSS Fonts Level 4 (2018+) | Text renders immediately in fallback; switches to loaded font when ready |
| Scroll event listeners for "which section" | IntersectionObserver + rootMargin | IO widely supported since 2017 | Off-main-thread; no rAF needed |
| Variable fonts via separate weight files | Single WOFF2 variable file covers weight 100–900 | WOFF2 variable font format (2018+) | ~47KB for Inter vs ~200KB+ for individual weight files |
| `gatsby-plugin-google-fonts` / CDN | Fontsource npm packages | ~2020 | Self-hosted, tree-shakeable, no CDN dependency |
| JavaScript-driven animations (GSAP, framer-motion) | CSS transitions + IO state toggle | ES6+ era | No animation library runtime cost; no COEP friction |

**Deprecated/outdated:**
- `woff` format: Still declared as fallback in Fontsource CSS but unnecessary for the desktop-only target (all modern desktop browsers support woff2). For this project, woff2-only is acceptable.
- Polyfilling IntersectionObserver: Not needed for desktop target; IE11 and pre-Chrome 58 are not supported.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js 22 | npm install, Vite | ✓ | v22.19.0 | — |
| npm | Package install | ✓ | 10.9.3 | — |
| `@fontsource-variable/inter` | DS-02 font sourcing | ✗ (not installed) | 5.2.8 available | No fallback — must install to extract WOFF2 |
| `@fontsource/jetbrains-mono` | DS-02 font sourcing | ✗ (not installed) | 5.2.8 available | No fallback — must install to extract WOFF2 |
| `public/fonts/` directory | DS-02 WOFF2 serving | ✗ (does not exist) | — | Must create |
| `src/styles/` directory | DS-01/DS-03 CSS files | ✗ (does not exist) | — | Must create |
| `IntersectionObserver` | NAV-03, DS-04 | ✓ | Browser API — desktop Chrome/Firefox/Safari all supported | — |
| `backdrop-filter` | NAV-01 nav glassmorphism | ✓ | Chrome 76+, Safari 9+ (with prefix), Firefox 103+ | Solid `rgba(0,0,0,0.9)` background as fallback (acceptable degradation) |

**Missing dependencies with no fallback:**
- Fontsource packages must be installed (`npm install --save-dev @fontsource-variable/inter @fontsource/jetbrains-mono`) to source the WOFF2 files. They can be uninstalled after extraction if preferred, as the WOFF2 files are committed to `public/fonts/`.

**Missing dependencies with fallback:**
- `backdrop-filter` on Firefox < 103: renders as solid dark background instead of frosted glass — acceptable.

---

## Open Questions

1. **First-section gradient ownership after Section.tsx refactor**
   - What we know: App.tsx currently sets `background: 'linear-gradient(to bottom, transparent 0%, #000000 35vh)'` inline on the first section stub. When the stub becomes `<Section id="about">`, the Section component owns the background.
   - What's unclear: Should Section accept an optional `gradientTop` prop, or should App.tsx wrap the first section in a separate div that provides the gradient overlay?
   - Recommendation: Keep the gradient in App.tsx as a wrapper element or position it as an absolutely-positioned overlay inside the content zone div (below the AquariumLanding). Section component stays simple with a consistent `background: var(--ds-bg)`.

2. **Nav zIndex relative to AquariumLanding fixed elements**
   - What we know: AquariumLanding has `position: fixed` elements at `zIndex: 2` and `zIndex: 3`. Nav will be at `zIndex: 100`.
   - What's unclear: When `heroVisible === true`, the nav is visually hidden (opacity 0, pointer-events none) but still in the DOM at z-index 100. The detection toggle button is at z-index 3. This is fine — hidden elements don't capture events. No issue.
   - Recommendation: Use `zIndex: 100` for Nav. Confirm no interaction between hero-visible-false state and the detection toggle.

3. **`prefers-reduced-motion` for scroll-reveal**
   - What we know: WCAG 2.1 AA recommends respecting `prefers-reduced-motion: reduce` for animations. The `useScrollReveal` hook applies a CSS transition.
   - What's unclear: Not specified in CONTEXT.md decisions; accessibility level not defined.
   - Recommendation: Add `@media (prefers-reduced-motion: reduce)` to the Section component's transition — set duration to `0.01s` or skip the `translateY` transform. This is a one-line addition that costs nothing and is best practice. Treat as part of the scroll-reveal implementation.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/App.tsx`, `src/components/AquariumLanding.tsx`, `src/main.tsx`, `src/App.css` — established patterns, existing state, integration points
- Direct package inspection: `@fontsource-variable/inter@5.2.8` and `@fontsource/jetbrains-mono@5.2.8` — actual WOFF2 file names, sizes, and CSS declarations verified by extracting packages locally
- `npm view` registry queries (2026-04-14): confirmed current versions for both Fontsource packages
- CONTEXT.md decisions D-01 through D-22: all locked decisions treated as specification

### Secondary (MEDIUM confidence)
- MDN IntersectionObserver API (rootMargin behavior, `root: null` default) — verified by established Phase 1 IO pattern in codebase
- CSS `backdrop-filter` browser compatibility — webkit prefix requirement for Safari verified by general knowledge; Safari 9+ supports `-webkit-backdrop-filter`
- `format('woff2-variations')` for variable fonts — confirmed by Fontsource CSS output inspected in package extraction

### Tertiary (LOW confidence)
- None — all claims verified by direct code/package inspection or established browser API behavior

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — packages verified by `npm view` and local extraction; no runtime dependencies
- Architecture: HIGH — patterns derived directly from existing Phase 1 code + locked CONTEXT.md decisions
- Pitfalls: HIGH — most pitfalls verified by direct code inspection (e.g., button/nav z-index non-conflict, font-family name mismatch, CSS import pattern)
- rootMargin technique: HIGH — established technique with verified browser API behavior

**Research date:** 2026-04-14
**Valid until:** 2026-05-14 (stable browser APIs; Fontsource versioning may update but WOFF2 files are committed)
