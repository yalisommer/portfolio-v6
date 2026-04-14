# Domain Pitfalls

**Domain:** Developer portfolio redesign (dark-theme, WASM/canvas hero, continuous scroll)
**Researched:** 2026-04-14

---

## Critical Pitfalls

Mistakes that cause rewrites, performance crises, or deployment failures.

### Pitfall 1: WASM Inference Loop Runs While Off-Screen (Battery/CPU Killer)

**What goes wrong:** The aquarium detection loop uses `requestAnimationFrame` with a ~10 FPS inference cycle. When users scroll past the hero into content sections, the canvas is off-screen but the WASM inference continues running. Each frame does a 416x416 tensor creation, full ONNX session.run(), and postprocessing. This burns CPU/battery for zero user benefit.

**Why it happens:** The current `DetectionCanvas.tsx` ties animation to the `active` prop (detection toggle), not to viewport visibility. Scrolling below the hero does not set `active` to false. The `requestAnimationFrame` loop keeps firing regardless.

**Consequences:** Sustained 10-20% CPU on a modern laptop, noticeable fan spin, battery drain. Recruiters reading your Experience section feel their laptop heat up. On low-end machines, scroll jank from main-thread contention between WASM inference and layout/paint. Users blame the site, not the demo.

**Prevention:**
- Use `IntersectionObserver` on the aquarium section. When visibility drops below a threshold (e.g., 10%), pause the detection loop entirely (cancel `requestAnimationFrame`, skip `session.run()`).
- Do NOT just hide the canvas visually -- the computation must stop.
- Re-enable when the user scrolls back up.
- Optionally, add `document.hidden` / `visibilitychange` listener to also pause when the tab is backgrounded.

**Detection (warning signs):** Open Activity Monitor or DevTools Performance tab while scrolled to the bottom of the page. If CPU stays above 5%, the loop is still running.

**Phase relevance:** Must be addressed in the first phase that introduces scrollable content below the hero. Retrofitting is harder because scroll behavior and detection state become entangled.

---

### Pitfall 2: COOP/COEP Headers Missing in Production (SharedArrayBuffer Breaks)

**What goes wrong:** The `vite.config.ts` sets `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` via `server.headers` -- but this only applies to `vite dev`. The production build (`vite build`) outputs static files. If deployed to a host that does not serve these headers, `SharedArrayBuffer` is unavailable, ONNX Runtime threading fails, and the aquarium demo either crashes or runs in degraded single-threaded mode (if ORT falls back gracefully -- it often does not).

**Why it happens:** Vite's `server.headers` config is dev-only. Developers test locally where everything works, then deploy to Netlify/Vercel/Cloudflare Pages without configuring production headers. The WASM loads, but threading silently breaks or throws a `DataCloneError`.

**Consequences:** The signature feature of the portfolio (live fish detection) is broken in production. A recruiter visiting the deployed URL sees either a blank canvas or console errors. The worst outcome: it works on your machine but nowhere else.

**Prevention:**
- **Netlify:** Add a `public/_headers` file:
  ```
  /*
    Cross-Origin-Opener-Policy: same-origin
    Cross-Origin-Embedder-Policy: require-corp
  ```
- **Vercel:** Add to `vercel.json`:
  ```json
  { "headers": [{ "source": "/(.*)", "headers": [
    { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
    { "key": "Cross-Origin-Embedder-Policy", "value": "same-origin" }
  ]}]}
  ```
- **Cloudflare Pages:** Add a `public/_headers` file (same format as Netlify).
- **GitHub Pages (no header support):** Use the `coi-serviceworker` package, which registers a service worker that intercepts responses and adds COOP/COEP headers client-side. Caveat: first visit triggers a reload.
- **Fallback:** Always configure `onnxruntime-web` to fall back to single-threaded WASM (no SharedArrayBuffer) so the demo degrades gracefully rather than crashing.

**Detection:** Run `vite build && vite preview` (preview does NOT add dev headers). If fish detection breaks in preview mode, production will also break. Automate this check.

