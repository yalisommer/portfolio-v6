import { DS } from '../../styles/tokens'
import { skillGroups } from '../../data/content'

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

export default function SkillsSection() {
  return (
    <div>
      <p style={sectionHeadingStyle}>Skills</p>
      {/* 3 columns x 2 rows = 6 categories */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem' }}>
        {skillGroups.map(group => (
          <div key={group.label}>
            <p style={{ ...labelStyle, marginBottom: '1rem' }}>{group.label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {group.items.map(item => (
                <span key={item} style={{
                  fontSize: '0.9rem',
                  color: DS.textSecondary,
                  padding: '0.35rem 0',
                  borderBottom: `1px solid ${DS.border}`,
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
