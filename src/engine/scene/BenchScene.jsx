// BenchScene — banco regulable de sala, con su cremallera.
//
// Objetos reales en las paginas que ensenan producto. Un banco se reconoce por
// tres cosas y las tres estan aqui: el patron de vinilo del respaldo, la
// cremallera dentada por debajo, y el larguero de soporte que sigue al respaldo
// cuando lo subes. Sin la cremallera y el soporte es un sofa.
//
// Cotas reales:
//   largo total  1,28 m · ancho 0,55 m · altura al patron 0,45 m
//   patron       0,30 m de ancho x 55 mm de espuma, vinilo de alta densidad
//   respaldo     0,72 m, posiciones de cremallera en 0 / 30 / 45 / 60 / 78 grados
//   estructura   tubo cuadrado de 30 x 30 mm, pies transversales de 0,55 m

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

const PAD = { width: 0.3, thickness: 0.055, back: 0.72, seat: 0.36 }
const HINGE_X = 0.06
const FRAME_Y = 0.45 - PAD.thickness / 2
const TUBE = 0.03
const FOOT_SPAN = 0.55
// Posiciones de la cremallera, en radianes. Son las de un banco real de 5 huecos.
const DETENTS = [0, 0.5236, 0.7854, 1.0472, 1.3614]

