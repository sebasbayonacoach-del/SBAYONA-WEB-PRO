// BarbellScene — barra olímpica de 20 kg cargada con discos, apoyada en el suelo.
//
// Objeto real, no figura. Las cotas son las de la barra de competición y el
// disco de 25 kg, y se respetan: si el diámetro del disco no guarda proporción
// con el manguito, el ojo detecta "juguete" aunque no sepa por qué.
//
//   barra       2,200 m · 28 mm de diámetro en el puño
//   manguitos   50 mm · 415 mm de largo por lado
//   disco 25 kg 450 mm de diámetro · 28 mm de grosor · agujero 50 mm
//
// Procedural y sin assets: cilindros, anillos y círculos. `assets: []` intacto.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

const BAR = { length: 2.2, shaft: 0.028, sleeve: 0.05, sleeveLen: 0.415 }
const PLATE = { radius: 0.225, thickness: 0.028, bore: 0.025 }
const PLATES_PER_SIDE = 4
const KNUCKLE = 0.22

/**
 * Posiciones en X de los discos de un lado, apilados desde dentro del manguito
 * hacia el extremo, y del collarín que los aprieta.
 */
function side(sign) {
  const inner = sign * (BAR.length / 2 - BAR.sleeveLen)
  const plates = Array.from({ length: PLATES_PER_SIDE }, (_, i) =>
    sign > 0 ? inner + (i + 0.5) * PLATE.thickness : inner - (i + 0.5) * PLATE.thickness,
  )
  // El collarín aprieta el último disco: si se pone cerca del extremo del
  // manguito deja 25 cm de acero desnudo y la pila flota, que es como delata
  // ser decorado.
  const stackEnd = Math.abs(inner) + PLATES_PER_SIDE * PLATE.thickness
  const collar = sign * (stackEnd + 0.016)
  return { plates, collar }
}

export function BarbellScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const barRef = useRef()
  const left = useMemo(() => side(-1), [])
  const right = useMemo(() => side(1), [])

  // Balanceo mínimo sobre el eje de la barra. Un objeto de 200 kg perfectamente
  // inmóvil lee como un render suspendido, no como algo apoyado en el suelo.
  useFrame(({ clock }) => {
    if (!barRef.current || caps?.reducedMotion) return
    const sp = readScroll(scrollProgress)
    const idle = Math.sin(clock.getElapsedTime() * 0.45) * 0.006
    barRef.current.rotation.x = idle + (sp - 0.5) * 0.05
    barRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.004
  })

  // Los álbedos se midieron, no se eligieron a ojo: con `black2` (#0c0c0d) la
  // pila entera salía a 26–31/255 sobre un fondo de #050505, es decir el objeto
  // estaba ahí pero no se veía. Ninguna luz compensa un difuso casi negro.
  const sleeveMaterial = (
    <meshStandardMaterial color="#3b3e44" metalness={0.9} roughness={0.28} />
  )

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.85} />
      {/* Relleno de frente. La cámara mira en -Z sin `lookAt`, así que lo que se
          ve de un disco es su canto cilíndrico: la normal de esa franja apunta a
          la cámara y las luces del rig están todas por detrás y arriba, a +X/+Y.
          Sin esta luz el canto salía a 23/255 bajo el velo de la sección, es
          decir un borrón. No se toca `LightingRig`: es compartido por las
          veintidós escenas y una luz de más ahí dentro cambia también /shop. */}
      <pointLight position={[0, 0.5, 1.25]} intensity={6} color={theme.color.muted} />

      <group position={[0, 0, 0]}>
        <group ref={barRef} position={[0, PLATE.radius + 0.004, 0]}>
          {/* Manguitos. `cylinderGeometry` nace en el eje Y: sin girarlos sobre Z
              quedan como dos pilares verticales de 41 cm, que es el fallo que
              delataba que esto era un adorno. */}
          {[-1, 1].map((sign) => (
            <mesh
              key={`sleeve${sign}`}
              position={[sign * (BAR.length / 2 - BAR.sleeveLen / 2), 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[BAR.sleeve / 2, BAR.sleeve / 2, BAR.sleeveLen, 28]} />
              {sleeveMaterial}
            </mesh>
          ))}

          {/* Puño central y los anillos de knurling que marcan dónde van las manos */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry
              args={[BAR.shaft / 2, BAR.shaft / 2, BAR.length - 2 * BAR.sleeveLen, 24]}
            />
            <meshStandardMaterial color="#8d959d" metalness={0.92} roughness={0.34} />
          </mesh>
          {[-KNUCKLE, KNUCKLE].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry
                args={[BAR.shaft / 2 + 0.0012, BAR.shaft / 2 + 0.0012, 0.022, 24]}
              />
              <meshStandardMaterial color={theme.color.black2} metalness={0.7} roughness={0.6} />
            </mesh>
          ))}

          {[left, right].flatMap((s) => s.plates).map((x, i) => (
            <group key={`plate${i}`} position={[x, 0, 0]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry
                  args={[PLATE.radius, PLATE.radius, PLATE.thickness, 40]}
                />
                <meshStandardMaterial color="#5a5e64" metalness={0.15} roughness={0.75} />
              </mesh>
              {/* La banda de color va en la cara del disco, como en los reales.
                  Un anillo y un círculo miran a +Z por defecto: hay que girarlos
                  sobre Y para que miren a lo largo de la barra. Girarlos sobre Z
                  los hace rodar sobre sí mismos y quedan invisibles de frente.
                  `position` exige tres componentes: con una sola, R3F deja y/z en
                  undefined y la pieza cae a NaN — invisible sin ningún error. */}
              <mesh
                position={[(x > 0 ? 1 : -1) * (PLATE.thickness / 2 + 0.0012), 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <ringGeometry args={[PLATE.bore + 0.03, PLATE.radius - 0.014, 40]} />
                <meshStandardMaterial
                  color={theme.color.orangeDeep}
                  metalness={0.25}
                  roughness={0.55}
                  side={DoubleSide}
                />
              </mesh>
              <mesh
                position={[(x > 0 ? 1 : -1) * (PLATE.thickness / 2 + 0.0018), 0, 0]}
                rotation={[0, Math.PI / 2, 0]}
              >
                <circleGeometry args={[PLATE.bore + 0.032, 32]} />
                <meshStandardMaterial
                  color="#1a1c1f"
                  metalness={0.5}
                  roughness={0.5}
                  side={DoubleSide}
                />
              </mesh>
            </group>
          ))}

          {/* Collarines y topes */}
          {[left, right].map((s) => (
            <mesh key={`collar${s.collar}`} position={[s.collar, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.024, 0.024, 0.03, 24]} />
              <meshStandardMaterial color="#9aa2aa" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
          {[-1, 1].map((sign) => (
            <mesh
              key={`cap${sign}`}
              position={[sign * (BAR.length / 2 + 0.006), 0, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.021, 0.021, 0.014, 24]} />
              <meshStandardMaterial color={theme.color.orangeFire} metalness={0.3} roughness={0.45} />
            </mesh>
          ))}
        </group>

        {/* Suelo de goma: sin superficie bajo la barra el objeto flota y se
            pierde todo el trabajo de proporción. */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ noMeasure: true }}>
          <planeGeometry args={[24, 18]} />
          <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
        </mesh>
      </group>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default BarbellScene
