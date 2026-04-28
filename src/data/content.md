---
# ──────────────────────────────────────────────────────────────────────────────
# Portfolio Content — edit this file to update all text on the site.
#
# Syntax notes:
#   >-   Folded block: newlines become spaces (use for paragraph text)
#   |    Literal block: preserves newlines (use for terminal/preformatted text)
#   HTML inline tags (<a href="...">, <strong>, etc.) work inside bio strings
# ──────────────────────────────────────────────────────────────────────────────

# ── About ─────────────────────────────────────────────────────────────────────
about:
  # First paragraph gets slightly larger, lighter treatment (lead paragraph)
  # Remaining paragraphs are secondary text
  # HTML links using href="#section-id" create smooth-scroll navigation
  bio:
    - >-
      I build systems that see — computer vision pipelines, real-time ML inference, and
      graphics tooling. This site runs YOLOv8 fish detection live in your browser via
      WebAssembly at ~10 FPS on-device. No cloud, no server. That's what I care about:
      pushing compute to where the data lives.
    - >-
      At <a href="#education">Brown</a> I study the math behind learning systems and the
      geometry behind the images they process. My
      <a href="#experience">experience</a> spans ML engineering, data science, and product
      — from anomaly detection on 1M+ telematics units at IturanTech to shaping product
      direction at an early-stage AI startup.
    - >-
      Outside of industry work I do <a href="#research">research</a> in computer vision
      and geometry processing — currently studying caustic light reconstruction on curved
      surfaces with the Brown Visual Computing Lab. I also build
      <a href="#projects">projects</a> ranging from real-time OpenGL renderers in C++ to
      3D CNN-based violence detection systems.
    - >-
      I'm selective about what I work on — I want to build things that are technically
      interesting and actually used. Check out my <a href="#skills">skills</a> or reach
      out via the <a href="#contact">contact</a> section below.

# ── Experience ────────────────────────────────────────────────────────────────
experience:
  - company: SMBC
    role: "Data Strategy Intern, AI Team"
    period: Summer 2026
    upcoming: true
    description: >-
      Incoming data strategy intern on SMBC's AI team. Working to rework internal systems
      to be AI-forward and integrate modern machine learning approaches across their data
      infrastructure.

  - company: IturanTech
    role: AI/ML Intern
    period: Summer 2025
    description: >-
      Honed an existing LSTM-based system to detect anomalies for vehicle theft detection
      across 1 million units. Researched and prototyped an LLM-based detection solution
      that was presented to the VP of Engineering and forwarded for further development
      after the internship concluded.

  - company: IturanTech
    role: Data Science & Backend Intern
    period: Spring 2025
    description: >-
      Built the data pipelines used in the subsequent summer role. Trained ML models on
      ship movement anomaly detection data (South China Sea) as preparation for the
      summer's confidential telematics work. Gained hands-on experience with large-scale
      streaming data and early anomaly-detection algorithms.

  - company: GenWell
    role: Product Management Intern
    period: Spring 2025
    description: >-
      Worked directly with the CEO at an early-stage wellness AI startup to help shape
      product direction. Led user interviews and synthesized insights into user personas
      that informed key product decisions. Contributed to feature definition, MVP scoping,
      and UI/UX design to align the experience with user needs.

# ── Education ─────────────────────────────────────────────────────────────────
education:
  university: Brown University
  location: "Providence, RI"
  years: "2023 – 2027"
  degree: B.Sc. Mathematics – Computer Science
  gpa: "3.94"
  tas:
    - course: Data Structures & Algorithms
      code: CSCI 0200
    - course: Introduction to Computer Graphics
      code: CSCI 1230
  csCourses:
    - CSCI 0150 Object Oriented Programming
    - CSCI 0200 Data Structures & Algorithms
    - CSCI 0320 Software Engineering
    - CSCI 0330 Introduction to Computer Systems
    - CSCI 1230 Introduction to Computer Graphics
    - CSCI 1430 Computer Vision
    - CSCI 1710 Logic For Systems
    - CSCI 1951A Data Science
    - INFR 11241 Computer Graphics- Geometry and Simulation


  mathCourses:
    - MATH 0180 Multivariable Calculus
    - MATH 0520 Linear Algebra
    - APMA 0350 Applied Ordinary Differential Equations
    - MATH 0420 Introduction to Number Theory
    - MATH 1460 Complex Analysis
    - MATH 1530 Abstract Algebra
    - APMA 1650 Statistical Inference
    - Math 10071 Number Theory

