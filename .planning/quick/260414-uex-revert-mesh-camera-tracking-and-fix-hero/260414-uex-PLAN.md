---
phase: quick
plan: 260414-uex
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/useMeshBackground.ts
  - src/App.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Wireframe meshes bounce off viewport walls in a DVD-screensaver pattern instead of being pinned to fixed scroll-depth Y positions"
    - "Camera Y never changes — meshes move, camera stays fixed at z=14"
    - "Meshes collide elastically with each other via bounding-sphere checks"
    - "Nav, black backdrop, and mesh canvas only appear after the hero is fully scrolled out of view (100vh, not 80vh)"
  artifacts:
    - path: "src/hooks/useMeshBackground.ts"
      provides: "DVD-bounce physics with wall reflections and elastic collisions"
      contains: "updatePhysics"
    - path: "src/App.tsx"
      provides: "Hero visibility threshold at 100vh"
      contains: "window.innerHeight)"
  key_links:
    - from: "src/hooks/useMeshBackground.ts"
      to: "animate loop"
      via: "updatePhysics(objects, dt, bounds) call in RAF"
      pattern: "updatePhysics\\(objects.*dt.*bounds\\)"
---

<objective>
Revert the mesh background from camera-tracking scroll to DVD-bounce physics, and fix the hero-gone threshold from 80vh to 100vh.

Purpose: The previous quick task (260414-u64) replaced bouncing physics with camera.position.y scroll tracking, causing meshes to scroll past the viewer instead of floating in a fixed viewport. The hero threshold at 0.8 causes premature nav/mesh appearance before the fish hero is fully offscreen.

Output: Two corrected source files restoring intended visual behavior.
</objective>

<context>
@src/hooks/useMeshBackground.ts
@src/App.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Restore DVD-bounce physics in useMeshBackground.ts</name>
  <files>src/hooks/useMeshBackground.ts</files>
  <action>
Make these exact changes to src/hooks/useMeshBackground.ts:

1. ADD velocity constants after ROTATION_SPEED_MAX:
   ```
   const VELOCITY_MIN = 0.05
   const VELOCITY_MAX = 0.15
   ```

2. REPLACE the `SceneMesh` interface (lines 30-33) with `BouncingMesh`:
   ```typescript
   interface BouncingMesh {
     mesh: THREE.Mesh
     velocity: THREE.Vector3
     radius: number
     rotationSpeed: THREE.Vector3
   }
   ```

3. ADD `randomSign()` helper after `randomInRange`:
   ```typescript
   function randomSign(): number {
     return Math.random() < 0.5 ? -1 : 1
   }
   ```

4. ADD `updatePhysics` function after the helpers section (before the hook):
   ```typescript
   function updatePhysics(objects: BouncingMesh[], dt: number, bounds: Bounds) {
     const hw = bounds.w / 2
     const hh = bounds.h / 2

     for (const obj of objects) {
       // Position update
       obj.mesh.position.x += obj.velocity.x * dt
       obj.mesh.position.y += obj.velocity.y * dt

       // Wall-bounce reflections with clamping
       if (obj.mesh.position.x - obj.radius < -hw) {
         obj.mesh.position.x = -hw + obj.radius
         obj.velocity.x = Math.abs(obj.velocity.x)
       } else if (obj.mesh.position.x + obj.radius > hw) {
         obj.mesh.position.x = hw - obj.radius
         obj.velocity.x = -Math.abs(obj.velocity.x)
       }
       if (obj.mesh.position.y - obj.radius < -hh) {
         obj.mesh.position.y = -hh + obj.radius
         obj.velocity.y = Math.abs(obj.velocity.y)
       } else if (obj.mesh.position.y + obj.radius > hh) {
         obj.mesh.position.y = hh - obj.radius
         obj.velocity.y = -Math.abs(obj.velocity.y)
       }
     }

     // Bounding-sphere elastic collision resolution
     for (let i = 0; i < objects.length; i++) {
       for (let j = i + 1; j < objects.length; j++) {
         const a = objects[i]
         const b = objects[j]
         const dx = b.mesh.position.x - a.mesh.position.x
         const dy = b.mesh.position.y - a.mesh.position.y
         const dist = Math.sqrt(dx * dx + dy * dy)
         const minDist = a.radius + b.radius
         if (dist < minDist && dist > 0) {
           const nx = dx / dist
           const ny = dy / dist
           // Swap velocity components along collision normal
           const aVn = a.velocity.x * nx + a.velocity.y * ny
           const bVn = b.velocity.x * nx + b.velocity.y * ny
           a.velocity.x += (bVn - aVn) * nx
           a.velocity.y += (bVn - aVn) * ny
           b.velocity.x += (aVn - bVn) * nx
           b.velocity.y += (aVn - bVn) * ny
           // Push apart to avoid overlap
           const overlap = (minDist - dist) / 2
           a.mesh.position.x -= overlap * nx
           a.mesh.position.y -= overlap * ny
           b.mesh.position.x += overlap * nx
           b.mesh.position.y += overlap * ny
         }
       }
     }
   }
   ```

