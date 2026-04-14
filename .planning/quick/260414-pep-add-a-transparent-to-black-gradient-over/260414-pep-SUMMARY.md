---
quick_id: 260414-pep
status: complete
date: 2026-04-14
commit: 335f769
---

# Summary: Transparent-to-black gradient at content zone top

Added an absolutely-positioned `30vh` tall div at the top of the content zone wrapper in `src/App.tsx`. It uses `linear-gradient(to bottom, transparent, #000000)` with `pointerEvents: none`, so as the user scrolls the aquarium fades out under the gradient rather than being hard-cut.

## What changed
- `src/App.tsx`: gradient overlay div inserted before the section stubs map
