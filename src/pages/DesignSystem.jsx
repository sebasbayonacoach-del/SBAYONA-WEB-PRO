// DesignSystem - playground interno del Design System 2.0 (Fase 3).
//
// Ruta /design-system: página de validación del sistema visual. INTERNA y
// noindex (ver routeMeta.js y robots.txt): no forma parte del itinerario
// público ni del sitemap. Su papel es demostrar que tokens, componentes,
// movimiento y presets 3D funcionan juntos antes de que las páginas migren.
//
// Todo lo que se muestra sale de las fuentes de verdad reales: theme.js,
// motionTokens.js, scenePresets.js, breakpoints.js y los componentes ds/.
// No hay copy comercial ni contenido inventado.

import {
  BREAKPOINTS,
  cameraPresets,
  depthLayers,
  HorizontalPassage,
  Marquee,
  materialPresets,
  MOTION_INTENSITIES,
  motionTokens,
  RECIPE_LIST,
  Reveal,
  sceneMotion,
  SECTION_RANGES,
  StickyStage,
  TextMask,
  TextReveal,
  theme,
} from '../engine'
import { useScrollHandoff } from '../engine/scroll/scrollHandoff.js'
import {
  Button,
  CardBase,
  Container,
  CTABlock,
  Link,
  MediaBlock,
  Metric,
  SectionLabel,
  Surface,
} from '../components/ds'
import { DEFAULT_OG_IMAGE } from '../config/site.config.js'
import TrajectoryLab from '../components/lab/TrajectoryLab.jsx'
import '../styles/ds-playground.css'

const COLOR_TOKENS = [
  ['Acento', theme.color.orange],
  ['Acento fuego', theme.color.orangeFire],
  ['Acento profundo', theme.color.orangeDeep],
  ['Tinta', theme.color.white],
  ['Apagado', theme.color.muted],
  ['Fondo', theme.color.black],
  ['Fondo 2', theme.color.black2],
  ['Fondo 3', theme.color.black3],
  ['Mediterráneo', theme.color.mediterranean],
  ['Azul profundo', theme.color.deepBlue],
]

const SURFACE_LEVELS = [
  ['background', 'Fondo de página'],
  ['deep', 'Plano hundido'],
  ['raised', 'Plano elevado'],
  ['content', 'Bloque de contenido'],
  ['overlay', 'Capa superior'],
]

const Z_LADDER = [
  ['--ds-z-base', '0', 'Luz ambiente, fondos'],
  ['--ds-z-content', '1', 'Contenido general'],
  ['--ds-z-raised', '10', 'Apilado dentro de sección'],
  ['--ds-z-sticky', '100', 'Navbar y barras fijas'],
  ['--ds-z-overlay', '9997', 'Capas fijas (consent, ribbon)'],
  ['--ds-z-grain', '10000', 'Grano fílmico'],
  ['--ds-z-cursor', '10001', 'Cursor personalizado'],
  ['--ds-z-modal', '11000', 'Drawers y diálogos'],
  ['--ds-z-curtain', '12000', 'Cortina de transición'],
]

const MOTION_TIERS = [
  ['micro', motionTokens.duration[motionTokens.tier.micro], 'Hover, tap, foco'],
  ['standard', motionTokens.duration[motionTokens.tier.standard], 'Reveals y transiciones de componente'],
  ['emphasis', motionTokens.duration[motionTokens.tier.emphasis], 'Movimientos amplios, entradas de sección'],
  // `tier.curtain` no existe: las claves de `tier` son las INTENCIONES
  // (micro/standard/emphasis/cinematic) y `cinematic` ya apunta a 'curtain'. Con la
  // clave mal escrita la fila salía «cinematic · undefined s» en la página (lo vio
  // el propietario en su captura). Se lee la intención, como en las tres filas de arriba.
  ['cinematic', motionTokens.duration[motionTokens.tier.cinematic], 'Cortina de transición de página'],
]

const SPACE_SCALE = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192]

