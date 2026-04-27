import { RefObject } from 'react'
import { StreamStatus } from '../hooks/useVideoStream'

interface Props {
  videoRef: RefObject<HTMLVideoElement | null>
  streamStatus: StreamStatus
}

const fullscreenStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: 0,
}

export default function AquariumVideo({ videoRef, streamStatus }: Props) {
  // Both 'live' (HLS stream) and 'fallback' (local mp4) use the same <video> element.
  // hls.js attaches directly to videoRef in live mode; in fallback we set src here.
  return (
    <video
      ref={videoRef}
      autoPlay
      loop
      muted
      playsInline
      crossOrigin="anonymous"
      src={streamStatus === 'fallback' ? '/aquarium.mp4' : undefined}
      style={fullscreenStyle}
    />
  )
}
