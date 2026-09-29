// WeightStackScene — la pila de pesos de una máquina selectorizada.
//
// Sustituye a `LevelsScene`, que eran cuatro aros abstractos. Un aro que se
// rellena no significa "nivel"; una pila de discos con el pasador clavado a 50 kg
// sí, y es el objeto que el usuario tiene delante en la sala.
//
// Cotas reales:
//   placa    190 × 75 mm, 14 mm de grosor, dos agujeros a 110 mm
//   paso     17,5 mm (placa + goma separadora)
//   pila     20 placas, de 5 a 100 kg de 5 en 5
//   varillas Ø16 mm cromadas, montantes de 26 mm, chapa base de 300 × 170 mm
//
// El movimiento es el de la máquina, no decoración: el scroll sube el pasador
// por la pila y las placas POR ENCIMA del pasador se levantan con el carro y el
// cable. Si el pasador está a 50 kg, lo de abajo se queda quieto — así es como
// funciona de verdad, y es lo que hace que el ojo lo lea como un objeto y no
// como una animación.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, DoubleSide, Object3D, SRGBColorSpace } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

const PLATE = { width: 0.19, thickness: 0.014, depth: 0.075 }
const PITCH = 0.0175
const COUNT = 20
const STACK_BOTTOM = 0.055
const ROD = { radius: 0.008, x: 0.055, bottom: 0.035, top: 0.615 }
const FRAME = { width: 0.3, depth: 0.17, post: 0.026, height: 0.66 }
const LIFT = 0.13

// El peso NO es el número de placa: es cuántas placas levanta el pasador. Con el
// pasador en la placa de abajo suben las 20, que es la selección más dura; con el
// pasador arriba no sube casi nada. Ponerlo al revés hace que la máquina mienta.
const kgOf = (i) => (COUNT - i) * 5
const plateY = (i) => STACK_BOTTOM + i * PITCH
// Placas 0, 5, 10 y 15 -> 100, 75, 50 y 25 kg.
const LABELS = [0, 5, 10, 15]

// Selección según el scroll: se empieza ligero (pasador arriba) y se baja
// endureciendo, que es el orden del discurso de niveles.
const selectionFor = (sp) => COUNT - 1 - Math.round(sp * (COUNT - 1))

function useKgLabels() {
  // Cuatro texturas, no veinte: son las cuatro placas que llevan el número
  // grabado, y es lo que hace que la pila parezca de una sala y no de un
  // visor de CAD.
  const textures = useMemo(
    () =>
      LABELS.map((index) => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 96
        return { canvas, texture: new CanvasTexture(canvas), index }
      }),
    [],
  )

  const paint = useMemo(() => {
    textures.forEach(({ canvas, texture, index }) => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = theme.color.muted
      ctx.font = '900 58px Montserrat, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${kgOf(index)}`, canvas.width / 2, canvas.height / 2)
      texture.colorSpace = SRGBColorSpace
      texture.needsUpdate = true
    })
  }, [textures])

  useMemo(() => {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        textures.forEach(({ texture }) => {
          texture.needsUpdate = true
        })
      })
    }
    return null
  }, [textures])

  return { textures, paint }
}

