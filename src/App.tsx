import { useState } from 'react'
import AquariumLanding from './components/AquariumLanding'

const SECTION_IDS = ['about', 'experience', 'education', 'skills', 'projects', 'research', 'contact'] as const

export default function App() {
  const [heroVisible, setHeroVisible] = useState(true)

  return (
    <>
      <AquariumLanding onHeroVisibility={setHeroVisible} heroVisible={heroVisible} />
      <div style={{ position: 'relative', zIndex: 10 }}>
        {SECTION_IDS.map((id, i) => (
          <section
            key={id}
            id={id}
            style={{
              minHeight: '100vh',
              background: i === 0
                ? 'linear-gradient(to bottom, transparent 0%, #000000 35vh)'
                : '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <h2 style={{
              fontSize: '2rem',
              color: 'rgba(255,255,255,0.55)',
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
