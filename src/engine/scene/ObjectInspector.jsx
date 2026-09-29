// ObjectInspector — que el objeto se pueda mirar, no solo ver.
//
// Por qué existe: el rack de demostración gustó porque se podía orbitar, porque las
// cotas salían de medir la geometría de verdad y porque había una caja envolvente
// que mostraba la estructura. Las escenas del sitio eran decorado: bonitas y
// mudas. Este componente convierte cualquier variante en un objeto inspeccionable.
//
// Qué hace:
//   - OrbitControls: acercarse y rodearlo.
//   - Mide el `Box3` del grupo montado y pinta las tres cotas (ancho, alto, fondo)
//     LEYENDO la geometría, no copiándolas de un texto. Si la escena cambia de
//     medidas, la etiqueta cambia con ella. Eso es lo que hace que fiar-se.
//   - Caja envolvente con "ver estructura": la arista que sostiene el objeto.
//
// Va dentro del <Canvas>, así que lo monta una variante que ya pase por
// `resolveSceneConfig`; no abre un segundo contexto WebGL.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Box3, CanvasTexture, Spherical, SRGBColorSpace, Vector3 } from 'three'
import { theme } from '../config/theme.js'

const fmt = (m) => (m >= 1 ? `${m.toFixed(2)} m` : `${Math.round(m * 100)} cm`)

function useDimensionTexture(text) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(5,5,5,0.82)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = theme.color.orange
      ctx.lineWidth = 3
      ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3)
      ctx.fillStyle = theme.color.orange
      ctx.font = '900 34px Montserrat, Arial, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)
      texture.needsUpdate = true
    }
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    draw()
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(draw)
    }
    return { texture, draw }
  }, [text])
}

function DimensionLabel({ text, position, scale = 1 }) {
  const { texture } = useDimensionTexture(text)
  return (
    <sprite position={position} scale={[0.26 * scale, 0.065 * scale, 1]}>
      <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} />
    </sprite>
  )
}

/**
 * @param {Object} props
 * @param {import('react').ReactNode} props.children  El objeto que se inspecciona.
 * @param {boolean} [props.enabled]  Si no, se comporta como un grupo normal.
 * @param {boolean} [props.structure]  Caja envolvente visible.
 * @param {number[]} [props.target]  Punto que mira la cámara al abrir.
 */
export function ObjectInspector({ children, enabled = true, structure = false, target = [0, 0.4, 0] }) {
  const group = useRef()
  const gl = useThree((state) => state.gl)
  const camera = useThree((state) => state.camera)
  const [box, setBox] = useState(null)
  const scratch = useMemo(() => new Box3(), [])
  const center = useMemo(() => new Vector3(), [])
  const size = useMemo(() => new Vector3(), [])

  // Orbitado escrito a mano. El contrato de escena de BAYONA no admite
  // @react-three/drei y el repo no importa three/examples en ningun fichero,
  // asi que la alternativa era ampliar el contrato para mi componente: no. Son
  // esfericas sobre la camara, arrastre de puntero y rueda para acercar.
  const orbit = useRef(null)
  const pivot = useMemo(() => new Vector3(), [])

  useFrame(() => {
    const sph = orbit.current
    if (!sph) return
    // Reutilizadas: new Vector3 por fotograma es basura que el recolector paga
    // en los cortes de frame del movil.
    pivot.set(target[0] ?? 0, target[1] ?? 0.4, target[2] ?? 0)
    camera.position.setFromSpherical(sph).add(pivot)
    camera.lookAt(pivot)
  })

  useEffect(() => {
    const el = gl?.domElement
    if (!enabled || !el) return undefined
    const sph = new Spherical().setFromVector3(
      camera.position.clone().sub(new Vector3(target[0] ?? 0, target[1] ?? 0.4, target[2] ?? 0)),
    )
    let dragging = false
    let lastX = 0
    let lastY = 0

    const down = (e) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      el.setPointerCapture?.(e.pointerId)
    }
    const move = (e) => {
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      sph.theta -= dx * 0.0075
      sph.phi = Math.min(Math.PI * 0.52, Math.max(0.12, sph.phi - dy * 0.0055))
    }
    const up = () => {
      dragging = false
    }
    const wheel = (e) => {
      sph.radius = Math.min(4, Math.max(0.55, sph.radius + e.deltaY * 0.0016))
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: true })
    orbit.current = sph
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
      orbit.current = null
    }
  }, [enabled, gl, camera, target])

  // Se mide sobre la geometría real, pero con dos cuidados que valieron dos
  // correcciones:
  //
  // 1. **Se salta el decorado.** `Box3.setFromObject` no distingue producto de
  //    escenario, y todas las escenas llevan un plano de suelo de 24 × 18 m: la
  //    primera medición de la barra devolvía `[24, 0.46, 18]` y las tres cotas
  //    eran mentira. Los suelos van marcados con `userData.noMeasure` y aquí se
  //    poda ese subárbol.
  // 2. **Se reintenta.** El objeto entra por `React.lazy` dentro del `<Suspense>`
  //    del viewer; medido en el primer fotograma el grupo está vacío y la cota no
  //    aparece nunca. Se mide cada cuadro hasta que tiene contenido, con tope.
  useEffect(() => {
    if (!enabled || !group.current) return undefined

    const medir = () => {
      scratch.makeEmpty()
      const podar = (node) => {
        for (const child of node.children) {
          if (child.userData?.noMeasure) continue
          if (child.isMesh && child.geometry) scratch.expandByObject(child)
          podar(child)
        }
      }
      podar(group.current)
      if (scratch.isEmpty()) return false
      scratch.getSize(size)
      scratch.getCenter(center)
      setBox({ size: size.clone(), center: center.clone() })
      return true
    }

    let cuadro = 0
    let id = 0
    const intentos = 90 // ~1,5 s a 60 Hz: sobra para el chunk del objeto
    const bucle = () => {
      cuadro += 1
      if (medir() || cuadro > intentos) return
      id = requestAnimationFrame(bucle)
    }
    id = requestAnimationFrame(bucle)
    return () => cancelAnimationFrame(id)
  }, [enabled, scratch, center, size])

  return (
    <>
      <group ref={group}>{children}</group>

      {enabled && box ? (
        <>
          {/* Las tres cotas, leídas del Box3: ancho, alto y fondo */}
          <DimensionLabel
            text={fmt(box.size.x)}
            position={[box.center.x, box.center.y - box.size.y / 2 - 0.06, box.center.z + box.size.z / 2]}
          />
          <DimensionLabel
            text={fmt(box.size.y)}
            position={[box.center.x - box.size.x / 2 - 0.1, box.center.y, box.center.z]}
          />
          <DimensionLabel
            text={fmt(box.size.z)}
            position={[box.center.x + box.size.x / 2 + 0.1, box.center.y - box.size.y / 2, box.center.z]}
          />
        </>
      ) : null}

      {enabled && structure && box ? (
        <StructureBox center={box.center} size={box.size} />
      ) : null}
    </>
  )
}

// La arista que sostiene el objeto: lo que aparece al pedir "ver estructura".
function StructureBox({ center, size }) {
  const box = useMemo(
    () =>
      new Box3(
        new Vector3(center.x - size.x / 2, center.y - size.y / 2, center.z - size.z / 2),
        new Vector3(center.x + size.x / 2, center.y + size.y / 2, center.z + size.z / 2),
      ),
    [center, size],
  )
  return <box3Helper args={[box, theme.color.orange]} />
}

export default ObjectInspector
