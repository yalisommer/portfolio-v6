import { DS } from '../../styles/tokens'
import '../../styles/motifs.css'

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

const linkStyle: React.CSSProperties = {
  color: DS.textSecondary,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
}

const focusTags = ['ML Engineering', 'Computer Vision', 'Computer Graphics', 'Visual Computing']

export default function AboutSection() {
  return (
    <div>
      <p style={sectionHeadingStyle}>About</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4rem', alignItems: 'start' }}>
        {/* Left column: photo placeholder + name + tags */}
        <div>
          {/* Photo placeholder with motif-corners border */}
          <div
            className="motif-corners"
            style={{
              aspectRatio: '3 / 4',
              background: DS.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem',
            }}
          >
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '0.15em',
              color: DS.textMuted,
              textTransform: 'uppercase',
            }}>
              Photo
            </span>
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
            Brown University &middot; Math &amp; CS &middot; Class of 2027
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {focusTags.map(tag => (
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

        {/* Right column: bio text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.75, color: DS.textSecondary }}>
            I build systems that see — computer vision pipelines, real-time ML inference, and
            graphics tooling. This site runs YOLOv8 fish detection live in your browser via
            WebAssembly at ~10 FPS on-device. No cloud, no server. That&#39;s what I care about:
            pushing compute to where the data lives.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: DS.textMuted }}>
            At{' '}
            <a href="#education" style={linkStyle}>Brown</a>
            {' '}I study the math behind learning systems and the geometry behind the images
            they process. My{' '}
            <a href="#experience" style={linkStyle}>experience</a>
            {' '}spans ML engineering, data science, and product — from anomaly detection on
            1M+ telematics units at IturanTech to shaping product direction at an early-stage AI startup.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: DS.textMuted }}>
            Outside of industry work I do{' '}
            <a href="#research" style={linkStyle}>research</a>
            {' '}in computer vision and geometry processing —
            currently studying caustic light reconstruction on curved surfaces with the
            Brown Visual Computing Lab. I also build{' '}
            <a href="#projects" style={linkStyle}>projects</a>
            {' '}ranging from real-time OpenGL renderers in C++ to 3D CNN-based violence
            detection systems.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.75, color: DS.textMuted }}>
            I&#39;m selective about what I work on — I want to build things that are technically
            interesting and actually used. Check out my{' '}
            <a href="#skills" style={linkStyle}>skills</a>
            {' '}or reach out via the{' '}
            <a href="#contact" style={linkStyle}>contact</a>
            {' '}section below.
          </p>
        </div>
      </div>
    </div>
  )
}
