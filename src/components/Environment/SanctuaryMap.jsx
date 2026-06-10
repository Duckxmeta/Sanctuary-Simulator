import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SANCTUARY_STRUCTURES } from '../../config/mapLayout'

function InteractiveGate({ isGateOpen, struct }) {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    const targetRotation = isGateOpen ? Math.PI / 2 : 0
    meshRef.current.rotation.y += (targetRotation - meshRef.current.rotation.y) * 0.1
  })
  
  return (
    <mesh ref={meshRef} position={struct.position} castShadow receiveShadow>
      <boxGeometry args={struct.scale} />
      <meshStandardMaterial color={struct.color} roughness={0.8} />
    </mesh>
  )
}

export default function SanctuaryMap({ isGateOpen }) {
  const waterStructures = SANCTUARY_STRUCTURES.filter((s) => s.isWater && (!s.id || !s.id.includes('corner-bush')))
  
  // Render other structures dynamically
  const regularStructures = SANCTUARY_STRUCTURES.filter((s) => !s.isWater && (!s.id || !s.id.includes('corner-bush')))

  // Rocks border pattern (relative offsets) to place around each pool
  const rockOffsets = useMemo(() => {
    return [
      { pos: [1.2, 0.05, 0.2], scale: [0.35, 0.15, 0.3], rot: [0, 0.5, 0] },
      { pos: [-1.2, 0.05, -0.2], scale: [0.3, 0.12, 0.35], rot: [0.1, 1.2, 0] },
      { pos: [0.2, 0.05, 1.2], scale: [0.4, 0.18, 0.3], rot: [0, 0, 0.1] },
      { pos: [-0.2, 0.05, -1.2], scale: [0.28, 0.1, 0.28], rot: [0.2, -0.5, 0] },
      { pos: [0.9, 0.05, 0.9], scale: [0.32, 0.14, 0.32], rot: [0.1, 0.7, 0.1] },
      { pos: [-0.9, 0.05, -0.9], scale: [0.34, 0.11, 0.34], rot: [0, -0.8, -0.1] },
      { pos: [-0.9, 0.05, 0.9], scale: [0.3, 0.13, 0.3], rot: [0.1, -0.7, 0] },
      { pos: [0.9, 0.05, -0.9], scale: [0.35, 0.16, 0.35], rot: [0, 0.8, 0.1] },
    ]
  }, [])

  return (
    <group>
      {/* 1. Main Ground / Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial color="#556B2F" roughness={0.9} />
      </mesh>

      {/* 3. Water Pools (rendered completely flat, matching the horizontal physics tracking) */}
      {waterStructures.map((waterStruct) => {
        const radius = waterStruct.scale[0] / 2
        const height = waterStruct.scale[1]

        return (
          <group key={waterStruct.id} position={waterStruct.position}>
            {/* Shoreline Sand Ring (no rotation on mesh so it sits flat horizontally) */}
            <mesh position={[0, 0.001, 0]} receiveShadow>
              <cylinderGeometry args={[radius + 0.2, radius + 0.3, 0.01, 32]} />
              <meshStandardMaterial color="#cfd8dc" roughness={0.9} />
            </mesh>
            
            {/* Water Surface (no rotation on mesh so it sits flat horizontally) */}
            <mesh position={[0, 0.01, 0]} receiveShadow>
              <cylinderGeometry args={[radius, radius, height, 32]} />
              <meshStandardMaterial color={waterStruct.color} roughness={0.1} metalness={0.1} transparent opacity={0.6} />
            </mesh>

            {/* Rocks border around each pool */}
            {rockOffsets.map((rock, idx) => (
              <mesh
                key={`rock-${waterStruct.id}-${idx}`}
                position={rock.pos}
                scale={rock.scale}
                rotation={rock.rot}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#90a4ae" roughness={0.8} />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* 4. Render All Other Structures Dynamically */}
      {regularStructures.map((struct) => {
        if (struct.id === 'main-gate') {
          return <InteractiveGate key={struct.id} isGateOpen={isGateOpen} struct={struct} />
        }

        const isCylinder = struct.type === 'cylinder'
        const isCone = struct.type === 'cone'
        
        return (
          <mesh 
            key={struct.id} 
            position={struct.position} 
            rotation={isCone ? [0, Math.PI / 4, 0] : [0, 0, 0]}
            castShadow 
            receiveShadow
          >
            {isCylinder ? (
              <cylinderGeometry args={[struct.scale[0] / 2, struct.scale[2] / 2, struct.scale[1], 16]} />
            ) : isCone ? (
              <coneGeometry args={[struct.scale[0] / 2, struct.scale[1], 4]} />
            ) : (
              <boxGeometry args={struct.scale} />
            )}
            <meshStandardMaterial color={struct.color} roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}
