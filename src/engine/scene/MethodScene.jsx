// MethodScene — las capas del método que se separan y vuelven a cerrarse.
//
// Arquetipo para los layouts `editorial` y `closing`. Nace de una queja concreta
// del brief: la sección «no es magia es método» era un cuadro negro con números
// gigantes que invita a cerrar la pestaña. Aquí el método se ve como un bloque
// que el scroll desmonta en capas y vuelve a compactar: la idea de
// «decisiones una tras otra» hecha objeto, que es lo que exige el §39 del brief.
//
// Coste: 5 cajas. Sin partículas y sin bloom por defecto.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'

const LAYERS = [
  { key: 'valorar', thickness: 0.16, tint: theme.color.black3 },
  { key: 'planificar', thickness: 0.12, tint: theme.color.black2 },
  { key: 'ejecutar', thickness: 0.2, tint: theme.color.orangeDeep },
  { key: 'registrar', thickness: 0.1, tint: theme.color.black2 },
  { key: 'ajustar', thickness: 0.14, tint: theme.color.black3 },
]

const PLATE = { width: 1.7, depth: 1.1 }
const SPREAD = 0.62

export function MethodScene({ params, scrollProgress = 0, caps, postProcessing = false }) {
  const groupRef = useRef()
  const layerRefs = useRef([])

  useFrame(({ clock }) => {
    const sp = readScroll(scrollProgress)
    // 0..0.5 abre el bloque, 0.5..1 lo vuelve a compactar: el método se entiende
    // mirándolo dos veces, no con un solo gesto.
    const open = caps?.reducedMotion ? 0.5 : Math.sin(sp * Math.PI)
    const idle = caps?.reducedMotion ? 0 : clock.getElapsedTime()

    if (groupRef.current) {
      groupRef.current.rotation.y = -0.35 + (caps?.reducedMotion ? 0 : Math.sin(idle * 0.18) * 0.06)
      groupRef.current.rotation.x = 0.18 - open * 0.1
    }

    let cursor = 0
    layerRefs.current.forEach((layer, index) => {
      if (!layer) return
      const { thickness } = LAYERS[index]
      cursor += thickness / 2
      layer.position.y = cursor + open * (index - (LAYERS.length - 1) / 2) * SPREAD
      layer.position.x = open * (index % 2 === 0 ? 0.16 : -0.16)
      cursor += thickness / 2
      const mat = layer.material
      if (mat) mat.opacity = 0.55 + open * 0.45
    })
  })

  return (
    <>
      <LightingRig caps={caps} />
      <group ref={groupRef}>
        {LAYERS.map(({ key, thickness, tint }, index) => (
          <mesh
            key={key}
            ref={(node) => {
              layerRefs.current[index] = node
            }}
          >
            <boxGeometry args={[PLATE.width, thickness, PLATE.depth]} />
            <meshStandardMaterial
              color={tint}
              roughness={0.68}
              metalness={0.12}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}

        {/* Costado en naranja de marca: sin él las capas se leen como grises
            apilados y la escena pierde el acento que exige R9.1. */}
        <mesh position={[-PLATE.width / 2 - 0.012, 0, 0]}>
          <boxGeometry args={[0.012, 0.78, PLATE.depth * 0.92]} />
          <meshBasicMaterial color={theme.color.orange} transparent opacity={0.7} />
        </mesh>
      </group>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default MethodScene
