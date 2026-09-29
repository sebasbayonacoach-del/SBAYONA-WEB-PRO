// VaultScene — el dinero ficticio que se acumula bajando.
//
// Arquetipo para los layouts `dashboard` e `interactive`. Responde a la petición
// del brief de que la página dé valor y dinero en cada tramo de scroll: los
// billetes aparecen apilándose mientras el usuario baja, y la pila se ve crecer.
//
// Es la escena que hace visible la economía sin escribir un número: si el
// usuario para, la pila para. `params.instanceCount` es el techo de billetes.

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedMesh, Object3D } from 'three'
import { theme } from '../config/theme.js'
import { readScroll } from '../hooks/useScrollProgress.js'
import { LightingRig } from './LightingRig.jsx'
import { PostProcessing } from './PostProcessing.jsx'

const BILL = { width: 0.62, height: 0.012, depth: 0.3 }
const STACK_LIFT = 0.026
// Altura de pila para la que está diseñada la escena. El móvil recorta
// `instanceCount` a 8 (MOBILE_MAX_INSTANCES), y 8 billetes finos no son una
// pila más pequeña: son una pegatina. El separación se escala con el número de
// instancias para que la silueta mida siempre lo mismo y lo único que baje en
// móvil sea el número de piezas, que es lo que cuesta GPU.
const DESIGN_COUNT = 48

export function VaultScene({
  params,
  scrollProgress = 0,
  postProcessing = true,
  caps,
}) {
  const meshRef = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  const total = Math.max(8, Math.floor(params?.instanceCount ?? DESIGN_COUNT))
  const lift = (STACK_LIFT * DESIGN_COUNT) / total
  const stackHeight = lift * total
  // Con menos piezas, cada pieza más gruesa: la pila mide lo mismo en pantalla.
  const thickness = total >= DESIGN_COUNT ? 1 : DESIGN_COUNT / total

  // Deriva determinista por billete: sin Math.random() en el bucle de render,
  // porque el frame N y el N+1 tienen que contar la misma pila.
  const seeds = useMemo(
    () =>
      Array.from({ length: total }, (_, i) => ({
        sway: (i % 7) * 0.11 - 0.33,
        yaw: ((i * 37) % 23) / 23 - 0.5,
        roll: ((i * 59) % 17) / 17 - 0.5,
      })),
    [total],
  )

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const sp = readScroll(scrollProgress)
    const visible = Math.max(1, Math.round(sp * total))
    const idle = caps?.reducedMotion ? 0 : clock.getElapsedTime()

    for (let i = 0; i < total; i += 1) {
      const shown = i < visible
      const seed = seeds[i]
      const rise = i * lift
      dummy.position.set(
        seed.sway * 0.35 + Math.sin(idle * 0.4 + i) * 0.02,
        rise - stackHeight / 2,
        Math.cos(idle * 0.3 + i * 0.5) * 0.02,
      )
      dummy.rotation.set(
        seed.roll * 0.06 + Math.sin(idle * 0.5 + i) * 0.01,
        seed.yaw * 0.5 + idle * 0.04,
        0,
      )
      // El billete que aún no se ganó no se esconde con scale 0 (rompe las
      // normales): se aplana contra la pila, que lee como apilarse.
      dummy.scale.set(1, shown ? thickness : 0.02, shown ? 1 : 0.2)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <LightingRig caps={caps} />
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, total]}
        frustumCulled={false}
      >
        <boxGeometry args={[BILL.width, BILL.height, BILL.depth]} />
        <meshStandardMaterial
          color={theme.color.muted}
          roughness={0.78}
          metalness={0.04}
          emissive={theme.color.orangeDeep}
          emissiveIntensity={0.16}
        />
      </instancedMesh>

      {/* Anillo de contenido: el borde de la bóveda, para que la pila no flote
          en el vacío y la escena lea un lugar, no un montón de cajas. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -stackHeight / 2 - 0.02, 0]}>
        <ringGeometry args={[0.42, 0.9, 64]} />
        <meshBasicMaterial color={theme.color.black3} transparent opacity={0.85} side={2} />
      </mesh>

      {postProcessing && <PostProcessing params={params} caps={caps} />}
    </>
  )
}

export default VaultScene
