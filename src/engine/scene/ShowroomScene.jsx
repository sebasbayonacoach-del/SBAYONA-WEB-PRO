// ShowroomScene — showroom 3D de los planes en Programs
// Fase 11.4 · Experiencia inmersiva Awwwards-grade
//
// Los planes flotan como monolitos con geometria propia: RAIZ organica
// (icosaedro), FUERZA angular (cubo), RENDIMIENTO dinamico (toro) y ELITE
// cristalino (octaedro). El cursor orbita alrededor del conjunto. Se monta via
// SceneMount con lazy loading y degrada al carrusel CSS 3D existente.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { membershipPlans } from '../../config/offerings.js'
import { theme } from '../config/theme.js'
import { LightingRig } from './LightingRig.jsx'
import { ParticleField } from './ParticleField.jsx'
import { PostProcessing } from './PostProcessing.jsx'

// Geometria y acabado por plan (PLAN_3D_INMERSIVO.md §1 / §6).
const PLAN_SHAPE = {
  RAIZ: { kind: 'icosa', color: theme.color.muted, metalness: 0.2 },
  FUERZA: { kind: 'box', color: theme.color.orangeFire, metalness: 0.45 },
  RENDIMIENTO: { kind: 'torus', color: theme.color.orange, metalness: 0.6 },
  ELITE: { kind: 'octa', color: theme.color.white, metalness: 0.85 },
}

const RING_RADIUS = 1.9

/**
 * Geometria procedural del monolito de un plan.
 * @param {string} kind  Clave de forma del mapa PLAN_SHAPE.
 * @returns {JSX.Element} Geometria Three.js correspondiente.
 */
function planGeometry(kind) {
  switch (kind) {
    case 'box':
      return <boxGeometry args={[0.72, 0.72, 0.72]} />
    case 'torus':
      return <torusGeometry args={[0.34, 0.13, 18, 48]} />
    case 'octa':
      return <octahedronGeometry args={[0.55, 0]} />
    case 'icosa':
    default:
      return <icosahedronGeometry args={[0.55, 0]} />
  }
}

/**
 * Escena 3D del showroom de planes.
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} props.params
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 * @param {boolean} [props.particles=true]
 * @param {boolean} [props.postProcessing=true]
 */
export function ShowroomScene({ params, caps, particles = true, postProcessing = true }) {
  const groupRef = useRef()

  // Monolitos distribuidos en circulo; uno por plan de membresia.
  const monoliths = useMemo(() => {
    const plans = membershipPlans.filter((p) => PLAN_SHAPE[p.id])
    return plans.map((plan, i) => {
      const angle = (i / plans.length) * Math.PI * 2
      const shape = PLAN_SHAPE[plan.id]
      return {
        id: plan.id,
        name: plan.name,
        shape,
        position: [Math.cos(angle) * RING_RADIUS, 0, Math.sin(angle) * RING_RADIUS],
        phase: i * 0.7,
      }
    })
  }, [])

  // Orbita lenta del conjunto + flotacion individual de cada monolito.
  useFrame(({ clock }) => {
    if (!groupRef.current || caps?.reducedMotion) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.05
    groupRef.current.children.forEach((child, i) => {
      if (child?.position) child.position.y = Math.sin(t * 0.5 + i * 0.7) * 0.09
    })
  })

  return (
    <group ref={groupRef}>
      <LightingRig caps={caps} />

      {monoliths.map(({ id, shape, position }) => (
        <group key={id} position={position}>
          <mesh castShadow>
            {planGeometry(shape.kind)}
            <meshStandardMaterial
              color={shape.color}
              roughness={0.25}
              metalness={shape.metalness}
              flatShading={shape.kind === 'icosa' || shape.kind === 'octa'}
            />
          </mesh>
          {/* Halo del plan: acento naranja de marca en la base */}
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
            <ringGeometry args={[0.42, 0.5, 32]} />
            <meshBasicMaterial color={theme.color.orange} transparent opacity={0.35} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {particles && <ParticleField params={params} scrollProgress={0} caps={caps} />}
      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </group>
  )
}

// Default export requerido por `React.lazy` (Scene_Registry).
export default ShowroomScene
