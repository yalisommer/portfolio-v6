# Feature Landscape

**Domain:** Developer portfolio website (scrollable single-page, dark theme, CV/ML/graphics focus)
**Researched:** 2026-04-14
**Overall confidence:** MEDIUM-HIGH (pattern consensus across multiple sources, some specifics drawn from training data for researcher portfolios)

---

## Table Stakes

Features users expect. Missing = portfolio feels incomplete or unprofessional.

### Navigation

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Fixed/sticky nav with section links | Recruiters and researchers need to jump to specific sections instantly; continuous-scroll pages without nav feel like traps | Low | Brittany Chiang pattern: minimal horizontal nav, semi-transparent, hides on scroll-down, shows on scroll-up. Works well with dark theme. |
| Active section indicator | Users need orientation in a long scroll page | Low | Highlight current section in nav based on scroll position. IntersectionObserver is the standard approach. |
| Smooth scroll to anchors | Jarring jump-scrolls feel broken in 2025 | Low | `scroll-behavior: smooth` or JS-based for more control. |

### About Me Section

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Concise bio (2-4 sentences) | Recruiters spend 6-10 seconds on first scan. Walls of text = bounce. | Low | Lead with identity + focus area, not "Hello, my name is." Example: "Junior at Brown studying Math & CS, focused on visual computing and AI. I build things at the intersection of computer vision, graphics, and software engineering." |
| Professional photo | Humanizes the page, builds trust. Every strong portfolio has one. | Low | Circular or rounded-rect crop. On dark bg, desaturated or B&W treatment fits the monochrome system. Avoid: overly casual, low-res, or corporate-stiff photos. |
| Current status/availability | Recruiters want to know: are you looking? When are you available? | Low | "Seeking Summer 2027 internship" or "Available for full-time starting May 2027." Subtle but present. |
| Links to resume/LinkedIn/GitHub | Table stakes for any developer portfolio. Missing = dead end. | Low | Icon row or inline links. Resume should be a downloadable PDF. |

### Experience Section

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Chronological entries with role, company, dates | Basic expectation. Missing = feels like you're hiding something. | Low | Reverse chronological (most recent first). |
| Brief description per role (2-3 bullets) | Recruiters scan for impact, not paragraphs | Low | Focus on outcomes and technologies, not responsibilities. "Built X using Y, resulting in Z" format. |
| Technology tags per role | Quick visual scanning for tech match | Low | Small pill/tag components per entry. Fits the monochrome system well. |

### Projects Section

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Visual preview per project (screenshot/thumbnail) | Projects without visuals feel like placeholder content | Medium | Static screenshots are fine. For CV/graphics projects, visual output IS the demo. |
| Title + one-line description | Scanability. Users decide in 1-2 seconds whether to engage further. | Low | |
| Tech stack tags | Quick identification of relevant technologies | Low | Consistent tag style with Experience section. |
| Links to demo/GitHub | Dead-end project cards without links frustrate visitors | Low | Two CTA links: "View Project" (live demo or video) and "Source" (GitHub). Either can be absent if not applicable. |

### Contact Section

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Email address (clickable mailto:) | Absolute minimum. Without it, the portfolio has no CTA. | Low | |
| LinkedIn link | Standard professional expectation | Low | |
| GitHub link | Expected for developer portfolios | Low | |
| Clear call-to-action text | "Get in touch" or equivalent. Without framing, links feel orphaned. | Low | A short sentence + links is sufficient. No need for a contact form on a personal portfolio. |

### Scroll-Triggered Reveals

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Fade-in / slide-up on section enter | Every modern portfolio does this. Without it, the page feels static and dated. | Low-Med | IntersectionObserver + CSS transitions. No heavy library needed for simple reveals. Use `opacity` and `transform` only (GPU-accelerated). |

---

## Differentiators

Features that set the portfolio apart. Not expected, but valued. Especially relevant given the aquarium landing page already establishes technical depth.

### About Me Section

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Dual-audience framing | Speaks to both SWE hiring managers and research PIs in one bio | Low | Structure: "I study X at Y, building Z" (technical identity) + "My work spans A and B" (breadth signal). Avoid: one audience feeling excluded. |
| CV-motif photo treatment | Photo styled with subtle bounding-box border or detection overlay, echoing the aquarium landing | Low-Med | Monochrome photo with a thin dashed border resembling a detection box. Ties the About section visually to the landing page's identity without being gimmicky. |

