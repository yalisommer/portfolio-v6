---
quick_id: 260414-pep
description: Add a transparent-to-black gradient overlay at the top of the content zone in App.tsx so the scroll transition fades over the aquarium instead of hard-cutting
date: 2026-04-14
---

# Quick Task 260414-pep

## Task
Add a `position: absolute` div inside the content zone wrapper in `src/App.tsx` with:
- `background: linear-gradient(to bottom, transparent, #000000)`
- `height: 30vh`
- `pointerEvents: none`

## Files
- `src/App.tsx`
