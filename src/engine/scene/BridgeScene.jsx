// BridgeScene — el umbral entre dos plantas del sitio.
//
// Arquetipo para el layout `bridge` de sectionBlueprints. El brief pide que al
// pasar de una sección a otra se sienta un cambio de lugar («subir de planta»,
// «entrar en la academia»), no un corte seco de página. Aquí el usuario baja y
// atraviesa un corredor de arcos hasta una luz.
//
// Geometría mínima: N arcos de toro + suelo. Sin postprocessing por defecto:
// un bridge se ve mucho tiempo en transición y el bloom en movimiento mare.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'

const ARCHES = 9
const ARCH_SPAN = 1.15
const CORRIDOR = (ARCHES - 1) * ARCH_SPAN

export function BridgeScene({ params, scrollProgress = 0, caps, postProcessing = false }) {
  const groupRef = useRef()
  const lightRef = useRef()

  const arches = useMemo(
    () =>
      Array.from({ length: ARCHES }, (_, i) => ({
        z: i * ARCH_SPAN,
        accent: i === ARCHES - 1,
      })),
    [],
  )

  useFrame(({ clock }) => {
    const sp = readScroll(scrollProgress)
    const t = caps?.reducedMotion ? 0 : sp
    if (groupRef.current) {
      groupRef.current.position.z = t * CORRIDOR
      // Ligera respiración lateral: el corredor no es un túnel recto de videojuego.
      if (!caps?.reducedMotion) {
        groupRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.2) * 0.06
      }
    }
    if (lightRef.current) {
      // La salida se enciende al acercarse: la recompensa se ve antes de llegar.
      lightRef.current.intensity = 1.2 + t * 6.5
    }
  })

  return (
    <>
      <LightingRig caps={caps} />
      <group ref={groupRef} position={[0, 0, 0]}>
        {arches.map(({ z, accent }) => (
          <mesh key={z} position={[0, 0, -z]}>
            <torusGeometry args={[1.25, accent ? 0.03 : 0.014, 6, 56]} />
            <meshBasicMaterial
              color={accent ? theme.color.orange : theme.color.muted}
              transparent
              opacity={accent ? 0.9 : 0.32}
            />
          </mesh>
        ))}

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, -CORRIDOR / 2]}>
          <planeGeometry args={[2.6, CORRIDOR + 4]} />
          <meshStandardMaterial color={theme.color.black2} roughness={0.9} metalness={0} />
        </mesh>

        <pointLight
          ref={lightRef}
          position={[0, 0, -(CORRIDOR + 0.6)]}
          color={theme.color.orangeFire}
          intensity={1.2}
          distance={7}
        />
      </group>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default BridgeScene
