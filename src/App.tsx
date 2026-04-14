import { useState } from 'react'
import AquariumLanding from './components/AquariumLanding'
import Nav from './components/Nav'
import Section from './components/Section'
import AboutSection from './components/sections/AboutSection'
import EducationSection from './components/sections/EducationSection'
import SkillsSection from './components/sections/SkillsSection'
import ContactSection from './components/sections/ContactSection'
import ExperienceSection from './components/sections/ExperienceSection'
import ProjectsSection from './components/sections/ProjectsSection'
import ResearchSection from './components/sections/ResearchSection'
const SECTION_IDS = ['about', 'experience', 'education', 'skills', 'projects', 'research', 'contact'] as const

// ── Section content map ────────────────────────────────────────────────────
function SectionContent({ id }: { id: typeof SECTION_IDS[number] }) {
  switch (id) {
    case 'about':      return <AboutSection />
    case 'experience': return <ExperienceSection />
    case 'education':  return <EducationSection />
    case 'skills':     return <SkillsSection />
    case 'projects':   return <ProjectsSection />
    case 'research':   return <ResearchSection />
    case 'contact':    return <ContactSection />
  }
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [heroVisible, setHeroVisible] = useState(true)

  return (
    <>
      <Nav heroVisible={heroVisible} />
      <AquariumLanding onHeroVisibility={setHeroVisible} heroVisible={heroVisible} />
      {/*
        paddingTop: '35vh' creates a transparent buffer above the first section.
        The gradient div covers this buffer — its transparent top reveals the fixed
        aquarium video (zIndex 0) behind the content zone (zIndex 10).
      */}
      <div style={{ position: 'relative', zIndex: 10, paddingTop: '35vh' }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '35vh',
          background: 'linear-gradient(to bottom, transparent 0%, #000000 100%)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />
        {SECTION_IDS.map((id) => (
          <Section key={id} id={id}>
            <SectionContent id={id} />
          </Section>
        ))}
      </div>
    </>
  )
}
