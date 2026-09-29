// TimelineScene — hitos anuales que se recorren caminando hacia dentro.
//
// Arquetipo para el layout `timeline` de sectionBlueprints (brief §50/§51), que
// en el sitio real ya usan `community-entry` y el «recorrido» de /about. El
// usuario baja y el grupo de marcos avanza hacia la cámara: el desplazamiento ES
// la línea temporal, así que el progreso de scroll manda la posición.
//
// Los años van escritos dentro de cada marco. Sin eso la escena es un pasillo
// bonito, no una línea temporal, y el §39 del brief exige que el objeto
// represente una idea.
//
// Coste: 4 marcos + 4 sprites + 1 hilo. Sin partículas ni bloom por defecto.

import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { ParticleField } from './ParticleField.jsx'
import { PostProcessing } from './PostProcessing.jsx'

// Los años del recorrido real de marca. Cambiar aquí, no en la página.
const YEARS = [2003, 2014, 2019, 2025]
const GATE_SPAN = 3.4
const DEPTH = (YEARS.length - 1) * GATE_SPAN
const GATE_RADIUS = 1.5

/**
 * Etiqueta de año pintada en un canvas 2D. Se genera una vez por año y se
 * memoriza: crear texturas dentro del bucle de render es la forma más rápida de
 * llenar la GPU de objetos que nadie libera.
 */
function yearTexture(label) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 160
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = '900 118px "Montserrat", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = theme.color.orange
  ctx.fillText(label, 256, 80)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/**
 * Texturas de año repaintadas cuando el navegador confirma que Montserrat está
 * cargado. Si no, el `fillText` se resuelve con el fallback del sistema y la
 * escena sale con otra tipografía sin lanzar ningún error: solo se ve en la foto.
 */
function useYearLabels(years) {
  const [labels, setLabels] = useState(() => years.map((y) => yearTexture(String(y))))

  useEffect(() => {
    let alive = true
    const repaint = () => {
      if (!alive) return
      setLabels((prev) => {
        prev.forEach((t) => t.dispose())
        return years.map((y) => yearTexture(String(y)))
      })
    }
    const fonts = document.fonts
    if (fonts?.ready?.then) {
      fonts.ready.then(repaint)
    }
    return () => {
      alive = false
    }
  }, [years])

  useEffect(() => () => labels.forEach((t) => t.dispose()), [labels])

  return labels
}

export function TimelineScene({
  params,
  scrollProgress = 0,
  particles = false,
  postProcessing = false,
  caps,
}) {
  const rigRef = useRef()
  const gateRefs = useRef([])

  const labels = useYearLabels(YEARS)

  useFrame(({ clock }) => {
    const sp = readScroll(scrollProgress)
    const travel = caps?.reducedMotion ? 0 : sp
    if (rigRef.current) {
      rigRef.current.position.z = travel * DEPTH
      if (!caps?.reducedMotion) {
        rigRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.12) * 0.025
      }
    }

    // El marco más cercano a la cámara es el que se abre: la atención viaja sola
    // hacia el año que toca sin necesidad de anclar texto en el DOM.
    const z = travel * DEPTH
    gateRefs.current.forEach((gate, index) => {
      if (!gate) return
      const distance = Math.abs(index * GATE_SPAN - z)
      const near = 1 - Math.min(1, distance / GATE_SPAN)
      // Curva cerrada: sin exponente, los cuatro años quedan a media luz y se
      // apilan sobre el centro del encuadre.
      const alpha = near ** 1.8
      gate.scale.setScalar(0.82 + near * 0.36)
      gate.traverse((node) => {
        // `isSprite` también: las etiquetas son sprites y no entraban en el
        // fade, que es lo que hacía que el año lejano se viera igual de fuerte.
        if ((node.isMesh || node.isSprite) && node.material?.opacity !== undefined) {
          node.material.opacity = 0.08 + alpha * 0.92
        }
      })
    })
  })

  return (
    <>
      <LightingRig caps={caps} />
      <group ref={rigRef} position={[0, 0, 0]}>
        {YEARS.map((year, index) => (
          <group
            key={year}
            ref={(node) => {
              gateRefs.current[index] = node
            }}
            position={[0, 0, -index * GATE_SPAN]}
          >
            <mesh>
              <torusGeometry args={[GATE_RADIUS, 0.012, 6, 64]} />
              <meshBasicMaterial
                color={index === YEARS.length - 1 ? theme.color.orange : theme.color.muted}
                transparent
                opacity={0.4}
              />
            </mesh>

            <sprite position={[0, 0.92, 0]} scale={[0.92, 0.28, 1]}>
              <spriteMaterial
                map={labels[index]}
                transparent
                depthWrite={false}
                opacity={index === YEARS.length - 1 ? 0.95 : 0.7}
              />
            </sprite>

            {/* Umbral: el suelo del pasillo bajo cada hito. */}
            <mesh position={[0, -GATE_RADIUS, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.4, GATE_RADIUS * 1.25, 48]} />
              <meshBasicMaterial color={theme.color.black3} transparent opacity={0.6} side={2} />
            </mesh>

            {/* Tramo hacia el siguiente hito, hijo de ESTE marco: así se apaga con
                él. Una sola caja para todo el pasillo se desproporciona con la
                perspectiva y corta el encuadre con un triángulo naranja. */}
            {index < YEARS.length - 1 && (
              <mesh position={[0, -GATE_RADIUS + 0.01, -GATE_SPAN / 2]}>
                <boxGeometry args={[0.008, 0.008, GATE_SPAN * 0.86]} />
                <meshBasicMaterial color={theme.color.orangeDeep} transparent opacity={0.45} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {particles && <ParticleField params={params} scrollProgress={scrollProgress} caps={caps} />}
      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default TimelineScene
