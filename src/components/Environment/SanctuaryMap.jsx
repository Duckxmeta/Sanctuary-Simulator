import React, { useMemo } from 'react'

function FenceLine({ start, end, postCount = 12 }) {
  const [x1, z1] = start
  const [x2, z2] = end

  const posts = useMemo(() => {
    const arr = []
    for (let i = 0; i < postCount; i++) {
      const t = i / (postCount - 1)
      const x = x1 + (x2 - x1) * t
      const z = z1 + (z2 - z1) * t
      arr.push([x, z])
    }
    return arr
  }, [x1, z1, x2, z2, postCount])

  const rails = useMemo(() => {
    const arr = []
    for (let i = 0; i < postCount - 1; i++) {
      const t = i / (postCount - 1)
      const nextT = (i + 1) / (postCount - 1)
      const x = x1 + (x2 - x1) * t
      const z = z1 + (z2 - z1) * t
      const nextX = x1 + (x2 - x1) * nextT
      const nextZ = z1 + (z2 - z1) * nextT

      const midX = (x + nextX) / 2
      const midZ = (z + nextZ) / 2
      const dx = nextX - x
      const dz = nextZ - z
      const length = Math.sqrt(dx * dx + dz * dz)
      const angle = Math.atan2(dz, dx)

      arr.push({
        position: [midX, midZ],
        length,
        angle,
      })
    }
    return arr
  }, [x1, z1, x2, z2, postCount])

  return (
    <group>
      {/* Posts */}
      {posts.map(([x, z], idx) => (
        <mesh key={`post-${idx}`} position={[x, 0.8, z]} castShadow receiveShadow>
          <boxGeometry args={[0.2, 1.6, 0.2]} />
          <meshStandardMaterial color="#4e3629" roughness={0.9} />
        </mesh>
      ))}
      {/* Rails */}
      {rails.map((rail, idx) => (
        <group
          key={`rail-group-${idx}`}
          position={[rail.position[0], 0, rail.position[1]]}
          rotation={[0, -rail.angle, 0]}
        >
          {/* Lower Rail */}
          <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[rail.length + 0.05, 0.08, 0.06]} />
            <meshStandardMaterial color="#4e3629" roughness={0.9} />
          </mesh>
          {/* Upper Rail */}
          <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[rail.length + 0.05, 0.08, 0.06]} />
            <meshStandardMaterial color="#4e3629" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function SanctuaryMap() {
  // Generate random placement of rocks around the pond
  const rocks = useMemo(() => {
    const arr = []
    const count = 16
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.2
      const radius = 5.2 + Math.random() * 0.4
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const scaleX = 0.5 + Math.random() * 0.6
      const scaleY = 0.3 + Math.random() * 0.4
      const scaleZ = 0.5 + Math.random() * 0.6
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
  }, [])

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
      {/* 1. Main Ground / Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
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
      <group position={[0, 0, 0]}>
        {/* Pond Sand/Dirt Shoreline */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
          <cylinderGeometry args={[5.6, 5.8, 0.02, 32]} />
          <meshStandardMaterial color="#cfd8dc" roughness={0.9} />
        </mesh>
        
        {/* Pond Water */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
          <cylinderGeometry args={[5.2, 5.2, 0.02, 32]} />
          <meshStandardMaterial color="#0288d1" roughness={0.2} metalness={0.1} transparent opacity={0.85} />
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

      {/* 4. Sanctuary Boundaries (Perimeter Fencing) */}
      <FenceLine start={[-24.8, -24.8]} end={[24.8, -24.8]} postCount={11} />
      <FenceLine start={[24.8, -24.8]} end={[24.8, 24.8]} postCount={11} />
      <FenceLine start={[24.8, 24.8]} end={[-24.8, 24.8]} postCount={11} />
      <FenceLine start={[-24.8, 24.8]} end={[-24.8, -24.8]} postCount={11} />

      {/* 5. The Main Coop */}
      <group position={[14, 0, -14]} rotation={[0, -Math.PI / 4, 0]}>
        {/* Support Legs */}
        <mesh position={[-1.7, 0.25, -1.7]} castShadow>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>
        <mesh position={[1.7, 0.25, -1.7]} castShadow>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>
        <mesh position={[-1.7, 0.25, 1.7]} castShadow>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>
        <mesh position={[1.7, 0.25, 1.7]} castShadow>
          <boxGeometry args={[0.2, 0.5, 0.2]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>

        {/* Main Cabin Body */}
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[4, 2, 4]} />
          <meshStandardMaterial color="#5d4037" roughness={0.8} />
        </mesh>

        {/* Triangular Roof (Rotated Cone/Pyramid) */}
        <mesh position={[0, 3.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.2, 1.5, 4]} />
          <meshStandardMaterial color="#8e24aa" roughness={0.6} />
        </mesh>

        {/* Coop Door */}
        <mesh position={[0, 1.2, 2.01]}>
          <boxGeometry args={[1, 1.4, 0.05]} />
          <meshStandardMaterial color="#2d1510" roughness={0.9} />
        </mesh>

        {/* Ramp leading down from the door to the ground */}
        <mesh position={[0, 0.25, 2.6]} rotation={[0.3, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 0.1, 1.5]} />
          <meshStandardMaterial color="#4e3629" roughness={0.9} />
        </mesh>

        {/* A tiny decorative window */}
        <mesh position={[-2.01, 1.6, 0]}>
          <boxGeometry args={[0.05, 0.6, 0.6]} />
          <meshStandardMaterial color="#e0f7fa" emissive="#006064" emissiveIntensity={0.2} roughness={0.1} />
        </mesh>
      </group>
    </group>
  )
}