### Experience Section

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Left-aligned vertical timeline with connecting line | More visually engaging than plain cards, reinforces chronological narrative | Medium | Single-column vertical timeline (not alternating left-right, which wastes space on desktop and breaks on narrow viewports). Thin vertical line + dot markers. Monochrome fits the design system. |
| Expand/collapse for detail | Shows restraint by default but lets interested visitors dig deeper | Medium | Default: role + company + dates + 2 bullets. Expand: full description, impact metrics, tech deep-dive. Keeps the section scannable. |

### Skills Section

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Categorized tag grid (no skill bars) | Clean, honest, scannable. Skill bars are universally derided as meaningless and subjective. | Low-Med | Categories: Languages, Frameworks/Libraries, ML/CV Tools, Graphics/Rendering, DevOps/Tools. Each skill as a monochrome pill/tag. Group visually by category with subtle headers. |
| Skills tied to projects | Clicking/hovering a skill highlights which projects used it, or vice versa | Medium-High | Cross-references skills with projects section. Powerful for demonstrating breadth. Could be deferred if scope is tight. |

### Projects Section

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Grid layout (2-col on desktop) | Better scanability than carousel. Carousel hides content behind interaction; grid shows all 5-8 projects at once. With only 5-8 projects, a carousel is unnecessary friction. | Medium | 2-column grid. Cards with thumbnail, title, one-liner, tech tags, and links. Consistent card height via fixed aspect-ratio thumbnails. |
| Featured project highlight | Draw attention to strongest work (e.g., the aquarium itself, ViolenceNet) | Low-Med | First project card spans full width or has a larger visual treatment. Rest in 2-col grid below. |
| Problem-approach-impact structure | Differentiates from "list of repos." Shows engineering thinking. | Low | Per-project: "What" (one sentence), "How" (key technical detail), "Result" (metric or outcome). Industry audience loves impact; research audience respects methodology. |
| Short GIF/video preview on hover | For CV/graphics projects, motion is the most compelling proof of work | Medium-High | 3-5 second looping preview on hover. Especially powerful for: raytracer renders, real-time renderer output, detection overlays. Falls back to static image on mobile (out of scope for v6, but good to design for). |

### Research Section

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Separate section from Projects | Signals that research is a distinct competency, not just "another project." Research PIs look for this explicitly. | Low | Separation is important for dual-audience targeting. Industry viewers see it as bonus depth; academic viewers see it as core qualification. |
| Paper-style presentation per entry | Lab name, advisor, institution, date range, abstract-style description, visual result | Medium | Structure per entry: Institution + Lab (e.g., "Brown Visual Computing Group"), Advisor, Date range, 2-3 sentence description pitched at technical-but-accessible level, Key visual (caustic render, mesh result), Links to paper/preprint/code if available. |
| Visual results prominently displayed | For graphics/CV research, the visual output IS the argument | Low-Med | Large image or figure per research entry. For catacaustics: a rendered caustic pattern. For Edinburgh mesh work: before/after mesh visualization. |
| Dual-register description | One description that works for both audiences | Low | Lead with the problem in plain language ("recreating how light bends through curved surfaces"), then technical detail ("neural network trained on [method], achieving [result]"). Industry readers stop at sentence 1-2. Researchers read all of it. |

### Education Section

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Compact but complete | University, degree, concentration, graduation year, GPA (3.94 is strong enough to show), relevant coursework | Low | Single card or block. Not a full section like Experience. Can be visually paired with Skills or stand alone. |
| Relevant coursework as expandable list | Shows depth without cluttering | Low-Med | Default: degree info + GPA. Expand: coursework list. Useful for research audience who care about specific classes (computer vision, graphics, ML courses). |

### Visual Design (Cross-Section)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| CV-motif design language throughout | Bounding-box borders, scan-line textures, feature-point dots, detection-confidence-style labels — creates a unique visual identity that IS the portfolio's brand | Medium | Already planned in PROJECT.md. The key is restraint: motifs should appear as subtle accents on borders, section dividers, and card frames. Not every element needs a motif. |
| Monochrome accent color system | One accent color (cool white, slight blue-white, or green-tinted white) for interactive elements on #0a0a0a | Low | Keeps the B&W identity but provides contrast for links, hover states, and active nav. Brittany Chiang uses green (#64ffda) effectively on dark; consider a muted equivalent. |
| Section dividers with personality | Rather than plain `<hr>` or whitespace, dividers can use CV motifs (scan lines fading out, feature-point scatter, grid overlay dissolve) | Low-Med | Reinforces the visual identity at every section boundary. |

---

## Anti-Features

