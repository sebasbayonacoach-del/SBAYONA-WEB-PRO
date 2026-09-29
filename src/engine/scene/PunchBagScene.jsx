// PunchBagScene — saco de boxeo colgado del techo, con cadena y giro.
//
// Objeto real con cotas de producto, no una figura:
//   saco      1,200 m de largo · 350 mm de diámetro (saco de 5 ft estándar)
//   cadena    4 ramales · 350 mm de caída · eslabones de 34 mm
//   anclaje   placa de techo de 180 mm · giratoria (swivel) · mosquetón
//   altura    suelo del saco a ~350 mm del suelo, como se monta en sala
//
// El grupo entero cuelga DE VERDAD del anclaje: el pivote está en el techo, así
// que el balanceo es un péndulo y no un cilindo girando sobre su propio centro,
// que es como se delata un objeto falso en cuanto se mueve.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, Object3D } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

const BAG = { length: 1.2, radius: 0.175 }
// El paso del eslabón manda sobre la longitud de la cadena: fijar «35 cm de
// caída» y «6 eslabones» por separado hace que la cadena termine en el aire,
// 25 cm por encima del saco.
const CHAIN = { drop: 0.35, radius: 0.017, tube: 0.0045, pitch: 0.024 }
CHAIN.links = Math.max(2, Math.round(CHAIN.drop / CHAIN.pitch))
const MOUNT_Y = 1.95
const STRAPS = 4

// El número de eslabones NO es una perilla de calidad: sale de la caída y el
// paso, y recortarlo deja el saco colgando del aire. Por eso esta escena no
// lee `params.instanceCount` — recortar por instancias lo que es geometría
// obligada se ve roto, no más ligero. Lo que sí baja en móvil es la densidad
// de los anillos y del cilindro: menos triángulos, misma silueta.
function lod(caps) {
  const low = caps?.mode !== 'desktop'
  return {
    link: low ? [4, 8] : [6, 14],
    ring: low ? [6, 18] : [8, 32],
    body: low ? 18 : 32,
    dome: low ? [14, 6] : [24, 12],
  }
}

/**
 * Los 60 eslabones de las cuatro cadenas en UNA sola draw call. Como mesh
 * suelta eran 60 nodos de escena y 60 draw calls, que es lo que hunde el
 * rendimiento en móvil; la geometría es idéntica.
 */
function ChainLinks({ segments }) {
  const ref = useRef()

  const transforms = useMemo(() => {
    const dummy = new Object3D()
    const list = []
    for (let s = 0; s < STRAPS; s += 1) {
      const angle = (s / STRAPS) * Math.PI * 2 + Math.PI / 4
      const x = Math.cos(angle) * 0.115
      const z = Math.sin(angle) * 0.115
      for (let i = 0; i < CHAIN.links; i += 1) {
        dummy.position.set(x, -(i + 0.5) * CHAIN.pitch, z)
        // Eslabón alternativo girado 90°: es lo que hace que la cadena lea como
        // cadena y no como una pila de aros.
        dummy.rotation.set(i % 2 === 0 ? 0 : Math.PI / 2, angle, 0)
        dummy.updateMatrix()
        list.push(dummy.matrix.clone())
      }
    }
    return list
  }, [])

  useFrame(() => {
    const mesh = ref.current
    if (!mesh || mesh.userData.filled) return
    transforms.forEach((matrix, i) => mesh.setMatrixAt(i, matrix))
    mesh.instanceMatrix.needsUpdate = true
    mesh.userData.filled = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, transforms.length]} frustumCulled={false}>
      <torusGeometry args={[CHAIN.radius, CHAIN.tube, segments[0], segments[1]]} />
      <meshStandardMaterial color="#8d959d" metalness={0.94} roughness={0.28} />
    </instancedMesh>
  )
}

export function PunchBagScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const swingRef = useRef()
  const q = lod(caps)

  // Péndulo amortiguado sobre el anclaje. El impulso lo da el scroll: cada vez
  // que el usuario baja, el saco recibe un golpe y lo va perdiendo.
  useFrame(({ clock }) => {
    if (!swingRef.current || caps?.reducedMotion) return
    const t = clock.getElapsedTime()
    const sp = readScroll(scrollProgress)
    const impulse = Math.max(0, Math.sin(sp * Math.PI * 3)) * 0.16
    swingRef.current.rotation.x = Math.sin(t * 1.6) * (0.02 + impulse)
    swingRef.current.rotation.z = Math.cos(t * 1.15) * (0.012 + impulse * 0.6)
  })

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.9} />
      {/* Relleno de frente: la cámara mira en -Z sin `lookAt` y el rig alumbra desde
          atrás y arriba; el cuero del saco, que es lo único en pantalla, se apagaba. */}
      <pointLight position={[0, 0.78, 2.76]} intensity={30} color={theme.color.muted} />

      {/* Anclaje al techo: no se balancea nunca, es el punto fijo */}
      <group position={[0, MOUNT_Y, 0]}>
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.022, 24]} />
          <meshStandardMaterial color="#55595f" metalness={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.055, 0]}>
          <torusGeometry args={[0.035, 0.008, 8, 20]} />
          <meshStandardMaterial color="#9aa2aa" metalness={0.95} roughness={0.22} />
        </mesh>
      </group>

      {/* Todo lo que cuelga, bajo un único pivote en el techo */}
      <group ref={swingRef} position={[0, MOUNT_Y - 0.075, 0]}>
        {/* Cuatro ramales de cadena en una sola instancia */}
        <ChainLinks segments={q.link} />

        {/* Correa de cuero que reparte el golpe en el hombro del saco */}
        <mesh position={[0, -CHAIN.drop - 0.055, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BAG.radius + 0.012, 0.026, q.ring[0], q.ring[1]]} />
          <meshStandardMaterial color={theme.color.orangeDeep} metalness={0.15} roughness={0.72} />
        </mesh>

        {/* Cuerpo del saco */}
        <mesh position={[0, -CHAIN.drop - 0.055 - BAG.length / 2, 0]}>
          <cylinderGeometry args={[BAG.radius, BAG.radius * 0.94, BAG.length, q.body]} />
          <meshStandardMaterial color="#64686e" metalness={0.12} roughness={0.82} />
        </mesh>
        {/* Casquetes: sin ellos el cilindro acaba en canto plano y parece un tubo */}
        <mesh position={[0, -CHAIN.drop - 0.055 - BAG.length, 0]}>
          <sphereGeometry args={[BAG.radius * 0.94, q.dome[0], q.dome[1], 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#5b5f65" metalness={0.12} roughness={0.78} />
        </mesh>
        <mesh position={[0, -CHAIN.drop - 0.055, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[BAG.radius, q.dome[0], q.dome[1], 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#5b5f65" metalness={0.12} roughness={0.78} />
        </mesh>

        {/* Franja de marca en el centro del saco */}
        <mesh position={[0, -CHAIN.drop - 0.055 - BAG.length / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[BAG.radius + 0.006, 0.014, q.ring[0], q.ring[1]]} />
          <meshStandardMaterial
            color={theme.color.orange}
            metalness={0.2}
            roughness={0.5}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* Suelo de sala */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default PunchBagScene
