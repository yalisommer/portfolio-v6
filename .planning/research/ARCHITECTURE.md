# Architecture Patterns

**Domain:** Single-page portfolio with WebAssembly/Canvas hero section
**Researched:** 2026-04-14

## Recommended Architecture

A two-zone page: a fixed-position aquarium hero (zone 1) that stays behind the viewport while scrollable content sections (zone 2) slide up and over it. The aquarium WASM inference loop is paused via IntersectionObserver the moment the hero leaves the viewport, and resumed when the user scrolls back up.

### High-Level Layout

```
+------------------------------------------------------+
|  ZONE 1 (position: fixed, z-index: 0)               |
|  +------------------------------------------------+  |
|  | <video> + <DetectionCanvas>   (AquariumHero)   |  |
|  | Full viewport, runs rAF + ORT inference        |  |
|  +------------------------------------------------+  |
+------------------------------------------------------+
|  ZONE 2 (position: relative, z-index: 1)             |
|  margin-top: 100vh  (pushes below the hero)          |
|  +------------------------------------------------+  |
|  | <StickyNav>  (position: sticky, top: 0)        |  |
|  +------------------------------------------------+  |
|  | <AboutSection>                                 |  |
|  +------------------------------------------------+  |
|  | <ExperienceSection>                            |  |
|  +------------------------------------------------+  |
|  | <EducationSection>                             |  |
|  +------------------------------------------------+  |
|  | <SkillsSection>                                |  |
|  +------------------------------------------------+  |
|  | <ProjectsSection>                              |  |
|  +------------------------------------------------+  |
|  | <ResearchSection>                              |  |
|  +------------------------------------------------+  |
|  | <ContactSection>                               |  |
|  +------------------------------------------------+  |
+------------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `App` | Root layout, owns scroll context | All children |
| `AquariumHero` | Fixed hero wrapper, owns visibility state via IntersectionObserver sentinel | `AquariumVideo`, `DetectionCanvas`, `HeroOverlay` |
| `AquariumVideo` | Video element (HLS/mp4/fallback) | `useVideoStream` hook |
| `DetectionCanvas` | rAF loop, ONNX inference, bounding box rendering | `useFishDetection` hook, receives `active` prop |
| `HeroOverlay` | Name, subtitle, scroll hint, gradient scrim | None (presentational) |
| `StickyNav` | Section navigation, scroll-to-section on click, highlights active section | `useSectionObserver` hook |
| `Section` (generic wrapper) | Consistent padding, id anchor, entrance animation trigger | `useSectionReveal` hook |
| `AboutSection` | Bio content | None |
| `ExperienceSection` | Timeline of 4 roles | None |
| `EducationSection` | Brown details, coursework | None |
| `SkillsSection` | Skills visualization (B&W) | None |
| `ProjectsSection` | Project cards/grid | None |
| `ResearchSection` | Two research entries | None |
| `ContactSection` | Email + LinkedIn | None |

### Data Flow

```
useVideoStream (HLS/mp4 source)
    |
    v
AquariumVideo <video ref>
    |
    +---> useFishDetection (ORT session, runDetection fn)
    |         |
    |         v
    +---> DetectionCanvas (rAF loop, reads video frames, draws boxes)
              |
              +---> `active` prop gated by:
                      1. Detection toggle button (user intent)
                      2. Hero visibility (IntersectionObserver)

useSectionObserver (single IntersectionObserver, tracks all section ids)
    |
    v
StickyNav (highlights active section, click scrolls to section)

useSectionReveal (per-section IntersectionObserver, triggers entrance animation)
    |
    v