Features to explicitly NOT build. These would hurt more than help.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Skill bars / percentage ratings | Universally mocked. "75% Python" means nothing. Signals junior-level portfolio thinking. Multiple sources confirm the developer community consensus against these. | Categorized tag grid. Let projects demonstrate proficiency. |
| Contact form | Attracts spam, requires backend, adds complexity for zero gain on a personal portfolio. Recruiters will email directly. | Direct mailto: link + LinkedIn. Clean and direct. |
| Carousel for projects (5-8 items) | Hides content, adds interaction friction, carousels have notoriously low engagement on items past the first. With only 5-8 projects, every project should be visible without interaction. | Grid layout showing all projects at once. |
| Parallax scrolling effects | Competes with the aquarium's visual impact. Heavy parallax on a page that already runs WASM inference will cause performance issues. | Simple fade-in reveals via IntersectionObserver. Subtle, performant, modern. |
| Auto-playing background music/audio | Always wrong. Always. | Nothing. |
| Light/dark theme toggle | Out of scope per PROJECT.md. Dark is the identity, not a preference. A toggle would dilute the visual brand and add complexity. | Single dark theme, fully committed. |
| Interactive skills visualization (3D graph, force-directed network) | v5 had a skills graph. It's a novelty that doesn't communicate information efficiently. Recruiters don't want to interact with your skills; they want to scan them. | Flat categorized tags. Fast to scan, honest, no gimmick. |
| Animated page transitions between sections | On a continuous-scroll page, section transitions should feel seamless, not event-driven. Animated transitions belong to multi-page sites. | Scroll-triggered reveals (fade-in) per element, not per section. |
| "Typing animation" intro text | Overused, delays content, annoying on repeat visits. Was trendy in 2020, now feels cliche. | Static text that's immediately readable. |
| Mobile layout | Explicitly out of scope for v6 per PROJECT.md. Do not add responsive breakpoints or mobile-specific layouts. | Desktop-only. Defer to v7. |

---

## Feature Dependencies

```
Fixed Nav ──────────────────────── requires: section IDs, IntersectionObserver for active state
  |
Scroll Reveals ─────────────────── requires: IntersectionObserver setup (shared with nav)
  |
About Me ───────────────────────── standalone (no deps beyond design system)
  |
Experience Timeline ────────────── requires: design system (tags, timeline components)
  |
Education ──────────────────────── standalone, can share card patterns with Experience
  |
Skills (categorized tags) ──────── standalone, but tag component shared with Experience + Projects
  |
Projects Grid ──────────────────── requires: tag component, card component, thumbnail assets
  |                                  optional: hover video previews (can defer)
  |
  +── Featured Project Highlight ── requires: Projects Grid layout
  |
Research Section ───────────────── requires: card component variant, visual assets for research
  |                                  references: Projects section patterns but distinct layout
  |
Contact ────────────────────────── standalone (simplest section)
  |
CV Motif Design Language ───────── horizontal dependency: informs borders, dividers, and
                                   accents across ALL sections. Should be defined in
                                   design system before building individual sections.
```

**Critical path:** Design system (colors, typography, spacing, CV motifs, tag component) must be established first. Everything depends on it.

---

## MVP Recommendation

**Prioritize (Phase 1 — Core Sections):**
1. Design system: colors, typography, spacing, CV-motif border/divider patterns, tag component
2. Fixed nav with active section indicator
3. About Me: bio + photo + links + availability line
4. Experience: vertical timeline, 4 entries, tech tags
5. Education: compact block with GPA and coursework
6. Skills: categorized tag grid (Languages, Frameworks, ML/CV, Graphics, Tools)
7. Projects: 2-col grid with thumbnails, descriptions, tech tags, links
8. Research: 2 entries with lab/institution, description, visual result
9. Contact: heading + one-liner CTA + email/LinkedIn/GitHub links
10. Scroll-triggered fade-in reveals (IntersectionObserver)

**Defer (Phase 2 — Polish and Differentiation):**
- Featured project highlight (full-width first card)
- Expand/collapse on Experience and Education entries
- Hover video previews on project cards
- Skills-to-projects cross-referencing
- Advanced CV-motif section dividers (scan-line fades, feature-point scatters)
- Problem-approach-impact copywriting refinement per project

**Rationale:** Phase 1 delivers a complete, functional portfolio that covers all sections. Phase 2 adds interaction depth and visual polish that elevates it from "good portfolio" to "memorable portfolio." The aquarium landing page already provides the wow factor; the sections below it need to be clean, scannable, and professional first.

---

## Section-by-Section Design Specifications