5. CHANGE `objects` type declaration (line 106) from `SceneMesh[]` to `BouncingMesh[]`.

6. In `addMeshToScene`, REPLACE the fixed Y positions block (lines 136-142):
   ```typescript
   // From:
   const yPositions = [-1.5 * boundsAtAdd.h, -4.0 * boundsAtAdd.h, -7.0 * boundsAtAdd.h]
   const hw = boundsAtAdd.w / 2 - 1.5
   mesh.position.set(
     randomInRange(-hw, hw),
     yPositions[colorIndex % yPositions.length],
     0,
   )
   ```
   ```typescript
   // To:
   const padding = 1.5
   const hw = boundsAtAdd.w / 2 - padding
   const hh = boundsAtAdd.h / 2 - padding
   mesh.position.set(randomInRange(-hw, hw), randomInRange(-hh, hh), 0)
   ```

7. In `objects.push(...)`, REPLACE the push block (lines 151-158) to include velocity and radius:
   ```typescript
   objects.push({
     mesh,
     velocity: new THREE.Vector3(
       randomSign() * randomInRange(VELOCITY_MIN, VELOCITY_MAX),
       randomSign() * randomInRange(VELOCITY_MIN, VELOCITY_MAX),
       0,
     ),
     radius: 1.5,
     rotationSpeed: new THREE.Vector3(
       randomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX),
       randomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX),
       randomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX) * 0.5,
     ),
   })
   ```

8. In the `animate` function, REMOVE the two camera-tracking lines (lines 209-210):
   ```typescript
   // DELETE these two lines:
   const contentScrollY = Math.max(0, window.scrollY - window.innerHeight)
   camera.position.y = -(contentScrollY / window.innerHeight) * bounds.h
   ```
   And ADD before `renderer.render(scene, camera)`:
   ```typescript
   updatePhysics(objects, dt, bounds)
   ```
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>useMeshBackground.ts compiles clean, contains BouncingMesh interface, updatePhysics function, randomSign helper, velocity constants, random placement (not fixed Y), and no camera.position.y scroll tracking in animate loop</done>
</task>

<task type="auto">
  <name>Task 2: Fix hero-gone threshold to 100vh in App.tsx</name>
  <files>src/App.tsx</files>
  <action>
In src/App.tsx line 30, change the hero visibility threshold:

From: `setHeroVisible(window.scrollY < window.innerHeight * 0.8)`
To:   `setHeroVisible(window.scrollY < window.innerHeight)`

This ensures nav, black backdrop, and mesh canvas only appear after the fish hero is completely scrolled out of view (at 100vh), not prematurely at 80vh.
  </action>
  <verify>
    <automated>cd /Users/yalisommer/Desktop/Non-Schoolwork/Personal-Coding-Projects/portfolio-v6 && grep -n 'innerHeight)' src/App.tsx | head -5</automated>
  </verify>
  <done>App.tsx line 30 reads `setHeroVisible(window.scrollY < window.innerHeight)` with no multiplier</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with zero errors
2. `grep 'camera.position.y' src/hooks/useMeshBackground.ts` returns no matches (camera tracking removed)
3. `grep 'updatePhysics' src/hooks/useMeshBackground.ts` returns matches (bounce physics restored)
4. `grep 'BouncingMesh' src/hooks/useMeshBackground.ts` returns matches (interface renamed)
5. `grep 'VELOCITY_MIN' src/hooks/useMeshBackground.ts` returns matches (velocity constants present)
6. `grep 'innerHeight \* 0.8' src/App.tsx` returns no matches (old threshold gone)
</verification>

<success_criteria>
- Meshes bounce within the fixed viewport using DVD-screensaver physics with wall reflections and elastic collisions
- Camera stays fixed at z=14, no scroll-tracking of camera.position.y
- Hero visibility threshold is 100vh (nav/meshes/backdrop appear only after full hero scroll-out)
- TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/260414-uex-revert-mesh-camera-tracking-and-fix-hero/260414-uex-SUMMARY.md`
</output>
