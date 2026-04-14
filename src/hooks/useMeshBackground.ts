import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import * as THREE from 'three'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'

// ── Constants ──────────────────────────────────────────────────────────────
const FPS_CAP = 1000 / 30  // 30 FPS throttle (MESH-02)

// Distinct muted tints at 12% opacity (D-07: 8-15% range)
const MESH_COLORS = [
  new THREE.Color(100 / 255, 220 / 255, 255 / 255), // soft cyan
  new THREE.Color(255 / 255, 120 / 255, 100 / 255), // coral
  new THREE.Color(255 / 255, 210 / 255, 100 / 255), // warm yellow
]

const MESH_OPACITY = 0.12

// OBJ mesh files committed to public/meshes/
const MESH_URLS = [
  '/meshes/bunny.obj',
  '/meshes/teapot.obj',
  '/meshes/dragon.obj',
]

// Physics: slow enough to be readable at any scroll position
const VELOCITY_MIN = 0.3
const VELOCITY_MAX = 1.0
const ROTATION_SPEED_MIN = 0.05
const ROTATION_SPEED_MAX = 0.25

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

// ── Physics helpers ────────────────────────────────────────────────────────
function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function randomSign(): number {
  return Math.random() < 0.5 ? -1 : 1
}

function updatePhysics(objects: BouncingMesh[], dt: number, bounds: Bounds) {
  // 1. Update positions and rotations
  for (const obj of objects) {
    obj.mesh.position.addScaledVector(obj.velocity, dt)
    obj.mesh.rotation.x += obj.rotationSpeed.x * dt
    obj.mesh.rotation.y += obj.rotationSpeed.y * dt
    obj.mesh.rotation.z += obj.rotationSpeed.z * dt
  }

  // 2. DVD-bounce: reflect off canvas bounds (D-05)
  for (const obj of objects) {
    const p = obj.mesh.position
    const r = obj.radius
    const hw = bounds.w / 2
    const hh = bounds.h / 2
    if (p.x - r < -hw || p.x + r > hw) {
      obj.velocity.x *= -1
      // Clamp to prevent sticking at edge
      p.x = Math.max(-hw + r, Math.min(hw - r, p.x))
    }
    if (p.y - r < -hh || p.y + r > hh) {
      obj.velocity.y *= -1
      p.y = Math.max(-hh + r, Math.min(hh - r, p.y))
    }
  }

  // 3. Bounding-sphere elastic collisions (D-06, Pattern 3)
  for (let i = 0; i < objects.length; i++) {
    for (let j = i + 1; j < objects.length; j++) {
      const a = objects[i]
      const b = objects[j]
      const dist = a.mesh.position.distanceTo(b.mesh.position)
      const minDist = a.radius + b.radius
      if (dist < minDist && dist > 0.001) {
        // Collision normal from a toward b
        const normal = new THREE.Vector3()
          .subVectors(b.mesh.position, a.mesh.position)
          .normalize()
        // Relative velocity projected onto collision normal
        const relVel = new THREE.Vector3().subVectors(a.velocity, b.velocity)
        const impulse = relVel.dot(normal)
        // Only resolve if objects are actually approaching
        if (impulse > 0) {
          a.velocity.addScaledVector(normal, -impulse)
          b.velocity.addScaledVector(normal, impulse)
        }
        // Separate overlapping meshes
        const overlap = minDist - dist
        a.mesh.position.addScaledVector(normal, -overlap / 2)
        b.mesh.position.addScaledVector(normal, overlap / 2)
      }
    }
  }
}

// ── Geometry fallback: build from Three.js built-ins if OBJ fails ──────────
function buildFallbackGeometry(index: number): THREE.BufferGeometry {
  switch (index % 3) {
    case 0: return new THREE.IcosahedronGeometry(1, 2)
    case 1: return new THREE.TorusKnotGeometry(0.8, 0.3, 64, 8)
    default: return new THREE.DodecahedronGeometry(1, 0)
  }
}