/** Lineas editoriales de la marquesina de demostracion. */
const MARQUEE_LINES = ['BAYONA', 'MÉTODO', 'MOVIMIENTO', 'DISCIPLINA', 'CALMA', 'PROGRESO']

/** Descripcion breve de cada rango declarativo de progreso. */
const RANGE_USE = {
  traverse: 'Recorrido completo de la seccion por el viewport',
  enter: 'Entrada: desde que asoma hasta ocupar el viewport',
  pin: 'Seccion fijada: base del sticky storytelling',
  exit: 'Salida de la seccion hacia la parte superior',
}

/** Estados del escenario sticky de demostracion. */
const STAGE_STATES = [
  { label: 'A', copy: 'El scroll entra en la seccion.' },
  { label: 'B', copy: 'La informacion se transforma en su lugar.' },
  { label: 'C', copy: 'La historia continua sin cortes.' },
]

/** Vagones del pasaje horizontal de demostracion. */
const PASSAGE_WAGONS = [
  { tag: '01', copy: 'Relacion espacial' },
  { tag: '02', copy: 'Cambio de escala' },
  { tag: '03', copy: 'Desplazamiento' },
  { tag: '04', copy: 'Continuidad' },
]

/** Lectura del handoff scroll -> 3D (Fase 7 lo consumira desde las escenas). */
function HandoffDemo() {
  const handoff = useScrollHandoff()
  const snapshot = handoff.snapshot()

  return (
    <table className="dsp-table">
      <thead>
        <tr>
          <th>Campo</th>
          <th>Valor ahora</th>
          <th>Uso en Fase 7</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>progress</td>
          <td>{snapshot.progress.toFixed(2)}</td>
          <td>Progreso de escena / camara</td>
        </tr>
        <tr>
          <td>velocity</td>
          <td>{snapshot.velocity.toFixed(1)}</td>
          <td>Inercia sutil de objetos</td>
        </tr>
        <tr>
          <td>direction</td>
          <td>{snapshot.direction}</td>
          <td>Sentido de la transicion</td>
        </tr>
        <tr>
          <td>viewport</td>
          <td>{`${snapshot.viewport.width}×${snapshot.viewport.height}`}</td>
          <td>Encuadre y calidad</td>
        </tr>
        <tr>
          <td>reducedMotion</td>
          <td>{snapshot.reducedMotion ? 'sí' : 'no'}</td>
          <td>Modo estatico de la escena</td>
        </tr>
        <tr>
          <td>mode / dprLimit</td>
          <td>{`${snapshot.mode} / ${snapshot.dprLimit}`}</td>
          <td>Nivel de detalle (R22.3)</td>
        </tr>
      </tbody>
    </table>
  )
}