Section wrapper (applies CSS class/transition on first intersection)
```

## Component Organization: Separate Section Components, Not One Monolith

Use one component per section. Each section component is a self-contained file under `src/sections/`. The generic `Section` wrapper handles the repeating concerns (id anchoring, entrance animations, consistent spacing), while each section component owns its own content and internal layout.

**Rationale:** This project has 7 content sections plus the hero. A single-file approach would exceed 1000 lines and make concurrent work on sections impossible. Separate files allow each section to be developed, tested, and iterated independently. The `Section` wrapper eliminates duplicated boilerplate.

### Recommended File Structure

```
src/
  App.tsx                          # Root: AquariumHero + content zone
  components/
    AquariumHero.tsx               # Renamed from AquariumLanding, now just the hero
    AquariumVideo.tsx              # Unchanged
    DetectionCanvas.tsx            # Unchanged (add active gating from observer)
    HeroOverlay.tsx                # Extracted: name, subtitle, scroll hint, gradient
    StickyNav.tsx                  # Nav bar with section links
    Section.tsx                    # Generic wrapper: id, padding, reveal animation
  sections/
    AboutSection.tsx
    ExperienceSection.tsx
    EducationSection.tsx
    SkillsSection.tsx
    ProjectsSection.tsx
    ResearchSection.tsx
    ContactSection.tsx
  hooks/
    useFishDetection.ts            # Unchanged
    useVideoStream.ts              # Unchanged
    useSectionObserver.ts          # Single observer for all section ids -> active section
    useSectionReveal.ts            # Per-section reveal animation hook
    useHeroVisibility.ts           # IntersectionObserver for hero -> pause/resume
  utils/
    yolo.ts                        # Unchanged
    sectionData.ts                 # Section ids, labels, ordering (single source of truth)
  styles/
    global.css                     # Dark theme tokens, base resets
    sections.css                   # Shared section styles
```

## Patterns to Follow

### Pattern 1: IntersectionObserver-Gated WASM Loop

**What:** Pause the detection rAF loop when the aquarium hero scrolls out of view. Resume when it scrolls back.

**When:** Always. This is the single most important performance optimization for this architecture.

**Why:** The YOLOv8 inference loop runs at ~10 FPS, performing canvas `drawImage` + `getImageData` + ORT WASM inference on every frame. When the user scrolls to content sections, this work is invisible but still consuming CPU, heating the device, and competing with scroll-driven animations. Pausing it reclaims the main thread and WASM threads entirely.

**Implementation:**

```typescript
// hooks/useHeroVisibility.ts
import { useEffect, useRef, useState } from 'react'

export function useHeroVisibility() {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isHeroVisible, setIsHeroVisible] = useState(true)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroVisible(entry.isIntersecting),
      { threshold: 0.05 }  // 5% visible = "on screen"
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { sentinelRef, isHeroVisible }
}
```

```typescript
// In AquariumHero.tsx
const { sentinelRef, isHeroVisible } = useHeroVisibility()
const isActive = canDetect && detectionOn && isHeroVisible

// The sentinel is a zero-height div at the bottom of the hero zone.
// When it exits the viewport, the hero is fully scrolled away.
<div ref={sentinelRef} style={{ position: 'absolute', bottom: 0, height: 1 }} />
<DetectionCanvas videoRef={videoRef} runDetection={runDetection} active={isActive} />
```

The existing `DetectionCanvas` already respects the `active` prop -- when `false`, it clears the canvas and the `useEffect` cleanup cancels the rAF. No changes needed to the detection canvas itself.

**Confidence:** HIGH. IntersectionObserver is universally supported. The existing `active` prop pattern in `DetectionCanvas` already handles the pause/resume lifecycle cleanly (lines 24-27 clear canvas, the effect cleanup on line 64 cancels rAF).

### Pattern 2: Fixed Hero + Scrolling Content Overlay

**What:** The aquarium video and detection canvas stay `position: fixed` (already the case), and the content zone is a `position: relative` block with `margin-top: 100vh` so it naturally sits below the fold. As the user scrolls, content slides up over the fixed hero.

**When:** This is the primary layout strategy. It gives the illusion of the aquarium "staying behind" as content covers it.

**Why:** This pattern avoids duplicating the hero in the DOM flow, keeps the video/canvas rendering layer independent of scroll position, and creates the visual effect of content emerging from below the aquarium. It also means the aquarium doesn't need to be re-rendered or re-measured during scroll.

**Implementation:**

```typescript
// App.tsx
export default function App() {
  return (
    <>
      {/* Zone 1: Fixed behind everything */}
      <AquariumHero />

      {/* Zone 2: Scrolls over the hero */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        marginTop: '100vh',
        background: '#0a0a0a',  // dark theme bg, covers the hero as it scrolls
      }}>
        <StickyNav />
        <AboutSection />
        <ExperienceSection />
        <EducationSection />
        <SkillsSection />
        <ProjectsSection />
        <ResearchSection />
        <ContactSection />
      </main>
    </>
  )
}
```

**Confidence:** HIGH. The hero is already `position: fixed` with `inset: 0`. The only addition is a `<main>` wrapper with `margin-top: 100vh` and an opaque background.

### Pattern 3: Sticky Nav That Appears After Scrolling Past the Hero

**What:** A navigation bar that lives at the top of the content zone. Because it uses `position: sticky; top: 0`, it sticks to the top of the viewport once the user scrolls past the hero and into the content.

**When:** Always, for all 7 content sections plus a "Top" link to scroll back to the aquarium.

**Why:** A permanently visible nav would obscure the aquarium hero. A sticky nav that only engages once content is reached is the standard pattern for full-screen-hero portfolios. It requires zero JavaScript for the stick behavior itself.

**Implementation:**

```typescript
// components/StickyNav.tsx
export default function StickyNav() {
  const activeSection = useSectionObserver()

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'rgba(10, 10, 10, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      {SECTIONS.map(s => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={activeSection === s.id ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault()
            document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          {s.label}
        </a>
      ))}
    </nav>
  )
}
```

**Confidence:** HIGH. `position: sticky` is universally supported. The nav only becomes "stuck" after the user scrolls `100vh` (past the hero), which is exactly the desired behavior.

### Pattern 4: Single IntersectionObserver for Active Section Tracking

**What:** One observer watches all section elements. The section with the largest visible area (or the topmost intersecting section) is the "active" section, which the nav highlights.

**When:** Whenever the sticky nav is visible.

**Implementation:**

```typescript
// hooks/useSectionObserver.ts
import { useEffect, useState } from 'react'
import { SECTIONS } from '../utils/sectionData'

