import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// Alternative streams (swap YOUTUBE_URL to try a different one):
// https://www.youtube.com/watch?v=nd_ildQK6wc  — original reef cam
// https://www.youtube.com/watch?v=oUCI4h56dXg  — coral reef cam 2
// https://www.youtube.com/watch?v=B30S0Vr9N9A  — betta fish mp4
// https://www.youtube.com/watch?v=sw1M7B1my-w  — aquarium mp4
// https://www.youtube.com/watch?v=KdpOnSpjkJU  — jellyfish mp4
// https://www.youtube.com/watch?v=zZD-7o97ugk  — fish tank mp4 (active, 1080p)
const YOUTUBE_URL = 'https://www.youtube.com/watch?v=zZD-7o97ugk'
const HLS_CACHE_TTL = 5 * 60 * 60 * 1000 // 5h (YouTube URLs expire in 6h)

// Serve ort WASM loader .mjs files from public/ without Vite transformation.
const serveOrtMjsRaw: Plugin = {
  name: 'serve-ort-mjs-raw',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url ?? ''
      const match = url.match(/^\/(ort-wasm[^?]*)(\?.*)?$/)
      if (match && match[1].endsWith('.mjs')) {
        const filepath = path.join(process.cwd(), 'public', match[1])
        if (fs.existsSync(filepath)) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
          res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
          res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
          fs.createReadStream(filepath).pipe(res)
          return
        }
      }
      next()
    })
  },
}

// YouTube live stream proxy:
// - GET /api/hls-stream → { url } (proxied m3u8 ready for hls.js)
// - GET /proxy/hls?url=<encoded> → proxies manifest + segments with CORS headers
//   m3u8 manifests get URL-rewritten so all segments also go through this proxy
const youtubeHlsProxy: Plugin = {
  name: 'youtube-hls-proxy',
  configureServer(server) {
    let cachedHlsUrl: string | null = null
    let cacheTime = 0

    function getHlsUrl(): string | null {
      if (cachedHlsUrl && Date.now() - cacheTime < HLS_CACHE_TTL) return cachedHlsUrl
      try {
        const url = execSync(
          `yt-dlp --force-ipv4 -g "${YOUTUBE_URL}" --format "best[protocol=m3u8_native]/bestvideo[ext=mp4][height>=1080]/best[ext=mp4][height>=720]/best[ext=mp4]/best" 2>/dev/null`,
          { encoding: 'utf8', timeout: 30_000 }
        ).trim().split('\n')[0]
        if (url.startsWith('http')) {
          cachedHlsUrl = url
          cacheTime = Date.now()
          console.log('\n[HLS proxy] Stream URL refreshed ✓')
          return url
        }
      } catch {
        console.warn('[HLS proxy] yt-dlp failed — falling back to local video')
      }
      return null
    }

    // Kick off URL fetch eagerly on server start (non-blocking)
    setImmediate(() => getHlsUrl())

    server.middlewares.use(async (req, res, next) => {
      const url = req.url ?? ''

      // ── /api/hls-stream ─────────────────────────────────────────
      if (url === '/api/hls-stream') {
        const streamUrl = getHlsUrl()
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Access-Control-Allow-Origin', '*')
        if (streamUrl) {
          const isHls = streamUrl.includes('m3u8')
          const type = isHls ? 'hls' : 'mp4'
          // Always proxy — adds CORS headers; streaming proxy handles mp4 Range requests
          const url = `/proxy/hls?url=${encodeURIComponent(streamUrl)}`
          res.end(JSON.stringify({ url, type }))
        } else {
          res.end(JSON.stringify({ url: null, type: null }))
        }
        return
      }

      // ── /proxy/hls?url=<encoded> ─────────────────────────────────
      if (url.startsWith('/proxy/hls')) {
        const params = new URL(url, 'http://localhost')
        const targetUrl = params.searchParams.get('url')
        if (!targetUrl) { res.statusCode = 400; res.end('Missing url'); return }

        try {
          // Forward Range header so mp4 seeking works
          const rangeHeader = (req as any).headers['range']
          const upstreamHeaders: Record<string, string> = { 'User-Agent': 'Mozilla/5.0' }
          if (rangeHeader) upstreamHeaders['Range'] = rangeHeader

          const upstream = await fetch(targetUrl, { headers: upstreamHeaders })
          if (!upstream.ok && upstream.status !== 206) {
            res.statusCode = upstream.status
            res.end(`Upstream error ${upstream.status}`)
            return
          }
          const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'

          res.statusCode = upstream.status  // preserve 206 Partial Content
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
          res.setHeader('Content-Type', contentType)
          // Forward range-related headers for mp4 seeking
          for (const h of ['content-range', 'content-length', 'accept-ranges']) {
            const v = upstream.headers.get(h)
            if (v) res.setHeader(h, v)
          }

          // Do NOT use targetUrl.includes('.m3u8') — YouTube segment URLs contain
          // /playlist/index.m3u8/sq/NNN/ in their path. Rely on content-type only.
          if (contentType.includes('mpegurl') || contentType.includes('x-mpegURL')) {
            // Rewrite absolute URLs in the manifest to go through this proxy
            const text = await upstream.text()
            const rewritten = text.replace(
              /(^|\s)(https?:\/\/[^\s\n]+)/gm,
              (_m, pre, absUrl) =>
                `${pre}/proxy/hls?url=${encodeURIComponent(absUrl)}`,
            )
            res.end(rewritten)
          } else {
            // Stream bytes through — avoids buffering entire mp4 in memory
            const { Readable } = await import('node:stream')
            if (upstream.body) {
              Readable.fromWeb(upstream.body as any).pipe(res)
            } else {
              res.end()
            }
          }
        } catch (err) {
          console.warn('[HLS proxy] upstream error:', err)
          res.statusCode = 502
          res.end('Proxy error')
        }
        return
      }

      next()
    })
  },
}

export default defineConfig({
  plugins: [
    react(),
    serveOrtMjsRaw,
    youtubeHlsProxy,
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/onnxruntime-web/dist/*.wasm',
          dest: '.',
        },
        {
          src: 'node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded*.mjs',
          dest: '.',
        },
      ],
    }),
  ],
  optimizeDeps: { exclude: ['onnxruntime-web'] },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
