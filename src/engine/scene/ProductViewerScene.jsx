// ProductViewerScene — el objeto de sala que se puede inspeccionar.
//
// Es la diferencia entre decorado y herramienta: aqui el usuario rodea el objeto,
// acerca y ve las cotas medidas sobre la geometria, como en el rack de
// demostracion. Va en /shop y en /programs, donde la pagina dice "objetos para
// entrenar" y "personaliza tu plan" y hasta ahora no habia donde mirar.
//
// La variante de objeto se pasa por `params.object`, asi que una sola entrada del
// registro sirve para barra, mancuernas, pila, kettlebell, caja, banco y saco.

import { Suspense, lazy } from 'react'
import { LightingRig } from './LightingRig.jsx'
import { ObjectInspector } from './ObjectInspector.jsx'

const OBJECTS = {
  barbell: lazy(() => import('./BarbellScene.jsx')),
  dumbbells: lazy(() => import('./DumbbellRackScene.jsx')),
  kettlebell: lazy(() => import('./KettlebellScene.jsx')),
  weightstack: lazy(() => import('./WeightStackScene.jsx')),
  plyobox: lazy(() => import('./PlyoBoxScene.jsx')),
  bench: lazy(() => import('./BenchScene.jsx')),
  punchbag: lazy(() => import('./PunchBagScene.jsx')),
  platetree: lazy(() => import('./PlateTreeScene.jsx')),
  scale: lazy(() => import('./ScaleScene.jsx')),
  timer: lazy(() => import('./IntervalTimerScene.jsx')),
  recovery: lazy(() => import('./RecoveryKitScene.jsx')),
  pullupbar: lazy(() => import('./PullUpBarScene.jsx')),
}

export function ProductViewerScene({ params, scrollProgress = 0, caps }) {
  const key = OBJECTS[params?.object] ? params.object : 'barbell'
  const Object3D = OBJECTS[key]
  const showStructure = Boolean(params?.structure)

  return (
    <>
      <LightingRig caps={caps} />
      <Suspense fallback={null}>
        <ObjectInspector enabled structure={showStructure} target={[0, 0.45, 0]}>
          <Object3D params={params} scrollProgress={1} caps={caps} postProcessing={false} />
        </ObjectInspector>
      </Suspense>
    </>
  )
}

export default ProductViewerScene
