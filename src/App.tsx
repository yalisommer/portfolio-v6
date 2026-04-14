import { useState } from 'react'
import AquariumLanding from './components/AquariumLanding'
import Nav from './components/Nav'
import Section from './components/Section'
import MeshBackground from './components/MeshBackground'
import AboutSection from './components/sections/AboutSection'
import ExperienceSection from './components/sections/ExperienceSection'
import EducationSection from './components/sections/EducationSection'
import SkillsSection from './components/sections/SkillsSection'
import ProjectsSection from './components/sections/ProjectsSection'
import ResearchSection from './components/sections/ResearchSection'
import ContactSection from './components/sections/ContactSection'

const SECTIONS: { id: string; Content: () => React.ReactElement }[] = [
  { id: 'about',      Content: AboutSection },
  { id: 'experience', Content: ExperienceSection },
  { id: 'education',  Content: EducationSection },
  { id: 'skills',     Content: SkillsSection },
  { id: 'projects',   Content: ProjectsSection },
  { id: 'research',   Content: ResearchSection },
  { id: 'contact',    Content: ContactSection },
]

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [heroVisible, setHeroVisible] = useState(true)

  return (
    <>
      <Nav heroVisible={heroVisible} />
      <AquariumLanding onHeroVisibility={setHeroVisible} heroVisible={heroVisible} />
      <MeshBackground active={!heroVisible} />
      {/*
        paddingTop: '35vh' creates a transparent buffer above the first section.
        The gradient div covers this buffer — its transparent top reveals the fixed
        aquarium video (zIndex 0) behind the content zone (zIndex 10).
        MeshBackground is fixed at zIndex 5 — above aquarium, below content zone.
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
        {SECTIONS.map(({ id, Content }) => (
          <Section key={id} id={id}>
            <Content />
          </Section>
        ))}
      </div>
    </>
  )
}