### About Me
- **Layout:** Two-column — photo left, text right (or photo with text overlay for more compact feel)
- **Photo:** B&W or desaturated, circular or rounded-rect with subtle CV-motif border (dashed, detection-box style)
- **Text:** 2-4 sentences. First sentence: identity ("Brown junior, Math & CS"). Second: focus area ("visual computing and AI"). Third (optional): current pursuit ("building at the intersection of..."). Fourth (optional): human touch (one non-technical interest).
- **Below text:** Icon row: GitHub, LinkedIn, Resume PDF, Email
- **Below icons:** Availability line in muted text: "Seeking [role] for [timeframe]"

### Experience
- **Layout:** Left-aligned vertical timeline. Thin vertical line (#333) with circular dot markers at each entry.
- **Per entry:** Date range (right-aligned or above), Role title (bold), Company name (muted), 2-3 bullet points (outcomes, not responsibilities), Tech tags row
- **Order:** Reverse chronological (GenWell -> IturanTech x2 -> SMBC, or by date)
- **Interaction:** Optional expand for full description (Phase 2)

### Education
- **Layout:** Single card or minimal block. Does NOT need a full timeline treatment.
- **Content:** Brown University | B.Sc. Math & CS | 2023-2027 | GPA: 3.94
- **Sub-content:** Relevant coursework as a collapsed/expandable list or small-print line

### Skills
- **Layout:** Section with 4-5 category headers, each with a row of pill tags below
- **Categories:** Languages (Python, TypeScript, C++, etc.), Frameworks (React, PyTorch, etc.), ML/CV (YOLO, OpenCV, ONNX, etc.), Graphics (OpenGL, ray tracing, etc.), Tools (Git, Docker, Linux, etc.)
- **Style:** Monochrome pills. No color coding, no progress bars, no proficiency levels.

### Projects
- **Layout:** 2-column grid. Optional: first project full-width as "featured."
- **Per card:** Thumbnail (16:9 or similar fixed aspect ratio), Title, One-line description, Tech tags (3-5 max), Two links: Demo + Source (icon buttons)
- **Card style:** Dark card (#111 or #141414) on dark bg (#0a0a0a), subtle border, slight hover lift/glow
- **Projects (from PROJECT.md):** ViolenceNet, Realtime Renderer, Raytracer, Alma Metrics, Confection (+ potentially the aquarium portfolio itself as a meta-project)

### Research
- **Layout:** Full-width cards (not grid), one per research entry. Generous vertical spacing.
- **Per entry:** Institution + Lab name (prominent), Date range, Advisor name, 2-3 sentence description (accessible lead, technical detail follow-up), Large visual result image, Links: paper/preprint, code repo (if available)
- **Entries (from PROJECT.md):**
  1. Brown Visual Computing Group — Catacaustics neural network
  2. University of Edinburgh — Geometry processing / DROK-inspired mesh manipulation
- **Visual treatment:** Research cards should feel slightly more "academic" — potentially using a serif font for research titles or a paper-abstract layout within the monochrome system.

### Contact
- **Layout:** Centered text block. Minimal.
- **Content:** Heading ("Get In Touch" or "Let's Connect"), One sentence ("I'm currently looking for [X]. Feel free to reach out."), Three icon-links: Email, LinkedIn, GitHub
- **Style:** Large heading, generous whitespace above and below. This section marks the end of the page.

---

## Sources

- [Brittany Chiang portfolio (canonical dark-theme dev portfolio reference)](https://brittanychiang.com/)
- [Colorlib portfolio design trends 2026](https://colorlib.com/wp/portfolio-design-trends/)
- [Hostinger web developer portfolio examples](https://www.hostinger.com/tutorials/web-developer-portfolio)
- [DEV Community: skill section debate](https://dev.to/vulcanwm/skill-section-or-not-1gj)
- [Scrimba: portfolio that gets you hired](https://scrimba.com/articles/how-to-build-a-web-developer-portfolio-that-gets-you-hired/)
- [Designmodo: dev portfolio tips](https://designmodo.com/dev-portfolio-tips/)
- [Justinmind: carousel UI best practices](https://www.justinmind.com/ui-design/carousel)
- [Sourcely: turning research into portfolio pieces](https://www.sourcely.net/post/how-to-turn-your-research-into-a-portfolio-piece)
- [Alliance Interactive: timeline design examples](https://www.allianceinteractive.com/blog/best-website-timeline-examples-and-design-tips/)
- [Kozodoi ML researcher portfolio](https://www.kozodoi.me/portfolio)
- [portalZINE: ScrollReveal solutions 2024-2025](https://portalzine.de/latest-scrollreveal-solutions-in-javascript-2024-2025/)
- [MROY: scroll animation techniques 2025](https://mroy.club/articles/scroll-animations-techniques-and-considerations-for-2025)
- [Webflow: portfolio design examples](https://webflow.com/blog/design-portfolio-examples)
