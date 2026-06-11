import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sky, PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'
import SanctuaryMap from './components/Environment/SanctuaryMap'
import { SANCTUARY_STRUCTURES } from './config/mapLayout'
import { SANCTUARY_NPCS } from './config/npcLayout'
import NPCBird from './components/Environment/NPCBird'
import HumanNPC from './components/Environment/HumanNPC'

const stats = {
  speed: 4,
  swimSpeed: 7,
}

// Axis-Aligned Bounding Box (AABB) Collision Helper
const checkCollision = (x, z, isGateOpen) => {
  for (const struct of SANCTUARY_STRUCTURES) {
    if (!struct.collidable) continue // Only check collidable structures
    if (struct.id && struct.id.includes('corner-bush')) continue // Explicitly ignore corner bushes
    if (struct.id === 'main-gate' && isGateOpen) continue // Ignore gate collision if open

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

const isEnvironmentObject = (obj) => {
  let current = obj
  while (current) {
    if (
      current.name === 'player-duck' ||
      current.name === 'npc-bird' ||
      current.name === 'human-npc' ||
      current.name === 'food-item'
    ) {
      return false
    }
    current = current.parent
  }
  return true
}

function PlayerBird({ isGateOpen, setIsGateOpen }) {
  const meshRef = useRef()
  const velocityYRef = useRef(0)
  const isGroundedRef = useRef(true)
  
  const yawRef = useRef(0)
  const pitchRef = useRef(0.2)

  // 2D horizontal velocity for acceleration/inertia
  const velocityRef = useRef(new THREE.Vector2(0, 0))

  // Raycaster references for ground surface snapping
  const raycasterRef = useRef(new THREE.Raycaster())
  const rayOriginRef = useRef(new THREE.Vector3())
  const rayDirRef = useRef(new THREE.Vector3(0, -1, 0))

  // Wing mesh references for flapping animation
  const leftWingRef = useRef()
  const rightWingRef = useRef()

  const isGateOpenRef = useRef(isGateOpen)
  useEffect(() => {
    isGateOpenRef.current = isGateOpen
  }, [isGateOpen])

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

      // E Key - Interaction
      if (e.code === 'KeyE') {
        const pos = meshRef.current?.position
        if (pos) {
          const dx = pos.x - (-30)
          const dz = pos.z - 45
          const dist = Math.sqrt(dx * dx + dz * dz)
          if (dist < 3) {
            setIsGateOpen((prev) => !prev)
          }
        }
      }

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

  // Mouse Tracking Event Listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (document.pointerLockElement) {
        yawRef.current -= e.movementX * 0.002
        pitchRef.current = Math.max(-0.5, Math.min(0.5, pitchRef.current + e.movementY * 0.002))
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const pos = meshRef.current.position
    const yaw = yawRef.current
    const pitch = pitchRef.current
    const isGateOpenVal = isGateOpenRef.current
    const velocity = velocityRef.current

    // Check distance to main gate [-30, 0, 45]
    const gateX = -30
    const gateZ = 45
    const dx = pos.x - gateX
    const dz = pos.z - gateZ
    const dist = Math.sqrt(dx * dx + dz * dz)
    const inRange = dist < 3

    const hudEl = document.getElementById('gate-hud')
    if (hudEl) {
      if (inRange) {
        hudEl.style.display = 'block'
        hudEl.innerText = isGateOpenVal ? '[E] Close Gate' : '[E] Open Gate'
      } else {
        hudEl.style.display = 'none'
      }
    }

    // A. Check distance to all water pools
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

    // B. RAYCAST GROUND TRACKING (IK Placement)
    // Project downward ray from high point at current horizontal coordinates
    rayOriginRef.current.set(pos.x, 10.0, pos.z)
    const raycaster = raycasterRef.current
    raycaster.set(rayOriginRef.current, rayDirRef.current)

    const intersects = raycaster.intersectObjects(state.scene.children, true)
    let raycastHeight = 0.0 // Baseline flat pasture grass
    for (const hit of intersects) {
      if (isEnvironmentObject(hit.object)) {
        raycastHeight = hit.point.y
        break
      }
    }

    // Determine target/ground height based on location (water vs land)
    let groundLevel = 0.0
    if (isInsidePond) {
      // If we are in the pool area, but stand on a rock/solid height > 0.05, we snap to it
      if (raycastHeight > 0.05) {
        groundLevel = raycastHeight
      } else {
        // Sinusoidal buoyancy bobbing on water ripples
        const bob = Math.sin(state.clock.getElapsedTime() * 3) * 0.05
        groundLevel = -0.2 + bob
      }
    } else {
      groundLevel = raycastHeight
    }

    const spacePressed = keysRef.current.space
    const forward = keysRef.current.moveForward
    const backward = keysRef.current.moveBackward
    const left = keysRef.current.moveLeft
    const right = keysRef.current.moveRight

    // C. Gravity / Gliding physics
    if (!isGroundedRef.current) {
      const gravity = 32
      const glideGravity = 6
      
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
      // Snap feet directly to exact surface height
      pos.y = groundLevel
    }

    // D. Rigid Velocity inertia (Acceleration & Deceleration curves)
    const accel = 12.0
    const decel = 8.0

    let targetSpeed = isInsidePond ? stats.swimSpeed : stats.speed
    if (!isGroundedRef.current && spacePressed && velocityYRef.current < 0 && (forward || backward || left || right)) {
      targetSpeed = stats.speed * 1.5
    }

    if (forward || backward || left || right) {
      // Calculate input direction relative to camera yaw
      let inputX = 0
      let inputZ = 0

      const fwdX = -Math.sin(yaw)
      const fwdZ = -Math.cos(yaw)
      const rgtX = Math.cos(yaw)
      const rgtZ = -Math.sin(yaw)

      if (forward) {
        inputX += fwdX
        inputZ += fwdZ
      }
      if (backward) {
        inputX -= fwdX
        inputZ -= fwdZ
      }
      if (left) {
        inputX -= rgtX
        inputZ -= rgtZ
      }
      if (right) {
        inputX += rgtX
        inputZ += rgtZ
      }

      // Normalize input heading
      const inputLen = Math.sqrt(inputX * inputX + inputZ * inputZ)
      if (inputLen > 0) {
        inputX /= inputLen
        inputZ /= inputLen
      }

      // Accelerate towards target velocity
      const targetVelX = inputX * targetSpeed
      const targetVelZ = inputZ * targetSpeed
      velocity.x += (targetVelX - velocity.x) * accel * delta
      velocity.y += (targetVelZ - velocity.y) * accel * delta
    } else {
      // Apply friction deceleration
      velocity.x += (0 - velocity.x) * decel * delta
      velocity.y += (0 - velocity.y) * decel * delta
    }

    // E. Swimming Damping (fluid drag reduces speed by 40%)
    const speedMultiplier = isInsidePond ? 0.6 : 1.0
    const stepX = velocity.x * speedMultiplier * delta
    const stepZ = velocity.y * speedMultiplier * delta

    const nextX = pos.x + stepX
    const nextZ = pos.z + stepZ

    // Apply sliding collision checks independently on X and Z axes
    if (!checkCollision(nextX, pos.z, isGateOpenVal)) {
      pos.x = nextX
    } else {
      velocity.x = 0
    }
    if (!checkCollision(pos.x, nextZ, isGateOpenVal)) {
      pos.z = nextZ
    } else {
      velocity.y = 0
    }

    // F. Animations & Turning Alignment
    const isMoving = velocity.length() > 0.1

    if (isMoving) {
      // Smoothly rotate body to align with horizontal velocity vector
      const targetRotationY = Math.atan2(-velocity.x, -velocity.y)
      const diffRot = targetRotationY - meshRef.current.rotation.y
      const normDiff = Math.atan2(Math.sin(diffRot), Math.cos(diffRot))
      meshRef.current.rotation.y += normDiff * 8 * delta

      // Lean body slightly based on forward/backward movement direction
      const directionMultiplier = forward ? 1 : (backward ? -1 : 0)
      meshRef.current.rotation.x += ((0.05 * directionMultiplier) - meshRef.current.rotation.x) * 0.1

      if (!isGroundedRef.current) {
        meshRef.current.rotation.z += (0 - meshRef.current.rotation.z) * 0.1
        if (spacePressed && velocityYRef.current < 0) {
          // Gliding leaning and banking
          meshRef.current.rotation.x += (0.15 - meshRef.current.rotation.x) * 0.1
          if (left) meshRef.current.rotation.z += (0.15 - meshRef.current.rotation.z) * 0.1
          if (right) meshRef.current.rotation.z += (-0.15 - meshRef.current.rotation.z) * 0.1
        } else {
          // Standard jump pitch
          const targetPitch = velocityYRef.current > 0 ? -0.1 : 0.1
          meshRef.current.rotation.x += (targetPitch - meshRef.current.rotation.x) * 0.1
        }
      } else {
        // Grounded animation waddle/swim
        if (!isInsidePond) {
          // Waddling on land
          const waddleFreq = 12
          meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * waddleFreq) * 0.08
          pos.y = groundLevel + Math.abs(Math.sin(state.clock.getElapsedTime() * waddleFreq)) * 0.05
        } else {
          // Swimming bobbing
          meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 4) * 0.05
          pos.y = groundLevel
        }
      }
    } else {
      // Reset rotations when not moving
      meshRef.current.rotation.z += (0 - meshRef.current.rotation.z) * 0.1
      meshRef.current.rotation.x += (0 - meshRef.current.rotation.x) * 0.1

      if (isGroundedRef.current) {
        pos.y = groundLevel
      }
    }

    // Sanctuary Boundaries Constraint Check
    const boundary = 44.5
    pos.x = Math.max(-boundary, Math.min(boundary, pos.x))
    pos.z = Math.max(-boundary, Math.min(boundary, pos.z))

    // G. Wing Flapping Animations (State-driven)
    if (leftWingRef.current && rightWingRef.current) {
      const t = state.clock.getElapsedTime()
      const isGliding = !isGroundedRef.current && spacePressed
      const isMovingInput = forward || backward || left || right

      if (isGliding) {
        // GLIDE MODE: Spread wings wide and flap aggressively!
        leftWingRef.current.rotation.z = Math.sin(t * 25) * 0.4 + 0.6
        rightWingRef.current.rotation.z = -Math.sin(t * 25) * 0.4 - 0.6
      } else if (isMovingInput) {
        // SPRINT MODE: Subtle wing wobble for running balance
        leftWingRef.current.rotation.z = Math.sin(t * 10) * 0.08 + 0.1
        rightWingRef.current.rotation.z = -Math.sin(t * 10) * 0.08 - 0.1
      } else {
        // IDLE MODE: Rest wings flat against the sides
        leftWingRef.current.rotation.z = 0.1
        rightWingRef.current.rotation.z = -0.1
      }
    }

    // Strict 3rd-person camera orbital locking
    const distance = 6
    const duckPos = meshRef.current.position
    const targetCamX = duckPos.x + distance * Math.sin(yaw) * Math.cos(pitch)
    const targetCamY = duckPos.y + 2.5 + distance * Math.sin(pitch)
    const targetCamZ = duckPos.z + distance * Math.cos(yaw) * Math.cos(pitch)

    state.camera.position.set(targetCamX, targetCamY, targetCamZ)
    state.camera.lookAt(duckPos.x, duckPos.y + 1, duckPos.z)
  })

  return (
    <group ref={meshRef} position={[-30, 0, 40]} scale={[0.6, 0.6, 0.6]} name="player-duck">
      {/* 1. PLUMP MAIN BODY */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 32, 16]} /> {/* Scaled to be elongated */}
        <meshStandardMaterial color="#8B5A2B" roughness={0.7} /> {/* Rich Mallard Brown */}
      </mesh>

      {/* 2. SLOPING NECK & EMERALD HEAD */}
      <group position={[0, 0.5, -0.25]}>
        {/* Neck */}
        <mesh position={[0, 0.15, -0.05]} rotation={[0.3, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.4, 16]} />
          <meshStandardMaterial color="#006400" roughness={0.4} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.35, -0.1]} castShadow receiveShadow>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color="#006400" roughness={0.4} /> {/* Glossy Mallard Green */}
        </mesh>
        {/* Realistic Yellow Bill/Beak */}
        <mesh position={[0, 0.32, -0.25]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.05, 0.18]} />
          <meshStandardMaterial color="#FFA500" roughness={0.5} /> {/* Orange/Yellow Bill */}
        </mesh>
      </group>

      {/* 3. FLAPPABLE WINGS (Tucked to sides) */}
      {/* Left Wing */}
      <mesh ref={leftWingRef} position={[-0.32, 0.4, 0]} rotation={[0, 0, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.25, 0.5]} />
        <meshStandardMaterial color="#5C4033" roughness={0.8} />
      </mesh>
      {/* Right Wing */}
      <mesh ref={rightWingRef} position={[0.32, 0.4, 0]} rotation={[0, 0, -0.1]} castShadow receiveShadow>
        <boxGeometry args={[0.05, 0.25, 0.5]} />
        <meshStandardMaterial color="#5C4033" roughness={0.8} />
      </mesh>

      {/* 4. WEBBED FEET (Grounded on grass) */}
      {/* Left Leg & Foot */}
      <group position={[-0.15, 0.1, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          <meshStandardMaterial color="#FF4500" /> {/* Bright Waterfowl Orange */}
        </mesh>
        <mesh position={[0, -0.1, -0.05]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.01, 0.15]} /> {/* Flat Webbed Paddle */}
          <meshStandardMaterial color="#FF4500" />
        </mesh>
      </group>
      {/* Right Leg & Foot */}
      <group position={[0.15, 0.1, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          <meshStandardMaterial color="#FF4500" />
        </mesh>
        <mesh position={[0, -0.1, -0.05]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.01, 0.15]} />
          <meshStandardMaterial color="#FF4500" />
        </mesh>
      </group>
    </group>
  )
}

