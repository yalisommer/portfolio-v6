import { useState } from 'react'
import AquariumLanding from './components/AquariumLanding'
import Section from './components/Section'

const SECTION_IDS = ['about', 'experience', 'education', 'skills', 'projects', 'research', 'contact'] as const

const gradientStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '35vh',
  background: 'linear-gradient(to bottom, transparent 0%, #000000 100%)',
  zIndex: 1,
  pointerEvents: 'none',
}

const headingStyle: React.CSSProperties = {
  fontSize: '2rem',
  color: 'var(--ds-text-secondary)',
  fontFamily: "'JetBrains Mono', monospace",
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
}

export default function App() {
  const [heroVisible, setHeroVisible] = useState(true)

  return (
    <>
      <AquariumLanding onHeroVisibility={setHeroVisible} heroVisible={heroVisible} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={gradientStyle} />
        {SECTION_IDS.map((id) => (
          <Section key={id} id={id}>
            <h2 style={headingStyle}>
              {id}
            </h2>
          </Section>
        ))}
      </div>
    </>
  )
}