export function useSectionObserver(): string {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry closest to the top of the viewport that is intersecting
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return activeId
}
```

The `rootMargin: '-80px 0px -60% 0px'` shrinks the observation zone: 80px from the top (below the sticky nav) and 60% from the bottom, so the "active" section is whichever one occupies the top 40% of the viewport. This gives natural-feeling nav highlighting.

**Confidence:** HIGH. This is the standard approach used by virtually every single-page portfolio with section navigation.

### Pattern 5: Scroll-Triggered Entrance Animations via IntersectionObserver (Not CSS Scroll-Driven Animations)

**What:** Each section fades/slides in when it first enters the viewport. Use IntersectionObserver + CSS transitions, NOT the CSS `animation-timeline` / `scroll()` / `view()` APIs.

**When:** Every content section, triggered once (not re-triggered on scroll back).

**Why not CSS scroll-driven animations?** Firefox does not support `animation-timeline` without a flag as of April 2026. Safari only added support in Safari 26 (very recent). For a portfolio that needs to work reliably in all modern browsers without polyfills, IntersectionObserver + CSS transitions are the right choice. They also avoid the complexity of progressive enhancement / `@supports` fallbacks for a project of this scope.

**Avoiding layout jank:** Only animate `transform` and `opacity`. Never animate `height`, `width`, `margin`, `padding`, or `top`/`left` -- these trigger layout recalculations and cause jank. Composite-only animations (`transform`, `opacity`) run on the GPU compositor thread and cannot cause layout shifts.

**Implementation:**

```typescript
// hooks/useSectionReveal.ts
import { useEffect, useRef, useState } from 'react'

