---
phase: quick
plan: 260427-qsa
title: "Host portfolio on GitHub Pages with custom domain and COOP/COEP service worker"
status: complete-pending-dns
completed: 2026-04-27
duration: ~30min
tasks_completed: 2/2 (checkpoint pending DNS configuration)
key_files_created:
  - public/sw.js
  - public/CNAME
  - .github/workflows/deploy.yml
  - .gitignore
key_files_modified:
  - index.html (service worker registration)
  - src/data/content.ts (content cleanup)
commits:
  - hash: 1e2fe51
    message: "feat(quick-260427-qsa): add GitHub Pages deployment with COOP/COEP service worker"
  - hash: c92f402
    message: "chore(quick-260427-qsa): stage all uncommitted project files for initial push"
decisions:
  - "Used GitHub Actions deploy-pages (not gh-pages branch) for cleaner CI/CD"
  - "Service worker approach for COOP/COEP headers instead of hosting platform config"
  - "Auto-reload on first visit to ensure SW controls the page before ONNX loads"
---

# Quick Task 260427-qsa: GitHub Pages Deployment Summary

Portfolio v6 deployed to GitHub Pages with a service worker that injects COOP/COEP headers required for ONNX Runtime WASM threading (SharedArrayBuffer), plus a custom domain configuration for yalisommer.com.

## Repository

- **GitHub repo:** https://github.com/yalisommer/portfolio-v6
- **GitHub Pages URL:** https://yalisommer.github.io/portfolio-v6 (before custom domain)
- **Custom domain:** https://yalisommer.com (after DNS propagation)
- **Build source:** GitHub Actions workflow (`deploy.yml`)

## Files Created

### `public/sw.js` -- COOP/COEP Service Worker

Intercepts all same-origin fetch responses and injects the headers GitHub Pages cannot set natively:

- **Navigation requests:** Adds `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`. These two headers together enable `SharedArrayBuffer`, which ONNX Runtime Web needs for its multi-threaded WASM backend.
- **Same-origin subresources** (JS, WASM, ONNX model files): Adds `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Resource-Policy: same-origin` so they pass the COEP check.
- **Cross-origin requests:** Not intercepted (pass through). No cross-origin dependencies exist in production (the YouTube HLS proxy is dev-only; production falls back to local `aquarium.mp4`).
- Uses `skipWaiting()` + `clients.claim()` for immediate activation.

### `public/CNAME`

Contains `yalisommer.com`. Vite copies this from `public/` into `dist/` at build time, and GitHub Pages reads it to configure the custom domain.

### `.github/workflows/deploy.yml`

GitHub Actions workflow triggered on push to `main` (and manual `workflow_dispatch`):

1. **build job:** Checks out code, sets up Node 22, runs `npm ci` + `npm run build`, uploads `dist/` as a Pages artifact.
2. **deploy job:** Uses `actions/deploy-pages@v4` to deploy the artifact to GitHub Pages.
3. Concurrency group `pages` prevents overlapping deployments.
4. Permissions: `contents: read`, `pages: write`, `id-token: write`.

### `.gitignore`

Standard ignores for Node/Vite projects (node_modules, dist, .env, OS files).

### `index.html` -- Service Worker Registration

Added a `<script>` block in `<head>` (before the app module) that:
1. Registers `/sw.js` via `navigator.serviceWorker.register()`
2. On first visit, detects when the SW transitions to `activated` state
3. If the page is not yet controlled by the SW (`!navigator.serviceWorker.controller`), triggers `window.location.reload()` so all subsequent requests go through the SW and get COOP/COEP headers
4. On repeat visits, the SW is already active -- no reload needed

## How COOP/COEP Service Worker Works

```
First Visit:
  Browser loads index.html (no SW active)
  -> SW registers and installs
  -> SW activates
  -> Page detects "activated but not controlled" -> reload
  -> Second load: SW intercepts all fetches, adds COOP/COEP headers
  -> SharedArrayBuffer available -> ONNX Runtime WASM threading works

Subsequent Visits:
  SW already active and controlling the page
  -> All fetches get COOP/COEP headers immediately
  -> No reload needed
```

## Deployment Status

- GitHub Actions workflow: **Build succeeded, deploy succeeded**
- GitHub Pages: **Enabled** (build source: GitHub Actions workflow)
- Custom domain: **Set to yalisommer.com** (pending DNS configuration)
- HTTPS enforcement: **Will be enabled after DNS propagates and TLS cert provisions**

## DNS Configuration Required (Namecheap)

Go to **Namecheap > Domain List > yalisommer.com > Advanced DNS**

Delete any existing A records or CNAME records for `@` or `www`.

Add these **4 A records** (for apex domain `yalisommer.com`):

| Type     | Host | Value            | TTL       |
|----------|------|------------------|-----------|
| A Record | @    | 185.199.108.153  | Automatic |
| A Record | @    | 185.199.109.153  | Automatic |
| A Record | @    | 185.199.110.153  | Automatic |
| A Record | @    | 185.199.111.153  | Automatic |

Add this **CNAME record** (for `www` subdomain redirect):

| Type         | Host | Value                  | TTL       |
|--------------|------|------------------------|-----------|
| CNAME Record | www  | yalisommer.github.io.  | Automatic |

DNS propagation typically takes 10-30 minutes (up to 48 hours in rare cases).

## Manual Steps Remaining

1. **Configure Namecheap DNS** -- Add the A records and CNAME record listed above
2. **Wait for DNS propagation** -- 10-30 minutes typically
3. **Enable HTTPS** -- Go to GitHub repo > Settings > Pages > check "Enforce HTTPS" (may need to wait a few minutes for GitHub to provision the TLS certificate after DNS propagates)
4. **Verify site** -- Visit https://yalisommer.com, open DevTools:
   - Application > Service Workers: confirm `sw.js` is registered and activated
   - Console: confirm no `SharedArrayBuffer` errors
   - Toggle fish detection ON: confirm bounding boxes appear (proves WASM threading works)

## Deviations from Plan

None -- plan executed as written. The deploy job initially failed because GitHub Pages was not yet enabled on the repo (expected for a new repo). Enabled Pages via API, then re-ran the failed deploy job successfully.
