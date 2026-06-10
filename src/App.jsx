import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sky, Html } from '@react-three/drei'
import SanctuaryMap from './components/Environment/SanctuaryMap'

const stats = {
  speed: 4,
  swimSpeed: 7,
}

function PlayerBird() {
  const meshRef = useRef()
  const [showQuack, setShowQuack] = useState(false)
  const keysRef = useRef({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
  })

  // Keyboard Event Listeners
  useEffect(() => {
    let quackTimeoutId = null

    const handleKeyDown = (e) => {
      // Movement keys
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysRef.current.moveForward = true
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.moveBackward = true
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.moveLeft = true
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.moveRight = true

      // Spacebar to quack
      if (e.code === 'Space') {
        setShowQuack(true)
        if (quackTimeoutId) clearTimeout(quackTimeoutId)
        quackTimeoutId = setTimeout(() => {
          setShowQuack(false)
        }, 1000)
      }
    }

    const handleKeyUp = (e) => {
      // Movement keys released
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysRef.current.moveForward = false
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.moveBackward = false
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.moveLeft = false
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.moveRight = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (quackTimeoutId) clearTimeout(quackTimeoutId)
    }
  }, [])

  useFrame((state, delta) => {
    if (!meshRef.current) return

    const pos = meshRef.current.position

    // 1. Calculate player's distance from the center of the pond (0, 0, 0)
    const distToCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
    const pondRadius = 5.2
    const isInsidePond = distToCenter < pondRadius

    // 2. Determine target height and movement speed
    const targetY = isInsidePond ? 0.15 : 0.5
    const moveSpeed = isInsidePond ? stats.swimSpeed : stats.speed

    // Smoothly transition the bird's height (lerp)
    pos.y += (targetY - pos.y) * 0.1

    // 3. Movement input & steering calculation
    const left = keysRef.current.moveLeft
    const right = keysRef.current.moveRight
    const forward = keysRef.current.moveForward
    const backward = keysRef.current.moveBackward

    // Rotation steering (A/D adjusts rotation.y)
    if (left) meshRef.current.rotation.y += 3 * delta
    if (right) meshRef.current.rotation.y -= 3 * delta

    const isMoving = forward || backward

    if (isMoving) {
      const directionMultiplier = forward ? 1 : -1
      
      // Move forward/backward based on current rotation.y
      pos.x -= Math.sin(meshRef.current.rotation.y) * moveSpeed * delta * directionMultiplier
      pos.z -= Math.cos(meshRef.current.rotation.y) * moveSpeed * delta * directionMultiplier

      // Waddling vs Swimming Animation
      if (!isInsidePond) {
        // Waddling on land (bobbing and side tilting)
        const waddleFreq = 16
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * waddleFreq) * 0.15
        pos.y = targetY + Math.abs(Math.sin(state.clock.elapsedTime * waddleFreq)) * 0.08
      } else {
        // Swimming in pond (gentle wave and forward lean)
        meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 6) * 0.05
        meshRef.current.rotation.x = 0.05 * directionMultiplier
        pos.y = targetY + Math.sin(state.clock.elapsedTime * 4) * 0.03
      }
    } else {
      // Reset rotations when not moving (Z and X rotations only, Y is controlled by steering)
      meshRef.current.rotation.z += (0 - meshRef.current.rotation.z) * 0.1
      meshRef.current.rotation.x += (0 - meshRef.current.rotation.x) * 0.1

      if (isInsidePond) {
        // Idle floating bob
        pos.y = targetY + Math.sin(state.clock.elapsedTime * 2) * 0.04
      }
    }

    // 4. Sanctuary Boundaries Constraint Check (perimeter at 24.5 units)
    const boundary = 24.5
    pos.x = Math.max(-boundary, Math.min(boundary, pos.x))
    pos.z = Math.max(-boundary, Math.min(boundary, pos.z))

    // 5. Dynamic Camera Tracking (3rd-person follow camera pinned behind tail feathers)
    const theta = meshRef.current.rotation.y
    state.camera.position.set(
      meshRef.current.position.x + Math.sin(theta) * 6,
      meshRef.current.position.y + 3, // Height behind player
      meshRef.current.position.z + Math.cos(theta) * 6  // Distance behind player
    )
    state.camera.lookAt(meshRef.current.position)
  })

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffde59" roughness={0.5} />
      {showQuack && (
        <Html position={[0, 1.3, 0]} center>
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#ff9800',
            padding: '6px 12px',
            borderRadius: '16px',
            fontWeight: '900',
            fontSize: '14px',
            fontFamily: '"Outfit", "Inter", sans-serif',
            border: '2px solid #ff9800',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            animation: 'quackPop 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            transformOrigin: 'bottom center',
          }}>
            QUACK! 🦆
          </div>
          <style>{`
            @keyframes quackPop {
              0% { transform: scale(0.5) translateY(10px); opacity: 0; }
              100% { transform: scale(1) translateY(0); opacity: 1; }
            }
          `}</style>
        </Html>
      )}
    </mesh>
  )
}

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 8, 16], fov: 60 }} shadows>
        <Sky sunPosition={[100, 10, 100]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 15, 5]} intensity={1.5} castShadow />
        
        <PlayerBird />
        
        <SanctuaryMap />
      </Canvas>
    </div>
  )
}