**Phase relevance:** Must be solved before any deployment milestone. Should be one of the first tasks in any deployment/infrastructure phase.

---

### Pitfall 3: COEP Breaks External Resources (YouTube Proxy, Fonts, Analytics)

**What goes wrong:** `Cross-Origin-Embedder-Policy: require-corp` means every sub-resource must either be same-origin or include a `Cross-Origin-Resource-Policy: cross-origin` header. External resources that do NOT send this header (Google Fonts, Google Analytics, external images, CDN scripts) are silently blocked. The page may load but with missing fonts, broken analytics, or failed API calls.

**Why it happens:** COEP is an all-or-nothing policy. The YouTube HLS proxy already handles this by adding CORS headers, but new external resources added during the redesign (web fonts, analytics scripts, embedded content) will not have these headers.

**Consequences:** Missing fonts fall back to system fonts (looks wrong), analytics silently fail (you do not know anyone is visiting), and any external images or embeds are blocked.

**Prevention:**
- Self-host all fonts (download Google Fonts woff2 files into `public/fonts/`).
- Self-host any analytics script, or use `crossorigin` attribute with `credentialless` COEP policy (but this may break SharedArrayBuffer in some browsers).
- Route all external resources through the existing proxy pattern or serve them from same-origin.
- Before adding ANY external resource, check whether it sends `Cross-Origin-Resource-Policy` headers. If not, self-host it.
- Consider `Cross-Origin-Embedder-Policy: credentialless` as an alternative to `require-corp` -- it is less restrictive but still enables SharedArrayBuffer in Chrome 96+. Test with ORT to confirm it works.

**Detection:** Open DevTools Network tab in production. Any blocked resource shows a COEP error. Filter by "blocked:coep" in Chrome.

**Phase relevance:** Every phase that adds new external resources. Should be a standing rule in the design system phase.

---

### Pitfall 4: Dark Theme Contrast Failures (Halation, Thin Fonts, Gray-on-Gray)

