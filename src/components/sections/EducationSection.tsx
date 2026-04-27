import { DS } from '../../styles/tokens'
import { educationData } from '../../data/content'

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

const courseItemStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.7rem',
  color: DS.textSecondary,
  letterSpacing: '0.05em',
  padding: '0.4rem 0',
  borderBottom: `1px solid ${DS.border}`,
}

export default function EducationSection() {
  return (
    <div>
      <p style={sectionHeadingStyle}>Education</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
        {/* Left column: university info */}
        <div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: DS.textPrimary,
            marginBottom: '0.5rem',
          }}>
            {educationData.university}
          </h3>
          <p style={{ ...labelStyle, marginBottom: '1rem' }}>
            {educationData.location} &middot; {educationData.years}
          </p>
          <p style={{
            fontSize: '1rem',
            color: DS.textSecondary,
            lineHeight: 1.6,
            marginBottom: '0.75rem',
          }}>
            {educationData.degree}
          </p>
          <p style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: DS.textPrimary,
            marginBottom: '1.5rem',
          }}>
            GPA: {educationData.gpa}
          </p>

          {/* TA badge */}
          <div style={{
            border: `1px solid ${DS.border}`,
            borderRadius: '2px',
            padding: '0.75rem 1rem',
          }}>
            <p style={{ ...labelStyle, marginBottom: '0.25rem' }}>Teaching Assistant</p>
            {educationData.tas.map((ta) => (
              <p key={ta.code} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.75rem',
                color: DS.textSecondary,
                letterSpacing: '0.05em',
                marginBottom: '0.1rem',
              }}>
                {ta.code} &mdash; {ta.course}
              </p>
            ))}
          </div>
        </div>

        {/* Right column: coursework split into CS and Math */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ ...labelStyle, marginBottom: '1rem' }}>Computer Science</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {educationData.csCourses.map(course => (
                  <div key={course} style={courseItemStyle}>
                    {course}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p style={{ ...labelStyle, marginBottom: '1rem' }}>Mathematics</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {educationData.mathCourses.map(course => (
                  <div key={course} style={courseItemStyle}>
                    {course}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