// ── useMeshBackground hook ─────────────────────────────────────────────────
export function useMeshBackground(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  active: boolean,
): void {
  // Track active state in a ref so the RAF loop reads it without re-running the effect
  const activeRef = useRef(active)
  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── Scene setup ──────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,        // transparent background
      antialias: true,
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setClearColor(0x000000, 0)  // fully transparent

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(
      50,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    )
    camera.position.z = 14

    // ── Bounds calculation ───────────────────────────────────────────────
    function computeBounds(): Bounds {
      const vFov = (camera.fov * Math.PI) / 180
      const halfH = Math.tan(vFov / 2) * camera.position.z
      const halfW = halfH * camera.aspect
      return { w: halfW * 2, h: halfH * 2 }
    }

    let bounds = computeBounds()

    // ── Objects array (filled asynchronously) ────────────────────────────
    const objects: BouncingMesh[] = []
    let disposed = false

    function addMeshToScene(
      geometry: THREE.BufferGeometry,
      colorIndex: number,
      boundsAtAdd: Bounds,
    ) {
      if (disposed) {
        geometry.dispose()
        return
      }

      const material = new THREE.MeshBasicMaterial({
        color: MESH_COLORS[colorIndex % MESH_COLORS.length],
        wireframe: true,
        transparent: true,
        opacity: MESH_OPACITY,
        depthWrite: false,
      })

      // Normalize scale: fit within a 2-unit bounding sphere
      geometry.computeBoundingSphere()
      const bsRadius = geometry.boundingSphere?.radius ?? 1
      const scale = 1.5 / bsRadius  // normalize to ~1.5 unit radius for visibility

      const mesh = new THREE.Mesh(geometry, material)
      mesh.scale.setScalar(scale)

      // Random initial position within bounds (avoid extreme edges)
      const padding = 1.5
      const hw = boundsAtAdd.w / 2 - padding
      const hh = boundsAtAdd.h / 2 - padding
      mesh.position.set(
        randomInRange(-hw, hw),
        randomInRange(-hh, hh),
        0,
      )

      // Random initial rotation
      mesh.rotation.x = Math.random() * Math.PI * 2
      mesh.rotation.y = Math.random() * Math.PI * 2
      mesh.rotation.z = Math.random() * Math.PI * 2

      scene.add(mesh)

      objects.push({
        mesh,
        velocity: new THREE.Vector3(
          randomSign() * randomInRange(VELOCITY_MIN, VELOCITY_MAX),
          randomSign() * randomInRange(VELOCITY_MIN, VELOCITY_MAX),
          0,
        ),
        radius: 1.5,  // normalized radius (matches the 1.5 scale above)
        rotationSpeed: new THREE.Vector3(
          randomSign() * randomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX),
          randomSign() * randomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX),
          randomSign() * randomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX) * 0.5,
        ),
      })
    }

    // ── Load meshes (OBJ → fallback to built-in geometry) ────────────────
    const loader = new OBJLoader()

    MESH_URLS.forEach((url, index) => {
      loader.load(
        url,
        (obj) => {
          // OBJLoader returns a Group — extract the first Mesh geometry
          let geometry: THREE.BufferGeometry | null = null
          obj.traverse((child) => {
            if (geometry) return
            if (child instanceof THREE.Mesh) {
              geometry = child.geometry as THREE.BufferGeometry
            }
          })
          if (geometry) {
            addMeshToScene(geometry, index, bounds)
          } else {
            // No mesh found in group — use fallback
            console.warn(`[MeshBackground] No mesh in ${url}, using fallback`)
            addMeshToScene(buildFallbackGeometry(index), index, bounds)
          }
        },
        undefined, // progress callback (not needed)
        (_err) => {
          // Load failed — use built-in geometry fallback
          console.warn(`[MeshBackground] Failed to load ${url}, using fallback geometry`)
          addMeshToScene(buildFallbackGeometry(index), index, bounds)
        },
      )
    })

    // ── Animation loop ───────────────────────────────────────────────────
    let rafId = 0
    let lastTime = 0

    function animate(time: number) {
      rafId = requestAnimationFrame(animate)

      // Throttle to 30 FPS (D-08, MESH-02)
      if (time - lastTime < FPS_CAP) return
      const dt = Math.min((time - lastTime) / 1000, 0.1)  // cap dt to 100ms
      lastTime = time

      // Pause when hero is visible / content zone not active (D-08)
      if (!activeRef.current) return
      if (objects.length === 0) return

      updatePhysics(objects, dt, bounds)
      renderer.render(scene, camera)
    }

    rafId = requestAnimationFrame(animate)

    // ── Resize handler ───────────────────────────────────────────────────
    function onResize() {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      bounds = computeBounds()
    }

    window.addEventListener('resize', onResize)

    // ── Cleanup (Pitfall 1: full GPU resource release) ───────────────────
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
      renderer.forceContextLoss()
    }
  }, [canvasRef]) // canvasRef is stable — effect runs once on mount
}
