import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

// ── Constants ──────────────────────────────────────────────────────────────
const FPS_CAP = 1000 / 60

// ROYGBV — one color per mesh instance
const MESH_COLORS = [
  new THREE.Color(1.00, 0.15, 0.15),  // red
  new THREE.Color(1.00, 0.55, 0.00),  // orange
  new THREE.Color(1.00, 0.90, 0.00),  // yellow
  new THREE.Color(0.00, 0.85, 0.30),  // green
  new THREE.Color(0.15, 0.45, 1.00),  // blue
  new THREE.Color(0.55, 0.00, 1.00),  // violet
]

const MESH_OPACITY = 0.25

// url: null → use buildFallbackGeometry instead of loading an OBJ.
// dragon.obj is a 20-face placeholder; replaced with procedural shapes.
interface MeshConfig {
  url: string | null
  colorIndex: number
  scaleMult?: number  // multiplier on top of the normalized 2.0-unit scale; default 1.0
}

const MESH_CONFIGS: MeshConfig[] = [
  { url: '/meshes/bunny.obj',      colorIndex: 0 },
  { url: '/meshes/teapot.obj',     colorIndex: 1 },
  { url: null,                     colorIndex: 2 },  // TorusKnot
  { url: '/meshes/max-planck.obj', colorIndex: 3 },  // Max Planck bust
  { url: '/meshes/cow.obj',        colorIndex: 4 },  // Cow
  { url: '/meshes/dragon.obj',     colorIndex: 5 },  // Stanford Dragon
  { url: null,                     colorIndex: 0 },  // Mobius strip
  { url: null,                     colorIndex: 3 },  // Hyperboloid
  { url: '/meshes/shark.obj',      colorIndex: 5, scaleMult: 1.7 },  // Shark
]

const VELOCITY_MIN = 0.15
const VELOCITY_MAX = 0.45

const ROTATION_SPEED_MIN = 0.02
const ROTATION_SPEED_MAX = 0.07

// ── Types ──────────────────────────────────────────────────────────────────
interface BouncingMesh {
  mesh: THREE.Mesh
  velocity: THREE.Vector3
  radius: number
  rotationSpeed: THREE.Vector3
}

interface Bounds {
  w: number
  h: number
}

// ── Helpers ────────────────────────────────────────────────────────────────
function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomSign(): number {
  return Math.random() < 0.5 ? -1 : 1
}

function updatePhysics(
  objects: BouncingMesh[],
  dt: number,
  bounds: Bounds,
  yMin: number,
  yMax: number,
) {
  for (const obj of objects) {
    obj.mesh.position.addScaledVector(obj.velocity, dt)
    obj.mesh.rotation.x += obj.rotationSpeed.x * dt
    obj.mesh.rotation.y += obj.rotationSpeed.y * dt
    obj.mesh.rotation.z += obj.rotationSpeed.z * dt
  }
  for (const obj of objects) {
    const p = obj.mesh.position
    const r = obj.radius
    const hw = bounds.w / 2
    if (p.x - r < -hw || p.x + r > hw) {
      obj.velocity.x *= -1
      p.x = Math.max(-hw + r, Math.min(hw - r, p.x))
    }
    if (p.y - r < yMin || p.y + r > yMax) {
      obj.velocity.y *= -1
      p.y = Math.max(yMin + r, Math.min(yMax - r, p.y))
    }
  }
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i]
      const b = objects[j]
      const dist = a.mesh.position.distanceTo(b.mesh.position)
      const minDist = a.radius + b.radius
      if (dist < minDist && dist > 0.001) {
        const normal = new THREE.Vector3()
          .subVectors(b.mesh.position, a.mesh.position)
          .normalize()
        const relVel = new THREE.Vector3().subVectors(a.velocity, b.velocity)
        const impulse = relVel.dot(normal)
        if (impulse > 0) {
          a.velocity.addScaledVector(normal, -impulse)
          b.velocity.addScaledVector(normal, impulse)
        }
        const overlap = minDist - dist
        a.mesh.position.addScaledVector(normal, -overlap / 2)
        b.mesh.position.addScaledVector(normal, overlap / 2)
      }
    }
  }
}

