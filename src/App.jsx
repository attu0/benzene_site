import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Robot from './Robot'
import Environment from './Environment'
import UI from './UI'
import { useStore } from './store'

export default function App() {
  const night = useStore((s) => s.night)
  const bg = night ? '#05080f' : '#dfe8ee'
  return (
    <>
      <Canvas shadows camera={{ position: [1.2, 0.8, 1.2], fov: 45 }}>
        <color attach="background" args={[bg]} />
        <fog attach="fog" args={[bg, 8, 28]} />
        <ambientLight intensity={night ? 0.12 : 0.6} />
        <directionalLight
          position={[3, 6, 2]}
          intensity={night ? 0.15 : 1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <Environment />
        <Robot />
        <OrbitControls makeDefault target={[0, 0.1, 0]} maxDistance={12} maxPolarAngle={Math.PI / 2 - 0.02} />
      </Canvas>
      <UI />
    </>
  )
}