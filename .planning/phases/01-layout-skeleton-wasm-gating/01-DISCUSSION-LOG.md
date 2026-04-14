# Phase 1: Layout Skeleton + WASM Gating - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-14
**Phase:** 01-layout-skeleton-wasm-gating
**Areas discussed:** Layout structure, Inference pause trigger, Detection toggle visibility, Placeholder content depth

---

## Layout Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Extend App.tsx | App.tsx becomes scroll container; AquariumLanding gets onHeroVisibility prop; drop overflow:hidden from outer div | ✓ |
| Refactor AquariumLanding | AquariumLanding owns the full page including content zone | |
| New PortfolioPage component | New PortfolioPage.tsx owns layout; AquariumLanding becomes pure hero | |

**User's choice:** Extend App.tsx (Recommended)
**Notes:** Minimal disruption to existing code. AquariumLanding stays focused on the aquarium; App.tsx naturally becomes the page shell.

---

## Inference Pause Trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Hero root div | Observe AquariumLanding outer div with threshold: 0.1 | ✓ |
| Sentinel at hero bottom | Zero-height sentinel div at hero's bottom edge for earlier trigger | |
| Scroll event listener | window.scroll + scrollY threshold check | |

**User's choice:** Hero root div (Recommended)
**Notes:** threshold: 0.1 gives a small buffer — detection off once 90% of hero is scrolled away. IO set up in AquariumLanding useEffect with disconnect() cleanup.

---

## Detection Toggle Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Hide when hero is off-screen | Toggle fades out when heroVisible is false | ✓ |
| Stay visible always | Toggle remains position: fixed throughout the page | |
| You decide | Leave to planner | |

**User's choice:** Hide when hero is off-screen
**Notes:** Fade via CSS opacity + pointer-events: none (not conditional unmount). Exact duration left to Claude's discretion (suggested 200–300ms).

---

## Placeholder Content Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Section ID stubs | 7 sections with correct IDs, h2 labels, minHeight: 100vh, #0a0a0a bg | ✓ |
| Single empty content div | One dark div, no structure | |
| Minimal height only | Just enough to trigger scrolling | |

**User's choice:** Section ID stubs (Recommended)
**Notes:** Section IDs: about, experience, education, skills, projects, research, contact. Establishes Phase 2 nav anchor targets immediately.

---

## Claude's Discretion

- Fade transition duration for detection toggle
- Whether heroVisible lives in App.tsx state or as a local concern in AquariumLanding
- Placeholder label styling (font/size/color — pre-design-system)

## Deferred Ideas

None.
