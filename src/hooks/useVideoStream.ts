import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

export type StreamStatus = 'loading' | 'live' | 'fallback'

export function useVideoStream() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('loading')

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        // Ask the dev-server proxy for the current HLS URL
        const res = await fetch('/api/hls-stream')
        const { url, type } = await res.json() as { url: string | null, type: 'hls' | 'mp4' | null }

        if (cancelled) return

        if (!url) {
          setStreamStatus('fallback')
          return
        }

        const video = videoRef.current
        if (!video) { setStreamStatus('fallback'); return }

        // Direct mp4 (non-live video) — set src directly, no hls.js needed
        if (type === 'mp4') {
          video.src = url
          video.addEventListener('loadedmetadata', () => {
            if (!cancelled) {
              video.play().catch(() => {})
              setStreamStatus('live')
            }
          }, { once: true })
          video.addEventListener('error', () => {
            if (!cancelled) setStreamStatus('fallback')
          }, { once: true })
          return
        }

        // HLS live stream
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: false,  // COEP require-corp breaks hls.js inline worker
            lowLatencyMode: false,
          })
          hlsRef.current = hls
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal && !cancelled) {
              console.warn('[HLS] fatal error, falling back to local video', data)
              hls.destroy()
              hlsRef.current = null
              setStreamStatus('fallback')
            }
          })
          hls.loadSource(url)
          hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!cancelled) {
              video.play().catch(() => {})
              setStreamStatus('live')
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS
          video.src = url
          video.addEventListener('loadedmetadata', () => {
            if (!cancelled) {
              video.play().catch(() => {})
              setStreamStatus('live')
            }
          }, { once: true })
          video.addEventListener('error', () => {
            if (!cancelled) setStreamStatus('fallback')
          }, { once: true })
        } else {
          setStreamStatus('fallback')
        }
      } catch {
        if (!cancelled) setStreamStatus('fallback')
      }
    }

    init()

    return () => {
      cancelled = true
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [])

  return { videoRef, streamStatus }
}
