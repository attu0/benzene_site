import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from './store'
import { ENVIRONMENTS } from './env'

// RPLIDAR A1M8-like: 360 deg, ~12 m range
const N = 360
const MIN_RANGE = 0.15
const MAX_RANGE = 12
const LIDAR_Y = 0.16 // mounting height (m)

// distance along a ray to a box footprint (slab method), Infinity if missed
function rayBox(ox, oz, dx, dz, b) {
  let tmin = 0
  let tmax = Infinity
  if (Math.abs(dx) < 1e-9) {
    if (ox < b.x - b.hx || ox > b.x + b.hx) return Infinity
  } else {
    let t1 = (b.x - b.hx - ox) / dx
    let t2 = (b.x + b.hx - ox) / dx
    if (t1 > t2) [t1, t2] = [t2, t1]
    tmin = Math.max(tmin, t1)
    tmax = Math.min(tmax, t2)
    if (tmin > tmax) return Infinity
  }
  if (Math.abs(dz) < 1e-9) {
    if (oz < b.z - b.hz || oz > b.z + b.hz) return Infinity
  } else {
    let t1 = (b.z - b.hz - oz) / dz
    let t2 = (b.z + b.hz - oz) / dz
    if (t1 > t2) [t1, t2] = [t2, t1]
    tmin = Math.max(tmin, t1)
    tmax = Math.min(tmax, t2)
    if (tmin > tmax) return Infinity
  }
  return tmin
}

export default function Lidar({ sim, groupRef }) {
  const on = useStore((s) => s.lidar)

  const { pointGeo, lineGeo } = useMemo(() => {
    const p = new THREE.BufferGeometry()
    p.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3))
    const l = new THREE.BufferGeometry()
    l.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 6), 3))
    return { pointGeo: p, lineGeo: l }
  }, [])

  // runs after the robot's pose update (priority 0) and before the render (priority 1)
  useFrame(() => {
    const { lidar, env } = useStore.getState()
    if (!lidar) return
    // only obstacles that reach the scan plane
    const boxes = ENVIRONMENTS[env].boxes.filter((b) => (b.y ?? 0) <= LIDAR_Y)
    const { x: ox, z: oz, h } = sim.current
    const pp = pointGeo.attributes.position.array
    const lp = lineGeo.attributes.position.array

    for (let i = 0; i < N; i++) {
      const a = h + (i / N) * Math.PI * 2
      const dx = Math.cos(a)
      const dz = -Math.sin(a)
      let t = MAX_RANGE
      for (const b of boxes) {
        const d = rayBox(ox, oz, dx, dz, b)
        if (d < t) t = d
      }
      const hit = t < MAX_RANGE && t > MIN_RANGE
      const hx = hit ? ox + dx * t : ox
      const hz = hit ? oz + dz * t : oz

      pp[i * 3] = hx
      pp[i * 3 + 1] = LIDAR_Y
      pp[i * 3 + 2] = hz
      lp[i * 6] = ox
      lp[i * 6 + 1] = LIDAR_Y
      lp[i * 6 + 2] = oz
      lp[i * 6 + 3] = hx
      lp[i * 6 + 4] = LIDAR_Y
      lp[i * 6 + 5] = hz
    }
    pointGeo.attributes.position.needsUpdate = true
    lineGeo.attributes.position.needsUpdate = true
  }, 0.5)

  return (
    <group ref={groupRef} visible={on}>
      <lineSegments geometry={lineGeo} frustumCulled={false}>
        <lineBasicMaterial color="#ff3b3b" transparent opacity={0.15} />
      </lineSegments>
      <points geometry={pointGeo} frustumCulled={false}>
        <pointsMaterial color="#ff3b3b" size={0.05} sizeAttenuation />
      </points>
    </group>
  )
}