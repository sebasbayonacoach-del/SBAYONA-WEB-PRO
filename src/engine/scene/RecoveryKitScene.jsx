// RecoveryKitScene — kit de recuperación: foam roller, pelota y banda.
//
// «PERSONALIZA TU PLAN / RECUPERACIÓN / RENDIMIENTO» vende la recuperación como
// parte del entrenamiento, y en la sala eso son tres cacharros concretos. Ni
// cápsulas ni anillos abstractos: un rodillo con su rejilla, una pelota de
// movilidad y una banda elástica que se estira.
//
// Cotas reales: rodillo de 330 mm de largo por 150 mm de diámetro, pelota de
// 80 mm, banda en lazo cerrado de 2,08 m de circunferencia, 15 mm de ancha y
// 4,5 mm de gruesa. La banda se dibuja como un `torus` con el radio mayor
// deducido de esa circunferencia (R = L / 2π = 0,331 m) y aplastada en el eje
// del grueso: es un lazo plano, no un flotador.
//
// El scroll estira la banda de 1× a 1,55× y hace girar el rodillo. La banda es
// lo único que cambia de escala porque es lo único que cambia de forma en la
// realidad; escalar el rodillo sería mentira.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'
import { StudioEnvironment } from './StudioEnvironment.jsx'

const ROLLER = { length: 0.33, radius: 0.075 }
const BALL = { radius: 0.04 }
// Banda MINI (la de glúteo/pierna, la que se compra en un kit de recuperación):
// 660 mm de circunferencia, no 2,08 m. Con la larga el lazo medía 66 cm de
// diámetro y se comía el encuadre, tapando el rodillo.
const BAND = { circumference: 0.66, width: 0.015, thickness: 0.0045 }
// Radio mayor del lazo, deducido de la longitud, no elegido a ojo.
const BAND_R = BAND.circumference / (Math.PI * 2)

// Rejilla del foam roller: los cortes que se ven en las de calidad, y que son la
// única señal de que esto es EVA y no un tubo de PVC.
function rollerTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = theme.color.black2
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 5
  for (let x = 0; x < canvas.width; x += 46) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + 46, canvas.height)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + 46, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
  ctx.strokeStyle = theme.color.orange
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.moveTo(0, canvas.height / 2)
  ctx.lineTo(canvas.width, canvas.height / 2)
  ctx.stroke()
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.wrapS = tex.wrapT = RepeatWrapping
  return tex
}

export function RecoveryKitScene({ params, scrollProgress = 0, caps, postProcessing = true }) {
  const roller = useRef()
  const band = useRef()
  const skin = useMemo(rollerTexture, [])

  useFrame(({ clock }) => {
    const sp = readScroll(scrollProgress)
    if (roller.current && !caps?.reducedMotion) {
      // El rodillo rueda sobre su eje (X, porque está tumbado), no sobre Y.
      roller.current.rotation.x = clock.getElapsedTime() * 0.25 + sp * 1.6
    }
    if (band.current) {
      const estirada = caps?.reducedMotion ? 1.2 : 1 + sp * 0.55
      band.current.scale.x = estirada
      // Al estirarse un lazo plano, el ancho se mantiene: escalar solo en X y
      // compensar en Z es lo que hace que siga pareciendo tela y no globo.
      band.current.scale.z = 1
    }
  })

  const eva = <meshStandardMaterial map={skin} color={theme.color.white} roughness={0.92} metalness={0} />

  return (
    <>
      <LightingRig caps={caps} />
      <StudioEnvironment intensity={0.7} />

      {/* Rodillo tumbado: el cilindro nace en Y, hay que girarlo 90° en Z para
          que quede apoyado sobre el suelo a lo largo de X. */}
      <group position={[-0.26, ROLLER.radius, 0.02]}>
        <mesh ref={roller} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[ROLLER.radius, ROLLER.radius, ROLLER.length, 40]} />
          {eva}
        </mesh>
        {/* Tapones: sin ellos el cilindro acaba en canto vivo y parece un tubo. */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * (ROLLER.length / 2 + 0.001), 0, 0]} rotation={[0, 0, -s * Math.PI / 2]}>
            <cylinderGeometry args={[ROLLER.radius - 0.008, ROLLER.radius - 0.008, 0.008, 32]} />
            <meshStandardMaterial color={theme.color.black3} roughness={0.85} metalness={0} />
          </mesh>
        ))}
      </group>

      {/* Pelota de movilidad, apoyada: el centro va a una radio del suelo. */}
      <mesh position={[0.06, BALL.radius, 0.14]} castShadow>
        <sphereGeometry args={[BALL.radius, 32, 24]} />
        <meshStandardMaterial color={theme.color.orangeDeep} roughness={0.78} metalness={0.02} />
      </mesh>

      {/* Banda en lazo, tumbada en el suelo y estirándose hacia la derecha. El
          torus nace en el plano XY; girado 90° en X queda en el XZ, que es el
          suelo. El grueso se aplastando escalando Y. */}
      {/* El lazo va VERTICAL, no tumbado. Con la cámara a la altura del centro
          del conjunto (8 cm sobre el suelo) una banda plana en el suelo se ve
          como un hilo: medido en la primera captura salía una elipse de 1 px.
          De pie es como se sostiene cuando se estira con la mano. */}
      <group ref={band} position={[0.3, BAND_R + 0.004, -0.02]}>
        <mesh scale={[1, 1, BAND.thickness / BAND.width]}>
          <torusGeometry args={[BAND_R, BAND.width / 2, 8, 96]} />
          <meshStandardMaterial color={theme.color.black3} roughness={0.95} metalness={0} />
        </mesh>
        {/* La banda de verdad lleva una franja de fábrica; sin esa línea el lazo
            se lee como un flotador negro. */}
        <mesh scale={[1, 1, BAND.thickness / BAND.width]} position={[0, 0, BAND.width * 0.28]}>
          <torusGeometry args={[BAND_R, BAND.width / 6, 6, 96]} />
          <meshStandardMaterial color={theme.color.orange} roughness={0.9} metalness={0} />
        </mesh>
      </group>

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow userData={{ noMeasure: true }}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color={theme.color.black} roughness={0.95} metalness={0} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default RecoveryKitScene
