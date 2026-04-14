import { researchEntries } from '../../data/content'
import { DS } from '../../styles/tokens'

// ── Shared styles (mirrors App.tsx) ─────────────────────────────────────────
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

export default function ResearchSection() {
  return (
    <div>
      <p style={sectionHeadingStyle}>Research</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {researchEntries.map((entry, i) => (
          <div
            key={entry.title}
            style={{
              border: `1px solid ${DS.border}`,
              padding: '2.5rem',
              display: 'grid',
              gridTemplateColumns: '1fr 280px',
              gap: '2.5rem',
              alignItems: 'start',
              ...(i < researchEntries.length - 1 ? {} : {}),
            }}
          >
            {/* Left: metadata + description */}
            <div>
              {/* Lab name */}
              <p style={{ ...labelStyle, marginBottom: '0.25rem' }}>{entry.lab}</p>

              {/* Advisor line */}
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                color: DS.textSecondary,
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}>
                Advisor: {entry.supervisor}
              </p>

              {/* Status badge */}
              <span style={{
                display: 'inline-block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.55rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: DS.textMuted,
                border: `1px solid ${DS.border}`,
                padding: '0.15rem 0.5rem',
                borderRadius: '2px',
                marginBottom: '1.25rem',
              }}>
                {entry.status}
              </span>

              {/* Research title */}
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: DS.textPrimary,
                lineHeight: 1.35,
                marginBottom: '1rem',
              }}>
                {entry.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '0.9rem',
                lineHeight: 1.7,
                color: DS.textMuted,
              }}>
                {entry.description}
              </p>
            </div>

            {/* Right: image or placeholder */}
            <div>
              {entry.image ? (
                <img
                  src={entry.image}
                  alt={`${entry.title} visualization`}
                  style={{
                    width: '100%',
                    borderRadius: '2px',
                    border: `1px solid ${DS.border}`,
                    display: 'block',
                  }}
                />
              ) : (
                <div
                  className="motif-corners"
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    background: DS.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.65rem',
                    color: DS.textMuted,
                    letterSpacing: '0.1em',
                  }}>
                    Visual Pending
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
