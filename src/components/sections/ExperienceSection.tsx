import { useState } from 'react'
import { experienceEntries } from '../../data/content'
import { DS } from '../../styles/tokens'

// ── Shared label style (mirrors App.tsx) ────────────────────────────────────
const labelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.65rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: DS.textMuted,
  marginBottom: '0.5rem',
}

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

export default function ExperienceSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div>
      <p style={sectionHeadingStyle}>Experience</p>

      {/* Timeline container */}
      <div style={{ position: 'relative', paddingLeft: '2rem' }}>

        {/* Vertical line */}
        <div style={{
          position: 'absolute',
          left: '3px',
          top: 0,
          bottom: 0,
          width: '1px',
          background: DS.border,
        }} />

        {experienceEntries.map((entry, i) => {
          const isHovered = hoveredIndex === i
          const isLast = i === experienceEntries.length - 1

          return (
            <div
              key={entry.company + entry.period}
              style={{
                position: 'relative',
                paddingBottom: isLast ? 0 : '3rem',
                paddingLeft: '2rem',
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Dot node */}
              <div style={{
                position: 'absolute',
                left: '-1px',
                top: '0.35rem',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isHovered ? DS.textPrimary : DS.textMuted,
                transition: 'background 0.2s ease',
                flexShrink: 0,
              }} />

              {/* Period label + upcoming tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                <p style={{ ...labelStyle, marginBottom: 0 }}>{entry.period}</p>
                {entry.upcoming && (
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.55rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: DS.textMuted,
                    border: `1px solid ${DS.border}`,
                    padding: '0.1rem 0.35rem',
                    borderRadius: '2px',
                  }}>
                    upcoming
                  </span>
                )}
              </div>

              {/* Role title */}
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: DS.textPrimary,
                marginBottom: '0.25rem',
                lineHeight: 1.3,
              }}>
                {entry.role}
              </h3>

              {/* Company name */}
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                color: DS.textSecondary,
                letterSpacing: '0.1em',
                marginBottom: '0.75rem',
              }}>
                {entry.company}
              </p>

              {/* Description */}
              <p style={{
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: DS.textMuted,
                maxWidth: '680px',
              }}>
                {entry.description}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
