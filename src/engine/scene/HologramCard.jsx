// HologramCard — tarjeta holografica 3D real (Shop / previews de producto)
// Fase 11.4 · Experiencia inmersiva Awwwards-grade
//
// Reemplaza el tilt CSS de HoloCard.jsx por holografia WebGL: tarjeta con
// profundidad, brillo iridiscente y banda de escaneo que reacciona al puntero.
// Se monta via SceneMount con lazy loading; el fallback es la HoloCard CSS.

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { theme } from '../config/theme.js'

const CARD_W = 1.0
const CARD_H = 1.4
const CARD_D = 0.035

/**
 * Tarjeta holografica 3D.
 * @param {Object} props
 * @param {import('../providers/capabilities.js').Capabilities} [props.caps]
 * @param {string} [props.faceColor]  Color de la cara de la tarjeta.
 */
export function HologramCard({ caps, faceColor }) {
  const groupRef = useRef()
  const scanRef = useRef()
  const { pointer } = useThree()

  // Tilt guiado por el puntero (rayo del cursor) + deriva suave en reposo.
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    if (caps?.reducedMotion) return
    const t = clock.getElapsedTime()

    const targetY = pointer.x * 0.4
    const targetX = -pointer.y * 0.3
    groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.08
    groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.08
    groupRef.current.position.y = Math.sin(t * 0.9) * 0.04

    if (scanRef.current) {
      // Banda de escaneo: cicla de arriba a abajo de la tarjeta.
      scanRef.current.position.y = ((t * 0.35) % 1) * CARD_H - CARD_H / 2
    }
  })

  return (
    <group ref={groupRef}>
      {/* Cuerpo de la tarjeta: capsula oscura con reborde metalico */}
      <mesh castShadow>
        <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
        <meshStandardMaterial
          color={faceColor ?? theme.color.black3}
          roughness={0.28}
          metalness={0.6}
        />
      </mesh>

      {/* Cara holografica: emisiva sutil que da profundidad */}
      <mesh position={[0, 0, CARD_D / 2 + 0.002]}>
        <planeGeometry args={[CARD_W * 0.92, CARD_H * 0.94]} />
        <meshBasicMaterial color={theme.color.deepBlue} transparent opacity={0.85} />
      </mesh>

      {/* Banda de escaneo: linea naranja que barre la tarjeta */}
      <mesh ref={scanRef} position={[0, 0, CARD_D / 2 + 0.006]}>
        <planeGeometry args={[CARD_W * 0.92, CARD_H * 0.05]} />
        <meshBasicMaterial color={theme.color.orange} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Halo: glow ambiental de marca detras de la tarjeta */}
      <mesh position={[0, 0, -CARD_D / 2 - 0.05]}>
        <planeGeometry args={[CARD_W * 1.3, CARD_H * 1.15]} />
        <meshBasicMaterial color={theme.color.orangeFire} transparent opacity={0.1} />
      </mesh>
    </group>
  )
}

// Default export requerido por `React.lazy` (Scene_Registry).
export default HologramCard
