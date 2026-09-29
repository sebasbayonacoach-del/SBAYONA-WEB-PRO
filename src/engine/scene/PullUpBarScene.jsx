// PullUpBarScene — barra fija de calle con su colchoneta de caída.
//
// «VALENTÍA NO ES IMPROVISACIÓN / SEGURIDAD ACTIVA» no se cuenta con un colchón
// suelto ni con una barra suelta: lo que dice la frase es la pareja — el apoyo
// donde se entrenan los saltos y el material que absorbe la caída. Van juntos.
//
// Cotas reales: barra de 1,20 m de ancho y tubo de 32 mm a 2,15 m del suelo,
// ménsulas de 500 mm saliendo de la pared, empuñaduras de 120 mm. Colchoneta de
// 1200 × 1000 × 100 mm, que es el grosor mínimo con el que se cae de pie desde
// esa altura sin hacerte daño; el número va grabado en el canto porque el
// grosor ES el dato de seguridad.
//
// El scroll comprime la colchoneta hasta el 78 % y la deja rebotar: es lo que
// pasa cuando alguien cae encima. La barra no se mueve — si se moviese, sería
// mala herrajería, no animación.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

const BAR = { span: 1.2, radius: 0.016, height: 2.15, offset: 0.5, grip: 0.12 }
const MAT = { w: 1.2, d: 1.0, h: 0.1 }
// Al 78 %: una espuma de 100 mm se aplasta unos 20 mm con un adulto cayendo de
// pie. Comprimirla más sería vender un colchón blando, que es lo contrario del
// mensaje de la sección.
const COMPRESION = 0.78

function sideTexture(mm) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#5a5e64' // grafito: sobre #050505 el negro del tema no separaba
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, canvas.height - 3)
  ctx.lineTo(canvas.width, canvas.height - 3)
  ctx.stroke()
  ctx.fillStyle = theme.color.orange
  ctx.font = '900 34px Montserrat, Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(`${mm} MM`, canvas.width / 2, canvas.height / 2)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

function topTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#5a5e64' // grafito: sobre #050505 el negro del tema no separaba
  ctx.fillRect(0, 0, 512, 512)
  // Costuras de los paneles: una colchoneta va picada en cuadros, y sin esas
  // líneas parece un tablón pintado.
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 4
  for (let i = 1; i < 4; i += 1) {
    const p = (i * 512) / 4
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 512); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(512, p); ctx.stroke()
  }
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  return tex
}

export function PullUpBarScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const colchoneta = useRef()
  const tapiz = useMemo(topTexture, [])
  const canto = useMemo(() => sideTexture(Math.round(MAT.h * 1000)), [])

  useFrame(({ clock }, delta) => {
    if (!colchoneta.current) return
    const sp = readScroll(scrollProgress)
    // Objetivo según el scroll, con rebote amortiguado: una espuma no vuelve a
    // su sitio en línea recta.
    const objetivo = caps?.reducedMotion ? 1 : 1 - (1 - COMPRESION) * Math.max(0, Math.sin(sp * Math.PI * 2.2))
    const actual = colchoneta.current.scale.y
    const siguiente = actual + (objetivo - actual) * Math.min(1, delta * 7)
    colchoneta.current.scale.y = siguiente
    if (!caps?.reducedMotion) {
      colchoneta.current.scale.y += Math.sin(clock.getElapsedTime() * 1.7) * 0.004
    }
  })

  const acero = <meshStandardMaterial color="#8d959d" metalness={0.92} roughness={0.3} />

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.85} />
      {/* Relleno de frente: la barra cuelga a 5 m en -Z y todo el rig alumbra por
          detrás y arriba; sin esta luz el acero y el tapiz llegaban casi negros. */}
      <pointLight position={[0, 1.1, 4.25]} intensity={70} color={theme.color.muted} />

      {/* La colchoneta se escala desde un grupo anclado en el suelo: si se
          escalara el mesh directamente, se encogería también por abajo y
          quedaría flotando. */}
      <group ref={colchoneta} position={[0.1, 0, 0.34]}>
        <mesh position={[0, MAT.h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[MAT.w, MAT.h, MAT.d]} />
          <meshStandardMaterial map={tapiz} roughness={0.95} metalness={0} />
        </mesh>
        {/* Canto delantero con el grosor grabado: el dato de seguridad. */}
        <mesh position={[0, MAT.h / 2, MAT.d / 2 + 0.0005]}>
          <planeGeometry args={[MAT.w, MAT.h]} />
          <meshBasicMaterial map={canto} toneMapped={false} />
        </mesh>
      </group>

      {/* Pared de anclaje. Sin ella las ménsulas salen de la nada y la barra
          parece un marco de gimnasio mal montado. */}
      {/* Muro: grande y hasta el suelo. Un panel de 2,6 m dejaba ver el negro
          por los cuatro lados y parecía un cartel colgado, no una pared. */}
      <mesh position={[0, 1.9, -0.62]} receiveShadow userData={{ noMeasure: true }}>
        <boxGeometry args={[9, 6.4, 0.12]} />
        <meshStandardMaterial color={theme.color.black2} roughness={0.96} metalness={0} />
      </mesh>

      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * (BAR.span / 2 - 0.06), BAR.height, -0.62 / 2 + 0.06]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.022, 0.022, BAR.offset, 18]} />
          {acero}
        </mesh>
      ))}
      {/* Refuerzo diagonal: las barras de calle good enough van arriostradas; sin
          él la ménsula parece de cartón. */}
      {/* Riostra: va del MURO (por debajo de la barra) a la puntera de la
          ménsula. Se calcula con el vector entre esos dos puntos; la versión
          anterior llevaba un ángulo a ojo y salía como una pata colgando. */}
      {[-1, 1].map((s) => {
        const desde = [-0.56, BAR.height - 0.34] // pared, 34 cm por debajo
        const hasta = [-0.11, BAR.height - 0.02] // punta de la ménsula
        const dz = hasta[0] - desde[0]
        const dy = hasta[1] - desde[1]
        const largo = Math.hypot(dz, dy)
        return (
          <mesh
            key={`rio${s}`}
            position={[s * (BAR.span / 2 - 0.06), (desde[1] + hasta[1]) / 2, (desde[0] + hasta[0]) / 2]}
            rotation={[Math.atan2(dz, dy), 0, 0]}
          >
            <cylinderGeometry args={[0.012, 0.012, largo, 14]} />
            {acero}
          </mesh>
        )
      })}

      {/* Barra: cilindro en Y girado 90° en Z para que corra a lo ancho. */}
      <mesh position={[0.1, BAR.height, -0.11]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[BAR.radius, BAR.radius, BAR.span, 24]} />
        {acero}
      </mesh>
      {/* Empuñaduras: 120 mm de goma en cada mano, y el centro queda con el
          knurling visto. Una barra lisa no es una barra de calistenia. */}
      {[-1, 1].map((s) => (
        <mesh
          key={`grip${s}`}
          position={[0.1 + s * (BAR.span / 2 - BAR.grip / 2 - 0.05), BAR.height, -0.11]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[BAR.radius + 0.004, BAR.radius + 0.004, BAR.grip, 24]} />
          <meshStandardMaterial color="#565a60" roughness={0.78} metalness={0.05} />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default PullUpBarScene
