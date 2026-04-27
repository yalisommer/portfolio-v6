import { useEffect, useRef, RefObject } from 'react'
import { Detection } from '../utils/yolo'

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>
  runDetection: (
    el: HTMLVideoElement | HTMLImageElement,
    w: number,
    h: number,
  ) => Promise<Detection[]>
  active: boolean
}

const MIN_INTERVAL_MS = 100  // ~10 FPS max

export default function DetectionCanvas({ videoRef, runDetection, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastRunRef = useRef<number>(0)
  const runningRef = useRef(false)
  const detectionsRef = useRef<Detection[]>([])

  useEffect(() => {
    if (!active) {
      const canvas = canvasRef.current
      if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
      return
    }

    async function loop() {
      const now = Date.now()
      const canvas = canvasRef.current
      const video = videoRef.current

      if (
        canvas &&
        video &&
        video.readyState >= 2 &&
        now - lastRunRef.current >= MIN_INTERVAL_MS &&
        !runningRef.current
      ) {
        lastRunRef.current = now
        runningRef.current = true

        const rect = video.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height

        try {
          const detections = await runDetection(video, rect.width, rect.height)
          detectionsRef.current = detections
          draw(canvas, detections)
        } catch (e) {
          console.warn('[DetectionCanvas] inference error:', e)
        } finally {
          runningRef.current = false
        }
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, videoRef, runDetection])

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const hit = detectionsRef.current.find(
      d => x >= d.x && x <= d.x + d.w && y >= d.y && y <= d.y + d.h
    )
    if (hit) window.open('https://www.google.com/search?q=Carassius+auratus', '_blank')
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        cursor: 'pointer',
      }}
    />
  )
}

function draw(canvas: HTMLCanvasElement, detections: Detection[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const det of detections) {
    const color = `hsl(${det.score * 120}, 80%, 55%)`

    // Glow + stroke
    ctx.shadowColor = color
    ctx.shadowBlur = 8
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.strokeRect(det.x, det.y, det.w, det.h)

    // Subtle fill
    ctx.shadowBlur = 0
    ctx.fillStyle = color.replace('55%)', '55%, 0.08)')
      .replace('hsl(', 'hsla(')
    ctx.fillRect(det.x, det.y, det.w, det.h)

    // Label chip
    const label = det.label
    const fontSize = 12
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`
    const textW = ctx.measureText(label).width
    const padX = 6, padY = 4
    const chipH = fontSize + padY * 2
    const chipX = det.x
    const chipY = det.y - chipH - 2

    // Chip background
    ctx.shadowBlur = 0
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
    roundRect(ctx, chipX, chipY, textW + padX * 2, chipH, 4)
    ctx.fill()

    // Chip text
    ctx.fillStyle = '#fff'
    ctx.fillText(label, chipX + padX, chipY + padY + fontSize - 1)
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