export default function DesignSystem() {
  return (
    <div className="dsp-page">
      <Container className="dsp-intro">
        <SectionLabel>Sistema interno · v2.0</SectionLabel>
        <h1 className="ds-title-1">BAYONA Design System</h1>
        <p className="ds-lead">
          Página interna de validación del sistema visual: tokens, componentes,
          movimiento y presets 3D antes de la migración de las rutas públicas.
        </p>
        <span className="dsp-notice">Ruta interna · no indexable · fuera del sitemap</span>
      </Container>

      <Container>
        {/* ---------------------------------------------------------- COLOR */}
        <div className="dsp-block">
          <SectionLabel>01 · Color</SectionLabel>
          <div className="dsp-swatches">
            {COLOR_TOKENS.map(([name, hex]) => (
              <div className="dsp-swatch" key={name}>
                <div className="dsp-swatch__chip" style={{ background: hex }} />
                <b>{name}</b>
                <span>{hex}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------------- SUPERFICIES */}
        <div className="dsp-block">
          <SectionLabel>02 · Superficies</SectionLabel>
          <div className="dsp-swatches">
            {SURFACE_LEVELS.map(([level, label]) => (
              <Surface level={level} key={level} className="dsp-swatch">
                <div className="dsp-swatch__chip" style={{ background: `var(--ds-surface-${level})` }} />
                <b>{label}</b>
                <span>{`--ds-surface-${level}`}</span>
              </Surface>
            ))}
            <Surface level="glass" className="dsp-swatch">
              <div className="dsp-swatch__chip" style={{ background: 'var(--ds-surface-glass)' }} />
              <b>Cristal</b>
              <span>--ds-surface-glass</span>
            </Surface>
          </div>
        </div>

        {/* ----------------------------------------------------- TIPOGRAFÍA */}
        <div className="dsp-block">
          <SectionLabel>03 · Tipografía</SectionLabel>
          <p className="ds-display">Display</p>
          <h2 className="ds-title-1">Titular de página</h2>
          <h3 className="ds-title-2">Titular de sección</h3>
          <h4 className="ds-title-3">Subsección o tarjeta</h4>
          <h5 className="ds-title-4">Titulillo</h5>
          <p className="ds-lead">
            Párrafo de entrada: el primero de cada sección, un paso por encima
            del cuerpo para marcar jerarquía.
          </p>
          <p className="ds-body">
            Cuerpo de texto. Inter 400 con longitud máxima de línea de 66
            caracteres para que el ojo no pierda el renglón al volver.
          </p>
          <p className="ds-body-small">Apoyo, notas al pie y microcopia.</p>
          <p className="ds-numeric">149.000 COP</p>
        </div>

        {/* ------------------------------------------------------ ESPACIADO */}
        <div className="dsp-block">
          <SectionLabel>04 · Espaciado</SectionLabel>
          {SPACE_SCALE.map((value, index) => (
            <div className="dsp-space-row" key={value}>
              <span>{`space-${index + 1} · ${value}px`}</span>
              <div className="dsp-space-bar" style={{ width: `${value}px` }} />
            </div>
          ))}
        </div>

        {/* ---------------------------------------------------- COMPONENTES */}
        <div className="dsp-block">
          <SectionLabel>05 · Componentes base</SectionLabel>

          <div className="dsp-row">
            <Button>Acción principal</Button>
            <Button variant="secondary">Acción secundaria</Button>
            <Button variant="ghost">Acción mínima</Button>
            <Button disabled>Bloqueada</Button>
            <Button loading>Enviando</Button>
            <Button href="#componentes">Como enlace</Button>
          </div>

          <div className="dsp-row">
            <Link href="#componentes">Enlace de texto</Link>
            <Metric value="4" label="Niveles de acompañamiento" />
            <Metric value="17" label="Rutas públicas" />
          </div>

          <div className="dsp-row" id="componentes">
            <CardBase>
              <h3 className="ds-title-3">Tarjeta base</h3>
              <p className="ds-body">
                Superficie de contenido que flota: cristal, borde fino y
                elevación cálida al pasar por encima.
              </p>
            </CardBase>
            <MediaBlock
              src={DEFAULT_OG_IMAGE.path}
              alt={DEFAULT_OG_IMAGE.alt}
              ratio="16-9"
            />
          </div>

          <CTABlock note="Microcopia opcional del grupo de acciones.">
            <Button>Empezar</Button>
            <Button variant="secondary">Saber más</Button>
          </CTABlock>
        </div>

        {/* ------------------------------------------------------ MOVIMIENTO */}
        <div className="dsp-block">
          <SectionLabel>06 · Movimiento</SectionLabel>
          <table className="dsp-table">
            <thead>
              <tr>
                <th>Nivel</th>
                <th>Duración</th>
                <th>Uso</th>
              </tr>
            </thead>
            <tbody>
              {MOTION_TIERS.map(([tier, duration, usage]) => (
                <tr key={tier}>
                  <td>{tier}</td>
                  <td>{`${duration}s`}</td>
                  <td>{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="dsp-motion-stage">
            <Reveal>
              <p className="ds-body">Reveal: aparece al entrar en el viewport.</p>
            </Reveal>
            <TextReveal text="TextReveal: el titular entra por líneas." as="p" />
          </div>
        </div>

        {/* ------------------------------------------------------------- 3D */}
        <div className="dsp-block">
          <SectionLabel>07 · Presets 3D</SectionLabel>
          <table className="dsp-table">
            <thead>
              <tr>
                <th>Cámara</th>
                <th>Posición</th>
                <th>FOV</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(cameraPresets).map(([name, preset]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{preset.position.join(', ')}</td>
                  <td>{preset.fov}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="dsp-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Color</th>
                <th>Rugosidad</th>
                <th>Metal</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(materialPresets).map(([name, preset]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{preset.color}</td>
                  <td>{preset.roughness}</td>
                  <td>{preset.metalness}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="ds-body-small">
            {`Capas de profundidad (Z): fondo ${depthLayers.background} · medio ${depthLayers.midground} · frente ${depthLayers.foreground}. `}
            {`Deriva: ${sceneMotion.driftSpeed.idle}–${sceneMotion.driftSpeed.active} rad/s. `}
            {`La iluminación por capacidades vive en LightingRig.lightingPlan().`}
          </p>
        </div>

        {/* -------------------------------------------------------- Z-INDEX */}
        <div className="dsp-block">
          <SectionLabel>08 · Escala z-index</SectionLabel>
          <table className="dsp-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Valor</th>
                <th>Uso</th>
              </tr>
            </thead>
            <tbody>
              {Z_LADDER.map(([token, value, usage]) => (
                <tr key={token}>
                  <td>{token}</td>
                  <td>{value}</td>
                  <td>{usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------------------------------------------------- BREAKPOINTS */}
        <div className="dsp-block">
          <SectionLabel>09 · Breakpoints</SectionLabel>
          <table className="dsp-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ancho</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(BREAKPOINTS).map(([name, width]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{`${width}px`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --------------------------------------------- SCROLL STORYTELLING */}
        <div className="dsp-block">
          <SectionLabel>10 · Scroll storytelling</SectionLabel>
          <p className="ds-body-small">
            Rangos declarativos de progreso por sección (vocabulario useScroll
            de Framer Motion) e intensidades disponibles del Motion Engine.
          </p>
          <table className="dsp-table">
            <thead>
              <tr>
                <th>Rango</th>
                <th>offset</th>
                <th>Uso</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(SECTION_RANGES).map(([name, offset]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{offset.join(' → ')}</td>
                  <td>{RANGE_USE[name]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table className="dsp-table">
            <thead>
              <tr>
                <th>Intensidad</th>
                <th>Amplitud</th>
                <th>Velocidad</th>
                <th>Simultaneidad</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(MOTION_INTENSITIES).map(([name, preset]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{preset.amplitude}</td>
                  <td>{preset.speed}</td>
                  <td>{preset.simultaneity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* -------------------------------------------------------- MARQUEE */}
        <div className="dsp-block">
          <SectionLabel>11 · Marquee</SectionLabel>
          <p className="ds-body-small">
            Marquesina declarativa: velocidad, dirección, pausa en hover y
            fallback estático con reduced motion.
          </p>
          <Marquee ariaLabel="Líneas editoriales" duration={30} pauseOnHover>
            {MARQUEE_LINES.map((line) => (
              <span className="dsp-marquee-item" key={line}>{line}</span>
            ))}
          </Marquee>
        </div>

        {/* ------------------------------------------------------- TEXTMASK */}
        <div className="dsp-block">
          <SectionLabel>12 · TextMask</SectionLabel>
          <p className="ds-body-small">
            Revelado de líneas con máscara: tipografía compacta que entra sin
            rebotes ni overshoot.
          </p>
          <TextMask
            className="dsp-mask-demo"
            lines={[
              'El movimiento es información.',
              'El scroll es una interfaz narrativa.',
              'La calma también se diseña.',
            ]}
          />
        </div>

        {/* ---------------------------------------------------- STICKYSTAGE */}
        <div className="dsp-block">
          <SectionLabel>13 · StickyStage</SectionLabel>
          <p className="ds-body-small">
            Escenario fijo con estados A/B/C por progreso. En móvil o con
            reduced motion se apila como secuencia estática.
          </p>
        </div>
        <StickyStage length="150vh" states={STAGE_STATES.length} className="dsp-stage">
          {({ index }) => (
            <div className="dsp-stage-state">
              <span className="dsp-stage-index">{`Estado ${STAGE_STATES[index].label}`}</span>
              <p className="dsp-stage-copy">{STAGE_STATES[index].copy}</p>
            </div>
          )}
        </StickyStage>

        {/* ----------------------------------------------- HORIZONTALPASSAGE */}
        <div className="dsp-block">
          <SectionLabel>14 · HorizontalPassage</SectionLabel>
          <p className="ds-body-small">
            Bloque horizontal controlado por scroll: solo narrativo. En móvil o
            con reduced motion se convierte en pila vertical.
          </p>
        </div>
        <HorizontalPassage length="200vh" className="dsp-passage">
          {PASSAGE_WAGONS.map((wagon) => (
            <div className="dsp-wagon" key={wagon.tag}>
              <span className="dsp-wagon-tag">{wagon.tag}</span>
              <p className="dsp-wagon-copy">{wagon.copy}</p>
            </div>
          ))}
        </HorizontalPassage>

        {/* ------------------------------------------------------ HANDOFF 3D */}
        <div className="dsp-block">
          <SectionLabel>15 · Handoff 3D</SectionLabel>
          <p className="ds-body-small">
            API de entrega del scroll al motor 3D (Fase 7): progreso,
            velocidad, dirección, viewport y capacidades.
          </p>
          <HandoffDemo />
        </div>

        {/* -------------------------------------------------------- RECETAS */}
        <div className="dsp-block">
          <SectionLabel>16 · Recetas de movimiento</SectionLabel>
          <table className="dsp-table">
            <thead>
              <tr>
                <th>Receta</th>
                <th>Intensidad</th>
                <th>Nivel</th>
                <th>Componentes</th>
                <th>Propósito</th>
              </tr>
            </thead>
            <tbody>
              {RECIPE_LIST.map((recipe) => (
                <tr key={recipe.id}>
                  <td>{recipe.name}</td>
                  <td>{recipe.intensity}</td>
                  <td>{recipe.tier}</td>
                  <td>{recipe.components.join(', ')}</td>
                  <td>{recipe.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------ LABORATORIO ESPACIAL */}
        {/*
          Lote 1 (FASE A): recorrido de tres estaciones en DOM puro.
          Lote 2: encima de ese DOM hay una maqueta greybox en 3D que SOLO se
          carga si se activa (0 WebGL y 0 carga del motor mientras no se pida;
          0 dependencias nuevas en los dos lotes).

          Vive aquí porque este playground es el propietario natural de la
          validación visual interna: ya es `noindex`, está fuera del sitemap y
          su chunk no se carga en ninguna ruta pública. `noindex` no es control
          de acceso: la URL es alcanzable, y por eso el contenido es material de
          trabajo sin datos personales ni comerciales.

          La escena es una maqueta de trabajo: escala, proporción y encuadre.
          No es el acabado (eso es dirección artística) ni una instalación real,
          y el laboratorio lo dice en su propio texto.
          Contexto: docs/immersive/STATE.md
        */}
        <div className="dsp-block">
          <SectionLabel>17 · Laboratorio espacial</SectionLabel>
          <p className="ds-body-small">
            Estado del lote: composición 2D y navegación DOM, y greybox espacial
            activable bajo `import()` diferido. Sigue sin enlazarse desde ninguna
            ruta pública del sitio: solo existe dentro de este bloque del sistema.
          </p>
          <TrajectoryLab />
        </div>
      </Container>
    </div>
  )
}
