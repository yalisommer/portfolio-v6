---
phase: quick
plan: 260427-qsa
type: execute
wave: 1
depends_on: []
files_modified:
  - public/CNAME
  - public/sw.js
  - index.html
  - .github/workflows/deploy.yml
  - vite.config.ts
autonomous: false
must_haves:
  truths:
    - "Site builds successfully via GitHub Actions on push to main"
    - "Site is accessible at yalisommer.com with HTTPS"
    - "SharedArrayBuffer is available in the browser (COOP/COEP headers injected by service worker)"
    - "ONNX Runtime fish detection works in production (WASM threading enabled)"
  artifacts:
    - path: ".github/workflows/deploy.yml"
      provides: "GitHub Actions CI/CD pipeline for GitHub Pages deployment"
    - path: "public/CNAME"
      provides: "Custom domain configuration for GitHub Pages"
    - path: "public/sw.js"
      provides: "Service worker that injects COOP/COEP headers for SharedArrayBuffer support"
    - path: "index.html"
      provides: "Service worker registration script"
  key_links:
    - from: ".github/workflows/deploy.yml"
      to: "GitHub Pages"
      via: "actions/deploy-pages"
      pattern: "deploy-pages"
    - from: "public/sw.js"
      to: "all fetched resources"
      via: "FetchEvent handler adding COOP/COEP response headers"
      pattern: "Cross-Origin-Embedder-Policy"
    - from: "index.html"
      to: "public/sw.js"
      via: "navigator.serviceWorker.register"
      pattern: "serviceWorker.register"
---

<objective>
Deploy portfolio-v6 to GitHub Pages with custom domain yalisommer.com, including a service worker
that injects COOP/COEP headers required for ONNX Runtime WASM threading (SharedArrayBuffer).

Purpose: Get the portfolio live at yalisommer.com with full fish-detection ML inference working in production.
Output: GitHub Actions workflow, service worker for header injection, CNAME for custom domain, DNS instructions.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@vite.config.ts
@index.html
@src/main.tsx
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create service worker, CNAME, GitHub Actions workflow, and register SW in index.html</name>
  <files>public/CNAME, public/sw.js, .github/workflows/deploy.yml, index.html, vite.config.ts</files>
  <action>
**1. Create `public/CNAME`:**
Single line: `yalisommer.com` (no trailing newline issues -- just the domain). This file gets copied into the build output root by Vite, telling GitHub Pages to use the custom domain.

**2. Create `public/sw.js` -- COOP/COEP header injection service worker:**

This is the standard workaround for GitHub Pages not supporting custom HTTP headers. The service worker intercepts all fetch responses and adds the required headers.

```js
// Service worker to inject COOP/COEP headers for SharedArrayBuffer support.
// GitHub Pages does not allow custom HTTP headers, so this SW intercepts
// responses and adds them. Required for ONNX Runtime Web threaded WASM backend.

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('fetch', (event) => {
  // Only handle same-origin navigations and subresources
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((response) => {
        const newHeaders = new Headers(response.headers)
        newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp')
        newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin')
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        })
      })
    )
  } else if (event.request.url.startsWith(self.location.origin)) {
    // Same-origin subresources: add COEP/CORP headers
    event.respondWith(
      fetch(event.request).then((response) => {
        const newHeaders = new Headers(response.headers)
        newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp')
        newHeaders.set('Cross-Origin-Resource-Policy', 'same-origin')
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        })
      })
    )
  }
})
```

Key design choices:
- `skipWaiting()` + `clients.claim()` ensures the SW activates immediately (no stale-tab issues)
- Navigation requests get COEP `require-corp` + COOP `same-origin` -- this is what enables `SharedArrayBuffer`
- Same-origin subresources (JS, WASM, ONNX model) get COEP + CORP headers so they pass the COEP check
- Cross-origin requests are NOT intercepted (pass through normally) -- there are no cross-origin dependencies in production (the HLS proxy is dev-only; production uses local aquarium.mp4 fallback)

**3. Update `index.html` -- register the service worker:**

