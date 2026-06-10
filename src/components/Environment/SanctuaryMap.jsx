import React, { useMemo } from 'react'
import { SANCTUARY_STRUCTURES } from '../../config/mapLayout'

export default function SanctuaryMap() {
  // Find specific structures to render custom premium details
  const pondStruct = SANCTUARY_STRUCTURES.find((s) => s.id === 'main-pond')
  const coopStruct = SANCTUARY_STRUCTURES.find((s) => s.id === 'main-coop')
  
  // Render other static box structures (like fences) directly
  const otherStructures = SANCTUARY_STRUCTURES.filter(
    (s) => s.id !== 'main-pond' && s.id !== 'main-coop'
  )

  // Generate random placement of rocks around the pond
  const rocks = useMemo(() => {
    if (!pondStruct) return []
    const arr = []
    const count = 18
    const pondRadius = pondStruct.scale[0] / 2
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15
      const radius = pondRadius + 0.2 + Math.random() * 0.3
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const scaleX = 0.6 + Math.random() * 0.6
      const scaleY = 0.3 + Math.random() * 0.4
      const scaleZ = 0.6 + Math.random() * 0.6
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
  }, [pondStruct])

  // Grass patches/hills for 3D terrain feel
  const hills = useMemo(() => {
    return [
      { position: [-20, -0.5, -16], scale: [10, 2, 10] },
      { position: [20, -0.3, 18], scale: [12, 1.5, 12] },
      { position: [-16, -0.4, 20], scale: [8, 1.8, 8] },
      { position: [12, -0.6, -22], scale: [9, 2, 9] },
    ]
  }, [])

  return (
    <group>
      {/* 1. Main Ground / Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#689f38" roughness={0.9} />
      </mesh>

      {/* 2. Hills/Mounds to break up flat terrain */}
      {hills.map((hill, idx) => (
        <mesh key={`hill-${idx}`} position={hill.position} scale={hill.scale} castShadow receiveShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#558b2f" roughness={0.9} />
        </mesh>
      ))}

      {/* 3. The Main Pond */}
      {pondStruct && (
        <group position={pondStruct.position}>
          {/* Pond Sand/Dirt Shoreline */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]} receiveShadow>
            <cylinderGeometry args={[pondStruct.scale[0] / 2 + 0.5, pondStruct.scale[2] / 2 + 0.7, 0.02, 32]} />
            <meshStandardMaterial color="#cfd8dc" roughness={0.9} />
          </mesh>
          
          {/* Pond Water */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
            <cylinderGeometry args={[pondStruct.scale[0] / 2, pondStruct.scale[2] / 2, 0.02, 32]} />
            <meshStandardMaterial color={pondStruct.color} roughness={0.15} metalness={0.1} transparent opacity={0.85} />
          </mesh>

          {/* Surrounding Rocks */}
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

      {/* 4. The Main Coop */}
      {coopStruct && (
        <group position={coopStruct.position}>
          {/* Main Cabin Body */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={coopStruct.scale} />
            <meshStandardMaterial color={coopStruct.color} roughness={0.85} />
          </mesh>

          {/* Triangular Roof (Rotated Cone/Pyramid) */}
          <mesh position={[0, coopStruct.scale[1] / 2 + 0.8, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[4.2, 1.6, 4]} />
            <meshStandardMaterial color="#8e24aa" roughness={0.6} />
          </mesh>

          {/* Coop Door */}
          <mesh position={[0, -0.3, coopStruct.scale[2] / 2 + 0.01]}>
            <boxGeometry args={[1.2, 1.6, 0.05]} />
            <meshStandardMaterial color="#2d1510" roughness={0.9} />
          </mesh>

          {/* Ramp leading down from the door to the ground */}
          <mesh position={[0, -1.45, coopStruct.scale[2] / 2 + 0.8]} rotation={[0.1, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.1, 1.2]} />
            <meshStandardMaterial color="#4e3629" roughness={0.9} />
          </mesh>

          {/* A tiny decorative window */}
          <mesh position={[-coopStruct.scale[0] / 2 - 0.01, 0.3, 0]}>
            <boxGeometry args={[0.05, 0.8, 0.8]} />
            <meshStandardMaterial color="#e0f7fa" emissive="#006064" emissiveIntensity={0.2} roughness={0.1} />
          </mesh>
        </group>
      )}

      {/* 5. Render Perimeter Fences and other structures from config */}
      {otherStructures.map((struct) => (
        <mesh key={struct.id} position={struct.position} castShadow receiveShadow>
          <boxGeometry args={struct.scale} />
          <meshStandardMaterial color={struct.color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
