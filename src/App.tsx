import { useState } from 'react'
import AquariumLanding from './components/AquariumLanding'
import Nav from './components/Nav'
import Section from './components/Section'
import AboutSection from './components/sections/AboutSection'
import EducationSection from './components/sections/EducationSection'
import SkillsSection from './components/sections/SkillsSection'
import ContactSection from './components/sections/ContactSection'
import { DS } from './styles/tokens'

const SECTION_IDS = ['about', 'experience', 'education', 'skills', 'projects', 'research', 'contact'] as const

// ── Shared label style (JetBrains Mono, uppercase, muted) ──────────────────
const labelStyle: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: '0.65rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: DS.textMuted,
  marginBottom: '0.5rem',
}

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

// ── EXPERIENCE ─────────────────────────────────────────────────────────────
// Stub — replaced in Phase 03-02
interface Job {
  company: string
  role: string
  period: string
  bullets: string[]
}

const jobs: Job[] = [
  {
    company: 'SMBC',
    role: 'Data Strategy Intern, AI Team',
    period: 'Summer 2026',
    bullets: [
      'Incoming data strategy intern on SMBC\'s AI team',
      'Working to rework internal systems to be AI-forward',
    ],
  },
  {
    company: 'IturanTech',
    role: 'AI/ML Intern',
    period: 'Summer 2025',
    bullets: [
      'Honed an existing LSTM-based system to detect anomalies for vehicle theft detection across 1 million units',
      'Researched and prototyped an LLM-based detection solution presented to the VP of Engineering',
    ],
  },
]

function ExperienceContent() {
  return (
    <div>
      <p style={sectionHeadingStyle}>Experience</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {jobs.map(job => (
          <div key={job.company + job.period} style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
            <div>
              <p style={{ ...labelStyle, marginBottom: '0.25rem' }}>{job.period}</p>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: DS.textPrimary, marginBottom: '0.25rem' }}>
                {job.role}
              </h3>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: DS.textSecondary, letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                {job.company}
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {job.bullets.map((b, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.95rem', lineHeight: 1.6, color: DS.textMuted }}>
                    <span style={{ color: DS.border, flexShrink: 0, marginTop: '0.15rem' }}>—</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PROJECTS ───────────────────────────────────────────────────────────────
// Stub — replaced in Phase 03-03
interface StubProject {
  name: string
  description: string
  tech: string[]
  year: string
}

const stubProjects: StubProject[] = [
  {
    name: 'ViolenceNet',
    description: '3D CNN-based violence detection for automated security and content moderation.',
    tech: ['Python', 'PyTorch', 'Computer Vision'],
    year: '2025',
  },
  {
    name: 'Realtime Renderer',
    description: 'Extensive OpenGL-based real-time renderer with screen-space DoF, real-time shadow mapping, and more.',
    tech: ['C++', 'OpenGL', 'GLSL'],
    year: '2025',
  },
  {
    name: 'Confection',
    description: 'Cellular automata epidemiological simulation with formal methods (Forge) for discovering interesting emergent cases.',
    tech: ['JavaScript', 'Formal Methods', 'Forge'],
    year: '2024',
  },
]

function ProjectsContent() {
  return (
    <div>
      <p style={sectionHeadingStyle}>Projects</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {stubProjects.map(p => (
          <div key={p.name} style={{
            border: `1px solid ${DS.border}`,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem', color: DS.textPrimary, letterSpacing: '0.05em' }}>
                {p.name}
              </h3>
              <span style={{ ...labelStyle, marginBottom: 0 }}>{p.year}</span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: DS.textMuted, flexGrow: 1 }}>
              {p.description}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto' }}>
              {p.tech.map(t => (
                <span key={t} style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.6rem',
                  letterSpacing: '0.08em',
                  color: DS.textSecondary,
                  border: `1px solid ${DS.border}`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '2px',
                }}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── RESEARCH ───────────────────────────────────────────────────────────────
// Stub — replaced in Phase 03-03
function ResearchContent() {
  return (
    <div>
      <p style={sectionHeadingStyle}>Research</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: '0.25rem' }}>In Progress · 2026</p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: DS.border }}>
              Brown Visual Computing Lab
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: DS.textPrimary, lineHeight: 1.4, marginBottom: '0.75rem' }}>
              Catacaustics: Neural Reconstruction of Caustic Light on Curved Surfaces
            </h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: DS.textMuted }}>
              Studying rendering and inverse optimization of mirror-reflection scenes. Builds synthetic
              scenes in BlenderPy and Mitsuba 3 featuring planar and parabolic mirrors.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Section content map ────────────────────────────────────────────────────
function SectionContent({ id }: { id: typeof SECTION_IDS[number] }) {
  switch (id) {
    case 'about':      return <AboutSection />
    case 'experience': return <ExperienceContent />
    case 'education':  return <EducationSection />
    case 'skills':     return <SkillsSection />
    case 'projects':   return <ProjectsContent />
    case 'research':   return <ResearchContent />
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
