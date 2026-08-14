'use client'

import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, OrbitControls, useGLTF } from '@react-three/drei'
import type { Group } from 'three'
import type { MutableRefObject } from 'react'

function RotatingModel({ url, progressRef }: { url: string; progressRef: MutableRefObject<number> }) {
  const group = useRef<Group>(null)
  const { scene } = useGLTF(url)

  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = progressRef.current * Math.PI * 2
    }
  })

  return (
    <group ref={group}>
      <Center>
        <primitive object={scene.clone()} />
      </Center>
    </group>
  )
}

interface ShowcaseModelCanvasProps {
  modelUrl: string
  progressRef: MutableRefObject<number>
}

export default function ShowcaseModelCanvas({ modelUrl, progressRef }: ShowcaseModelCanvasProps) {
  useEffect(() => {
    useGLTF.preload(modelUrl)
  }, [modelUrl])

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        frameloop="demand"
        camera={{ position: [0, 0, 4], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <RotatingModel url={modelUrl} progressRef={progressRef} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  )
}
