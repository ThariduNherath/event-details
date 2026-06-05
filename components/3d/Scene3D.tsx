'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sphere, MeshDistortMaterial, Stars, Trail, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function DistortSphere() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.x = clock.getElapsedTime() * 0.1
      ref.current.rotation.y = clock.getElapsedTime() * 0.15
    }
  })
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={ref} args={[1.8, 64, 64]} position={[0, 0, 0]}>
        <MeshDistortMaterial
          color="#7B2FFF"
          distort={0.5}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          emissive="#FF4500"
          emissiveIntensity={0.15}
          transparent
          opacity={0.7}
        />
      </Sphere>
    </Float>
  )
}

function Particles() {
  const count = 1200
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  const ref = useRef<THREE.Points>(null)
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime() * 0.03
      ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.02) * 0.1
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#00FFB2"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

function RingSystem() {
  const ref1 = useRef<THREE.Mesh>(null)
  const ref2 = useRef<THREE.Mesh>(null)
  const ref3 = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ref1.current) {
      ref1.current.rotation.z = t * 0.2
      ref1.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.1
    }
    if (ref2.current) {
      ref2.current.rotation.z = -t * 0.15
      ref2.current.rotation.y = t * 0.1
    }
    if (ref3.current) {
      ref3.current.rotation.x = t * 0.1
      ref3.current.rotation.z = t * 0.08
    }
  })

  return (
    <>
      <mesh ref={ref1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.8, 0.02, 16, 200]} />
        <meshBasicMaterial color="#FF4500" transparent opacity={0.6} />
      </mesh>
      <mesh ref={ref2} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[3.5, 0.015, 16, 200]} />
        <meshBasicMaterial color="#7B2FFF" transparent opacity={0.5} />
      </mesh>
      <mesh ref={ref3} rotation={[Math.PI / 4, Math.PI / 3, 0]}>
        <torusGeometry args={[4.2, 0.01, 16, 200]} />
        <meshBasicMaterial color="#00FFB2" transparent opacity={0.4} />
      </mesh>
    </>
  )
}

function OrbitalDots() {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.4
  })
  return (
    <group ref={ref}>
      {[0, 1, 2, 3, 4].map(i => {
        const angle = (i / 5) * Math.PI * 2
        return (
          <Sphere key={i} args={[0.06, 16, 16]} position={[Math.cos(angle) * 3, Math.sin(angle) * 0.5, Math.sin(angle) * 3]}>
            <meshStandardMaterial color={i % 2 === 0 ? '#FF4500' : '#00FFB2'} emissive={i % 2 === 0 ? '#FF4500' : '#00FFB2'} emissiveIntensity={2} />
          </Sphere>
        )
      })}
    </group>
  )
}

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FF4500" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#7B2FFF" />
      <pointLight position={[0, 0, 5]} intensity={0.6} color="#00FFB2" />
      
      <Stars radius={80} depth={50} count={3000} factor={3} fade speed={0.5} />
      <DistortSphere />
      <RingSystem />
      <Particles />
      <OrbitalDots />
    </Canvas>
  )
}
