import { DS } from '../../styles/tokens'
import { contactLinks, contactIntro, contactTerminal } from '../../data/content'

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

const labelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.65rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: DS.textMuted,
  marginBottom: '0.5rem',
}

export default function ContactSection() {
  return (
    <div>
      <p style={sectionHeadingStyle}>Contact</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
        {/* Left column: intro + contact links */}
        <div>
          <p style={{
            fontSize: '1.1rem',
            lineHeight: 1.75,
            color: DS.textSecondary,
            marginBottom: '2rem',
          }}>
            {contactIntro}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {contactLinks.map(link => (
              <div
                key={link.label}
                style={{
                  display: 'flex',
                  gap: '2rem',
                  alignItems: 'baseline',
                  borderBottom: `1px solid ${DS.border}`,
                  paddingBottom: '1rem',
                }}
              >
                <span style={{ ...labelStyle, marginBottom: 0, width: '80px', flexShrink: 0 }}>
                  {link.label}
                </span>
                <a
                  href={link.href}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.8rem',
                    color: DS.textSecondary,
                    textDecoration: 'none',
                    letterSpacing: '0.05em',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = DS.textPrimary)}
                  onMouseLeave={e => (e.currentTarget.style.color = DS.textSecondary)}
                >
                  {link.value}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: info block — sourced from content.md */}
        <div style={{
          color: DS.textMuted,
          fontSize: '0.8rem',
          lineHeight: 1.8,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <p style={{ color: DS.textSecondary }}>{contactTerminal.whoami}</p>
          <p>location: {contactTerminal.location}</p>
          <p>school: {contactTerminal.school}</p>
          <p>status: {contactTerminal.status}</p>
          <p>interests: {contactTerminal.interests}</p>
          <p style={{ marginTop: '1rem' }}>{contactTerminal.focus}</p>
        </div>
      </div>
    </div>
  )
}
