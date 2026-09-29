// ScaleScene — báscula con tallímetro de pared.
//
// «NO ES MAGIA. ES MÉTODO. TE LEEMOS» y «CONTEXTO ANTES QUE DIAGNÓSTICO» piden
// un objeto que HACE una valoración: altura y peso medidos con una herramienta,
// no un número flotando. El tallímetro es lo que separa una báscula de domésti-
// ca de una de sala: el brazo que baja sobre la coronilla y la regla grabada.
//
// Cotas reales: plataforma de 360 × 360 mm y 28 mm de grosor, columna de
// aluminio de 20 mm de diámetro y 2,00 m, brazo de coronilla de 160 × 100 mm.
// La regla va de 100 a 210 cm porque por debajo de 100 no se valora a un
// adulto, que es lo que vende la página.
//
// El scroll mueve el brazo de 1,55 m a 1,92 m y el visor cambia con él. La
// textura del visor se repinta SOLO cuando el valor cuantizado cambia: repintar
// un `CanvasTexture` cada fotograma sube una textura a GPU por cuadro, y eso en
// móvil es el error clásico que ya costó una sesión en otro objeto.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

const PLATFORM = { w: 0.36, d: 0.36, h: 0.028 }
const POST = { radius: 0.01, height: 2.0 }
const ARM = { w: 0.16, d: 0.1, t: 0.012 }
const CM_MIN = 100
const CM_MAX = 210
const CM_AT_0 = 118 // cm que cae al pie de la regla grabada
const CM_PER_M = 100

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = theme.color.black2
  ctx.fillRect(0, 0, w, h)
  return { canvas, ctx }
}

