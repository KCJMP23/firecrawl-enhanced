'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Box, Sphere, Torus } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function FloatingWebsite() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <group>
        <Box args={[8, 5, 0.5]} ref={meshRef}>
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.8} 
            roughness={0.2}
            emissive="#0066ff"
            emissiveIntensity={0.1}
          />
        </Box>
        
        <Sphere args={[0.5]} position={[2, 2, 1]}>
          <meshStandardMaterial
            color="#6366f1"
            metalness={0.9}
            roughness={0.1}
            emissive="#6366f1"
            emissiveIntensity={0.5}
          />
        </Sphere>
        
        <Torus args={[3, 0.2, 16, 100]} position={[0, 0, -2]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#8b5cf6"
            metalness={0.7}
            roughness={0.3}
            emissive="#8b5cf6"
            emissiveIntensity={0.2}
          />
        </Torus>
      </group>
    </Float>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <Environment preset="night" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
        <FloatingWebsite />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}