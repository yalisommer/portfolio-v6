import { useState } from 'react'
import AquariumLanding from './components/AquariumLanding'

const SECTION_IDS = ['about', 'experience', 'education', 'skills', 'projects', 'research', 'contact'] as const

export default function App() {
  const [heroVisible, setHeroVisible] = useState(true)

  return (
    <>
      <AquariumLanding onHeroVisibility={setHeroVisible} heroVisible={heroVisible} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '30vh',
          background: 'linear-gradient(to bottom, transparent, #000000)',
          pointerEvents: 'none',
          zIndex: 1,
        }} />
        {SECTION_IDS.map(id => (
          <section
            key={id}
            id={id}
            style={{
              minHeight: '100vh',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <h2 style={{
              fontSize: '2rem',
              color: 'rgba(255,255,255,0.15)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}>
              {id}
            </h2>
          </section>
        ))}
      </div>
    </>
  )
}
