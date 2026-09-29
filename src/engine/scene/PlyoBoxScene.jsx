// PlyoBoxScene — caja pliométrica de tres alturas.
//
// El método hecho objeto: la misma caja da 40, 50 o 60 cm según qué cara apoye,
// y el scroll la gira. No hay anillo que se rellena ni barra que sube: se cambia
// de altura, que es literalmente lo que se hace en la sala.
//
// Cotas reales: 60 x 50 x 40 cm, tablero de 15 mm, canto de goma. El número que
// lleva grabado cada cara NO es decorativo: dice la altura que tendrá la caja
// cuando ESA cara quede abajo, o sea la distancia a su cara opuesta. Por eso
// ±X valen 60, ±Z valen 50 e ±Y valen 40.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, Quaternion, SRGBColorSpace, Vector3 } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

// x = 60 cm, y = 40 cm, z = 50 cm
const BOX = { x: 0.6, y: 0.4, z: 0.5, skin: 0.015 }

// Tres apoyos, en orden de dificultad. Cada uno es un vuelco real sobre una
// arista, no una rotación arbitraria.
const POSES = [
  { cm: 40, axis: [0, 0, 0], angle: 0, height: BOX.y },
  { cm: 50, axis: [1, 0, 0], angle: Math.PI / 2, height: BOX.z },
  { cm: 60, axis: [0, 0, 1], angle: Math.PI / 2, height: BOX.x },
]

const QUATS = POSES.map((pose) =>
  new Quaternion().setFromAxisAngle(new Vector3(...pose.axis), pose.angle),
)

function faceTexture(cm, sideways = false) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 384
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = theme.color.black2
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = theme.color.orange
  ctx.lineWidth = 9
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48)
  ctx.fillStyle = theme.color.orange
  ctx.font = '900 176px Montserrat, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (sideways) {
    // En los cantos de 60 el numero va girado: es como viene de fabrica, para
    // que se lea de pie cuando esa cara queda abajo. Sin esto sale tumbado.
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2 - 22)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText(String(cm), 0, 0)
    ctx.restore()
  } else {
    ctx.fillText(String(cm), canvas.width / 2, canvas.height / 2 - 22)
  }
  ctx.font = '400 44px "DM Mono", monospace'
  ctx.fillStyle = theme.color.muted
  ctx.fillText('CM', canvas.width / 2, canvas.height / 2 + 104)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function PlyoBoxScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const boxRef = useRef()
  const scratch = useMemo(() => new Quaternion(), [])

  const { tex40, tex50, tex60 } = useMemo(() => {
    const made = { tex40: faceTexture(40), tex50: faceTexture(50), tex60: faceTexture(60) }
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        Object.values(made).forEach((texture) => {
          texture.needsUpdate = true
        })
      })
    }
    return made
  }, [])

  useFrame(() => {
    const box = boxRef.current
    if (!box) return
    const sp = readScroll(scrollProgress)
    // Se interpola con slerp entre apoyos: interpolar Euler entre dos vuelcos de
    // ejes distintos hace que la caja atraviese el suelo a mitad de camino.
    const raw = Math.min(1, Math.max(0, sp)) * (POSES.length - 1)
    const step = Math.min(POSES.length - 2, Math.floor(raw))
    const t = caps?.reducedMotion ? 1 : raw - step
    const ease = t * t * (3 - 2 * t)

    scratch.copy(QUATS[step]).slerp(QUATS[step + 1], ease)
    box.quaternion.copy(scratch)

    const from = POSES[step].height
    const to = POSES[step + 1].height
    box.position.set(0, (from + (to - from) * ease) / 2, 0)
  })

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.55} />

      {/* Un <mesh>, no un <group>: la caja salia negra porque los materiales y la
          geometria estaban colgando de un group, que no tiene ni unos ni otra.
          React no avisa: simplemente no se dibuja nada. */}
      <mesh ref={boxRef} position={[0, BOX.y / 2, 0]}>
        <boxGeometry args={[BOX.x, BOX.y, BOX.z]} />
        {/* Seis cantos con su altura grabada: +X/-X dan 60, +/-Z dan 50, +/-Y dan 40 */}
        <meshStandardMaterial attach="material-0" map={tex60} roughness={0.86} metalness={0.04} />
        <meshStandardMaterial attach="material-1" map={tex60} roughness={0.86} metalness={0.04} />
        <meshStandardMaterial attach="material-2" map={tex40} roughness={0.86} metalness={0.04} />
        <meshStandardMaterial attach="material-3" map={tex40} roughness={0.86} metalness={0.04} />
        <meshStandardMaterial attach="material-4" map={tex50} roughness={0.86} metalness={0.04} />
        <meshStandardMaterial attach="material-5" map={tex50} roughness={0.86} metalness={0.04} />
      </mesh>

      {/* Tarima de aterrizaje delante de la caja */}
      <mesh position={[0, 0.01, 0.66]} userData={{ noMeasure: true }}>
        <boxGeometry args={[1.2, 0.02, 0.7]} />
        <meshStandardMaterial color="#17171a" metalness={0.02} roughness={0.96} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default PlyoBoxScene
