---
phase: quick
plan: 260414-rr6
subsystem: components
tags: [bug-fix, scroll-reveal, animation, transparency]
dependency_graph:
  requires: []
  provides: [opaque-section-backgrounds]
  affects: [src/components/Section.tsx]
tech_stack:
  added: []
  patterns: [reveal-animation-on-inner-div]
key_files:
  created: []
  modified:
    - src/components/Section.tsx
decisions:
  - "Move revealStyle from <section> element to inner <div> so section background is always opaque"
metrics:
  duration: "< 5 minutes"
  completed: "2026-04-14"
  tasks: 1
  files: 1
---

# Quick Task 260414-rr6: Fix Fast-Scroll Background Transparency

**One-liner:** Moved scroll-reveal opacity/transform animation from `<section>` element to inner content `<div>` so section backgrounds remain always opaque during fast scrolling.

## What Was Done

**Task 1: Move reveal animation from section element to inner content div**

**Root cause:** `revealStyle` (which sets `opacity: 0` before IntersectionObserver fires) was spread onto the `<section>` element itself. This made the entire section transparent — including its `background: var(--ds-bg)`. When scrolling fast, the IntersectionObserver callback fires too late or not at all for sections that pass through the viewport quickly, leaving them transparent and revealing the aquarium video behind them.

**Fix applied:** Removed `revealStyle` spread from `<section style={sectionStyle}>` and applied it to the inner `<div style={{ ...innerStyle, ...revealStyle }}>` instead.

Before:
```tsx
<section id={id} ref={...} style={{ ...sectionStyle, ...revealStyle }}>
  <div style={innerStyle}>{children}</div>
</section>
```

After:
```tsx
<section id={id} ref={...} style={sectionStyle}>
  <div style={{ ...innerStyle, ...revealStyle }}>{children}</div>
</section>
```

The `sectionStyle` constant has `background: 'var(--ds-bg)'` and `minHeight: '100vh'` — the section is now always opaque and blocks the aquarium video at any scroll speed. Only the inner text/content fades and translates on scroll-reveal.

## Verification

- `npx tsc --noEmit` — exited 0 with no errors
- No other files modified; `useScrollReveal`, `sectionStyle`, `innerStyle`, and animation timing values unchanged

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- File modified: `src/components/Section.tsx` — FOUND
- `<section>` element style is exactly `sectionStyle` — CONFIRMED
- Inner `<div>` style is `{ ...innerStyle, ...revealStyle }` — CONFIRMED
- TypeScript compile passes with no errors — CONFIRMED