export function BenchScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const backRef = useRef()
  const strutRef = useRef()
  const pinRef = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  const last = useRef(0)

  useFrame(() => {
    const sp = readScroll(scrollProgress)
    // La cremallera no es continua: el respaldo descansa en un diente y salta al
    // siguiente. Interpolar el angulo sin cuantizar se ve como una mecedora.
    const raw = Math.min(1, Math.max(0, sp)) * (DETENTS.length - 1)
    const from = Math.min(DETENTS.length - 1, Math.floor(raw))
    const to = Math.min(DETENTS.length - 1, from + 1)
    const t = caps?.reducedMotion ? 1 : raw - from
    const eased = t * t * (3 - 2 * t)
    const angle = -(DETENTS[from] + (DETENTS[to] - DETENTS[from]) * eased)

    if (backRef.current) {
      backRef.current.rotation.set(0, 0, angle)
      last.current = angle
    }
    // El larguero NO se gira aqui: es hijo del respaldo, ya hereda su angulo.
    // Rotarlo ademas lo doble-rotaria y el banco se desmontaria al subir.
    if (pinRef.current) {
      const idx = Math.round(-angle / (Math.PI / 2.4))
      pinRef.current.position.x = HINGE_X - 0.08 - idx * 0.055
    }
  })

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.6} />

      {/* Estructura: dos largueros y dos pies transversales con goma */}
      {[-1, 1].map((side) => (
        <mesh key={`rail${side}`} position={[-0.18, FRAME_Y - 0.06, side * (PAD.width / 2 + 0.05)]}>
          <boxGeometry args={[1.1, TUBE, TUBE]} />
          <meshStandardMaterial color={theme.color.black3} metalness={0.6} roughness={0.42} />
        </mesh>
      ))}
      {[-0.62, 0.34].map((x) => (
        <mesh key={`foot${x}`} position={[x, 0.028, 0]}>
          <boxGeometry args={[TUBE + 0.008, TUBE, FOOT_SPAN]} />
          <meshStandardMaterial color={theme.color.black3} metalness={0.6} roughness={0.42} />
        </mesh>
      ))}
      {[-0.62, 0.34].map((x) =>
        [-1, 1].map((side) => (
          <mesh key={`cap${x}${side}`} position={[x, 0.008, side * (FOOT_SPAN / 2 - 0.02)]}>
            <cylinderGeometry args={[0.026, 0.026, 0.016, 16]} />
            <meshStandardMaterial color="#141416" metalness={0.05} roughness={0.95} />
          </mesh>
        )),
      )}
      {/* Montantes: lo que une los pies con los largueros. Sin esto el banco se
          veia como cuatro palos sueltos por el suelo, que es lo que pasaba. */}
      {[-0.62, 0.34].map((x) =>
        [-1, 1].map((side) => (
          <mesh key={`up${x}${side}`} position={[x, 0.20, side * (PAD.width / 2 + 0.05)]}>
            <boxGeometry args={[TUBE + 0.006, 0.345, TUBE + 0.006]} />
            <meshStandardMaterial color={theme.color.black3} metalness={0.6} roughness={0.42} />
          </mesh>
        )),
      )}
      {/* Dos carrillos laterales de acero, no un bloque: un poste de 40 cm de
          fondo convertia el centro del banco en una pared. Lo que sujeta el
          respaldo son dos chapas finadas a cada lado, que es como esta montado. */}
      {[-1, 1].map((side) => (
        <mesh key={`cheek${side}`} position={[HINGE_X + 0.02, 0.20, side * (PAD.width / 2 + 0.01)]}>
          <boxGeometry args={[0.09, 0.345, 0.014]} />
          <meshStandardMaterial color={theme.color.black3} metalness={0.6} roughness={0.42} />
        </mesh>
      ))}
      {/* Travesano que une los dos carrillos por abajo */}
      <mesh position={[HINGE_X + 0.02, 0.055, 0]}>
        <boxGeometry args={[TUBE + 0.01, TUBE, PAD.width + 0.1]} />
        <meshStandardMaterial color={theme.color.black3} metalness={0.6} roughness={0.42} />
      </mesh>

      {/* Asiento: patron fijo de espuma */}
      <mesh position={[HINGE_X + PAD.seat / 2 + 0.01, FRAME_Y, 0]}>
        <boxGeometry args={[PAD.seat, PAD.thickness, PAD.width]} />
        <meshStandardMaterial color="#101012" metalness={0.08} roughness={0.88} />
      </mesh>

      {/* Respaldo pivotando en su canto delantero */}
      <group ref={backRef} position={[HINGE_X, FRAME_Y, 0]}>
        <mesh position={[-PAD.back / 2, 0, 0]}>
          <boxGeometry args={[PAD.back, PAD.thickness, PAD.width]} />
          <meshStandardMaterial color="#101012" metalness={0.08} roughness={0.88} />
        </mesh>
        {/* Costura central del vinilo: es lo que le da aspecto de patron y no de
            tabla pintada */}
        <mesh position={[-PAD.back / 2, PAD.thickness / 2 + 0.0006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PAD.back - 0.04, 0.008]} />
          <meshStandardMaterial color={theme.color.black3} metalness={0.1} roughness={0.7} />
        </mesh>
        {/* Larguero de soporte, pegado al enves */}
        <mesh ref={strutRef} position={[-PAD.back * 0.55, -PAD.thickness / 2 - 0.055, 0]}>
          <boxGeometry args={[PAD.back * 0.62, TUBE * 0.8, TUBE * 0.8]} />
          <meshStandardMaterial color={theme.color.black3} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Cremallera: dientes de 12 mm sobre placa, y el pasador de seguridad que
          cae en el diente elegido */}
      <mesh position={[HINGE_X - 0.19, FRAME_Y - 0.115, 0]}>
        <boxGeometry args={[0.3, 0.012, PAD.width * 0.55]} />
        <meshStandardMaterial color={theme.color.black2} metalness={0.65} roughness={0.4} />
      </mesh>
      <Teeth />
      <mesh ref={pinRef} position={[HINGE_X - 0.08, FRAME_Y - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.1, 12]} />
        <meshStandardMaterial color="#aab2ba" metalness={0.95} roughness={0.2} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

// Los dientes se instancian: son 7 piezas identicas y como mesh suelta serian 7
// draw calls por nada.
function Teeth() {
  const ref = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  const COUNT = 7

  useFrame(() => {
    const mesh = ref.current
    if (!mesh || mesh.userData.filled) return
    for (let i = 0; i < COUNT; i += 1) {
      dummy.position.set(HINGE_X - 0.32 + i * 0.055, FRAME_Y - 0.104, 0)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.userData.filled = true
  })

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.024, 0.014, PAD.width * 0.5]} />
      <meshStandardMaterial color={theme.color.black3} metalness={0.7} roughness={0.35} />
    </instancedMesh>
  )
}

export default BenchScene
