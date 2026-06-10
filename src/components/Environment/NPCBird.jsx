import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SANCTUARY_STRUCTURES } from '../../config/mapLayout'

export default function NPCBird({ id, name, color, pos, type, speed, foodItems, onEatFood }) {
  const groupRef = useRef()
  const targetAngleRef = useRef(Math.random() * Math.PI * 2)
  const changeTimeRef = useRef(0)

  // Determine geometry scale and colors based on bird type
  const isGoose = type === 'goose'
  const baseScale = isGoose ? [0.85, 0.85, 0.85] : [0.6, 0.6, 0.6]
  const headColor = isGoose ? '#FFFFFF' : '#006400' // Mallard green head for ducks, white for goose
  const beakColor = isGoose ? '#FF8C00' : '#FFD700' // Orange beak for goose, yellow for ducks

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const currentPos = groupRef.current.position

    // 1. Attraction & Eat State Machine vs. Wander State Machine
    let nearestFood = null
    let minDistance = Infinity

    if (foodItems && foodItems.length > 0) {
      for (const food of foodItems) {
        const dx = food.position[0] - currentPos.x
        const dz = food.position[2] - currentPos.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < minDistance) {
          minDistance = dist
          nearestFood = food
        }
      }
    }

    let isEating = false
    let targetAngle = targetAngleRef.current

    if (nearestFood) {
      isEating = true
      const dx = nearestFood.position[0] - currentPos.x
      const dz = nearestFood.position[2] - currentPos.z
      targetAngle = Math.atan2(-dx, -dz)
      
      if (minDistance < 0.5) {
        onEatFood(nearestFood.id)
      }
    } else {
      if (state.clock.elapsedTime > changeTimeRef.current) {
        targetAngleRef.current = Math.random() * Math.PI * 2
        changeTimeRef.current = state.clock.elapsedTime + 3 + Math.random() * 3
      }
      targetAngle = targetAngleRef.current
    }

    // Smoothly rotate towards the target angle
    const diff = targetAngle - groupRef.current.rotation.y
    const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff))
    groupRef.current.rotation.y += normalizedDiff * 2 * delta

    // Move forward at native speed relative to body heading
    const currentAngle = groupRef.current.rotation.y
    const stepX = -Math.sin(currentAngle) * speed * delta
    const stepZ = -Math.cos(currentAngle) * speed * delta

    currentPos.x += stepX
    currentPos.z += stepZ

    // 2. Sanctuary Boundaries Constraint Check (perimeter at 44.5 units to match fences at ±45.0)
    const boundary = 44.5
    if (currentPos.x < -boundary || currentPos.x > boundary || currentPos.z < -boundary || currentPos.z > boundary) {
      currentPos.x = Math.max(-boundary, Math.min(boundary, currentPos.x))
      currentPos.z = Math.max(-boundary, Math.min(boundary, currentPos.z))
      // Rotate 180 degrees back into the area
      targetAngleRef.current = (targetAngleRef.current + Math.PI) % (Math.PI * 2)
    }

    // 3. Water Detection Check (Distance check against all pools)
    let isInsidePond = false
    for (const struct of SANCTUARY_STRUCTURES) {
      if (struct.isWater) {
        const [px, , pz] = struct.position
        const pradius = struct.scale[0] / 2
        const dx = currentPos.x - px
        const dz = currentPos.z - pz
        const dist = Math.sqrt(dx * dx + dz * dz)
        if (dist < pradius) {
          isInsidePond = true
          break
        }
      }
    }

    // Determine target height & apply animations (bobbing / waddling)
    let targetY = 0.0
    if (isInsidePond) {
      // Simulate floating and bobbing inside the pool: drop Y position slightly
      const bob = Math.sin(state.clock.elapsedTime * 3 + currentPos.x) * 0.03
      targetY = -0.2 + bob
      // Tilt side-to-side slightly while swimming
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.05
      groupRef.current.rotation.x = 0
    } else {
      // Waddle on land
      const waddleFreq = 12
      const waddleAngle = Math.sin(state.clock.elapsedTime * waddleFreq) * 0.08
      groupRef.current.rotation.z = waddleAngle
      // Waddle bobbing height
      targetY = 0.0 + Math.abs(Math.sin(state.clock.elapsedTime * waddleFreq)) * 0.05
      // Slight pitch tilt forward when walking
      groupRef.current.rotation.x = 0.04
    }

    // Smooth height lerping
    currentPos.y += (targetY - currentPos.y) * 0.1
  })

  return (
    <group ref={groupRef} position={[pos[0], pos[1], pos[2]]} scale={baseScale}>
      {/* MAIN BODY */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.5, 1.0]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* HEAD */}
      <mesh position={[0, 0.8, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color={headColor} roughness={0.5} />
      </mesh>

      {/* BEAK */}
      <mesh position={[0, 0.75, -0.7]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshStandardMaterial color={beakColor} />
      </mesh>
    </group>
  )
}
