---
quick_id: 260414-pie
description: Fix the scroll fade — remove useless absolute gradient overlay div, give the first section a transparent-to-black background gradient so the fixed fish video shows through as it scrolls into view
date: 2026-04-14
---

## Task
- Remove the `position: absolute` gradient overlay div added in 260414-pep (it was overlaying solid black sections, so the transparent part showed black not fish)
- Change the first section's background from `#000000` to `linear-gradient(to bottom, transparent, #000000)`
- All other sections stay `#000000`
- Add `i` index to the `.map()` call

## Files
- `src/App.tsx`
