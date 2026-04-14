---
status: partial
phase: 01-layout-skeleton-wasm-gating
source: [01-VERIFICATION.md]
started: 2026-04-14T19:30:00Z
updated: 2026-04-14T19:30:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Aquarium hero fills full viewport on first load
expected: Aquarium video covers 100% of browser window; no dark section content visible until user scrolls
result: [pending]

### 2. Continuous scroll into dark content zone
expected: Smooth continuous scroll revealing 7 section stubs (about, experience, etc.) with dark #0a0a0a backgrounds; no page snap
result: [pending]

### 3. Fish detection stops when hero scrolls off-screen
expected: Enable detection, scroll down until aquarium is fully off-screen — bounding boxes clear within ~1 second of hero crossing 10% threshold
result: [pending]

### 4. Fish detection resumes when scrolling back to hero
expected: Scroll back up to aquarium — detection resumes within ~100ms of hero re-entering viewport; bounding boxes reappear
result: [pending]

### 5. Detection toggle button fade-out
expected: With button visible and detection on, scroll past hero — button fades to opacity:0 with smooth 250ms transition and becomes non-interactive
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
