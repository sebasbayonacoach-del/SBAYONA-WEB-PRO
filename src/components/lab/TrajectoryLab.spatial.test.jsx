/**
 * CONTRATO DE COMPONENTE — modo espacial del laboratorio (Lote 2).
 * -----------------------------------------------------------------------------
 * Aquí lo que se prueba NO es que Three.js dibuje (eso exige WebGL de verdad y
 * está declarado como pendiente): se prueba la FRONTERA, que es la decisión de
 * este lote.
 *
 *   · Que el motor no se toca sin intención: `import()` solo tras el clic.
 *   · Que sin contexto WebGL no se descarga nada y se explica por qué.
 *   · Que el DOM del recorrido sigue completo con la maqueta montada (la escena
 *     acompaña al contenido, no lo sustituye).
 *   · Que cancelar invalida una resolución tardía, que un lienzo sin contexto se
 *     convierte en error visible y que volver a la vista sencilla desmonta.
 *
 * Por qué el grafo de módulos se rehace en cada test (`vi.doMock` +
 * `resetModules`): si el puente se mockea una sola vez para todo el fichero, la
 * segunda `import()` sale de la caché y «no se descargó nada» deja de ser una
 * medición para ser una ilusión. Con grafo fresco, `loads` cuenta descargas
 * reales del componente, no artefactos del runner.
 */

import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { STATIONS } from './trajectoryStations.js'

/** Control por test: retardo del módulo y fallo simulado del lienzo. */
const stageControl = { importDelay: 0, failOnMount: false }
const stageLog = { loads: 0, live: 0, props: [] }

function installStageMock() {
  vi.doMock('./TrajectoryStage.jsx', async () => {
    stageLog.loads += 1
    await new Promise((resolve) => setTimeout(resolve, stageControl.importDelay))
    const React = await import('react')
    function FakeStage(props) {
      stageLog.props.push(props)
      // Se desestructura (y se declara como dependencia) en vez de leer `props`
      // dentro del efecto: el aviso tiene que salir del mismo canal que usa el
      // puente real — un efecto, no el render — y sin engañar a las reglas de
      // hooks con un `[]` que oculte la dependencia.
      const { onFailed } = props
      React.useEffect(() => {
        stageLog.live += 1
        // Mismo canal que usa el puente real: el lienzo avisa desde un efecto, no
        // durante el render (si se avisara aquí, React lo prohibiría: el mock
        // tendría que parecerse al real también en CUÁNDO notifica).
        if (stageControl.failOnMount) {
          onFailed('El motor se descargó, pero no pudo montar un lienzo WebGL.')
        }
        return () => {
          stageLog.live -= 1
        }
      }, [onFailed])
      return React.createElement('div', {
        'data-lab-stage': 'trajectory',
        'data-station': props.stationKey ?? '',
        'aria-hidden': 'true',
      })
    }
    return { default: FakeStage }
  })
}

/**
 * Grafo limpio + componente importado DESPUÉS del mock → mediciones por test.
 * El `CapabilityContext` se re-importa en el mismo grafo: si se usara el que se
 * importó en la cabecera del fichero, sería OTRO objeto de contexto (otro módulo
 * tras el reset) y el provider no llegaría a `useCapabilities` — el test pasaría
 * sin probar nada.
 */
async function mountLab(caps, { strict = false } = {}) {
  vi.resetModules()
  installStageMock()
  const [React, { default: TrajectoryLab }, { CapabilityContext }] = await Promise.all([
    import('react'),
    import('./TrajectoryLab.jsx'),
    import('../../engine/providers/CapabilityProvider.jsx'),
  ])
  // `strict` monta el mismo árbol dentro de StrictMode: en desarrollo React
  // invoca cada efecto dos veces (montaje → limpieza → montaje). Es la prueba de
  // que la carga espacial no depende de que un efecto corra una sola vez — y de
  // que el token de cancelación no es un booleano compartido que el segundo
  // montaje invalide, que es exactamente cómo nace un botón que no responde.
  const tree = (
    <MemoryRouter>
      <TrajectoryLab />
    </MemoryRouter>
  )
  const wrapped = strict ? <React.StrictMode>{tree}</React.StrictMode> : tree
  return render(caps ? <CapabilityContext.Provider value={caps}>{wrapped}</CapabilityContext.Provider> : wrapped)
}

