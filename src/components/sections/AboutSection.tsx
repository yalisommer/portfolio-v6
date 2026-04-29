import { DS } from '../../styles/tokens'
import '../../styles/motifs.css'
import { aboutBio, aboutTagline, aboutFocusTags } from '../../data/content'

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


export default function AboutSection() {
  return (
    <div>
      <p style={sectionHeadingStyle}>About</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'start' }}>
        {/* Left column: photo placeholder + name + tags */}
        <div>
          {/* About photo with motif-corners border */}
          <div
            className="motif-corners"
            style={{
              aspectRatio: '3 / 4',
              marginBottom: '2rem',
              overflow: 'hidden',
            }}
          >
            <img
              src="/images/yali.png"
              alt="Yali Sommer"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.1,
            color: DS.textPrimary,
            marginBottom: '1rem',
          }}>
            Yali Sommer
          </h2>
          <p style={{ ...labelStyle, marginBottom: '1.5rem' }}>
            {aboutTagline}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {aboutFocusTags.map(tag => (
              <span key={tag} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                color: DS.textSecondary,
                border: `1px solid ${DS.border}`,
                borderRadius: '2px',
                padding: '0.25rem 0.6rem',
                display: 'inline-block',
                width: 'fit-content',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right column: bio text — sourced from content.md */}
        <div className="about-bio" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {aboutBio.map((html, i) => (
            <p
              key={i}
              style={{
                fontSize: i === 0 ? '1.1rem' : '1rem',
                lineHeight: 1.75,
                color: i === 0 ? DS.textSecondary : DS.textMuted,
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
