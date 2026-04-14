---
quick_id: 260414-pie
status: complete
date: 2026-04-14
commit: eb6e449
---

## What changed
- Removed the `position: absolute` gradient overlay div (was invisible — sections behind it had solid black backgrounds)
- First section now uses `background: linear-gradient(to bottom, transparent, #000000)` — the fixed fish video (zIndex:0) shows through the transparent top and fades to black as the section scrolls over it
- All other 6 sections remain `background: #000000`
