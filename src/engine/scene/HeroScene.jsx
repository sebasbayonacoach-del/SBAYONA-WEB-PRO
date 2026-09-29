// HeroScene — escena 3D del hero de Home
// Fase 11.1 · Experiencia inmersiva Awwwards-grade
//
// Composición espacial y ASIMÉTRICA (no un blob centrado): la geometría
// insignia queda reducida y descentralizada, rodeada de anillos orbitales que
// giran a distintas velocidades, sobre un campo de partículas disperso.
// Referencia visual: sites Awwwards con "objeto flotante + órbitas".
//
// Se monta vía SceneMount con lazy loading.
// Fallback CSS garantizado: .hero-aurora + .hero-particles siempre existen.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { theme } from '../config/theme.js'
import { LightingRig } from './LightingRig.jsx'
import { SignatureGeometry } from './SignatureGeometry.jsx'
import { ParticleField } from './ParticleField.jsx'
import { PostProcessing } from './PostProcessing.jsx'

// Anillos orbitales: radio, grosor, inclinación y velocidad de giro.
const RINGS = [
  { radius: 1.85, tube: 0.014, tilt: 0.35, speed: 0.10 },
  { radius: 2.45, tube: 0.010, tilt: -0.55, speed: -0.07 },
  { radius: 3.10, tube: 0.008, tilt: 0.9, speed: 0.045 },
]

/**
 * Escena 3D del hero de Home.
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} props.params
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 * @param {boolean} [props.particles=true]
 * @param {boolean} [props.postProcessing=true]
 */
export function HeroScene({ params, caps, particles = true, postProcessing = true }) {
  const groupRef = useRef()
  const orbitRef = useRef()
  const spinRef = useRef()
  const ringRefs = useRef([])

  // Respiración del conjunto + giro de órbitas + deriva del núcleo.
  useFrame(({ clock }) => {
    if (caps?.reducedMotion) return
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.015
      groupRef.current.rotation.x = Math.cos(t * 0.06) * 0.008
    }
    if (orbitRef.current) orbitRef.current.rotation.z = t * 0.02
    if (spinRef.current) {
      spinRef.current.rotation.y = t * 0.12
      spinRef.current.rotation.x = Math.sin(t * 0.15) * 0.12
    }
    // Cada órbita gira a su propia velocidad y eje.
    ringRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const { speed, tilt } = RINGS[i]
      mesh.rotation.z = t * speed
      mesh.rotation.x = tilt + Math.sin(t * 0.1) * 0.05
    })
  })

  return (
    <group ref={groupRef}>
      <LightingRig caps={caps} />

      {/*
        Núcleo descentralizado (asimetría editorial): la geometría insignia
        se reduce y se desplaza a la derecha, dejando aire a la izquierda
        donde vive el texto del hero.
      */}
      <group ref={orbitRef} position={[1.35, 0.15, -0.4]}>
        <group ref={spinRef}>
          <group scale={0.5}>
            <SignatureGeometry params={params} scrollProgress={0} caps={caps} />
          </group>
        </group>

        {/* Órbitas: anillos finos inclinados que giran en planos distintos */}
        {RINGS.map(({ radius, tube, tilt }, i) => (
          <mesh
            key={i}
            ref={(m) => { ringRefs.current[i] = m }}
            rotation={[tilt, i * 0.7, 0]}
          >
            <torusGeometry args={[radius, tube, 8, 128]} />
            <meshBasicMaterial
              color={i === 0 ? theme.color.orange : theme.color.muted}
              transparent
              opacity={i === 0 ? 0.55 : 0.22}
            />
          </mesh>
        ))}
      </group>

      {/* Campo de partículas: energía flotante */}
      {particles && (
        <ParticleField params={params} scrollProgress={0} caps={caps} />
      )}

      {/* Post-proceso cinematográfico */}
      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </group>
  )
}

export default HeroScene
