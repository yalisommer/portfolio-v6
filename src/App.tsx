import { useState, useEffect, useRef } from 'react'
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
  const heroVisibleRef = useRef(true)

  useEffect(() => {
    function handleScroll() {
      const sv = window.scrollY
      const vh = window.innerHeight
      const next = sv < vh
      if (next !== heroVisibleRef.current) {
        heroVisibleRef.current = next
        setHeroVisible(next)
      }
      // Backdrop rises from translateY(vh) at scrollY=0 to translateY(0) at scrollY=vh.
      // Nav shares the same variable so it rides the top edge of the rising backdrop.
      // Gradient stop: soft edge while rising, solid black when fully risen.
      document.documentElement.style.setProperty('--backdrop-translate', Math.max(0, vh - sv) + 'px')
      document.documentElement.style.setProperty('--backdrop-stop', sv >= vh ? '0%' : '20%')
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <AquariumLanding heroVisible={heroVisible} />

      {/*
        Backdrop: position fixed, rises from below the viewport as the user scrolls.
        translateY goes from 100vh (fully hidden below) to 0 (covering the full screen).
        Gradient at the top edge softens the wipe; collapses to solid black when fully risen.
        zIndex 4: above hero text (3), below mesh zone (5).
      */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4,
        background: 'linear-gradient(to bottom, transparent 0%, #000 var(--backdrop-stop, 20%), #000 100%)',
        transform: 'translateY(var(--backdrop-translate, 100vh))',
        pointerEvents: 'none',
      }} />

      <Nav heroVisible={heroVisible} />

      {/* Mesh canvas: position fixed, zIndex 5 — above backdrop (4), below sections (10).
          Sections are transparent so the mesh shows through. Hidden during hero via opacity. */}
      <MeshBackground active={!heroVisible} />

      {/* 10vh gap: brief transition after the hero before sections begin */}
      <div style={{ height: '10vh' }} />

      {/* Sections at global zIndex 10 — above canvas (5), transparent backgrounds. */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {SECTIONS.map(({ id, Content }) => (
          <Section key={id} id={id}>
            <Content />
          </Section>
        ))}
      </div>
    </>
  )
}
