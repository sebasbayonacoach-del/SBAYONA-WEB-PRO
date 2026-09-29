// KettlebellScene — bateria de cinco kettlebells sobre esterilla.
//
// La bola con asa es de los objetos mas reconocibles de una sala, y el asa es lo
// que la define: sin ella es una esfera. El asa se construye con un toro de
// media circunferencia apoyado en el cuello de la campana, no flotando encima.
//
// Cotas reales (las de gimnasio crecen con el peso, que es lo que se ve aqui):
//   campana  diametro 98 mm (8 kg) a 140 mm (32 kg), fondo plano de fundicion
//   asa      barra de 33 mm, abertura de 95 a 125 mm
//   esterilla 1,10 x 0,62 m de goma de 8 mm

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

// El asa es MAS ESTRECHA que la campana: en una 32 kg el cuerpo mide ~140 mm y
// la abertura del asa ~95 mm. Ponerlas casi iguales dejaba las patas del asa
// flotando por detras de la bola, que es exactamente como se delata un objeto
// falso. 0,62 del radio de campana las mete dentro del cuello.
const HANDLE_RATIO = 0.62
const BELLS = [8, 12, 16, 24, 32].map((kg, i) => {
  const r = [0.049, 0.056, 0.062, 0.067, 0.070][i]
  return { kg, r, handle: r * HANDLE_RATIO }
})
const HANDLE_REF = 0.05   // radio de referencia del asa
const HANDLE_BAR = 0.0175   // barra de acero de 35 mm de seccion
const SPACING = 0.185
const MAT = { width: 1.1, depth: 0.62, thickness: 0.008 }

export function KettlebellScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const bodyRef = useRef()
  const handleRef = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  const count = BELLS.length
  const startX = -((count - 1) * SPACING) / 2

  useFrame(() => {
    const bodies = bodyRef.current
    const handles = handleRef.current
    if (!bodies || !handles) return
    const sp = readScroll(scrollProgress)

    BELLS.forEach((bell, i) => {
      // Entran de izquierda a derecha conforme se baja: la bateria se va
      // cargando. Con movimiento reducido salen todas de una.
      const appear = caps?.reducedMotion
        ? 1
        : Math.min(1, Math.max(0, (sp * 1.4 - i * 0.16) * 4))
      const set = 0.55 + appear * 0.45
      const x = startX + i * SPACING
      const r = bell.r * set
      // El fondo plano apoya en la esterilla: si la esfera entra tangente,
      // flota medio centimetro y el ojo lo nota.
      const y = MAT.thickness + r * 0.94

      dummy.position.set(x, y, 0)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(r, r * 0.94, r)
      dummy.updateMatrix()
      bodies.setMatrixAt(i, dummy.matrix)

      // El asa NO se escala por su radio absoluto: la geometria ya mide lo que
      // mide (radio 50 mm, barra de 16,5 mm), asi que escalar por 0,048 aplastaba
      // el tubo a 0,8 mm y la pesa rusa salia como una bola de petanca. Se escala
      // por la proporcion respecto a ese radio de referencia: la barra queda en
      // 16-21 mm, que es el acero de verdad.
      const hs = (bell.handle / HANDLE_REF) * set
      dummy.position.set(x, y + r * 0.5, 0)
      dummy.scale.set(hs, hs, hs)
      dummy.updateMatrix()
      handles.setMatrixAt(i, dummy.matrix)
    })

    bodies.instanceMatrix.needsUpdate = true
    handles.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.75} />
      {/* Relleno de frente: la camara mira en -Z sin lookAt y las luces del rig caen
          atras y arriba, asi que la bola y su asa salian como un borron negro. */}
      <pointLight position={[0, 0.09, 1.22]} intensity={5.8} color={theme.color.muted} />

      <instancedMesh ref={bodyRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial color="#5f6369" metalness={0.18} roughness={0.74} />
      </instancedMesh>
      <instancedMesh ref={handleRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <torusGeometry args={[HANDLE_REF, HANDLE_BAR, 14, 32, Math.PI]} />
        <meshStandardMaterial color="#6b6f75" metalness={0.2} roughness={0.7} />
      </instancedMesh>

      {/* Esterilla de goma bajo la bateria */}
      <mesh position={[0, MAT.thickness / 2, 0]}>
        <boxGeometry args={[MAT.width, MAT.thickness, MAT.depth]} />
        <meshStandardMaterial color="#17171a" metalness={0.02} roughness={0.96} />
      </mesh>
      {/* Parche de marca en el canto: antes era una linea de 12 mm cruzando la
          esterilla, que leida de lejos parecia un error de render */}
      <mesh position={[0, MAT.thickness + 0.0012, MAT.depth / 2 - 0.055]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.16, 0.04]} />
        <meshStandardMaterial color={theme.color.orange} metalness={0.08} roughness={0.72} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default KettlebellScene
