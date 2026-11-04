import { Grid } from '@react-three/drei'
import { ENVIRONMENTS } from './env'
import { useStore } from './store'

function Table({ b }) {
  const lx = b.hx - 0.05
  const lz = b.hz - 0.05
  return (
    <group position={[b.x, 0, b.z]}>
      <mesh position={[0, b.h - 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[b.hx * 2, 0.05, b.hz * 2]} />
        <meshStandardMaterial color={b.color} />
      </mesh>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * lx, (b.h - 0.05) / 2, sz * lz]} castShadow>
          <boxGeometry args={[0.05, b.h - 0.05, 0.05]} />
          <meshStandardMaterial color="#3b3b3b" />
        </mesh>
      ))}
    </group>
  )
}

function Plant({ b }) {
  const r = b.hx
  return (
    <group position={[b.x, 0, b.z]}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[r * 0.8, r * 0.6, 0.3, 16]} />
        <meshStandardMaterial color="#b4694a" />
      </mesh>
      <mesh position={[0, b.h - r, 0]} castShadow>
        <sphereGeometry args={[r, 16, 16]} />
        <meshStandardMaterial color="#3f8f4f" roughness={1} />
      </mesh>
    </group>
  )
}

export default function Environment() {
  const night = useStore((s) => s.night)
  const key = useStore((s) => s.env)
  const env = ENVIRONMENTS[key]
  const [w, d] = env.size

  return (
    <group key={key}>
      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w + 0.4, d + 0.4]} />
        <meshStandardMaterial color={env.floor} roughness={0.9} />
      </mesh>

      {/* rugs, floor markings */}
      {env.flats.map((f, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[f.x, 0.004, f.z]} receiveShadow>
          <planeGeometry args={[f.w, f.d]} />
          <meshStandardMaterial color={f.color} roughness={1} />
        </mesh>
      ))}

      {env.grid && (
        <Grid
          position={[0, 0.008, 0]}
          args={[w, d]}
          cellSize={0.5}
          sectionSize={2}
          cellColor={night ? '#2a3140' : '#7d8790'}
          sectionColor={night ? '#3b4558' : '#5f6a75'}
          fadeDistance={14}
        />
      )}

      {/* walls + furniture */}
      {env.boxes.map((b, i) => {
        if (b.type === 'table') return <Table key={i} b={b} />
        if (b.type === 'plant') return <Plant key={i} b={b} />
        return (
          <mesh key={i} position={[b.x, (b.y ?? 0) + b.h / 2, b.z]} castShadow receiveShadow>
            <boxGeometry args={[b.hx * 2, b.h, b.hz * 2]} />
            <meshStandardMaterial
              color={b.color}
              transparent={b.color === '#bcd7e6'}
              opacity={b.color === '#bcd7e6' ? 0.35 : 1}
            />
          </mesh>
        )
      })}

      {/* even room fill instead of spot-like point lights */}
      <hemisphereLight args={[env.lampColor, env.floor, night ? 0.45 : 0.5]} />

      {/* ceiling lamp fixtures (visual only) */}
      {env.lamps.map(([x, z], i) => (
        <group key={i} position={[x, 2.45, z]}>
          <mesh>
            <boxGeometry args={[1.2, 0.05, 0.25]} />
            <meshStandardMaterial color="#ffffff" emissive={env.lampColor} emissiveIntensity={night ? 1.2 : 0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}