# ── Skills ────────────────────────────────────────────────────────────────────
skills:
  - label: Languages
    items: [Python, C++, C, TypeScript, JavaScript, GLSL, SQL, Java]

  - label: Vision / Graphics
    items: [OpenCV, OpenGL, WebGL, CUDA, Three.js, Mitsuba 3, BlenderPy]

  - label: ML / AI
    items: [PyTorch, YOLO, Hugging Face, scikit-learn, LSTMs, LLM Integration]

  - label: Software Engineering
    items: [React, Vite, Git, Docker, REST APIs, Figma Prototyping]

  - label: Data
    items: [PostgreSQL, Pandas, NumPy, Streaming Pipelines, Data Visualization]

  - label: Teamwork / Teaching
    items: [Technical Mentorship, User Research, Product Scoping, Code Review, TA Instruction]

# ── Projects ──────────────────────────────────────────────────────────────────
projects:
  - id: violencenet
    title: ViolenceNet
    tech: [Python, PyTorch, Computer Vision]
    description: 3D CNN-based violence detection for automated security and content moderation.
    link: https://github.com/yalisommer/ViolenceNet
    image: /images/vnet.jpg

  - id: realtime-renderer
    title: Realtime Renderer
    tech: [C++, OpenGL, GLSL]
    description: >-
      Extensive OpenGL-based real-time renderer with screen-space DoF, real-time
      shadow mapping, and more.
    link: null
    image: /images/realtime.png

  - id: raytracer
    title: Raytracer
    tech: [C++, Ray Tracing, Acceleration Structures]
    description: Phong-based C++ raytracer with multi-bounce rays and anti-aliasing.
    link: null
    image: /images/raytrace.png

  - id: alma-metrics
    title: Alma Metrics
    tech: [TypeScript, React, Node.js, ML]
    description: ML-based prediction of college admissions trends.
    link: null
    image: /images/alma-metrics.jpg

  - id: confection
    title: Confection
    tech: [JavaScript, Formal Methods, Forge]
    description: >-
      Cellular automata epidemiological simulation with formal methods (Forge) for
      discovering interesting emergent cases.
    link: "https://github.com/yalisommer/Confection?tab=readme-ov-file"
    image: /images/confec.png

# ── Research ──────────────────────────────────────────────────────────────────
research:
  - lab: Brown Visual Computing Lab
    supervisor: Prof. James Tompkin & Joel Salzman (PhD)
    title: "Catacaustics: Neural Reconstruction of Caustic Light on Curved Surfaces"
    description: >-
      Studying rendering and inverse optimization of mirror-reflection scenes. Builds
      synthetic scenes in BlenderPy and Mitsuba 3 featuring planar and parabolic mirrors.
      Develops inverse methods in PyTorch that recover mirror geometry (parabolic
      coefficient) via finite-difference gradients and MS-SSIM loss. Analyzes optimization
      behavior and robustness across scene configurations. Broader goal: reconstruct 3D
      scenes where geometry is only visible indirectly through curved reflective surfaces.
    image: /images/bvc_cubes_gt.png
    status: In Progress

  - lab: "University of Edinburgh — Geometry Processing"
    supervisor: Prof. Amir Vaxman
    title: DROK-Inspired Mesh Manipulation with Training-Time Constraints
    description: >-
      Extended work inspired by the DROK (Data-Free Reduced Order Kinematics) paper.
      Trains low-dimensional kinematics representations with additional geometric
      constraints such as quad planarity and piecewise edge stretch conditions. Applies
      classical penalty methods and Lagrangian training approaches. End goal: an
      interactive tool for architects to manipulate meshes within a defined
      constraint-space rather than post-correcting unconstrained deformations.
    image: null
    status: Completed

# ── Contact ───────────────────────────────────────────────────────────────────
contact:
  intro: >-
    Open to opportunities in ML engineering and computer vision research.
    Happy to chat about graphics, systems, or building things that run fast.
  terminal:
    whoami: Yali Sommer
    location: "Providence, RI"
    school: Brown University
    status: Open to work — Summer 2026
    interests: Computer Vision, Machine Learning, Graphics
    focus: ML Engineering · Computer Vision · Computer Graphics
  links:
    - label: Email
      value: yali_sommer@brown.edu
      href: "mailto:yali_sommer@brown.edu"
    - label: LinkedIn
      value: linkedin.com/in/yalisommer
      href: https://linkedin.com/in/yalisommer
      external: true
    - label: GitHub
      value: github.com/yalisommer
      href: https://github.com/yalisommer
      external: true
---
