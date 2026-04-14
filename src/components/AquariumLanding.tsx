import { useState, useRef, useEffect } from 'react'
import { useVideoStream } from '../hooks/useVideoStream'
import { useFishDetection } from '../hooks/useFishDetection'
import AquariumVideo from './AquariumVideo'
import DetectionCanvas from './DetectionCanvas'

const statusColor: Record<string, string> = {
  idle:    '#888',
  loading: '#f0c040',
  ready:   '#4caf7d',
  error:   '#e05555',
}

interface Props {
  onHeroVisibility: (visible: boolean) => void
  heroVisible: boolean
}

export default function AquariumLanding({ onHeroVisibility, heroVisible }: Props) {
  const { videoRef, streamStatus } = useVideoStream()
  const { status, runDetection } = useFishDetection()
  const [detectionOn, setDetectionOn] = useState(true)

  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        onHeroVisibility(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [onHeroVisibility])

  const canDetect = status === 'ready'
  const isActive = canDetect && detectionOn && heroVisible

  return (
    <div ref={heroRef} style={{ position: 'relative', width: '100vw', height: '100vh' }}>

      {/* Layer 0: video */}
      <AquariumVideo videoRef={videoRef} streamStatus={streamStatus} />

      {/* Layer 1: detection canvas */}
      <DetectionCanvas
        videoRef={videoRef}
        runDetection={runDetection}
        active={isActive}
      />

      {/* Layer 2: portfolio UI */}

      {/* Bottom gradient */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Hero text */}
      <div style={{
        position: 'fixed',
        bottom: '10%',
        left: 0,
        right: 0,
        zIndex: 3,
        textAlign: 'center',
        padding: '0 2rem',
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 6rem)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          lineHeight: 1,
          marginBottom: '0.5rem',
          textShadow: '0 2px 20px rgba(0,0,0,0.6)',
        }}>
          Yali Sommer
        </h1>
        <p style={{
          fontSize: 'clamp(0.875rem, 2vw, 1.125rem)',
          fontWeight: 400,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)',
          marginBottom: '2rem',
        }}>
          Machine Learning | Computer Vision | Computer Graphics | Data Science
        </p>
        <ScrollHint />
      </div>

      {/* Detection toggle — top right */}
      <button
        onClick={() => canDetect && setDetectionOn(v => !v)}
        style={{
          position: 'fixed',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '999px',
          padding: '0.3rem 0.75rem',
          fontSize: '0.7rem',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.85)',
          cursor: canDetect ? 'pointer' : 'default',
          userSelect: 'none',
          opacity: heroVisible ? 1 : 0,
          pointerEvents: heroVisible ? 'auto' as const : 'none' as const,
          transition: 'opacity 0.25s ease',
        }}
      >
        <span style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: isActive ? statusColor.ready : (status === 'loading' ? statusColor.loading : '#555'),
          flexShrink: 0,
          boxShadow: isActive ? `0 0 6px ${statusColor.ready}` : 'none',
          transition: 'background 0.2s, box-shadow 0.2s',
        }} />
        {status === 'loading' ? 'Loading…' : isActive ? 'Detection on' : 'Detection off'}
      </button>
    </div>
  )
}

function ScrollHint() {
  return (
    <div style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.3rem',
      color: 'rgba(255,255,255,0.5)',
      fontSize: '0.7rem',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      animation: 'scrollBounce 2s ease-in-out infinite',
    }}>
      <span>Scroll</span>
      <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
        <path d="M1 1l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <style>{`
        @keyframes scrollBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(5px); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
