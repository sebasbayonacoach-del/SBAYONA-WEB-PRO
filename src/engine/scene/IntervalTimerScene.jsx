// IntervalTimerScene — cronómetro de intervalos de sala.
//
// «TRES MOMENTOS, UN MISMO PULSO» y «SÉ EXACTAMENTE POR QUÉ NO AVANZAS» piden el
// objeto con el que se mide el trabajo: no un reloj genérico, un temporizador de
// intervalos con sus tres arcos — trabajo, descanso, serie — en la misma esfera.
//
// Cotas reales: esfera de 240 mm de diámetro y 55 mm de fondo, bisel de 6 mm,
// aguja de 96 mm. El reparto 40 / 20 / 8 es el tabata de toda la vida y es el
// que usa la página, así que los arcos miden EN ANGULO lo que duran: 240° de
// trabajo, 120° de descanso. Un arco decorativo del mismo tamaño para cada fase
// sería mentira.
//
// La aguja barre con el scroll y el arco activo se enciende. Se pinta el color
// por material, no por textura: cambiar `material.color` es gratis, subir una
// `CanvasTexture` nueva cada fotograma no.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Color, SRGBColorSpace } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

const DIAL = { r: 0.12, depth: 0.055, bezel: 0.006 }
const HAND = { length: 0.096, width: 0.006 }

// 40 s de trabajo + 20 s de descanso = 60 s de ciclo. El arco ocupa el ángulo que
// ocupa el tiempo, empezando arriba (las 12) y en el sentido de las agujas.
const SEGUNDOS = 60
const FASES = [
  { clave: 'trabajo', s: 40, color: theme.color.orange, encendido: theme.color.orangeFire },
  { clave: 'descanso', s: 20, color: theme.color.black3, encendido: theme.color.muted },
]

// `ringGeometry` arranca en +X y va hacia +Y; girando el mesh -90° se alinea con
// las 12 y el barrido coincide con el sentido horario del reloj.
function arcoDesde(inicio, segundos) {
  const thetaLength = (segundos / SEGUNDOS) * Math.PI * 2
  return { thetaStart: Math.PI / 2 - (inicio / SEGUNDOS) * Math.PI * 2 - thetaLength, thetaLength }
}

function faceTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = theme.color.black
  ctx.beginPath()
  ctx.arc(256, 256, 256, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(256, 256, 232, 0, Math.PI * 2)
  ctx.stroke()
  // Los cuatro cuartos, para que la esfera se lea como reloj aunque la aguja
  // esté quieta por `reduced-motion`.
  ctx.fillStyle = theme.color.muted
  ctx.font = '500 40px "DM Mono", monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const [i, n] of [60, 15, 30, 45].entries()) {
    const a = (i * Math.PI) / 2
    ctx.fillText(String(n), 256 + Math.sin(a) * 196, 256 - Math.cos(a) * 196)
  }
  ctx.fillStyle = theme.color.orange
  ctx.font = '900 58px Montserrat, Arial, sans-serif'
  ctx.fillText('TABATA', 256, 344)
  ctx.fillStyle = theme.color.muted
  ctx.font = '500 30px "DM Mono", monospace'
  ctx.fillText('40 / 20 · 8 SERIES', 256, 386)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

