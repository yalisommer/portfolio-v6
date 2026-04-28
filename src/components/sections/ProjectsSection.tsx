import { useState } from 'react'
import { projects } from '../../data/content'
import { DS } from '../../styles/tokens'

const sectionHeadingStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.7rem',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: DS.textMuted,
  marginBottom: '3rem',
  paddingBottom: '1rem',
  borderBottom: `1px solid ${DS.border}`,
}

const monoSm: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.6rem',
  letterSpacing: '0.08em',
  color: DS.textSecondary,
}

const expandKeyframes = `
  @keyframes projectExpand {
    from { opacity: 0; transform: scale(0.97) translateY(6px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
  @keyframes projectSlideIn {
    from { opacity: 0; transform: translateX(10px); }
    to   { opacity: 1; transform: translateX(0);    }
  }
`

export default function ProjectsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [animKey, setAnimKey] = useState(0)

  const toggle = (id: string) => {
    setExpandedId(prev => {
      if (prev === id) return null
      setAnimKey(k => k + 1)
      return id
    })
  }

  const expanded = projects.find(p => p.id === expandedId) ?? null
  const others = projects.filter(p => p.id !== expandedId)

  return (
    <div onClick={() => setExpandedId(null)}>
      <style>{expandKeyframes}</style>
      <p style={sectionHeadingStyle}>Projects</p>

      <div style={{ position: 'relative' }}>

        {/* ── Grid layout ───────────────────────────────────────────── */}
        <div style={{
          position: expandedId ? 'absolute' : 'relative',
          width: '100%',
          top: 0,
          opacity: expandedId ? 0 : 1,
          transition: 'opacity 0.18s ease',
          pointerEvents: expandedId ? 'none' : 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}>
          {projects.map(p => (
            <div
              key={p.id}
              onClick={(e) => { e.stopPropagation(); toggle(p.id) }}
              style={{
                border: `1px solid ${DS.border}`,
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.85rem',
                  color: DS.textPrimary,
                  letterSpacing: '0.05em',
                }}>
                  {p.title}
                </h3>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      ...monoSm,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      border: `1px solid ${DS.border}`,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '2px',
                      flexShrink: 0,
                      marginLeft: '0.75rem',
                    }}
                  >
                    View
                  </a>
                )}
              </div>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: DS.textMuted, flexGrow: 1 }}>
                {p.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {p.tech.map(t => (
                  <span key={t} style={{
                    ...monoSm,
                    border: `1px solid ${DS.border}`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '2px',
                  }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Expanded layout ───────────────────────────────────────── */}
        <div style={{
          position: !expandedId ? 'absolute' : 'relative',
          width: '100%',
          top: 0,
          opacity: !expandedId ? 0 : 1,
          transition: 'opacity 0.18s ease',
          pointerEvents: !expandedId ? 'none' : 'auto',
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-start',
        }}>

          {/* Left: image only */}
          {expanded && (
            <div
              key={`img-${animKey}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: '0 0 62%',
                border: `1px solid ${DS.textMuted}`,
                overflow: 'hidden',
                animation: 'projectExpand 0.28s ease-out',
              }}
            >
              {expanded.image ? (
                <img
                  src={expanded.image}
                  alt={expanded.title}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  background: DS.surface,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ ...monoSm, color: DS.textMuted }}>{expanded.title}</span>
                </div>
              )}
            </div>
          )}

          {/* Right: bio + other projects */}
          {expanded && (
            <div
              key={`info-${animKey}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                animation: 'projectSlideIn 0.3s ease-out',
              }}
            >
              {/* Title + link */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                <h3 style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.95rem',
                  color: DS.textPrimary,
                  letterSpacing: '0.05em',
                  lineHeight: 1.4,
                }}>
                  {expanded.title}
                </h3>
                {expanded.link && (
                  <a
                    href={expanded.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      ...monoSm,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      textDecoration: 'none',
                      border: `1px solid ${DS.border}`,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '2px',
                      flexShrink: 0,
                    }}
                  >
                    View
                  </a>
                )}
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: DS.textSecondary }}>
                {expanded.description}
              </p>

              {/* Tech tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {expanded.tech.map(t => (
                  <span key={t} style={{
                    ...monoSm,
                    border: `1px solid ${DS.border}`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '2px',
                  }}>{t}</span>
                ))}
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${DS.border}`, paddingTop: '1rem' }}>
                <p style={{ ...monoSm, color: DS.textMuted, marginBottom: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '0.55rem' }}>
                  Other Projects
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {others.map(p => (
                    <div
                      key={p.id}
                      onClick={(e) => { e.stopPropagation(); toggle(p.id) }}
                      style={{
                        padding: '0.5rem 0.6rem',
                        border: `1px solid transparent`,
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.2rem',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = DS.border)}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                    >
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.65rem',
                        color: DS.textSecondary,
                        letterSpacing: '0.04em',
                      }}>
                        {p.title}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: DS.textMuted, lineHeight: 1.5 }}>
                        {p.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