**What goes wrong:** The specified palette (#0a0a0a background, #f0f0f0 text) has a contrast ratio of approximately 17.4:1 -- which sounds good but creates "halation" on dark displays. Bright text blooms/glows against near-black, especially for the ~33% of users with some degree of astigmatism. Meanwhile, secondary text, borders, and disabled states in the gray midrange (e.g., #666 on #0a0a0a = 3.8:1) fail WCAG AA for body text.

**Why it happens:** Developers test on high-end Retina displays in well-lit rooms. Issues appear on: low-DPI screens (office monitors), high-brightness settings, OLED screens (true black), and for users with astigmatism or photosensitivity.

**Consequences:** Body text feels "vibrating" or hard to focus on. Secondary text (#888 or lighter grays) becomes illegible. CV motifs (subtle scan lines, faint borders) disappear entirely on some screens.

**Prevention:**
- Soften the primary text to #e0e0e0 or #d4d4d4 rather than #f0f0f0. The target is 11:1 to 14:1 contrast -- still far above WCAG AA (4.5:1) but without halation.
- Set the background to #111111 or #121212 instead of #0a0a0a. Slightly warmer, reduces the OLED bloom.
- Establish a fixed gray scale with WCAG-checked stops: primary text (#e0e0e0, ~13:1), secondary text (#a0a0a0, ~7:1), disabled/muted (#707070, ~4.5:1 -- the WCAG AA floor), borders (#333333, visible but not prominent).
- Test with browser zoom at 150% (reveals thin-font illegibility).
- Test with the "Blurred vision" emulation in Chrome DevTools Rendering panel.
- Never use font-weight below 400 on dark backgrounds.

**Detection:** Run Chrome DevTools > Rendering > "Emulate vision deficiency" > "Blurred vision." If secondary text disappears, contrast is too low.

**Phase relevance:** Must be locked in during the design system / theme phase. Changing contrast values after content sections are built means touching every component.

---

## Moderate Pitfalls

### Pitfall 5: Scroll Performance Degradation from Layout Thrashing

**What goes wrong:** When the hero section (100vh fixed-position video + canvas) coexists with scrollable content below, naive scroll-driven animations trigger layout recalculations. Reading `scrollTop`, `getBoundingClientRect()`, or `offsetHeight` inside a scroll handler forces synchronous layout. If scroll animations also write to the DOM (opacity, transform), you get read-write-read-write thrashing.

**Prevention:**
- Use CSS `scroll-timeline` or `animation-timeline: scroll()` for scroll-linked effects where possible (compositor-thread, no JS).
- If using JS: batch reads before writes. Use `IntersectionObserver` for enter/exit triggers rather than scroll listeners.
- Avoid animating properties that trigger layout (width, height, top, left, margin). Stick to `transform` and `opacity` (compositor-only).
- Use `will-change: transform` sparingly on elements that will animate.
- If using a library like Motion (Framer Motion), prefer its `useScroll` + `useTransform` API, which batches correctly.

**Detection:** Chrome DevTools Performance tab > record while scrolling. Look for long "Layout" and "Recalculate Style" blocks. FPS below 50 during scroll is a failure.

**Phase relevance:** Every phase that adds scroll-triggered content sections. Establish the pattern in the first content phase; later phases inherit it.

---

### Pitfall 6: Over-Engineering Visual Effects at the Expense of Content

**What goes wrong:** The CV/graphics-inspired motifs (bounding-box borders, scan lines, feature-point overlays, grid patterns) compete with the actual content. Every section gets a unique visual treatment, the page becomes a visual effects showcase rather than a portfolio, and recruiters cannot quickly scan for job titles, company names, or project descriptions.

**Why it happens:** The aquarium demo sets a high visual bar. There is pressure to make subsequent sections "match" that level of polish, leading to creeping complexity: animated borders, parallax text, particle backgrounds per section.

**Consequences:** Time to first meaningful read increases. Recruiters spend 30-60 seconds on a portfolio. If the first 15 seconds are consumed by animation loading and visual noise, they leave before reading your experience. The portfolio impresses developers but fails its actual audience (hiring managers, recruiters).

**Prevention:**
- Apply the "one trick per section" rule: each section gets at most one subtle motif. The aquarium IS the trick for the hero; other sections should be calm.
- Motifs should be structural (e.g., bounding-box corners on section headers) not animated.
- Content text must be immediately readable without waiting for animations to complete.
- Test with the "5-second test": can someone identify your name, role, and top 2 skills within 5 seconds of scrolling past the hero?
- Set a hard rule: no `requestAnimationFrame` loops below the hero section.

**Detection:** Ask a non-developer friend to use the site for 30 seconds, then close it. Ask what they remember. If they say "cool effects" but cannot name a project or skill, you have over-engineered.

**Phase relevance:** Design system phase must establish motif constraints. Every content section phase must resist scope creep.

---

### Pitfall 7: Hero-to-Content Scroll Transition Feels Broken

**What goes wrong:** The aquarium hero is `position: fixed` with `width: 100vw; height: 100vh`. When content sections are placed below in normal document flow, the transition from the fixed hero to scrollable content can feel discontinuous: the hero "sticks" and then content abruptly appears, or there is a confusing gap, or the scroll feels like it "hitches" at the boundary.

**Prevention:**
- Use a wrapper structure: the hero is a `position: sticky` (or fixed) element inside a container that has `height: 100vh`. Content starts in the normal document flow below that container.
- Add a fade-to-black gradient at the bottom of the hero viewport that transitions into the dark background of content sections.
- The existing `bottom gradient` div (40% height, black gradient) is a good start -- extend it to also reveal the first content section title as a visual cue.
- Test: scroll from hero to first section using both trackpad (smooth scroll) and mouse wheel (discrete steps). Both must feel natural.
- Avoid `scroll-snap-type` on the hero boundary -- it fights the continuous-scroll design goal.

**Detection:** Scroll the page with DevTools > Rendering > "Scrolling performance issues" enabled. Watch for scroll hitches or layout shifts at the hero/content boundary.

**Phase relevance:** Must be solved in the first phase that adds content below the hero. This is the architectural transition point.

---

### Pitfall 8: Safari-Specific ONNX Runtime Failure

**What goes wrong:** A known issue exists where ONNX Runtime Web throws a `DataCloneError` when creating an inference session in Safari (15.4+) under cross-origin isolation (COOP/COEP). The error occurs during worker thread initialization.

**Prevention:**
- Test the production build in Safari specifically, not just Chrome.
- Implement graceful degradation: if ORT session creation fails, catch the error and hide the detection overlay (show just the video). Do not let the error propagate and break the page.
- The current code has a try/catch in `useFishDetection.ts` that sets `status: 'error'` -- verify that the UI handles this state visually (e.g., hide the toggle button, show just the video).
- Consider: is the Safari issue still present in current ORT versions? Test with `onnxruntime-web@1.24.x` in Safari before deployment.

**Detection:** Open the deployed site in Safari. If the detection toggle shows "Error" or console shows `DataCloneError`, the issue is active.

**Phase relevance:** Deployment/QA phase. Must be tested before launch.

---

## Minor Pitfalls

### Pitfall 9: YouTube Proxy Only Works in Dev Server

**What goes wrong:** The `youtubeHlsProxy` Vite plugin runs a server-side yt-dlp process. In a static deployment (Netlify, Vercel, GitHub Pages), there is no server -- the proxy does not exist. The aquarium video source will be null, and the fallback file (`/aquarium.mp4`) is noted as "not present" in the project memory.

**Prevention:**
- For production, bake a pre-recorded video into the build: download a high-quality aquarium video, compress to reasonable size (10-20MB for a 30-60 second loop), and place in `public/aquarium.mp4`.
- Update `useVideoStream.ts` to detect production mode (`import.meta.env.PROD`) and skip the API call entirely, going straight to the local video.
- Alternatively, host the video on a CDN and hardcode the URL for production.

**Detection:** Run `vite build && vite preview`. If the video is black/missing, the fallback is broken.

**Phase relevance:** Must be solved before deployment. Can be deferred until the deployment phase but must not be forgotten.

---

### Pitfall 10: Canvas Inaccessible to Screen Readers and Keyboard Users

**What goes wrong:** The `<canvas>` element is a bitmap -- screen readers cannot read its content. The detection bounding boxes have no semantic meaning to assistive technology. The fish click handler (opens Google search) is invisible to keyboard navigation. The canvas covers the entire viewport at `z-index: 1`, potentially blocking keyboard focus on underlying elements.

**Prevention:**
- Add `role="img"` and `aria-label="Real-time fish detection overlay showing bounding boxes around detected fish in the aquarium video"` to the canvas element.
- Add a visually hidden description paragraph near the canvas for screen readers explaining the demo.
- Set `tabIndex={-1}` on the canvas (it should not be in the tab order since the click-to-search feature is decorative).
- Ensure the detection toggle button (top right) is keyboard-focusable and has a visible focus ring that contrasts against the dark/video background.
- Verify that the fixed-position canvas does not trap keyboard focus or block focus on the scroll hint or nav elements.

**Detection:** Navigate the page using only Tab/Shift+Tab. If focus disappears behind the canvas or the toggle button has no visible focus indicator, there is a problem.

**Phase relevance:** Should be addressed alongside the hero section refinement, but not blocking for initial layout work.

---

### Pitfall 11: No `prefers-reduced-motion` Respect

**What goes wrong:** Users with vestibular disorders or motion sensitivity have `prefers-reduced-motion: reduce` set at the OS level. The aquarium video, detection animation, scroll hint bounce, and any scroll-triggered animations ignore this preference.

**Prevention:**
- Wrap all CSS animations (like `scrollBounce`) in `@media (prefers-reduced-motion: no-preference) { ... }`.
- In JS, check `window.matchMedia('(prefers-reduced-motion: reduce)')` before starting the detection loop or scroll animations. For reduced-motion users: show a static frame of the video with a single detection overlay, and disable all scroll-triggered transitions.
- This is not about removing the demo -- it is about making it non-animated. A still frame with static bounding boxes is still impressive.

**Detection:** In macOS System Settings > Accessibility > Display, enable "Reduce motion." Reload the site. If animations still play, this is unhandled.

**Phase relevance:** Design system phase should establish the `prefers-reduced-motion` pattern. Every subsequent phase inherits it.

---

### Pitfall 12: No Production Build Testing Before Deployment

**What goes wrong:** The project memory explicitly notes "No production build tested (only dev server via npm run dev)." The Vite dev server has different behavior from the production build: it serves WASM files through the static copy plugin with dev middleware, sets COOP/COEP headers via server config, and runs the YouTube proxy. None of this exists in the production build output.

**Prevention:**
- Run `npm run build && npx vite preview` as a regular development check.
- Add a checklist for deployment: (1) build succeeds, (2) preview serves correctly, (3) fish detection works in preview, (4) video plays in preview, (5) WASM files are present in `dist/`.
- Consider adding a `"preview"` script to package.json that sets appropriate headers.

**Detection:** If `vite preview` has not been run even once, assume production is broken.

**Phase relevance:** Should be the very first task in any deployment phase.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Design system / theme | Gray-on-gray contrast failures (#4), halation on OLED (#4), thin font illegibility | Lock in contrast scale with WCAG checks before building any components |
| Hero-to-content layout | Scroll transition discontinuity (#7), detection loop not pausing (#1), fixed positioning conflicts (#5) | Solve the hero/content boundary architecture first; add IntersectionObserver for detection pause |
| Content sections (Experience, Projects, etc.) | Over-engineering motifs (#6), layout thrashing from scroll animations (#5), no reduced-motion fallback (#11) | "One trick per section" rule; use transform/opacity only; add prefers-reduced-motion checks |
| Deployment | COOP/COEP missing (#2), COEP blocking external resources (#3), YouTube proxy absent (#9), Safari ORT failure (#8), untested production build (#12) | Test `vite preview` early; configure hosting headers; bake in fallback video; test Safari |
| Accessibility polish | Canvas inaccessible (#10), keyboard focus trapping (#10), missing ARIA labels, focus indicators invisible on dark bg (#4) | Add canvas ARIA, verify tab order, ensure visible focus rings |

---

## Sources

- [Setting COOP/COEP headers on static hosting (March 2025)](https://blog.tomayac.com/2025/03/08/setting-coop-coep-headers-on-static-hosting-like-github-pages/)
- [Inclusive Dark Mode: Designing Accessible Dark Themes -- Smashing Magazine](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/)
- [Dark Mode Design Best Practices 2026](https://natebal.com/best-practices-for-dark-mode/)
- [WCAG 2.2 Contrast Requirements](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [OffscreenCanvas -- web.dev](https://web.dev/articles/offscreen-canvas)
- [Web Animation Performance Tier List -- Motion Magazine](https://motion.dev/blog/web-animation-performance-tier-list)
- [ONNX Runtime Safari COOP/COEP issue #11567](https://github.com/microsoft/onnxruntime/issues/11567)
- [Making your website cross-origin isolated -- web.dev](https://web.dev/articles/coop-coep)
- [Netlify COOP/COEP forum thread](https://answers.netlify.com/t/react-website-getting-sharedarraybuffer-error-due-to-coop-and-coep/41705)
- [coi-serviceworker (GitHub Pages COOP/COEP workaround)](https://github.com/nicktomlin/coi-serviceworker)
- [Dark Mode Design: Trends, Myths, and Common Mistakes](https://webwave.me/blog/dark-mode-design-trends)
- [Canvas element accessibility -- pauljadam.com](https://pauljadam.com/demos/canvas.html)
- [React Intersection Observer guide -- Builder.io](https://www.builder.io/blog/react-intersection-observer)
- [Performant scroll animations in React](https://www.nray.dev/blog/how-to-create-performant-scroll-animations-in-react/)
