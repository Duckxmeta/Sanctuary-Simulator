import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'

export default function HumanNPC({ setIsGateOpen, onSpawnFood }) {
  const groupRef = useRef()
  const [phase, setPhase] = useState('walking_to_gate')
  const [holdingBucket, setHoldingBucket] = useState(true)

  // Path nodes coordinates
  const nodes = {
    gateLine: [-30, 0, 45],
    node1: [-30, 0, 43],
    node2: [-20, 0, 22],
    pool1: [-9, 0, -26],
    pool2: [-3, 0, -26],
    pool3: [3, 0, -26],
    pool4: [9, 0, -26],
    outside: [-30, 0, 55]
  }

  // Index pointer for sub-phases (e.g. gate segments, pool segments)
  const stepIndexRef = useRef(0)
  
  // Walking speed
  const speed = 2.0

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const pos = groupRef.current.position

    let target = [0, 0, 0]

    // Chore Phase State Machine
    if (phase === 'walking_to_gate') {
      if (stepIndexRef.current === 0) {
        // Target: gate threshold to open it
        target = nodes.gateLine
        const dist = Math.sqrt((pos.x - target[0]) ** 2 + (pos.z - target[2]) ** 2)
        if (dist < 0.2) {
          setIsGateOpen(true)
          stepIndexRef.current = 1 // Step through the gate
        }
      } else {
        // Target: Node 1 inside the gate
        target = nodes.node1
        const dist = Math.sqrt((pos.x - target[0]) ** 2 + (pos.z - target[2]) ** 2)
        if (dist < 0.2) {
          setPhase('feeding')
          stepIndexRef.current = 0
        }
      }
    } else if (phase === 'feeding') {
      // Target: Campsite Feed Zone
      target = nodes.node2
      const dist = Math.sqrt((pos.x - target[0]) ** 2 + (pos.z - target[2]) ** 2)
      if (dist < 0.2) {
        onSpawnFood()
        setHoldingBucket(false) // Feed bucket is emptied/put away
        setPhase('cleaning_pools')
        stepIndexRef.current = 1 // Set target to Pool 1
      }
    } else if (phase === 'cleaning_pools') {
      if (stepIndexRef.current === 1) {
        target = nodes.pool1
        const dist = Math.sqrt((pos.x - target[0]) ** 2 + (pos.z - target[2]) ** 2)
        if (dist < 0.2) stepIndexRef.current = 2
      } else if (stepIndexRef.current === 2) {
        target = nodes.pool2
        const dist = Math.sqrt((pos.x - target[0]) ** 2 + (pos.z - target[2]) ** 2)
        if (dist < 0.2) stepIndexRef.current = 3
      } else if (stepIndexRef.current === 3) {
        target = nodes.pool3
        const dist = Math.sqrt((pos.x - target[0]) ** 2 + (pos.z - target[2]) ** 2)
        if (dist < 0.2) stepIndexRef.current = 4
      } else if (stepIndexRef.current === 4) {
        target = nodes.pool4
        const dist = Math.sqrt((pos.x - target[0]) ** 2 + (pos.z - target[2]) ** 2)
        if (dist < 0.2) {
          setPhase('exiting')
          stepIndexRef.current = 0 // Set target back to gate exit node
        }
      }
    } else if (phase === 'exiting') {
      if (stepIndexRef.current === 0) {
        // Target: Node 1 inside the gate
        target = nodes.node1
        const dist = Math.sqrt((pos.x - target[0]) ** 2 + (pos.z - target[2]) ** 2)
        if (dist < 0.2) {
          setIsGateOpen(true) // Make sure gate is open
          stepIndexRef.current = 1
        }
      } else {
        // Target: Outside gate road boundary
        target = nodes.outside
        const dist = Math.sqrt((pos.x - target[0]) ** 2 + (pos.z - target[2]) ** 2)
        if (dist < 0.2) {
          setIsGateOpen(false) // Close gate behind them
          setPhase('resting') // Chore schedule completed
        }
      }
    } else {
      // Idle state when caretakers duties are finished
      return
    }

    // Smooth movement logic
    const dx = target[0] - pos.x
    const dz = target[2] - pos.z
    const len = Math.sqrt(dx * dx + dz * dz)
    if (len > 0.05) {
      pos.x += (dx / len) * speed * delta
      pos.z += (dz / len) * speed * delta

      // Rotate caretaker to face walking target direction
      const angle = Math.atan2(-dx, -dz)
      // Smooth rotation interp
      const diff = angle - groupRef.current.rotation.y
      const normDiff = Math.atan2(Math.sin(diff), Math.cos(diff))
      groupRef.current.rotation.y += normDiff * 5 * delta
    }
  })

  return (
    <group ref={groupRef} position={[-30, 0, 55]}>
      {/* Tall Blue Caretaker Canvas Body */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 1.8, 0.4]} />
        <meshStandardMaterial color="#1E90FF" roughness={0.7} />
      </mesh>

      {/* Caretaker Head */}
      <mesh position={[0, 1.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#FFDAB9" roughness={0.6} />
      </mesh>

      {/* Feed Bucket (if holding) */}
      {holdingBucket && (
        <mesh position={[0.35, 0.5, -0.1]} castShadow receiveShadow>
          <cylinderGeometry args={[0.15, 0.12, 0.3, 16]} />
          <meshStandardMaterial color="#708090" roughness={0.5} />
        </mesh>
      )}
    </group>
  )
}
