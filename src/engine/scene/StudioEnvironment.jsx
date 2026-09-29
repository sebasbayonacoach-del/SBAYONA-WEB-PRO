// StudioEnvironment — entorno IBL generado por código, sin descargar nada.
//
// Por qué existe: un material con `metalness` alto y `roughness` bajo refleja el
// entorno. Si no hay entorno, no refleja nada y el resultado es negro, por muchas
// luces que se pongan. Es exactamente lo que le pasaba a la barra olímpica.
//
// `RoomEnvironment` viene del paquete `three`, no es un fichero de asset: se
// construye en memoria. Así el contrato `assets: []` del registro de escenas se
// mantiene intacto — cero descargas, cero presupuesto de carga afectado.

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export function StudioEnvironment({ blur = 0.04, intensity = 0.7 }) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl)
    const target = pmrem.fromScene(new RoomEnvironment(), blur)
    scene.environment = target.texture
    scene.environmentIntensity = intensity

    return () => {
      // La textura del PMREM es un render target propio: si no se libera, cada
      // montaje de escena deja un entorno en GPU para toda la vida de la página.
      scene.environment = null
      target.dispose()
      pmrem.dispose()
    }
  }, [gl, scene, blur, intensity])

  return null
}

export default StudioEnvironment