Add a script block BEFORE the main app module script. This must run before the app loads so the SW is active when ONNX Runtime tries to use SharedArrayBuffer.

Add inside `<head>`, after the `<title>` tag:
```html
<script>
  // Register COOP/COEP service worker for SharedArrayBuffer support on GitHub Pages.
  // On first visit the SW is not yet active, so we reload once after registration.
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      if (registration.installing || registration.waiting) {
        const sw = registration.installing || registration.waiting
        sw.addEventListener('statechange', () => {
          if (sw.state === 'activated' && !navigator.serviceWorker.controller) {
            // First install: SW is now active but this page wasn't controlled.
            // Reload so all requests go through the SW and get COOP/COEP headers.
            window.location.reload()
          }
        })
      }
    })
  }
</script>
```

This handles the first-visit problem: on the very first page load, the SW registers but doesn't control the page yet. The reload ensures the second load has COOP/COEP headers applied. On subsequent visits, the SW is already active and no reload occurs.

**4. Create `.github/workflows/deploy.yml`:**

Use the modern GitHub Pages deployment via GitHub Actions (not the legacy gh-pages branch approach). This is cleaner and officially supported.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Key details:
- `actions/checkout@v4` -- checks out the repo
- `actions/setup-node@v4` with `node-version: 22` and `cache: npm` -- matches the project's Node requirement
- `npm ci` -- clean install from lockfile
- `npm run build` -- runs `tsc -b && vite build`, outputs to `dist/`
- `actions/upload-pages-artifact@v3` with `path: dist` -- uploads the build output
- `actions/deploy-pages@v4` -- deploys to GitHub Pages
- `workflow_dispatch` -- allows manual deploys from the GitHub UI
- `concurrency` with `cancel-in-progress: false` -- prevents overlapping deployments

**5. Verify `vite.config.ts` base path:**

The default Vite base is `/` which is correct for a custom domain (yalisommer.com). Do NOT add `base: '/portfolio-v6/'` -- that would be needed for `username.github.io/repo-name` but NOT for a custom domain. No changes needed to vite.config.ts unless the base is currently set to something other than `/`. Check and confirm -- if base is already `/` (the default), no edit needed.
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && test -f public/CNAME && test -f public/sw.js && test -f .github/workflows/deploy.yml && grep -q "serviceWorker" index.html && npm run build && test -f dist/CNAME && test -f dist/sw.js && echo "PASS: All deployment files created and included in build output"</automated>
  </verify>
  <done>
    - public/CNAME contains "yalisommer.com"
    - public/sw.js contains COOP/COEP header injection logic with install/activate/fetch handlers
    - .github/workflows/deploy.yml contains build+deploy jobs targeting dist/
    - index.html registers the service worker with first-visit reload logic
    - `npm run build` succeeds and dist/ contains CNAME and sw.js
  </done>
</task>

<task type="auto">
  <name>Task 2: Create GitHub repo, push, enable Pages, and provide DNS instructions</name>
  <files>None (git/GitHub operations only)</files>
  <action>
**1. Create GitHub repository:**

```bash
gh repo create yalisommer/portfolio-v6 --public --source=. --remote=origin
```

This creates the repo on GitHub and adds the `origin` remote. Use `--public` since this is a portfolio site.

If a remote named `origin` already exists, skip this step.

**2. Push all code to main:**

```bash
git push -u origin main
```

If the default branch is not `main`, rename it first:
```bash
git branch -M main
git push -u origin main
```

**3. Enable GitHub Pages via GitHub Actions deployment:**

```bash
gh api repos/yalisommer/portfolio-v6/pages -X POST -f build_type=workflow
```

This tells GitHub Pages to use GitHub Actions as the deployment source (not a branch). If this returns a 409 (already enabled), that's fine -- the workflow will deploy on push.

If the above fails with a 422, try:
```bash
gh api repos/yalisommer/portfolio-v6/pages -X PUT -f build_type=workflow -f source='{"branch":"main","path":"/"}'
```

