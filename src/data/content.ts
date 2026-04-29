// ── Portfolio content — parsed from content.md ─────────────────────────────
// Edit src/data/content.md to update all portfolio text. No code changes needed.

import { load } from 'js-yaml'
import raw from './content.md?raw'

// Strip --- frontmatter delimiters and parse the YAML block
const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
const data = (match ? load(match[1]) : {}) as Record<string, unknown>

// ── Type definitions ───────────────────────────────────────────────────────

export interface ExperienceEntry {
  company: string
  role: string
  period: string
  description: string
  upcoming?: boolean
}

export interface EducationData {
  university: string
  location: string
  years: string
  degree: string
  gpa: string
  tas: { course: string; code: string }[]
  csCourses: string[]
  mathCourses: string[]
}

export interface SkillCategory {
  label: string
  items: string[]
}

export interface Project {
  id: string
  title: string
  tech: string[]
  description: string
  link: string | null
  image: string | null
}

export interface ResearchEntry {
  lab: string
  supervisor: string
  title: string
  description: string
  image: string | null
  status: string
}

export interface ContactLink {
  label: string
  value: string
  href: string
  external?: boolean
}

export interface ContactTerminal {
  whoami: string
  location: string
  school: string
  status: string
  interests: string
  focus: string
}

// ── Exports (sourced from content.md frontmatter) ─────────────────────────

const about = data.about as Record<string, unknown>
const contact = data.contact as Record<string, unknown>

/** HTML strings — may contain inline <a> tags for section links */
export const aboutBio = about.bio as string[]

export const aboutTagline = about.tagline as string

export const aboutFocusTags = about.focusTags as string[]

export const experienceEntries = data.experience as ExperienceEntry[]

export const educationData = data.education as EducationData

export const skillGroups = data.skills as SkillCategory[]

export const projects = data.projects as Project[]

export const researchEntries = data.research as ResearchEntry[]

export const contactLinks = contact.links as ContactLink[]

export const contactIntro = contact.intro as string

export const contactTerminal = contact.terminal as ContactTerminal
