// HomeSceneCycler — la capa 3D de `/`.
//
// Configuracion pura: que variante representa la idea de cada tramo y en que
// orden de reserva. Toda la mecanica (descubrir secciones, encuadrar contra el
// titular, un solo lienzo) vive en RouteSceneCycler, que es la misma que ya
// funciona en `/resources`.

import { RouteSceneCycler } from '../RouteSceneCycler.jsx'

const RULES = [
  [/pasa|enseño/i, 'bridge'],
  [/notar|vas a/i, 'habitat'],
  [/por que|bloquea|despiertas/i, 'levels'],
  [/magia|metodo|capa/i, 'method'],
  [/humo|prueba|resultado/i, 'dumbbells'],
  [/plan|precio|membres/i, 'vault'],
  [/calcul|configura/i, 'barbell'],
  [/gratis|empieza/i, 'timeline'],
  [/instalaciones|sala|coach/i, 'punchbag'],
]

const CYCLE = ['bridge', 'method', 'levels', 'vault', 'timeline', 'dumbbells', 'punchbag', 'habitat']

export function HomeSceneCycler() {
  return <RouteSceneCycler rules={RULES} cycle={CYCLE} idPrefix="home-sec" />
}

export default HomeSceneCycler