export function WeightStackScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const platesRef = useRef()
  const pinRef = useRef()
  const carriageRef = useRef()
  const cableRef = useRef()
  const labelRefs = useRef([])
  const dummy = useMemo(() => new Object3D(), [])
  const { textures } = useKgLabels()
  const lifted = useRef(0)

  useFrame(({ clock }) => {
    const mesh = platesRef.current
    if (!mesh) return
    const sp = readScroll(scrollProgress)
    // Placas 0..target-1 quietas; target..19 suben con el carro.
    const target = selectionFor(sp)
    const rise = caps?.reducedMotion ? LIFT * sp : LIFT * sp * (1 + Math.sin(clock.getElapsedTime() * 0.9) * 0.012)

    for (let i = 0; i < COUNT; i += 1) {
      const up = i >= target ? rise : 0
      dummy.position.set(0, plateY(i) + up, 0)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.setScalar(1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    lifted.current = target

    LABELS.forEach((index, slot) => {
      const node = labelRefs.current[slot]
      if (!node) return
      const up = index >= target ? rise : 0
      node.position.set(0, plateY(index) + up, PLATE.depth / 2 + 0.006)
    })

    if (pinRef.current) {
      pinRef.current.position.set(0, plateY(target) + rise, PLATE.depth / 2 + 0.012)
    }
    if (carriageRef.current) {
      carriageRef.current.position.set(0, plateY(target) + rise - 0.02, 0)
    }
    if (cableRef.current) {
      const from = plateY(target) + rise + 0.03
      const to = FRAME.height - 0.02
      cableRef.current.position.set(0, (from + to) / 2, -PLATE.depth / 2 - 0.02)
      cableRef.current.scale.y = Math.max(0.02, to - from)
    }
  })

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.9} />
      {/* Relleno de frente: la cámara cae a 4 m mirando en -Z y todo el rig alumbra
          desde arriba y detrás; sin esta luz la pila entera salía negra. */}
      <pointLight position={[0, 0.55, 3.37]} intensity={44} color={theme.color.muted} />

      {/* Bastidor: chapa base, dos montantes y travesaño superior por donde
          pasa el cable. Sin montantes la pila flota, y eso la delata. */}
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[FRAME.width, 0.024, FRAME.depth]} />
        <meshStandardMaterial color="#62676e" metalness={0.15} roughness={0.72} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={`post${side}`} position={[side * (FRAME.width / 2 - FRAME.post / 2), FRAME.height / 2, 0]}>
          <boxGeometry args={[FRAME.post, FRAME.height, FRAME.post]} />
          <meshStandardMaterial color="#62676e" metalness={0.15} roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0, FRAME.height - 0.015, 0]}>
        <boxGeometry args={[FRAME.width, 0.03, FRAME.depth * 0.8]} />
        <meshStandardMaterial color="#62676e" metalness={0.15} roughness={0.72} />
      </mesh>
      {/* Puerta trasera: la chapa que tapa la guía, típica de estas máquinas */}
      <mesh position={[0, FRAME.height / 2, -PLATE.depth / 2 - 0.022]}>
        <boxGeometry args={[FRAME.width - FRAME.post * 2, FRAME.height - 0.06, 0.008]} />
        <meshStandardMaterial color="#565b62" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Dos varillas cromadas: los agujeros de las placas van a 110 mm */}
      {[-1, 1].map((side) => (
        <mesh key={`rod${side}`} position={[side * ROD.x, (ROD.bottom + ROD.top) / 2, 0]}>
          <cylinderGeometry args={[ROD.radius, ROD.radius, ROD.top - ROD.bottom, 16]} />
          <meshStandardMaterial color="#b4bcc4" metalness={0.95} roughness={0.18} />
        </mesh>
      ))}

      {/* 20 placas en una sola instancia */}
      <instancedMesh ref={platesRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <boxGeometry args={[PLATE.width, PLATE.thickness, PLATE.depth]} />
        <meshStandardMaterial color="#5a5e64" metalness={0.12} roughness={0.78} />
      </instancedMesh>

      {/* Carro: el bloque al que enganchan las placas elevadas */}
      <mesh ref={carriageRef} position={[0, STACK_BOTTOM, 0]}>
        <boxGeometry args={[PLATE.width + 0.02, 0.018, PLATE.depth + 0.014]} />
        <meshStandardMaterial color="#5f646b" metalness={0.15} roughness={0.72} />
      </mesh>

      {/* Cable hasta la polea del travesaño */}
      <mesh ref={cableRef} position={[0, 0.4, -PLATE.depth / 2 - 0.02]}>
        <cylinderGeometry args={[0.0035, 0.0035, 1, 8]} />
        <meshStandardMaterial color="#6f7783" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Pasador selector: varilla de 10 mm con mango de nylon naranja. Es el
          detalle que convierte "cajas apiladas" en "una máquina de pesos". */}
      <group ref={pinRef} position={[0, STACK_BOTTOM, PLATE.depth / 2 + 0.012]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.075, 12]} />
          <meshStandardMaterial color="#aab2ba" metalness={0.95} roughness={0.2} />
        </mesh>
        <mesh position={[0.028, 0, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.062, 16]} />
          <meshStandardMaterial color={theme.color.orange} metalness={0.15} roughness={0.55} />
        </mesh>
      </group>

      {/* Los kg grabados: sin el número, la pila es un adorno */}
      {textures.map(({ texture, index }, slot) => (
        <sprite
          key={index}
          ref={(node) => { labelRefs.current[slot] = node }}
          position={[0, plateY(index), PLATE.depth / 2 + 0.006]}
          scale={[0.1, 0.038, 1]}
        >
          <spriteMaterial map={texture} transparent alphaTest={0.02} side={DoubleSide} depthWrite={false} />
        </sprite>
      ))}

      {/* Topes de goma y suelo de sala */}
      <mesh position={[0, STACK_BOTTOM - 0.012, 0]}>
        <boxGeometry args={[PLATE.width + 0.03, 0.01, PLATE.depth + 0.02]} />
        <meshStandardMaterial color="#55595f" metalness={0.05} roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default WeightStackScene
