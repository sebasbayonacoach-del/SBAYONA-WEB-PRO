// GlobeScene — globo terraqueo low-poly de la pagina About
// Fase 11.2 · Experiencia inmersiva Awwwards-grade
//
// Esfera WebGL low-poly con marcadores luminosos en los puntos donde BAYONA
// tiene raices o impacto (Colombia, Espana, Miami). Cada testimonio enciende
// un punto del mundo. Se monta via SceneMount con lazy loading y degrada a la
// lista HTML accesible (patron de fallback de Globe3D.jsx) si WebGL falla.

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { theme } from '../config/theme.js'
import { LightingRig } from './LightingRig.jsx'
import { ParticleField } from './ParticleField.jsx'
import { PostProcessing } from './PostProcessing.jsx'

// Marcadores geograficos de marca (latitud, longitud, etiqueta).
const MARKERS = [
  { lat: 4.0, long: -74.0, label: 'Colombia' },
  { lat: 39.0, long: -0.2, label: 'Gandía' },
  { lat: 25.8, long: -80.2, label: 'Miami' },
]

const GLOBE_RADIUS = 1.35

/**
 * Convierte latitud/longitud (grados) a un punto de la esfera unitaria.
 * @param {number} lat  Latitud en grados.
 * @param {number} long  Longitud en grados.
 * @param {number} radius  Radio de la esfera.
 * @returns {[number, number, number]} Posicion [x, y, z].
 */
function latLongToVector3(lat, long, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (long + 180) * (Math.PI / 180)
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ]
}

/**
 * Escena 3D del globo de About.
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} props.params
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 * @param {boolean} [props.particles=true]
 * @param {boolean} [props.postProcessing=true]
 */
export function GlobeScene({ params, caps, particles = true, postProcessing = true }) {
  const groupRef = useRef()

  const markers = useMemo(
    () => MARKERS.map((m) => ({ ...m, position: latLongToVector3(m.lat, m.long, GLOBE_RADIUS) })),
    [],
  )

  // Rotacion lenta: el mundo respira sin distraer del contenido.
  useFrame(({ clock }) => {
    if (!groupRef.current || caps?.reducedMotion) return
    groupRef.current.rotation.y = clock.getElapsedTime() * 0.03
  })

  return (
    <group ref={groupRef}>
      <LightingRig caps={caps} />

      {/* Globo low-poly: icosaedro facetado, material oscuro de marca */}
      <mesh>
        <icosahedronGeometry args={[GLOBE_RADIUS, 2]} />
        <meshStandardMaterial
          color={theme.color.black3}
          roughness={0.55}
          metalness={0.35}
          flatShading
        />
      </mesh>

      {/* Linea del ecuador y meridiano: estructura geometrica del mundo */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[GLOBE_RADIUS * 1.001, 0.004, 8, 96]} />
        <meshBasicMaterial color={theme.color.muted} transparent opacity={0.35} />
      </mesh>

      {/* Marcadores luminosos: un punto de luz por lugar de marca */}
      {markers.map(({ label, position }) => (
        <group key={label} position={position}>
          <mesh>
            <sphereGeometry args={[0.028, 12, 12]} />
            <meshBasicMaterial color={theme.color.orange} />
          </mesh>
          <pointLight color={theme.color.orange} intensity={2.2} distance={0.55} />
        </group>
      ))}

      {particles && <ParticleField params={params} scrollProgress={0} caps={caps} />}
      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </group>
  )
}

// Default export requerido por `React.lazy` (Scene_Registry).
export default GlobeScene