export function useSectionReveal(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          observer.disconnect()  // One-shot: never un-reveal
        }
      },
      { threshold: 0.15, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, isRevealed }
}
```

```css
/* styles/sections.css */
.section-enter {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.section-enter.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

**Confidence:** HIGH. `transform` + `opacity` animations on the compositor thread are the established best practice. IntersectionObserver is universally supported.

### Pattern 6: Section Data as Single Source of Truth

**What:** A `sectionData.ts` file defines the ordered list of sections with their ids and labels. Both the nav and the section rendering consume this list.

**When:** Always.

**Why:** Prevents id mismatches between nav links and section anchors. Adding, removing, or reordering sections requires changing one file.

```typescript
// utils/sectionData.ts
export interface SectionMeta {
  id: string
  label: string
}

export const SECTIONS: SectionMeta[] = [
  { id: 'about',      label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'education',  label: 'Education' },
  { id: 'skills',     label: 'Skills' },
  { id: 'projects',   label: 'Projects' },
  { id: 'research',   label: 'Research' },
  { id: 'contact',    label: 'Contact' },
]
```

**Confidence:** HIGH. Standard pattern.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Running WASM Inference When the Canvas is Off-Screen

**What:** Leaving the rAF + ORT inference loop running when the user has scrolled away from the hero.

**Why bad:** The YOLOv8 inference at 416x416 with 3549 anchors consumes significant CPU and WASM thread time. On lower-end machines, this will cause scroll jank, battery drain, and thermal throttling -- all while producing output nobody can see. The model does `drawImage` + `getImageData` (main thread) plus ONNX inference (WASM threads) every ~100ms. That is a continuous 10 FPS workload competing with scroll event handlers, IntersectionObservers, and CSS transitions.

**Instead:** Gate the `active` prop with `isHeroVisible` from Pattern 1. The existing `DetectionCanvas` already handles the `active=false` case correctly.

### Anti-Pattern 2: Animating Layout Properties for Entrance Effects

**What:** Using `height`, `margin-top`, `padding`, or `top` in entrance animations.

**Why bad:** These trigger layout recalculation (reflow), which is synchronous and blocks the main thread. On a page with 7+ sections, multiple reflows during scroll can cause visible stutter. Combined with an active WASM loop (if the user scrolls back up while the hero is partially visible), this is a recipe for dropped frames.

**Instead:** Only animate `transform` and `opacity`. These are compositor-only properties that bypass the layout and paint stages entirely.

### Anti-Pattern 3: Using scroll Event Listeners for Animation or Active Section Detection

**What:** Attaching `window.addEventListener('scroll', ...)` to detect which section is active or to trigger entrance animations.

**Why bad:** Scroll event handlers fire on every frame during scroll (potentially 60+ times per second). Even with `requestAnimationFrame` throttling, this is more main-thread work than necessary. IntersectionObserver is specifically designed for this use case and runs asynchronously off the main thread.

**Instead:** Use `IntersectionObserver` for all scroll-dependent behavior: hero visibility, active section tracking, and entrance animations. Zero scroll listeners in the entire application.

### Anti-Pattern 4: Unmounting the Aquarium When Scrolled Away

**What:** Conditionally rendering `{isHeroVisible && <AquariumHero />}` to "save resources."

**Why bad:** Unmounting destroys the ORT InferenceSession, the HLS connection, and the video element. Remounting requires re-downloading the ONNX model (~6MB), re-initializing WASM, and re-establishing the video stream -- a multi-second delay that makes scrolling back up feel broken. The video would also lose its playback position.

**Instead:** Keep the hero mounted permanently. Only toggle `DetectionCanvas`'s `active` prop. The video continues playing (negligible cost), and the ORT session stays warm in memory. Resume is instant.

### Anti-Pattern 5: Using `ort.env.wasm.proxy = true` Without Testing COOP/COEP Interaction

**What:** Blindly enabling the ORT proxy worker to "improve UI responsiveness."

**Why risky:** The proxy worker creates a Web Worker via `Blob` URL. In COOP/COEP environments, Blob-based workers inherit the cross-origin isolation context, which is correct. However, the proxy worker adds latency to each inference call (message serialization between threads) and does NOT improve inference speed -- it only frees the main thread during inference. Since the existing architecture already throttles inference to ~100ms intervals and uses `runningRef` to prevent overlap, the main thread is only blocked for the duration of `preprocessFrame` (canvas operations, ~2-5ms). The actual WASM inference already runs on separate threads via SharedArrayBuffer. Enabling the proxy worker would add complexity for minimal gain.

**Instead:** Keep the current architecture. The main-thread cost is already minimal (just the `drawImage` + `getImageData` for preprocessing). If main-thread responsiveness becomes a measurable problem, enable it as an optimization, not as a default.

## Performance Budget Considerations

### Budget Breakdown

| Resource | Budget | Rationale |
|----------|--------|-----------|
| ORT WASM inference (per frame) | < 80ms | At 100ms interval, leaves 20ms headroom for preprocessing + draw |
| `preprocessFrame` (drawImage + getImageData) | < 5ms | Canvas 2D ops on 416x416 are fast |
| Detection box draw (per frame) | < 2ms | Typically < 20 boxes, simple strokes |
| Section entrance animation | < 16ms per frame | Must not exceed single frame budget |
| Total JS on scroll (no hero) | < 4ms per frame | Only IntersectionObserver callbacks (async, batched) |
| Initial page load (JS bundle) | < 300KB gzipped | ORT WASM loaded separately |
| ONNX model file | ~6MB | Loaded async, does not block render |
| fish-detector.onnx | Already present | 416x416 YOLOv8n -- appropriate size for web |

### Key Performance Rules

1. **When hero is visible:** WASM inference is the dominant cost. All other JS should be minimal. Do not run heavy animations in content sections simultaneously (they are off-screen anyway).

2. **When hero is off-screen:** WASM inference is paused. CPU budget is entirely available for scroll animations, section reveals, and user interaction. This is the normal portfolio browsing state.

3. **Image optimization:** All project screenshots and profile images should use modern formats (WebP or AVIF with JPEG fallback), appropriate dimensions (never larger than display size), and lazy loading (`loading="lazy"` on `<img>` tags in content sections).

4. **Font loading:** Use `font-display: swap` and limit to 1-2 font weights. System font stack for body text is acceptable. A single display font (e.g., Inter or similar) for headings.

5. **No animation libraries:** This project does not need Framer Motion, GSAP, or similar. CSS transitions triggered by IntersectionObserver class toggles are sufficient for the planned entrance animations. Adding an animation library would increase bundle size for capabilities that are not needed.

## Scalability Considerations

| Concern | Current (8 sections) | If Adding More Sections | If Adding More WASM Models |
|---------|----------------------|------------------------|---------------------------|
| Scroll performance | Excellent (IntersectionObserver, no scroll listeners) | No change (IO scales to hundreds of targets) | N/A |
| Bundle size | ~300KB JS + ~6MB ONNX (async) | Minimal growth (sections are mostly markup) | Each model adds multi-MB async load |
| Memory | ORT session (~50MB), video decoder, canvas | Negligible per section | Significant per model (avoid) |
| Nav usability | 7 links + "Top" = comfortable | 10+ links may need collapsing or different pattern | N/A |

## Suggested Build Order

Based on dependencies and the brownfield constraint (aquarium code must remain functional throughout):

1. **Layout skeleton** -- App.tsx restructured with fixed hero zone + scrolling content zone + margin-top: 100vh. Verify aquarium still works with new layout.
2. **Hero visibility hook** -- `useHeroVisibility` + wire into `DetectionCanvas` active prop. Verify inference pauses when scrolled away.
3. **Sticky nav** -- `StickyNav` + `sectionData.ts` + `useSectionObserver`. Placeholder section divs with ids.
4. **Section wrapper** -- `Section` component + `useSectionReveal` hook + CSS transitions. Apply to placeholder sections.
5. **Design system** -- Dark theme CSS tokens, typography, CV-motif border/overlay patterns.
6. **Content sections** -- Build each section component one at a time, in order: About, Experience, Education, Skills, Projects, Research, Contact.
7. **Polish** -- Transition timing, nav active state styling, scroll hint behavior at hero bottom.

**Ordering rationale:** Steps 1-2 must come first because they restructure the existing codebase and prove the WASM pause/resume works. Steps 3-4 create the scaffolding all sections depend on. Step 5 (design system) before step 6 (content) ensures consistent styling from the start. Content sections (step 6) are independent of each other and can be built in any order, but the listed order matches the scroll order for testability.

## Sources

- [IntersectionObserver API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [ONNX Runtime Web env flags and session options](https://onnxruntime.ai/docs/tutorials/web/env-flags-and-session-options.html)
- [ONNX Runtime Web performance diagnosis](https://onnxruntime.ai/docs/tutorials/web/performance-diagnosis.html)
- [CSS scroll-driven animations - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations)
- [Create section navigation with React and IntersectionObserver](https://dev.to/maciekgrzybek/create-section-navigation-with-react-and-intersection-observer-fg0)
- [Sticky hero section using CSS position sticky - CodyHouse](https://codyhouse.co/blog/post/sticky-hero-section)
- [react-intersection-observer - npm](https://www.npmjs.com/package/react-intersection-observer)
- [Scroll-driven animations browser support - Cyd Stumpel](https://cydstumpel.nl/start-using-scroll-driven-animations-today/)
- [React architecture patterns 2026](https://www.bacancytechnology.com/blog/react-architecture-patterns-and-best-practices)
- [Animate canvas in a worker - Alex MacArthur](https://macarthur.me/posts/animate-canvas-in-a-worker/)