**4. Set the custom domain on GitHub Pages:**

```bash
gh api repos/yalisommer/portfolio-v6/pages -X PUT -f cname=yalisommer.com
```

**5. Print DNS configuration instructions for Namecheap:**

After completing the above steps, output these instructions clearly for the user:

```
=== DNS CONFIGURATION (Namecheap) ===

Go to Namecheap > Domain List > yalisommer.com > Advanced DNS

Delete any existing A records or CNAME records for @ or www.

Add these 4 A records (for apex domain yalisommer.com):
  Type: A Record | Host: @ | Value: 185.199.108.153 | TTL: Automatic
  Type: A Record | Host: @ | Value: 185.199.109.153 | TTL: Automatic
  Type: A Record | Host: @ | Value: 185.199.110.153 | TTL: Automatic
  Type: A Record | Host: @ | Value: 185.199.111.153 | TTL: Automatic

Add this CNAME record (for www subdomain redirect):
  Type: CNAME Record | Host: www | Value: yalisommer.github.io. | TTL: Automatic

DNS propagation takes 10-30 minutes (up to 48 hours in rare cases).

After DNS propagates:
1. Go to GitHub repo > Settings > Pages
2. Verify "yalisommer.com" shows as custom domain
3. Check "Enforce HTTPS" (may take a few minutes for certificate provisioning)
```

**6. Verify the GitHub Actions workflow runs:**

```bash
gh run list --limit 1
```

Check that a workflow run was triggered by the push.
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && gh repo view yalisommer/portfolio-v6 --json name,url -q '.url' && gh api repos/yalisommer/portfolio-v6/pages -q '.cname' 2>/dev/null && echo "PASS: Repo exists and Pages configured"</automated>
  </verify>
  <done>
    - GitHub repo yalisommer/portfolio-v6 exists and is public
    - Code is pushed to main branch
    - GitHub Pages is enabled with GitHub Actions as build source
    - Custom domain yalisommer.com is set on the Pages configuration
    - GitHub Actions deploy workflow has been triggered
    - DNS configuration instructions for Namecheap have been provided to the user
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Full GitHub Pages deployment pipeline with COOP/COEP service worker for WASM threading support.
    The site should be deploying (or deployed) to yalisommer.com.
  </what-built>
  <how-to-verify>
    1. Check GitHub Actions: go to https://github.com/yalisommer/portfolio-v6/actions and confirm the deploy workflow completed successfully (green checkmark)
    2. If DNS is configured: visit https://yalisommer.com
       - The page should load (portfolio with aquarium background)
       - Open DevTools > Application > Service Workers: confirm sw.js is registered and activated
       - Open DevTools > Console: confirm no SharedArrayBuffer errors
       - Toggle fish detection ON: confirm bounding boxes appear (proves WASM threading works)
    3. If DNS is NOT yet configured: visit the GitHub Pages URL shown in repo Settings > Pages
       - Same checks as above
    4. Note: First visit will reload once (SW registration). Second load should work fully.
  </how-to-verify>
  <resume-signal>Type "approved" if the site is live and fish detection works, or describe any issues</resume-signal>
</task>

</tasks>

<verification>
- `npm run build` produces dist/ with CNAME, sw.js, index.html (with SW registration), and all WASM assets
- GitHub Actions workflow deploys successfully on push to main
- Site loads at yalisommer.com (after DNS propagation)
- Service worker activates and injects COOP/COEP headers
- SharedArrayBuffer is available (check: `typeof SharedArrayBuffer !== 'undefined'` in console)
- ONNX Runtime loads and fish detection works
</verification>

<success_criteria>
- Portfolio accessible at https://yalisommer.com with HTTPS
- Fish detection toggle works (WASM threading enabled via service worker COOP/COEP injection)
- GitHub Actions auto-deploys on every push to main
- No manual deployment steps required after DNS is configured
</success_criteria>

<output>
After completion, create `.planning/quick/260427-qsa-host-portfolio-on-github-pages-with-cust/260427-qsa-SUMMARY.md`
</output>