export default function App() {
  const [isGateOpen, setIsGateOpen] = useState(false)
  const [foodItems, setFoodItems] = useState([])

  const handleSpawnFood = () => {
    const list = []
    const count = 15 + Math.floor(Math.random() * 6) // 15 to 20 items
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 5 // within a 5-meter radius
      const fx = -22 + Math.cos(angle) * radius
      const fz = 8 + Math.sin(angle) * radius
      list.push({ id: `food-${i}-${Date.now()}`, position: [fx, 0.075, fz] })
    }
    setFoodItems(list)
  }

  const handleEatFood = (foodId) => {
    setFoodItems((prev) => prev.filter((item) => item.id !== foodId))
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas camera={{ position: [0, 8, 16], fov: 60 }} shadows>
        <Sky distance={450000} sunPosition={[15, 30, 15]} inclination={0} azimuth={0.25} />
        <ambientLight intensity={0.7} />
        <directionalLight 
          castShadow 
          position={[15, 30, 15]} 
          intensity={1.5} 
          shadow-mapSize={[2048, 2048]} 
        />
        
        <PlayerBird isGateOpen={isGateOpen} setIsGateOpen={setIsGateOpen} />
        
        {SANCTUARY_NPCS.map((npc) => (
          <NPCBird 
            key={npc.id} 
            {...npc} 
            foodItems={foodItems} 
            onEatFood={handleEatFood} 
          />
        ))}

        {foodItems.map((food) => (
          <mesh key={food.id} position={food.position} castShadow receiveShadow>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#FFD700" roughness={0.5} />
          </mesh>
        ))}

        <HumanNPC setIsGateOpen={setIsGateOpen} onSpawnFood={handleSpawnFood} />
        
        <SanctuaryMap isGateOpen={isGateOpen} />
        
        <PointerLockControls />
      </Canvas>

      {/* Interactive Gate HUD Overlay */}
      <div id="gate-hud" style={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.75)',
        color: '#fff',
        padding: '12px 24px',
        borderRadius: '30px',
        fontFamily: "'Outfit', 'Inter', sans-serif",
        fontSize: '18px',
        fontWeight: '600',
        pointerEvents: 'none',
        display: 'none',
        zIndex: 10,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(5px)',
        letterSpacing: '0.5px',
      }}>
        [E] Open Gate
      </div>
    </div>
  )
}
