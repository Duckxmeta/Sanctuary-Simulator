import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sky, PointerLockControls } from '@react-three/drei'
import SanctuaryMap from './components/Environment/SanctuaryMap'
import { SANCTUARY_STRUCTURES } from './config/mapLayout'

const stats = {
  speed: 4,
  swimSpeed: 7,
}

// Axis-Aligned Bounding Box (AABB) Collision Helper
const checkCollision = (x, z) => {
  for (const struct of SANCTUARY_STRUCTURES) {
    if (!struct.collidable) continue // Only check collidable structures

    const [sx, , sz] = struct.position
    const [sw, , sd] = struct.scale

    // Calculate structure bounding box edges
    const minX = sx - sw / 2
    const maxX = sx + sw / 2
    const minZ = sz - sd / 2
    const maxZ = sz + sd / 2

    // Bird bounding box edges (assumed 1x1x1 size)
    const birdMinX = x - 0.5
    const birdMaxX = x + 0.5
    const birdMinZ = z - 0.5
    const birdMaxZ = z + 0.5

    // Check for AABB intersection
    if (birdMinX < maxX && birdMaxX > minX && birdMinZ < maxZ && birdMaxZ > minZ) {
      return true // Collision detected
    }
  }
  return false
}

function PlayerBird() {
  const meshRef = useRef()
  const velocityYRef = useRef(0)
  const isGroundedRef = useRef(true)

  const keysRef = useRef({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    space: false,
  })

  // Keyboard Event Listeners (tracking active down/up states)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Movement keys
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysRef.current.moveForward = true
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.moveBackward = true
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.moveLeft = true
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.moveRight = true

      // Spacebar (Jump & Glide)
      if (e.code === 'Space') {
        keysRef.current.space = true
        // Jump trigger: if player is grounded, apply initial velocity burst
        if (isGroundedRef.current) {
          velocityYRef.current = 12 // Initial jump force
          isGroundedRef.current = false
        }
      }
    }

    const handleKeyUp = (e) => {
      // Movement keys released
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysRef.current.moveForward = false
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.moveBackward = false
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.moveLeft = false
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.moveRight = false

      // Spacebar released
      if (e.code === 'Space') {
        keysRef.current.space = false
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const pos = meshRef.current.position
    const camYaw = state.camera.rotation.y

    // 1. Calculate player's distance to all water pools
    let isInsidePond = false
    for (const struct of SANCTUARY_STRUCTURES) {
      if (struct.isWater) {
        const [px, , pz] = struct.position
        const pradius = struct.scale[0] / 2
        const dx = pos.x - px
        const dz = pos.z - pz
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < pradius) {
          isInsidePond = true
          break
        }
      }
    }

    // Determine target/ground height based on location (water vs land)
    const groundLevel = isInsidePond ? 0.15 : 0.5

    const spacePressed = keysRef.current.space
    const forward = keysRef.current.moveForward
    const backward = keysRef.current.moveBackward
    const left = keysRef.current.moveLeft
    const right = keysRef.current.moveRight

    // 2. Physics & Gravity / Gliding logic
    if (!isGroundedRef.current) {
      const gravity = 32
      const glideGravity = 6 // Drastically slows descent
      
      // Choose gravity based on spacebar input (only glide when falling/descending)
      const currentGravity = (spacePressed && velocityYRef.current < 0) ? glideGravity : gravity

      velocityYRef.current -= currentGravity * delta
      pos.y += velocityYRef.current * delta

      // Landing Detection
      if (pos.y <= groundLevel) {
        pos.y = groundLevel
        velocityYRef.current = 0
        isGroundedRef.current = true
      }
    } else {
      // Grounded state height updates (smooth transition when entering/exiting pond)
      pos.y += (groundLevel - pos.y) * 0.1
    }

    // Determine move speed based on environment state
    let moveSpeed = isInsidePond ? stats.swimSpeed : stats.speed

    // Forward speed boost while gliding (catching air current)
    if (!isGroundedRef.current && spacePressed && velocityYRef.current < 0 && forward) {
      moveSpeed = stats.speed * 1.5
    }

    // 3. Movement input & steering calculation (Mouse updates camera, W/S/A/D moves relative to camera)
    const isMoving = forward || backward || left || right

    if (isMoving) {
      // Smoothly rotate the duck's mesh to match the camera's horizontal angle
      const diff = camYaw - meshRef.current.rotation.y
      const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff))
      meshRef.current.rotation.y += normalizedDiff * 0.1

      // Calculate movement vector relative to camera direction
      let moveX = 0
      let moveZ = 0

      const fwdX = -Math.sin(camYaw)
      const fwdZ = -Math.cos(camYaw)
      const rgtX = Math.cos(camYaw)
      const rgtZ = -Math.sin(camYaw)

      if (forward) {
        moveX += fwdX
        moveZ += fwdZ
      }
      if (backward) {
        moveX -= fwdX
        moveZ -= fwdZ
      }
      if (left) {
        moveX -= rgtX
        moveZ -= rgtZ
      }
      if (right) {
        moveX += rgtX
        moveZ += rgtZ
      }

      // Normalize diagonal movement
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ)
      if (length > 0) {
        moveX /= length
        moveZ /= length
      }

      const stepX = moveX * moveSpeed * delta
      const stepZ = moveZ * moveSpeed * delta

      const nextX = pos.x + stepX
      const nextZ = pos.z + stepZ

      // Apply sliding collision checks on X and Z axes independently
      if (!checkCollision(nextX, pos.z)) {
        pos.x = nextX
      }
      if (!checkCollision(pos.x, nextZ)) {
        pos.z = nextZ
      }

      // Animations based on state
      const directionMultiplier = forward ? 1 : (backward ? -1 : 0)

      if (!isGroundedRef.current) {
        // In-air movement: pitch/lean based on jump/glide direction
        meshRef.current.rotation.z += (0 - meshRef.current.rotation.z) * 0.1
        if (spacePressed && velocityYRef.current < 0) {
          // Gliding: slight forward lean and minor banking
          meshRef.current.rotation.x += (0.15 - meshRef.current.rotation.x) * 0.1
          if (left) meshRef.current.rotation.z += (0.15 - meshRef.current.rotation.z) * 0.1
          if (right) meshRef.current.rotation.z += (-0.15 - meshRef.current.rotation.z) * 0.1
        } else {
          // Standard jump pitch (lean up when rising, lean down when falling)
          const targetPitch = velocityYRef.current > 0 ? -0.1 : 0.1
          meshRef.current.rotation.x += (targetPitch - meshRef.current.rotation.x) * 0.1
        }
      } else {
        // Grounded movement waddle/swim
        meshRef.current.rotation.x += ((0.05 * directionMultiplier) - meshRef.current.rotation.x) * 0.1
        if (!isInsidePond) {
          // Waddling on land
          const waddleFreq = 16
          meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * waddleFreq) * 0.15
          pos.y = groundLevel + Math.abs(Math.sin(state.clock.elapsedTime * waddleFreq)) * 0.08
        } else {
          // Swimming in pond
          meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.05
          pos.y = groundLevel + Math.sin(state.clock.elapsedTime * 4) * 0.03
        }
      }
    } else {
      // Reset rotations when not moving
      meshRef.current.rotation.z += (0 - meshRef.current.rotation.z) * 0.1
      meshRef.current.rotation.x += (0 - meshRef.current.rotation.x) * 0.1

      if (isGroundedRef.current && isInsidePond) {
        // Idle floating bob
        pos.y = groundLevel + Math.sin(state.clock.elapsedTime * 2) * 0.04
      }
    }

    // Sanctuary Boundaries Constraint Check (perimeter at 44.5 units to match fences at ±45.0)
    const boundary = 44.5
    pos.x = Math.max(-boundary, Math.min(boundary, pos.x))
    pos.z = Math.max(-boundary, Math.min(boundary, pos.z))

    // 5. Dynamic Camera Tracking (3rd-person follow camera orbiting the player)
    const theta = state.camera.rotation.y
    const phi = state.camera.rotation.x
    const distance = 6

    state.camera.position.set(
      pos.x + Math.sin(theta) * Math.cos(phi) * distance,
      pos.y + 0.5 - Math.sin(phi) * distance,
      pos.z + Math.cos(theta) * Math.cos(phi) * distance
    )
  })

  return (
    <group ref={meshRef} position={[-30, 0, 40]} scale={[0.6, 0.6, 0.6]}>
      {/* MAIN BODY - Textured Brown */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.5, 1.0]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.8} />
      </mesh>

      {/* MALLARD GREEN HEAD - Facing FORWARD (negative Z) */}
      <mesh position={[0, 0.8, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#006400" roughness={0.5} />
      </mesh>

      {/* YELLOW BEAK - Pointing STRAIGHT FORWARD */}
      <mesh position={[0, 0.75, -0.7]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
    </group>
  )
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 8, 16], fov: 60 }} shadows>
        <Sky distance={450000} sunPosition={[15, 30, 15]} inclination={0} azimuth={0.25} />
        <ambientLight intensity={0.7} />
        <directionalLight 
          castShadow 
          position={[15, 30, 15]} 
          intensity={1.5} 
          shadow-mapSize={[2048, 2048]} 
        />
        
        <PlayerBird />
        
        <SanctuaryMap />
        
        <PointerLockControls />
      </Canvas>
    </div>
  )
}
