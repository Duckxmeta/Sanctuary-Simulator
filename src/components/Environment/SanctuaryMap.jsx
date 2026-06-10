import React, { useMemo } from 'react'
import { SANCTUARY_STRUCTURES } from '../../config/mapLayout'

export default function SanctuaryMap() {
  const waterStruct = SANCTUARY_STRUCTURES.find((s) => s.isWater)
  
  // Render other structures dynamically
  const regularStructures = SANCTUARY_STRUCTURES.filter((s) => !s.isWater)

  // Generate random placement of rocks around the water feature
  const rocks = useMemo(() => {
    if (!waterStruct) return []
    const arr = []
    const count = 16
    const radius = waterStruct.scale[0] / 2 // pond radius
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2
      const rockRadius = radius + 0.1 + Math.random() * 0.2
      const x = Math.cos(angle) * rockRadius
      const z = Math.sin(angle) * rockRadius
      const scaleX = 0.4 + Math.random() * 0.4
      const scaleY = 0.2 + Math.random() * 0.3
      const scaleZ = 0.4 + Math.random() * 0.4
      arr.push({
        id: i,
        position: [x, scaleY / 2, z],
        scale: [scaleX, scaleY, scaleZ],
        rotation: [
          (Math.random() - 0.5) * 0.3,
          Math.random() * Math.PI,
          (Math.random() - 0.5) * 0.3,
        ],
      })
    }
    return arr
  }, [waterStruct])

  // Grass patches/hills for 3D terrain feel
  const hills = useMemo(() => {
    return [
      { position: [-15, -0.5, -12], scale: [8, 2, 8] },
      { position: [16, -0.3, 14], scale: [10, 1.5, 10] },
      { position: [-12, -0.4, 15], scale: [6, 1.8, 6] },
      { position: [8, -0.6, -18], scale: [7, 2, 7] },
    ]
  }, [])

  return (
    <group>
      {/* 1. Main Ground / Grass (46x46 plane to cover the 45x45 boundary area) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[46, 46]} />
        <meshStandardMaterial color="#689f38" roughness={0.9} />
      </mesh>

      {/* 2. Hills/Mounds */}
      {hills.map((hill, idx) => (
        <mesh key={`hill-${idx}`} position={hill.position} scale={hill.scale} castShadow receiveShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#558b2f" roughness={0.9} />
        </mesh>
      ))}

      {/* 3. Water Pond (with rocks and shoreline details) */}
      {waterStruct && (
        <group position={waterStruct.position}>
          {/* Shoreline Sand Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
            <cylinderGeometry args={[waterStruct.scale[0] / 2 + 0.3, waterStruct.scale[2] / 2 + 0.4, 0.02, 32]} />
            <meshStandardMaterial color="#cfd8dc" roughness={0.9} />
          </mesh>
          
          {/* Water Surface */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <cylinderGeometry args={[waterStruct.scale[0] / 2, waterStruct.scale[2] / 2, 0.02, 32]} />
            <meshStandardMaterial color={waterStruct.color} roughness={0.1} metalness={0.1} transparent opacity={0.85} />
          </mesh>

          {/* Rocks border */}
          {rocks.map((rock) => (
            <mesh
              key={`rock-${rock.id}`}
              position={rock.position}
              scale={rock.scale}
              rotation={rock.rotation}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#90a4ae" roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* 4. Render All Other Structures Dynamically */}
      {regularStructures.map((struct) => {
        const isCylinder = struct.type === 'cylinder'
        
        return (
          <mesh key={struct.id} position={struct.position} castShadow receiveShadow>
            {isCylinder ? (
              <cylinderGeometry args={[struct.scale[0] / 2, struct.scale[2] / 2, struct.scale[1], 16]} />
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
