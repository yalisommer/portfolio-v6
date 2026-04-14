// ── Portfolio content data — single source of truth ───────────────────────
// All section data is exported from here. Components import from this file.

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
  ta: { course: string; code: string }
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

// ── Experience ─────────────────────────────────────────────────────────────

export const experienceEntries: ExperienceEntry[] = [
  {
    company: 'SMBC',
    role: 'Data Strategy Intern, AI Team',
    period: 'Summer 2026',
    description: "Incoming data strategy intern on SMBC's AI team. Working to rework internal systems to be AI-forward and integrate modern machine learning approaches across their data infrastructure.",
    upcoming: true,
  },
  {
    company: 'IturanTech',
    role: 'AI/ML Intern',
    period: 'Summer 2025',
    description: 'Honed an existing LSTM-based system to detect anomalies for vehicle theft detection across 1 million units. Researched and prototyped an LLM-based detection solution that was presented to the VP of Engineering and forwarded for further development after the internship concluded.',
  },
  {
    company: 'IturanTech',
    role: 'Data Science & Backend Intern',
    period: 'Spring 2025',
    description: "Built the data pipelines used in the subsequent summer role. Trained ML models on ship movement anomaly detection data (South China Sea) as preparation for the summer's confidential telematics work. Gained hands-on experience with large-scale streaming data and early anomaly-detection algorithms.",
  },
  {
    company: 'GenWell',
    role: 'Product Management Intern',
    period: 'Spring 2025',
    description: 'Worked directly with the CEO at an early-stage wellness AI startup to help shape product direction. Led user interviews and synthesized insights into user personas that informed key product decisions. Contributed to feature definition, MVP scoping, and UI/UX design to align the experience with user needs.',
  },
]

// ── Education ──────────────────────────────────────────────────────────────

export const educationData: EducationData = {
  university: 'Brown University',
  location: 'Providence, RI',
  years: '2023 \u2013 2027',
  degree: 'B.Sc. Mathematics & Computer Science',
  gpa: '3.94',
  ta: { course: 'Data Structures & Algorithms', code: 'CSCI 0200' },
  csCourses: [
    'CSCI 1430 Computer Vision',
    'CSCI 1470 Deep Learning',
    'CSCI 2240 Interactive Computer Graphics',
    'CSCI 1951X Formal Proof & Verification',
    'CSCI 0200 Data Structures & Algorithms',
    'CSCI 0330 Introduction to Computer Systems',
    'CSCI 0320 Software Engineering',
    'CSCI 0220 Discrete Mathematics',
  ],
  mathCourses: [
    'MATH 1530 Abstract Algebra',
    'MATH 1410 Topology',
    'MATH 1260 Complex Analysis',
    'APMA 1690 Computational Probability',
    'APMA 1660 Statistical Inference',
    'MATH 0520 Linear Algebra',
    'MATH 0200 Multivariable Calculus',
  ],
}

// ── Skills ─────────────────────────────────────────────────────────────────

export const skillGroups: SkillCategory[] = [
  { label: 'Languages', items: ['Python', 'TypeScript', 'C++', 'GLSL', 'Rust', 'SQL', 'Java'] },
  { label: 'Vision / Graphics', items: ['OpenCV', 'OpenGL', 'WebGL', 'CUDA', 'Three.js', 'Mitsuba 3', 'BlenderPy'] },
  { label: 'ML / AI', items: ['PyTorch', 'ONNX Runtime', 'YOLOv8', 'Hugging Face', 'scikit-learn', 'LSTMs'] },
  { label: 'Software Engineering', items: ['React', 'Node.js', 'Vite', 'Git', 'Docker', 'REST APIs', 'WebAssembly'] },
  { label: 'Data', items: ['PostgreSQL', 'Pandas', 'NumPy', 'Streaming Pipelines', 'AWS', 'Data Visualization'] },
  { label: 'Teamwork / Teaching', items: ['Technical Mentorship', 'User Research', 'Product Scoping', 'Code Review', 'TA Instruction'] },
]

// ── Projects ───────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: 'violencenet',
    title: 'ViolenceNet',
    tech: ['Python', 'PyTorch', 'Computer Vision'],
    description: '3D CNN-based violence detection for automated security and content moderation.',
    link: 'https://github.com/yalisommer/ViolenceNet',
    image: null,
  },
  {
    id: 'realtime-renderer',
    title: 'Realtime Renderer',
    tech: ['C++', 'OpenGL', 'GLSL'],
    description: 'Extensive OpenGL-based real-time renderer with screen-space DoF, real-time shadow mapping, and more.',
    link: null,
    image: null,
  },
  {
    id: 'raytracer',
    title: 'Raytracer',
    tech: ['C++', 'Ray Tracing', 'Acceleration Structures'],
    description: 'Phong-based C++ raytracer with multi-bounce rays and anti-aliasing.',
    link: null,
    image: null,
  },
  {
    id: 'alma-metrics',
    title: 'Alma Metrics',
    tech: ['TypeScript', 'React', 'Node.js', 'ML'],
    description: 'ML-based prediction of college admissions trends.',
    link: null,
    image: null,
  },
  {
    id: 'confection',
    title: 'Confection',
    tech: ['JavaScript', 'Formal Methods', 'Forge'],
    description: 'Cellular automata epidemiological simulation with formal methods (Forge) for discovering interesting emergent cases.',
    link: 'https://github.com/yalisommer/Confection?tab=readme-ov-file',
    image: null,
  },
]

// ── Research ───────────────────────────────────────────────────────────────

export const researchEntries: ResearchEntry[] = [
  {
    lab: 'Brown Visual Computing Lab',
    supervisor: 'Prof. James Tompkin & Joel Salzman (PhD)',
    title: 'Catacaustics: Neural Reconstruction of Caustic Light on Curved Surfaces',
    description: 'Studying rendering and inverse optimization of mirror-reflection scenes. Builds synthetic scenes in BlenderPy and Mitsuba 3 featuring planar and parabolic mirrors. Develops inverse methods in PyTorch that recover mirror geometry (parabolic coefficient) via finite-difference gradients and MS-SSIM loss. Analyzes optimization behavior and robustness across scene configurations. Broader goal: reconstruct 3D scenes where geometry is only visible indirectly through curved reflective surfaces.',
    image: '/images/bvc_cubes_gt.png',
    status: 'In Progress',
  },
  {
    lab: 'University of Edinburgh \u2014 Geometry Processing',
    supervisor: 'Prof. Amir Vaxman',
    title: 'DROK-Inspired Mesh Manipulation with Training-Time Constraints',
    description: 'Extended work inspired by the DROK (Data-Free Reduced Order Kinematics) paper. Trains low-dimensional kinematics representations with additional geometric constraints such as quad planarity and piecewise edge stretch conditions. Applies classical penalty methods and Lagrangian training approaches. End goal: an interactive tool for architects to manipulate meshes within a defined constraint-space rather than post-correcting unconstrained deformations.',
    image: null,
    status: 'Completed',
  },
]

// ── Contact ────────────────────────────────────────────────────────────────

export const contactLinks: ContactLink[] = [
  { label: 'Email', value: 'yali_sommer@brown.edu', href: 'mailto:yali_sommer@brown.edu' },
  { label: 'LinkedIn', value: 'linkedin.com/in/yalisommer', href: 'https://linkedin.com/in/yalisommer', external: true },
  { label: 'GitHub', value: 'github.com/yalisommer', href: 'https://github.com/yalisommer', external: true },
]
