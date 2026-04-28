import { useState } from 'react'
import { projects } from '../../data/content'
import { DS } from '../../styles/tokens'

// ── Shared styles (mirrors App.tsx) ─────────────────────────────────────────
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

export default function ProjectsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id)

  return (
    // Click outside collapses expanded card
    <div onClick={() => setExpandedId(null)}>
      <p style={sectionHeadingStyle}>Projects</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1.5rem',
      }}>
        {projects.map(p => {
          const isExpanded = expandedId === p.id

          return (
            <div
              key={p.id}
              onClick={(e) => { e.stopPropagation(); toggle(p.id) }}
              style={{
                border: `1px solid ${isExpanded ? DS.textMuted : DS.border}`,
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Expandable image region */}
              <div style={{
                maxHeight: isExpanded ? '800px' : '0px',
                overflow: 'hidden',
                transition: 'max-height 0.4s ease-in-out',
              }}>
                <div
                  className="motif-corners"
                  style={{
                    width: '100%',
                    background: DS.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                  }}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  ) : (
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.7rem',
                      color: DS.textMuted,
                      letterSpacing: '0.1em',
                      padding: '2rem',
                    }}>
                      {p.title}
                    </span>
                  )}
                </div>
              </div>

              {/* Title + link */}
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
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: DS.textSecondary,
                      textDecoration: 'none',
                      border: `1px solid ${DS.border}`,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '2px',
                      flexShrink: 0,
                      marginLeft: '0.75rem',
                      transition: 'color 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    View
                  </a>
                )}
              </div>

              {/* Description */}
              <p style={{
                fontSize: '0.875rem',
                lineHeight: 1.65,
                color: DS.textMuted,
                flexGrow: 1,
              }}>
                {p.description}
              </p>

              {/* Tech tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto' }}>
                {p.tech.map(t => (
                  <span key={t} style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.6rem',
                    letterSpacing: '0.08em',
                    color: DS.textSecondary,
                    border: `1px solid ${DS.border}`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '2px',
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
