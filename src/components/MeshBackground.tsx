import { useRef } from 'react'
import { useMeshBackground } from '../hooks/useMeshBackground'

interface Props {
  active: boolean  // true when content zone is visible (!heroVisible)
}

export default function MeshBackground({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useMeshBackground(canvasRef, active)

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 5,             // Above aquarium (zIndex 0) but below content zone (zIndex 10)
        pointerEvents: 'none', // Scroll events pass through to content
        opacity: active ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
    />
  )
}