// Parametric Mobius strip — single-sided surface with a half twist
function buildMobiusGeometry(): THREE.BufferGeometry {
  const uSegs = 96
  const vSegs = 10
  const positions: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= uSegs; i++) {
    const u = (i / uSegs) * Math.PI * 2
    for (let j = 0; j <= vSegs; j++) {
      const v = (j / vSegs) - 0.5
      const cosHalf = Math.cos(u / 2)
      const sinHalf = Math.sin(u / 2)
      const x = (1 + v * cosHalf) * Math.cos(u)
      const y = (1 + v * cosHalf) * Math.sin(u)
      const z = v * sinHalf
      positions.push(x, y, z)
    }
  }

  for (let i = 0; i < uSegs; i++) {
    for (let j = 0; j < vSegs; j++) {
      const a = i * (vSegs + 1) + j
      const b = a + vSegs + 1
      indices.push(a, b, a + 1)
      indices.push(a + 1, b, b + 1)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

// One-sheet hyperboloid via LatheGeometry
function buildHyperboloidGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = []
  const n = 24
  for (let i = 0; i < n; i++) {
    const t = -1.2 + (2.4 * i) / (n - 1)
    const r = Math.sqrt(1 + t * t) * 0.8
    points.push(new THREE.Vector2(r, t))
  }
  return new THREE.LatheGeometry(points, 48)
}

// Enneper minimal surface — self-intersecting algebraic minimal surface
function buildEnneperGeometry(): THREE.BufferGeometry {
  const segs = 40
  const range = 1.3
  const positions: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= segs; i++) {
    const u = -range + (2 * range * i) / segs
    for (let j = 0; j <= segs; j++) {
      const v = -range + (2 * range * j) / segs
      const x = u - (u * u * u) / 3 + u * v * v
      const y = v - (v * v * v) / 3 + v * u * u
      const z = u * u - v * v
      positions.push(x, y, z)
    }
  }

  for (let i = 0; i < segs; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * (segs + 1) + j
      const b = a + segs + 1
      indices.push(a, b, a + 1)
      indices.push(a + 1, b, b + 1)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

// 9 distinct procedural shapes — indexed by mesh slot so each gets a unique form.
function buildFallbackGeometry(index: number): THREE.BufferGeometry {
  const variants: Array<() => THREE.BufferGeometry> = [
    () => new THREE.IcosahedronGeometry(1, 3),              // 320 faces, smooth sphere
    () => new THREE.TorusKnotGeometry(0.8, 0.25, 128, 16),  // complex knot
    () => new THREE.TorusKnotGeometry(0.7, 0.2, 96, 12),    // smaller knot variant
    () => new THREE.OctahedronGeometry(1, 2),               // 128 faces
    () => new THREE.TorusGeometry(0.8, 0.35, 32, 48),       // smooth donut
    () => new THREE.DodecahedronGeometry(1, 1),             // 240 faces
    () => buildMobiusGeometry(),
    () => buildHyperboloidGeometry(),
    () => buildEnneperGeometry(),
  ]
  return variants[index % variants.length]()
}

// ── useMeshBackground hook ─────────────────────────────────────────────────
export function useMeshBackground(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  active: boolean,
): void {
  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    // Pass false so Three.js does not override the canvas CSS dimensions —
    // MeshBackground sets width/height via 100vw/100vh inline styles.
    renderer.setSize(window.innerWidth, window.innerHeight, false)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    camera.position.z = 14

    function computeBounds(): Bounds {
      const vFov = (camera.fov * Math.PI) / 180
      const halfH = Math.tan(vFov / 2) * camera.position.z
      const halfW = halfH * camera.aspect
      return { w: halfW * 2, h: halfH * 2 }
    }

    let bounds = computeBounds()

    // ── World geometry ────────────────────────────────────────────────────
    // The Three.js world spans from the top of #about to the bottom of #contact.
    // worldUnitsPerPixel converts CSS scroll pixels to world units so that
    // camera.y tracks scroll 1:1 with the page — meshes appear page-locked.
    const aboutEl   = document.getElementById('about')
    const contactEl = document.getElementById('contact')
    const aboutTop      = (aboutEl?.getBoundingClientRect().top    ?? 0) + window.scrollY
    const contactBottom = (contactEl?.getBoundingClientRect().bottom ?? 0) + window.scrollY
    const sectionStart  = aboutTop

    const worldUnitsPerPixel = bounds.h / window.innerHeight
    const worldHeight = (contactBottom - aboutTop) * worldUnitsPerPixel
    const Y_TOP    =  bounds.h / 2        // world Y at viewport top when at sectionStart
    const Y_BOTTOM = Y_TOP - worldHeight  // world Y at viewport bottom when at sectionEnd

    // ── Objects ───────────────────────────────────────────────────────────
    const objects: BouncingMesh[] = []
    let disposed = false

    function addMeshToScene(
      sourceGeometry: THREE.BufferGeometry,
      colorIndex: number,
      spawnY: number,
      scaleMult: number = 1.0,
    ) {
      if (disposed) { sourceGeometry.dispose(); return }

      const material = new THREE.MeshBasicMaterial({
        color: MESH_COLORS[colorIndex],
        wireframe: true,
        transparent: true,
        opacity: MESH_OPACITY,
        depthWrite: false,
      })

      sourceGeometry.computeBoundingSphere()
      const bsRadius = sourceGeometry.boundingSphere?.radius ?? 1
      const scale = (2.0 / bsRadius) * scaleMult

      const mesh = new THREE.Mesh(sourceGeometry, material)
      mesh.scale.setScalar(scale)

      const hw = bounds.w / 2 - 2.0
      mesh.position.set(randomInRange(-hw, hw), spawnY, 0)
      mesh.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      )

      scene.add(mesh)
      objects.push({
        mesh,
        velocity: new THREE.Vector3(
          randomSign() * randomInRange(VELOCITY_MIN, VELOCITY_MAX),
          // Y velocity is zero — autonomous vertical drift relative to the
          // camera-tracked scroll creates a parallax feel. Horizontal-only
          // bounce keeps meshes page-locked in Y while still animated.
          0,
          0,
        ),
        radius: 2.0,
        rotationSpeed: new THREE.Vector3(
          randomSign() * randomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX),
          randomSign() * randomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX),
          randomSign() * randomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX) * 0.5,
        ),
      })
    }

    // ── Load meshes (stratified Y) ────────────────────────────────────────
    // Divide the world into N equal buckets; each mesh spawns at a random Y
    // within its assigned bucket — guarantees even vertical coverage.
    const loader = new OBJLoader()
    const n = MESH_CONFIGS.length
    const bucketHeight = worldHeight / n

    MESH_CONFIGS.forEach(({ url, colorIndex, scaleMult = 1.0 }, index) => {
      const bucketTop = Y_TOP - index * bucketHeight
      const spawnY = bucketTop - Math.random() * bucketHeight

      if (url === null) {
        addMeshToScene(buildFallbackGeometry(index), colorIndex, spawnY, scaleMult)
        return
      }

      loader.load(
        url,
        (obj) => {
          let geometry: THREE.BufferGeometry | null = null
          obj.traverse((child) => {
            if (!geometry && child instanceof THREE.Mesh) {
              geometry = child.geometry as THREE.BufferGeometry
            }
          })
          addMeshToScene(geometry ?? buildFallbackGeometry(index), colorIndex, spawnY, scaleMult)
        },
        undefined,
        () => {
          console.warn(`[MeshBackground] Failed to load ${url}, using fallback`)
          addMeshToScene(buildFallbackGeometry(index), colorIndex, spawnY, scaleMult)
        },
      )
    })

    // ── Animation loop ────────────────────────────────────────────────────
    // Camera reads window.scrollY directly every frame — no scroll listener
    // needed, no 1-frame lag, perfect sync with page scroll.
    // Physics is throttled to ~60 fps; rendering runs at native refresh rate
    // so camera updates are always current when the frame is painted.
    let rafId = 0
    let lastTime = 0

    function animate(time: number) {
      rafId = requestAnimationFrame(animate)

      camera.position.y = -(window.scrollY - sectionStart) * worldUnitsPerPixel

      if (!activeRef.current || objects.length === 0) return

      if (time - lastTime >= FPS_CAP) {
        const dt = Math.min((time - lastTime) / 1000, 0.1)
        lastTime = time
        updatePhysics(objects, dt, bounds, Y_BOTTOM, Y_TOP)
      }

      renderer.render(scene, camera)
    }

    rafId = requestAnimationFrame(animate)

    // ── Resize handler ────────────────────────────────────────────────────
    function onResize() {
      const w = window.innerWidth
      const h = window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      bounds = computeBounds()
    }

    window.addEventListener('resize', onResize)

    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) {
            for (const mat of obj.material) {
              if (mat instanceof THREE.Material) mat.dispose()
            }
          } else if (obj.material instanceof THREE.Material) {
            obj.material.dispose()
          }
        }
      })
      renderer.dispose()
    }
  }, [canvasRef])
}
