import { useRef } from 'react'
import { useMeshBackground } from '../hooks/useMeshBackground'

interface Props {
  active: boolean  // true when past the hero; gates rendering and opacity
}

export default function MeshBackground({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useMeshBackground(canvasRef, active)

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 5,
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        willChange: 'transform',
      }}
    />
  )
}
