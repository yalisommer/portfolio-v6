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

function TechTags({ tech }: { tech: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
      {tech.map(t => (
        <span key={t} style={{
          ...monoSm,
          border: `1px solid ${DS.border}`,
          padding: '0.2rem 0.5rem',
          borderRadius: '2px',
        }}>{t}</span>
      ))}
    </div>
  )
}

export default function ProjectsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id)

  const expanded = projects.find(p => p.id === expandedId) ?? null
  const others = projects.filter(p => p.id !== expandedId)

  return (
    <div onClick={() => setExpandedId(null)}>
      <p style={sectionHeadingStyle}>Projects</p>

      {/* Both layouts are always rendered; opacity crossfade between them */}
      <div style={{ position: 'relative' }}>

        {/* ── Grid layout ───────────────────────────────────────────── */}
        <div style={{
          position: expandedId ? 'absolute' : 'relative',
          width: '100%',
          top: 0,
          opacity: expandedId ? 0 : 1,
          transition: 'opacity 0.2s ease',
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
              <TechTags tech={p.tech} />
            </div>
          ))}
        </div>

        {/* ── Expanded layout ───────────────────────────────────────── */}
        <div style={{
          position: !expandedId ? 'absolute' : 'relative',
          width: '100%',
          top: 0,
          opacity: !expandedId ? 0 : 1,
          transition: 'opacity 0.2s ease',
          pointerEvents: !expandedId ? 'none' : 'auto',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-start',
        }}>
          {/* Featured card */}
          {expanded && (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: '0 0 72%',
                border: `1px solid ${DS.textMuted}`,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {expanded.image && (
                <div className="motif-corners" style={{ overflow: 'hidden' }}>
                  <img
                    src={expanded.image}
                    alt={expanded.title}
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.95rem',
                  color: DS.textPrimary,
                  letterSpacing: '0.05em',
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
                      marginLeft: '0.75rem',
                    }}
                  >
                    View
                  </a>
                )}
              </div>

              <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: DS.textMuted }}>
                {expanded.description}
              </p>

              <TechTags tech={expanded.tech} />
            </div>
          )}

          {/* Side column — compact cards, no images */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {others.map(p => (
              <div
                key={p.id}
                onClick={(e) => { e.stopPropagation(); toggle(p.id) }}
                style={{
                  border: `1px solid ${DS.border}`,
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.7rem',
                  color: DS.textSecondary,
                  letterSpacing: '0.05em',
                }}>
                  {p.title}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {p.tech.map(t => (
                    <span key={t} style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.55rem',
                      letterSpacing: '0.06em',
                      color: DS.textMuted,
                      border: `1px solid ${DS.border}`,
                      padding: '0.15rem 0.4rem',
                      borderRadius: '2px',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