export function IntervalTimerScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const aguja = useRef()
  const materiales = useRef([])
  const face = useMemo(faceTexture, [])

  const arcos = useMemo(
    () => [
      { ...FASES[0], ...arcoDesde(0, FASES[0].s) },
      { ...FASES[1], ...arcoDesde(FASES[0].s, FASES[1].s) },
    ],
    [],
  )

  useFrame(({ clock }) => {
    const sp = readScroll(scrollProgress)
    // Una vuelta por ciclo de 60 s. Con `reduced-motion` la aguja se queda en
    // una pose fija y legible en vez de congelarse en el último barrido.
    const segundos = caps?.reducedMotion ? 12 : sp * SEGUNDOS
    if (aguja.current) {
      aguja.current.rotation.z = -(segundos / SEGUNDOS) * Math.PI * 2
      if (!caps?.reducedMotion) {
        // El temblor de un reloj de muelle, no una animación de adorno.
        aguja.current.rotation.z += Math.sin(clock.getElapsedTime() * 6) * 0.004
      }
    }
    const activa = segundos < FASES[0].s ? 0 : 1
    materiales.current.forEach((mat, i) => {
      if (!mat) return
      const fase = arcos[i]
      const objetivo = i === activa ? fase.encendido : fase.color
      mat.color.lerp(new Color(objetivo), 0.12)
    })
  })

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.9} />
      {/* Relleno de frente: la cámara mira en -Z sin `lookAt` y el rig alumbra desde
          atrás, así que la caja y el pie, que son lo que se ve, salían negros. */}
      <pointLight position={[0, 0.23, 0.85]} intensity={2.8} color={theme.color.muted} />

      <group position={[0, 0.34, 0]} rotation={[-0.22, 0, 0]}>
        {/* Caja: cilindro de eje Y girado 90° en X para que la esfera mire a la
            cámara. Sin el giro sale un tambor tumbado. */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[DIAL.r, DIAL.r, DIAL.depth, 56]} />
          <meshStandardMaterial color="#55595f" metalness={0.2} roughness={0.72} />
        </mesh>
        {/* Sin rotación: `planeGeometry` ya mira a +Z. Girarlo -90° en X lo
            tumbaba y la esfera desaparecía (se veía solo la tapa del cilindro). */}
        <mesh position={[0, 0, DIAL.depth / 2 + 0.0015]}>
          <circleGeometry args={[DIAL.r - 0.008, 56]} />
          <meshBasicMaterial map={face} toneMapped={false} />
        </mesh>

        {/* Los dos arcos, a 3 mm de la esfera. Son tiempo, no decoración: cada
            uno mide el ángulo de su fase. */}
        {arcos.map((fase, i) => (
          <mesh
            key={fase.clave}
            position={[0, 0, DIAL.depth / 2 + 0.004]}
            rotation={[0, 0, -Math.PI / 2]}
          >
            <ringGeometry args={[DIAL.r - 0.026, DIAL.r - 0.008, 64, 1, fase.thetaStart, fase.thetaLength]} />
            <meshStandardMaterial
              ref={(m) => { materiales.current[i] = m }}
              color={fase.color}
              emissive={fase.color}
              emissiveIntensity={0.5}
              roughness={0.6}
              metalness={0}
              side={2}
            />
          </mesh>
        ))}

        {/* El toro nace en el plano XY, o sea mirando a +Z: girarlo 90° en X lo
            convertía en un aro horizontal cruzando la esfera por mitad. */}
        <mesh position={[0, 0, DIAL.depth / 2]}>
          <torusGeometry args={[DIAL.r - 0.002, DIAL.bezel, 14, 64]} />
          <meshStandardMaterial color="#8d959d" metalness={0.9} roughness={0.28} />
        </mesh>

        {/* Aguja: la geometría nace centrada, así que se traslada el PIVOTE al
            extremo que gira; si no, la aguja gira sobre su centro y no marca nada. */}
        <group ref={aguja} position={[0, 0, DIAL.depth / 2 + 0.008]}>
          <mesh position={[0, HAND.length / 2 - 0.014, 0]}>
            <boxGeometry args={[HAND.width, HAND.length, 0.004]} />
            <meshStandardMaterial color={theme.color.orangeFire} metalness={0.3} roughness={0.45} />
          </mesh>
          <mesh position={[0, -0.026, 0]}>
            <boxGeometry args={[HAND.width * 1.6, 0.05, 0.004]} />
            <meshStandardMaterial color={theme.color.muted} metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
        <mesh position={[0, 0, DIAL.depth / 2 + 0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.007, 0.007, 0.008, 20]} />
          <meshStandardMaterial color="#6b6f75" metalness={0.2} roughness={0.7} />
        </mesh>

        {/* Pie de mesa: dos soportes que BAJAN HASTA EL SUELO. Con el grupo a
            0,34 m, una pata de 5 cm colgaba en el aire — el fallo que delata un
            adorno. Longitud = la altura del grupo menos el radio de la caja. */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.07, -DIAL.r - (0.34 - DIAL.r) / 2 + 0.01, -0.01]} rotation={[0.16, 0, 0]}>
            <boxGeometry args={[0.014, 0.34 - DIAL.r + 0.02, 0.014]} />
            <meshStandardMaterial color="#55595f" metalness={0.2} roughness={0.72} />
          </mesh>
        ))}
        <mesh position={[0, -0.335, -0.02]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.22, 0.012, 0.07]} />
          <meshStandardMaterial color="#55595f" metalness={0.2} roughness={0.75} />
        </mesh>
      </group>

      <mesh position={[0, 0.03, -0.16]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.34, 0.06, 0.012]} />
        <meshStandardMaterial color={theme.color.black2} metalness={0.5} roughness={0.5} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default IntervalTimerScene
