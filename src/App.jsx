import React, { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import SanctuaryMap from './components/Environment/SanctuaryMap'

function PlayerBird() {
  const [active, setActive] = useState(false)
  return (
    <mesh position={[0, 0.5, 0]} onClick={() => setActive(!active)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={active ? '#ffde59' : '#00a8ff'} />
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
        
        <OrbitControls />
      </Canvas>
    </div>
  )
}
