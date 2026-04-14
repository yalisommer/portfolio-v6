import { useState, useEffect } from 'react'

interface Props {
  heroVisible: boolean
}

const SECTIONS = [
  { id: 'about', label: 'ABOUT' },
  { id: 'experience', label: 'EXPERIENCE' },
  { id: 'education', label: 'EDUCATION' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'projects', label: 'PROJECTS' },
  { id: 'research', label: 'RESEARCH' },
  { id: 'contact', label: 'CONTACT' },
] as const

const navStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  height: '52px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.25rem',
  background: 'rgba(0, 0, 0, 0.75)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  padding: '0 2rem',
}

const linkBaseStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
  padding: '4px 6px',
  display: 'inline-block',
}

export default function Nav({ heroVisible }: Props) {
  const [activeSection, setActiveSection] = useState<string>('')

  useEffect(() => {
    const sectionEls = SECTIONS
      .map(s => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null)

    if (sectionEls.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )

    for (const el of sectionEls) {
      observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const visibilityStyle: React.CSSProperties = {
    ...navStyle,
    opacity: heroVisible ? 0 : 1,
    transform: heroVisible ? 'translateY(-100%)' : 'translateY(0)',
    pointerEvents: heroVisible ? 'none' as const : 'auto' as const,
    transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
  }

  return (
    <nav style={visibilityStyle}>
      {SECTIONS.map(({ id, label }) => {
        const isActive = activeSection === id
        return isActive ? (
          <span key={id} className="motif-corners" style={{ padding: '4px 6px', display: 'inline-block' }}>
            <a
              href={`#${id}`}
              style={{
                ...linkBaseStyle,
                color: '#e0e0e0',
                padding: 0,
              }}
            >
              {label}
            </a>
          </span>
        ) : (
          <a
            key={id}
            href={`#${id}`}
            style={{
              ...linkBaseStyle,
              color: 'rgba(255, 255, 255, 0.45)',
            }}
          >
            {label}
          </a>
        )
      })}
    </nav>
  )
}