function fakeGLContext(renderer) {
  return {
    getExtension(name) {
      if (name === 'WEBGL_debug_renderer_info') return { UNMASKED_RENDERER_WEBGL: 37446 }
      if (name === 'WEBGL_lose_context') return { loseContext() {} }
      return null
    },
    getParameter: () => renderer,
  }
}

function stubWebGL({ available = true, renderer = 'MockGL Hardware' } = {}) {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((type) => {
    if (!available || (type !== 'webgl2' && type !== 'webgl')) return null
    return fakeGLContext(renderer)
  })
}

const activate = () => screen.getByRole('button', { name: /^Activar vista espacial$/i })
const retry = () => screen.getByRole('button', { name: /Reintentar vista espacial/i })
const mountedStage = () => document.querySelector('[data-lab-stage="trajectory"]')
const figure = () => document.querySelector('.lab-composition')
const tabs = () => within(screen.getByRole('navigation', { name: 'Estaciones del recorrido' }))

beforeEach(() => {
  stageControl.importDelay = 0
  stageControl.failOnMount = false
  stageLog.loads = 0
  stageLog.live = 0
  stageLog.props = []
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.doUnmock('./TrajectoryStage.jsx')
})

describe('TrajectoryLab · frontera de carga del modo espacial', () => {
  it('sin intención explícita no hay puente, no hay lienzo y sí hay figura 2D', async () => {
    stubWebGL()
    await mountLab()

    expect(figure()).not.toBeNull()
    expect(mountedStage()).toBeNull()
    expect(stageLog.loads).toBe(0)
    expect(stageLog.live).toBe(0)
    expect(screen.getByText(/Vista sencilla: composición 2D y texto/i)).toBeInTheDocument()
  })

  it('StrictMode deja UN solo lienzo vivo, y el botón sigue respondiendo', async () => {
    stubWebGL()
    await mountLab(null, { strict: true })

    fireEvent.click(activate())
    await waitFor(() => expect(mountedStage()).not.toBeNull())

    expect(document.querySelectorAll('[data-lab-stage="trajectory"]')).toHaveLength(1)
    // El contador vivo es la aserción dura: si el primer montaje no se limpió,
    // quedan DOS bucles de render sobre el mismo canvas (y dos contextos WebGL).
    expect(stageLog.live, 'StrictMode: el doble efecto debe acabar en un solo lienzo vivo').toBe(1)
    expect(stageLog.loads).toBeLessThanOrEqual(1) // y una sola resolución del módulo
    expect(screen.getByText(/Vista espacial activa/i)).toBeInTheDocument()
    expect(screen.queryByText(/Reintentar vista espacial/i)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Volver a la vista sencilla/i }))
    await waitFor(() => expect(stageLog.live).toBe(0))
    expect(mountedStage()).toBeNull()
    expect(figure()).not.toBeNull()
  })

  it('StrictMode + carga lenta + cancelar: la resolución tardía no monta nada', async () => {
    stubWebGL()
    stageControl.importDelay = 60
    await mountLab(null, { strict: true })

    fireEvent.click(activate())
    expect(screen.getByRole('button', { name: /Cancelar carga/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Cancelar carga/i }))

    await new Promise((resolve) => setTimeout(resolve, 200)) // deja resolver el import colgado

    expect(mountedStage()).toBeNull()
    expect(stageLog.live).toBe(0)
    // Y el control no queda muerto: vuelve a ofrecer la activación.
    expect(screen.getByRole('button', { name: /^Activar vista espacial$/i })).toBeEnabled()
    expect(figure()).not.toBeNull()
  })

  it('la carga no usa relojes como diagnóstico (nada que filtrar al desmontar)', () => {
    // §14 prohíbe un timeout corto como sentencia de fallo. La forma más barata de
    // que eso no se cuele por comodidad es que aquí no haya temporizadores: la
    // carga se resuelve por eventos (promesa resuelta, contexto creado, unmount).
    for (const file of ['trajectoryStageMachine.js', 'TrajectoryLab.jsx', 'TrajectoryStage.jsx', 'webglSupport.js']) {
      const src = readFileSync(`src/components/lab/${file}`, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
      expect(src, `${file} introduce setTimeout/setInterval: el fallo debe llegar del contexto WebGL, no del reloj`).not.toMatch(
        /setTimeout\(|setInterval\(|requestAnimationFrame\(/,
      )
    }
  })

  it('el puente solo se alcanza por import dinámico (ni un import estático del motor)', () => {
    const source = readFileSync('src/components/lab/TrajectoryLab.jsx', 'utf8')
    expect(source).toMatch(/import\(['"]\.\/TrajectoryStage\.jsx['"]\)/)
    expect(source).not.toMatch(/^import\s[^;]*from\s+['"]\.\/TrajectoryStage\.jsx['"]/m)
    expect(source).not.toMatch(/from\s+['"](three|@react-three\/)/)
    // El puente, por su parte, SÍ puede tocar el motor: vive al otro lado del import().
    const bridge = readFileSync('src/components/lab/TrajectoryStage.jsx', 'utf8')
    expect(bridge).toMatch(/from\s+'\.\.\/\.\.\/engine\/scene\/SceneMount\.jsx'/)
    expect(bridge).not.toMatch(/from\s+['"](three|@react-three\/)/)
    // Y ni el puente ni la escena salen exportados por el barrel del shell.
    expect(readFileSync('src/engine/index.js', 'utf8')).not.toMatch(/Trajectory/)
  })

  it('sin WebGL disponible: cero descargas, explicación concreta y DOM intacto', async () => {
    stubWebGL({ available: false })
    await mountLab()

    fireEvent.click(activate())

    expect(await screen.findByText(/no ha creado un contexto WebGL/i)).toBeInTheDocument()
    expect(stageLog.loads).toBe(0) // <- la aserción dura: no se pidió ni un byte del motor
    expect(mountedStage()).toBeNull()
    expect(figure()).not.toBeNull()
    expect(screen.getByRole('heading', { level: 3, name: STATIONS[0].title })).toBeInTheDocument()
    expect(retry()).toBeInTheDocument()
    expect(screen.getByText(/Vista espacial no disponible/i)).toBeInTheDocument()
  })

  it('la activación carga el puente y monta la greybox sin robarle el contenido al DOM', async () => {
    stubWebGL()
    await mountLab()

    fireEvent.click(activate())
    await waitFor(() => expect(mountedStage()).not.toBeNull())

    expect(stageLog.loads).toBe(1)
    expect(stageLog.live).toBe(1)
    expect(figure()).toBeNull() // la figura 2D da paso al lienzo: no se apilan
    expect(screen.getByText(/Vista espacial activa/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: STATIONS[0].title })).toBeInTheDocument()
    expect(screen.getAllByText(STATIONS[0].body).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: /Volver a la vista sencilla/i })).toBeInTheDocument()
    // El panel dice QUÉ es: una greybox sin materiales ni sombras, no un acabado.
    expect(screen.getByText(/sin sombras y sin modelo descargado/i)).toBeInTheDocument()
    // Diagnóstico del entorno, legible también desde el spec de navegador.
    expect(screen.getByText(/Motor: WebGL 2/)).toBeInTheDocument()
    expect(mountedStage()).toHaveAttribute('data-station', STATIONS[0].key)
  })

  it('cambiar de estación reenvía la estación al lienzo sin volver a cargar ni remontar', async () => {
    stubWebGL()
    await mountLab()
    fireEvent.click(activate())
    await waitFor(() => expect(mountedStage()).not.toBeNull())

    fireEvent.click(tabs().getAllByRole('button')[2])

    await waitFor(() => expect(mountedStage()).toHaveAttribute('data-station', STATIONS[2].key))
    expect(stageLog.loads).toBe(1) // un módulo, no uno por estación
    expect(stageLog.live).toBe(1) // y el lienzo no se desmonta/remonta al cambiar de encuadre
    expect(screen.getByRole('heading', { level: 3, name: STATIONS[2].title })).toBeInTheDocument()
  })

  it('volver a la vista sencilla desmonta el lienzo y devuelve la figura', async () => {
    stubWebGL()
    await mountLab()
    fireEvent.click(activate())
    await waitFor(() => expect(mountedStage()).not.toBeNull())

    fireEvent.click(screen.getByRole('button', { name: /Volver a la vista sencilla/i }))

    expect(mountedStage()).toBeNull()
    expect(stageLog.live).toBe(0) // el render loop se va con el Canvas
    expect(figure()).not.toBeNull()
    expect(screen.getByText(/Vista sencilla: composición 2D y texto/i)).toBeInTheDocument()
  })

  it('un lienzo que no consigue contexto WebGL pasa a error y se retira del árbol', async () => {
    stubWebGL()
    stageControl.failOnMount = true
    await mountLab()

    fireEvent.click(activate())

    expect(await screen.findByText(/no pudo montar un lienzo WebGL/i)).toBeInTheDocument()
    // El error boundary puede pintar el fallback un frame antes de que React
    // ejecute el cleanup del Stage. Esperamos el teardown observable completo.
    await waitFor(() => {
      expect(mountedStage()).toBeNull()
      expect(stageLog.live).toBe(0)
      expect(figure()).not.toBeNull()
    })
    expect(retry()).toBeInTheDocument()
  })

  it('cancelar durante la carga impide que una resolución tardía monte la escena', async () => {
    stubWebGL()
    stageControl.importDelay = 40
    await mountLab()

    fireEvent.click(activate())
    expect(screen.getByText(/Cargando la vista espacial/i)).toBeInTheDocument()
    const cancel = screen.getByRole('button', { name: /Cancelar carga/i })

    fireEvent.click(cancel)
    await new Promise((resolve) => setTimeout(resolve, 120))

    expect(mountedStage()).toBeNull() // llegó tarde y no se montó
    expect(stageLog.live).toBe(0)
    expect(screen.getByText(/Vista sencilla: composición 2D y texto/i)).toBeInTheDocument()
  })

  it('el reintento vuelve a sondear WebGL en vez de fiarse del fallo anterior', async () => {
    stubWebGL({ available: false })
    await mountLab()
    fireEvent.click(activate())
    await screen.findByText(/no ha creado un contexto WebGL/i)
    expect(stageLog.loads).toBe(0)

    // Ahora el entorno SÍ puede: el reintento tiene que volver a intentarlo.
    stubWebGL({ available: true })
    fireEvent.click(retry())

    await waitFor(() => expect(mountedStage()).not.toBeNull())
    expect(stageLog.loads).toBe(1)
    expect(stageLog.live).toBe(1)
  })

  it('el reintento tras un fallo de montaje también llega a la vista espacial', async () => {
    stubWebGL()
    stageControl.failOnMount = true
    await mountLab()
    fireEvent.click(activate())
    await screen.findByText(/no pudo montar un lienzo WebGL/i)

    stageControl.failOnMount = false
    fireEvent.click(retry())

    await waitFor(() => expect(mountedStage()).not.toBeNull())
    expect(stageLog.live).toBe(1)
  })

  it('con movimiento reducido el estado lo dice y no hay travelling que simular', async () => {
    stubWebGL()
    await mountLab({ mode: 'desktop', reducedMotion: true, canHover: true, finePointer: true, dprLimit: 2 })
    fireEvent.click(activate())

    await waitFor(() => expect(mountedStage()).not.toBeNull())
    expect(screen.getByText(/cambios de encuadre por corte/i)).toBeInTheDocument()
  })

  it('el laboratorio sigue siendo propiedad del playground, no de una ruta pública', () => {
    const pages = readFileSync('src/pages/DesignSystem.jsx', 'utf8')
    expect(pages).toMatch(/from '\.\.\/components\/lab\/TrajectoryLab\.jsx'/)
    expect(pages).toMatch(/<TrajectoryLab \/>/)
    expect(pages).not.toMatch(/from '\.\.\/engine\/scene\//)
  })
})
