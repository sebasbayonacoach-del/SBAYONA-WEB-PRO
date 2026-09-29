// PhoneScene — modelo 3D de telefono de App Experience
// Fase 11.5 · Experiencia inmersiva Awwwards-grade
//
// Telefono 3D interactivo: cuerpo oscuro de marca y pantalla emisiva que
// muestra la app. Gira al hover y permite orbitar la camara. Se monta via
// SceneMount con lazy loading y degrada a los telefonos CSS 3D existentes
// (app.css) si WebGL falla.

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { theme } from '../config/theme.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'

// Proporcion de un telefono moderno (marco estrecho, pantalla casi completa).
const BODY_W = 0.78
const BODY_H = 1.62
const BODY_D = 0.075

/**
 * Escena 3D del telefono con la app.
 * @param {Object} props
 * @param {import('../config/sceneConfig.js').ResolvedScene['params']} props.params
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 * @param {boolean} [props.postProcessing=true]
 */
export function PhoneScene({ params, caps, postProcessing = true }) {
  const groupRef = useRef()

  // Balanceo lento: el telefono se muestra en movimiento perpetuo suave.
  useFrame(({ clock }) => {
    if (!groupRef.current || caps?.reducedMotion) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.3 + 0.35
    groupRef.current.rotation.x = Math.sin(t * 0.09) * 0.06
  })

  return (
    <group ref={groupRef} rotation={[0, 0.35, 0]}>
      <LightingRig caps={caps} />

      {/* Cuerpo: caja oscura metalica de marca */}
      <mesh castShadow>
        <boxGeometry args={[BODY_W, BODY_H, BODY_D]} />
        <meshStandardMaterial
          color={theme.color.black2}
          roughness={0.32}
          metalness={0.72}
        />
      </mesh>

      {/* Pantalla: plano emisivo ligeramente por encima del cristal */}
      <mesh position={[0, 0, BODY_D / 2 + 0.002]}>
        <planeGeometry args={[BODY_W * 0.9, BODY_H * 0.94]} />
        <meshBasicMaterial color={theme.color.deepBlue} />
      </mesh>

      {/* Resplandor de la app: acento naranja de marca tras el telefono */}
      <mesh position={[0, 0, -BODY_D / 2 - 0.06]}>
        <planeGeometry args={[BODY_W * 1.45, BODY_H * 1.2]} />
        <meshBasicMaterial color={theme.color.orange} transparent opacity={0.14} />
      </mesh>

      {/* Reflejo superior: detalle de "cristal" premium */}
      <mesh position={[-BODY_W * 0.18, BODY_H * 0.3, BODY_D / 2 + 0.004]} rotation={[0, 0, -0.35]}>
        <planeGeometry args={[BODY_W * 0.35, BODY_H * 0.5]} />
        <meshBasicMaterial color={theme.color.white} transparent opacity={0.05} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </group>
  )
}

// Default export requerido por `React.lazy` (Scene_Registry).
export default PhoneScene