function textureFrom(canvas) {
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

// La regla: marcas cada cm, numerales cada 10. Es lo que hace que el objeto se
// lea como instrumento y no como adorno con números pegados.
function rulerTexture() {
  const { canvas, ctx } = makeCanvas(128, 1024)
  const px = 1024 / ((CM_MAX - CM_MIN) / 100) // píxeles por metro
  ctx.strokeStyle = theme.color.muted
  ctx.fillStyle = theme.color.white
  ctx.font = '500 26px "DM Mono", monospace'
  ctx.textBaseline = 'middle'
  for (let cm = CM_MIN; cm <= CM_MAX; cm += 1) {
    const y = px - ((cm - CM_MIN) / 100) * px
    const mayor = cm % 10 === 0
    ctx.lineWidth = mayor ? 4 : 2
    ctx.beginPath()
    ctx.moveTo(118 - (mayor ? 44 : 22), y)
    ctx.lineTo(118, y)
    ctx.stroke()
    if (mayor) ctx.fillText(String(cm), 12, y)
  }
  return textureFrom(canvas)
}

// Visor: peso fijo y altura viva. Un visor que no cambia con el brazo sería
// mentir con el objeto.
function makeDisplay() {
  const { canvas, ctx } = makeCanvas(512, 256)
  const tex = textureFrom(canvas)
  const draw = (cm) => {
    ctx.fillStyle = theme.color.black
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
    ctx.textAlign = 'center'
    ctx.fillStyle = theme.color.orange
    ctx.font = '900 118px Montserrat, Arial, sans-serif'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${cm}`, canvas.width / 2, 96)
    ctx.fillStyle = theme.color.muted
    ctx.font = '500 44px "DM Mono", monospace'
    ctx.fillText('CM  ·  72,4 KG', canvas.width / 2, 190)
    tex.needsUpdate = true
  }
  draw(168)
  return { tex, draw }
}

export function ScaleScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const armRef = useRef()
  const lastCm = useRef(-1)

  const ruler = useMemo(rulerTexture, [])
  const display = useMemo(makeDisplay, [])

  useFrame(() => {
    const sp = readScroll(scrollProgress)
    // 1,55 → 1,92 m. El brazo se desliza por la columna, que es el gesto real.
    const height = 1.55 + sp * 0.37
    if (armRef.current) {
      if (!caps?.reducedMotion) {
        armRef.current.position.y = height
      } else if (armRef.current.position.y !== 1.72) {
        armRef.current.position.y = 1.72
      }
      const cm = Math.round(CM_AT_0 + armRef.current.position.y * CM_PER_M - 18)
      if (cm !== lastCm.current) {
        lastCm.current = cm
        display.draw(cm)
      }
    }
  })

  const steel = <meshStandardMaterial color="#9aa2aa" metalness={0.88} roughness={0.34} />

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.8} />
      {/* Relleno de frente: las luces del rig caen por detrás y arriba, y la cámara
          mira en -Z desde 4,4 m sin `lookAt`; sin esta luz el conjunto llegaba negro. */}
      <pointLight position={[0, 1.0, 3.72]} intensity={54} color={theme.color.muted} />

      {/* Plataforma. Va ligeramente elevada: las de sala tienen patas de goma y
          28 mm de chapa, no son un cristal en el suelo. */}
      <mesh position={[0, PLATFORM.h / 2, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[PLATFORM.w, PLATFORM.h, PLATFORM.d]} />
        <meshStandardMaterial color="#62666c" metalness={0.2} roughness={0.7} />
      </mesh>
      <mesh position={[0, PLATFORM.h + 0.001, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PLATFORM.w - 0.05, PLATFORM.d - 0.05]} />
        <meshStandardMaterial color="#565a60" metalness={0.5} roughness={0.16} />
      </mesh>

      {/* Visor en el canto delantero, inclinado hacia quien se sube. */}
      <mesh position={[0, PLATFORM.h + 0.055, 0.1 + PLATFORM.d / 2 - 0.01]} rotation={[-0.5, 0, 0]}>
        <boxGeometry args={[0.13, 0.07, 0.014]} />
        {steel}
      </mesh>
      <mesh position={[0, PLATFORM.h + 0.055, 0.1 + PLATFORM.d / 2 + 0.001]} rotation={[-0.5, 0, 0]}>
        <planeGeometry args={[0.118, 0.056]} />
        <meshBasicMaterial map={display.tex} toneMapped={false} />
      </mesh>

      {/* Columna del tallímetro, detrás de la plataforma. */}
      <mesh position={[0, POST.height / 2, 0.1 - PLATFORM.d / 2 + 0.02]}>
        <cylinderGeometry args={[POST.radius, POST.radius, POST.height, 20]} />
        {steel}
      </mesh>

      {/* Regla grabada mirando a la cámara. Es un plano delante de la columna
          porque una regla grabada EN el tubo se lee torcida desde cualquier lado
          que no sea el frente, y aquí se mira de frente. */}
      <mesh position={[0, (CM_AT_0 / 100 + 1.02) / 2 + 0.18, 0.1 - PLATFORM.d / 2 + 0.033]}>
        <planeGeometry args={[0.052, (CM_MAX - CM_MIN) / 100]} />
        <meshBasicMaterial map={ruler} toneMapped={false} />
      </mesh>

      {/* Brazo de coronilla: vive en un grupo que se desliza entero por la
          columna, que es como se mueve de verdad. */}
      <group ref={armRef} position={[0, 1.72, 0.1 - PLATFORM.d / 2 + 0.02]}>
        <mesh position={[0, 0, 0.075]}>
          <boxGeometry args={[0.02, 0.014, 0.16]} />
          {steel}
        </mesh>
        <mesh position={[0, ARM.t / 2 + 0.002, 0.13]}>
          <boxGeometry args={[ARM.w, ARM.t, ARM.d]} />
          <meshStandardMaterial color="#62666c" metalness={0.2} roughness={0.7} />
        </mesh>
        {/* El tope cae por delante del borde de la columna: si quedara centrado,
            el brazo parecería flotar. */}
        <mesh position={[0, -0.03, 0.0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.02, 16]} />
          {steel}
        </mesh>
      </group>

      {/* Suelo: sin él el objeto flota sobre el fondo de la sección. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default ScaleScene
