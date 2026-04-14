import { useRef, useState, useEffect } from 'react'
import type { RefObject } from 'react'

export function useScrollReveal(threshold = 0.1): {
  ref: RefObject<HTMLElement | null>
  revealed: boolean
} {
  const ref = useRef<HTMLElement | null>(null)
  const [revealed, setRevealed] = useState(() => {
    // Skip animation when user prefers reduced motion
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return false
  })

  useEffect(() => {
    const el = ref.current
    if (!el || revealed) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, revealed])

  return { ref, revealed }
}
