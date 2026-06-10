import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
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

function Tree({ struct }) {
  return (
    <group position={struct.position}>
      {/* Trunk: A dark brown (#5C4033) cylinder tapers naturally */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 3, 8]} />
        <meshStandardMaterial color="#5C4033" roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Canopy: A cluster of three overlapping, slightly offset icosahedron geometries */}
      <mesh position={[0, 3.0, 0]} castShadow receiveShadow>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial color="#228B22" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[-0.4, 3.6, 0.3]} castShadow receiveShadow>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial color="#228B22" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0.3, 3.7, -0.4]} castShadow receiveShadow>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial color="#228B22" roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  )
}

function Bush({ struct }) {
  return (
    <group position={struct.position}>
      {/* Clusters of organic spheres of varying scales ([0.6, 0.8, 0.6]) and alternating leaf tones (#2E8B57 and #1E5631) tightly grouped together */}
      <mesh position={[0, 0.4, 0]} scale={[0.6, 0.8, 0.6]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#1E5631" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0.5, 0.3, 0.3]} scale={[0.5, 0.7, 0.5]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#2E8B57" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-0.5, 0.3, -0.3]} scale={[0.55, 0.75, 0.55]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#2E8B57" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[-0.3, 0.4, 0.4]} scale={[0.6, 0.8, 0.6]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#1E5631" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0.3, 0.2, -0.4]} scale={[0.5, 0.7, 0.5]} castShadow receiveShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#2E8B57" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  )
}

export default function SanctuaryMap({ isGateOpen }) {
  const waterStructures = useMemo(() => {
    return (SANCTUARY_STRUCTURES || []).filter((s) => s.isWater)
  }, [])
  
  // Render other structures dynamically, excluding trees and bushes
  const regularStructures = useMemo(() => {
    return (SANCTUARY_STRUCTURES || []).filter(
      (s) => !s.isWater && s.type !== 'tree' && s.type !== 'bush' && (!s.id || !s.id.includes('corner-bush'))
    )
  }, [])

  const treeStructures = useMemo(() => {
    return (SANCTUARY_STRUCTURES || []).filter((s) => s.type === 'tree')
  }, [])

  const bushStructures = useMemo(() => {
    return (SANCTUARY_STRUCTURES || []).filter((s) => s.type === 'bush' || (s.id && s.id.includes('corner-bush')))
  }, [])

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

  // Create subtle grayscale procedural noise texture using HTML5 Canvas
  const noiseTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    
    // Fill with light gray base
    ctx.fillStyle = '#e0e0e0'
    ctx.fillRect(0, 0, 128, 128)
    
    const imgData = ctx.getImageData(0, 0, 128, 128)
    const data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30
      const val = Math.min(255, Math.max(0, data[i] + noise))
      data[i] = val
      data[i + 1] = val
      data[i + 2] = val
    }
    ctx.putImageData(imgData, 0, 0)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(30, 30)
    return texture
  }, [])

  return (
    <group>
      {/* 1. Main Ground / Grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[90, 90]} />
        <meshStandardMaterial 
          color="#556B2F" 
          roughness={0.9} 
          metalness={0.1} 
          map={noiseTexture}
          bumpMap={noiseTexture}
          bumpScale={0.02}
        />
      </mesh>

      {/* 3. Water Pools */}
      {(waterStructures || []).map((waterStruct) => {
        const radius = waterStruct.scale[0] / 2
        const height = waterStruct.scale[1]

        return (
          <group key={waterStruct.id} position={waterStruct.position}>
            {/* Shoreline Sand Ring */}
            <mesh position={[0, 0.001, 0]} receiveShadow>
              <cylinderGeometry args={[radius + 0.2, radius + 0.3, 0.01, 32]} />
              <meshStandardMaterial color="#cfd8dc" roughness={0.9} />
            </mesh>
            
            {/* Water Surface */}
            <mesh position={[0, 0.01, 0]} receiveShadow>
              <cylinderGeometry args={[radius, radius, height, 32]} />
              <meshStandardMaterial color={waterStruct.color} roughness={0.1} metalness={0.1} transparent opacity={0.6} />
            </mesh>

            {/* Rocks border around each pool */}
            {(rockOffsets || []).map((rock, idx) => {
              const rockScaleFactor = radius / 1.125
              const rockPos = [rock.pos[0] * rockScaleFactor, rock.pos[1], rock.pos[2] * rockScaleFactor]
              const rockScale = [rock.scale[0] * rockScaleFactor, rock.scale[1] * rockScaleFactor, rock.scale[2] * rockScaleFactor]
              return (
                <mesh
                  key={`rock-${waterStruct.id}-${idx}`}
                  position={rockPos}
                  scale={rockScale}
                  rotation={rock.rot}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#90a4ae" roughness={0.8} />
                </mesh>
              )
            })}
          </group>
        )
      })}

      {/* 4. Render All Other Structures Dynamically */}
      {(regularStructures || []).map((struct) => {
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

      {/* 5. Render Shade Trees */}
      {(treeStructures || []).map((struct) => (
        <Tree key={struct.id} struct={struct} />
      ))}

      {/* 6. Render Corner Bushes */}
      {(bushStructures || []).map((struct) => (
        <Bush key={struct.id} struct={struct} />
      ))}
    </group>
  )
}
