/**
 * BAYONA · «TRAYECTORIA» — GREYBOX · DATOS PUROS DEL ESCENARIO
 * -------------------------------------------------------------------------
 * Lote 2 (FASE A · greybox espacial aislado).
 *
 * Este módulo es la ÚNICA fuente de la geometría, los materiales, la luz y los
 * encuadres de la maqueta. Es deliberadamente **puro**: ni React, ni Three.js,
 * ni `Vector3`, ni `import` del motor. Por eso pueden consumirlo tres clientes
 * distintos sin duplicar ni una cifra:
 *
 *   1. `TrajectoryScene.jsx`  → monta la escena real (React Three Fiber).
 *   2. Los tests              → verifican escala, encuadre y ausencia de caras
 *                               coplanares SIN navegador.
 *   3. `scripts/lab-greybox-projection.mjs` → proyecta estos mismos datos con
 *       la matemática de `three` y produce una comprobación geométrica de los
 *       encuadres (ver "Limitación" abajo).
 *
 * Escala: **1 unidad = 1 metro** y `HUMAN_HEIGHT` es la referencia. Todos los
 * números de este fichero son metros. Si alguien cambia una losa a 4.6 en vez de
 * 4.6 m, se está cambiando la proporción respecto al cuerpo humano: por eso la
 * referencia está aquí y no en la escena.
 *
 * Qué es esta maqueta: un fragmento de pabellón de movimiento — suelo, dos
 * montantes, tres plataformas, una barra, una trayectoria y una abertura de
 * luz. Sirve para juzgar escala, profundidad, orientación y encuadre.
 *
 * Limitación (no fingir más de lo que hay): los datos verifican GEOMETRÍA y
 * ENCUADRE, no luz ni material. La validación con navegador (WebGL real,
 * cadencia, temperatura, GPU móvil) sigue pendiente en este entorno.
 */

import { theme } from '../config/theme.js'

/** 1 unidad = 1 metro. Referencia humana para juzgar proporción. */
export const METERS_PER_UNIT = 1
export const HUMAN_HEIGHT = 1.8

/** Volumen jugable de la maqueta (para encuadres y tests de contención). */
export const STAGE_BOUNDS = Object.freeze({
  x: Object.freeze([-12, 12]),
  y: Object.freeze([0, 6.6]),
  z: Object.freeze([-12, 6]),
})

/**
 * Relación de aspecto por DEBAJO de la cual se usa el encuadre «narrow».
 *
 * No es 1,0 "porque el móvil es vertical": es 1,30 porque este pabellón es mucho
 * más ancho que alto (11,25 m de traviesa contra 6,35 m de alzado). Con el FOV
 * vertical que fija Three, el ancho visible cae por debajo del sujeto en cuanto
 * el aspecto deja de ser holgadamente apaisado: a 1,00 (cuadrado) el plano
 * «wide» ya recorta los montantes, y eso lo midió la proyección, no la intuición.
 * Vista de arriba: los 7 viewports del script (1440×900 … 320×568).
 */
export const NARROW_ASPECT_MAX = 1.3

/**
 * ## Paleta — Lote 3A: la escena aprende del panel, no de un humor
 *
 * El Lote 2 usaba `theme.color.black/2/3` como materiales. Esos son los negros
 * del *fondo tipográfico* del sitio: valen para escribir encima, no para construir
 * volumen. Con ellos la maqueta entera caía entre 1,00:1 y 1,06:1 contra el fondo
 * de escena (lo midió la revisión visual del greybox: `STATE.md` → «Revisión visual
 * del greybox»), y por eso el render salía negro.
 *
 * La corrección no inventa una paleta nueva: toma las **superficies que el propio
 * laboratorio ya declara en CSS** — `src/styles/spatial-lab.css`: `--lab-plane`,
 * `--lab-concrete`, `--lab-bone` — y las reparte por jerarquía de valor. Los tres
 * hexes son copia declarada, y `trajectoryStage.test.js` los compara con el CSS: si
 * alguien mueve el hueso del panel, el test avisa. El acento sigue siendo
 * `theme.color.orange` y solo señala.
 *
 * Jerarquía de valor pedida y cumplida (fondo → suelo → estructura → losas → activa
 * → acento). Se comprueba por orden de luminancia, no por un número mágico.
 */
export const LAB_SURFACES = Object.freeze({
  plane: '#17181a', // --lab-plane: grafito, la superficie del panel
  concrete: '#6e6a63', // --lab-concrete: hormigón mineral, el material de la maqueta
  bone: '#ede7dc', // --lab-bone: hueso, el papel sobre el que se imprime
})

const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const hexOf = (rgb) => `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`

/** `mix(a, b, t)`: t=0 es `a`, t=1 es `b`. Un solo mecanismo para toda la jerarquía. */
export function mix(hexA, hexB, t) {
  const a = rgbOf(hexA)
  const b = rgbOf(hexB)
  return hexOf(a.map((c, i) => c + (b[i] - c) * t))
}

/** Luminancia relativa (WCAG 1.4.5). Se exporta: el test y la proyección la comparten. */
export function relativeLuma(hex) {
  const [r, g, b] = rgbOf(hex).map((v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Ratio de contraste entre dos hexes. 1,00:1 = indistinguibles. */
export function contrastRatio(hexA, hexB) {
  const a = relativeLuma(hexA)
  const b = relativeLuma(hexB)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
/** El valor de estructura, ancla del tono de la trayectoria (declarado antes para no leer un objeto en construcción). */
const MATERIAL_ANCHOR_STRUCTURE = mix(theme.color.black, LAB_SURFACES.concrete, 0.45)

export const MATERIALS = Object.freeze({
  // Suelo: grafito del panel. Sube un paso sobre el fondo (#050505) para que el
  // plano deje de fusionarse con él, y poco más: el suelo no es el asunto.
  floor: Object.freeze({ color: LAB_SURFACES.plane, roughness: 0.94, metalness: 0 }),
  // Juntas de pavimento: la malla de 2,00 m que da escala al suelo vacío.
  joint: Object.freeze({ color: mix(LAB_SURFACES.plane, LAB_SURFACES.concrete, 0.35), roughness: 0.9, metalness: 0 }),
  // Estructura: el hormigón a media luz. Mineral medio, no negro.
  structure: Object.freeze({ color: MATERIAL_ANCHOR_STRUCTURE, roughness: 0.78, metalness: 0.02 }),
  // Tono de la RUTA. Ya no pinta nada en la escena (los peldaños la sustituyen);
  // lo consume `--with-route` de la proyección para poder auditar la línea que la
  // maqueta declara pero no dibuja. Un material sin mesh no es presupuesto: es un
  // registro, y está dicho para que nadie lo confunda con un adorno pendiente.
  // Losas: el hormigón tal cual, la superficie más clara del conjunto.
  platform: Object.freeze({ color: LAB_SURFACES.concrete, roughness: 0.82, metalness: 0.02 }),
  bar: Object.freeze({ color: theme.color.orange, roughness: 0.42, metalness: 0.4 }),
  /**
   * La abertura: luz de día entrando, no una luminaria naranja. Hueso — el mismo
   * valor del texto del panel — y `toneMapped: false` en la escena para que el
   * tone mapping no la aplaste y se lea como fuente, no como plástico.
   * `doubleSided` es necesario, no estético: el plano general está MÁS ALTO que la
   * abertura, así que con una sola cara la luz sería invisible desde el encuadre
   * que tiene que presentarla. Lo detectó la proyección (backface culling), no el ojo.
   */
  aperture: Object.freeze({ color: LAB_SURFACES.bone, unlit: true, opacity: 1, doubleSided: true }),
  // Señal de estación: un canto fino autoluminoso. Es la única superficie saturada.
  signal: Object.freeze({ color: theme.color.orange, unlit: true, opacity: 0.9, doubleSided: true }),
  // Referencia de escala (1,80 m). Se apaga a propósito: si compite, sobra.
  scale: Object.freeze({ color: mix(LAB_SURFACES.bone, LAB_SURFACES.concrete, 0.25), roughness: 0.8, metalness: 0 }),
  /**
   * Losa activa: un paso de valor hacia el hueso y nada más. El Lote 2 la pintaba
   * entera con `emissive` naranja; aquí el naranja se retira a la señal (el canto)
   * y la losa se diferencia por LUMINANCIA, que es lo que el ojo puede seguir en
   * una escena en escala de grises (regla §3 del lote). `glow` queda como empuje
   * mínimo, declarado como dato y no como capricho del componente.
   */
  platformActive: Object.freeze({
    color: mix(LAB_SURFACES.concrete, LAB_SURFACES.bone, 0.5),
    roughness: 0.74,
    metalness: 0.02,
    glow: theme.color.orangeFire,
    glowIntensity: 0.1,
  }),
})

/**
 * Piezas de la maqueta. `kind` es el vocabulario cerrado de primitivas que
 * sabe montar `TrajectoryScene`: 'box' | 'plane' | 'cylinder' | 'tube' | 'openBox'.
 * `args` sigue el orden del constructor de Three.js correspondiente, sin
 * azúcar: si Three cambia, cambia aquí, no en siete sitios.
 */
export const GEOMETRY = Object.freeze([
  // --- SUELO: LA PEANA, NO LA PLAZA ---------------------------------------
  // El plano medía 24 × 24 m y en los encuadres del Lote 2 su mitad delantera era
  // un campo vacío: el cuadro no estaba «abierto», estaba desocupado (hallazgo C
  // de la revisión). 16 × 13 m es lo que necesita el pabellón para apoyarse: 11,25
  // de ancho construido + 2,4 de andén delante + holgura. Un plano de maqueta con
  // BORDO visible lee como base; uno de 24 m lee como error de encuadre.
  // No es un truco de métrica: el vacío del encuadre anterior era geometría real
  // que no comunicaba nada.
  {
    id: 'floor',
    kind: 'plane',
    args: [16, 13],
    material: 'floor',
    position: [0, 0, -0.6],
    rotation: [-Math.PI / 2, 0, 0],
    role: 'ground',
  },

  // --- MONTANTES Y TRAVIESA (la estructura sostiene la abertura) ---------
  // Los montantes llegan hasta y = 6,1 y la traviesa arranca en y = 6,0: 0,1 m
  // de INTERPENETRACIÓN deliberada, y la traviesa mide 11,0 (no 11,25): sus
  // extremos quedan EMBEBIDOS en los montantes en vez de enrasados con ellos.
  // Caras enrasadas = caras coplanares = costura de z-fighting en cuanto la
  // cámara raspa el ángulo. Lo comprueba trajectoryStage.test.js.
  // Encaje real (entalladura) llegaría con la dirección artística; para juzgar
  // escala y volumen, embeber es geométricamente correcto y más barato.
  {
    id: 'pier-west',
    kind: 'box',
    args: [0.45, 6.1, 0.45],
    material: 'structure',
    position: [-5.4, 3.05, -2.6],
    role: 'structure',
  },
  {
    id: 'pier-east',
    kind: 'box',
    args: [0.45, 6.1, 0.45],
    material: 'structure',
    position: [5.4, 3.05, -2.6],
    role: 'structure',
  },
  {
    id: 'beam',
    kind: 'box',
    // 0,60 de fondo frente al 0,45 de los montantes: la traviesa sobresale 7,5
    // cm por delante y por detrás. Con el mismo fondo, sus caras serían
    // coplanares con las de los pilares en la franja de encuentro (lo detectó
    // el test de caras coincidentes) y ahí aparece la costura.
    args: [11.0, 0.35, 0.6],
    material: 'structure',
    position: [0, 6.175, -2.6],
    role: 'structure',
  },

  // --- TRES PLATAFORMAS EN PROGRESIÓN ------------------------------------
  // Planos de apoyo a 0,48 / 1,54 / 2,60 m (separación de 1,06 m: un cuerpo
  // cabe de pie entre dos losas, que es la proporción que se quiere leer) y
  // escalonadas hacia +x y hacia -z. Todas quedan DELANTE de la línea de
  // montantes (z ≥ −2,0 frente a z = −2,6) para que la barra no las atraviese.
  {
    id: 'platform-1',
    kind: 'box',
    args: [5.4, 0.28, 3.4],
    material: 'platform',
    position: [-3.1, 0.34, 1.4],
    role: 'platform',
    station: 'understand',
  },
  {
    id: 'platform-2',
    kind: 'box',
    args: [4.6, 0.28, 3.0],
    material: 'platform',
    position: [0.2, 1.4, 0.4],
    role: 'platform',
    station: 'build',
  },
  {
    id: 'platform-3',
    kind: 'box',
    args: [4.0, 0.28, 2.8],
    material: 'platform',
    position: [3.3, 2.46, -0.6],
    role: 'platform',
    station: 'support',
  },

  // --- BARRA (el objeto del método: apoyo, medida) ------------------------
  // Barra fija entre los dos montantes a 2,40 m del suelo: altura de barra alta
  // real (una persona de 1,80 m la alcanza con los brazos casi extendidos) y,
  // sobre todo, ANCLADA: sus extremos entran en los montantes. Sin apoyo, una
  // barra flotando es exactamente el adorno arbitrario que el plan prohíbe.
  {
    id: 'bar',
    kind: 'cylinder',
    args: [0.05, 0.05, 10.5, 16],
    material: 'bar',
    position: [0, 2.4, -2.6],
    rotation: [0, 0, Math.PI / 2],
    role: 'apparatus',
  },

  // --- LOSA DE CUBIERTA CON EL VANO RECORTADO (Lote 3A) -------------------
  // El Lote 2 dejaba un plano autoluminoso colgando bajo la traviesa: leía como
  // una LUMINARIA, no como luz que entra. Un hueco solo se ve como hueco si hay
  // un plano que lo recorte, así que la abertura pasa a estar flanqueada por dos
  // bandas de losa (oeste y este) que dejan el vano de 6,20 × 2,20 entre ellas.
  // Es geometría mínima: dos cajas, sin muro, sin edificio. La Junta superior de
  // sombra (losa a 6,42–6,58 contra traviesa hasta 6,35) es deliberada: le da
  // grosor constructivo al encuentro en vez de una costura coplanar.
  {
    id: 'roof-west',
    kind: 'box',
    args: [3.6, 0.16, 4.6],
    material: 'structure',
    position: [-4.35, 6.5, -2.3],
    role: 'roof',
  },
  {
    id: 'roof-east',
    kind: 'box',
    args: [2.3, 0.16, 4.6],
    material: 'structure',
    position: [4.85, 6.5, -2.3],
    role: 'roof',
  },

  // --- ABERTURA DE LUZ ----------------------------------------------------
  // El cielo del vano. Sigue mirando hacia abajo porque el encuadre que la
  // presenta está por debajo de ella.
  {
    id: 'aperture',
    kind: 'plane',
    args: [6.2, 2.2],
    material: 'aperture',
    position: [0.6, 5.94, -2.6],
    rotation: [Math.PI / 2, 0, 0],
    role: 'light-source',
  },

  // --- CANTO DE SEÑAL POR ESTACIÓN (el hallazgo del Lote 2, contenido) -----
  // El Lote 2 distinguía la estación pintando la losa entera con `emissive`
  // naranja. Funcionaba, y funciona: el principio se conserva. Lo que cambia es
  // la dosis — la losa sube un paso de valor (material `platformActive`) y el
  // naranja se retira a UN CANTO de 12 cm sobre el frente del rellano, que es
  // como un pabellón real señala un nivel: una línea pintada, no un cartel.
  // Cada señal está anclada a su losa (el test comprueba frente, canto y apoyo),
  // y 0,001 m por encima del plano: apoyo exacto = caras coplanares = costura.
  {
    id: 'signal-understand',
    kind: 'box',
    args: [4.9, 0.06, 0.12],
    material: 'signal',
    position: [-3.1, 0.511, 3.03],
    role: 'signal',
    station: 'understand',
  },
  {
    id: 'signal-build',
    kind: 'box',
    args: [4.1, 0.06, 0.12],
    material: 'signal',
    position: [0.2, 1.571, 1.83],
    role: 'signal',
    station: 'build',
  },
  {
    id: 'signal-support',
    kind: 'box',
    args: [3.5, 0.06, 0.12],
    material: 'signal',
    position: [3.3, 2.631, 0.73],
    role: 'signal',
    station: 'support',
  },

  // --- PAVIMENTO: LA ESCALA ESTÁ EN LA MALLA, NO EN EL ADORNO -------------
  // El suelo de 24 m era el 45 % del encuadre sin decir nada (hallazgo C de la
  // revisión). Se resuelve con lo que un pabellón real tiene: juntas cada 2,00 m.
  // La malla es la referencia de escala (una persona cabe de paso entre dos
  // juntas) y a la vez da lectura de profundidad en el plano bajo, que es justo
  // lo que faltaba. `role: 'context'` = NO entra en el bounding del sujeto: si
  // entrara, la cámara retrocedería para encuadrar 24 m de pavimento y
  // reproduciría el problema que quiere corregir.
  ...[5.0, 3.0, 1.0, -1.0, -3.0, -5.0].map((z, i) => ({
    id: `joint-${i + 1}`,
    kind: 'box',
    args: [15.4, 0.02, 0.05],
    material: 'joint',
    position: [0, 0.02, z],
    role: 'context',
  })),

  // --- PELDAÑOS: LA TRAYECTORIA HECHA CONSTRUCCIÓN ------------------------
  // Decisión del lote (§7): la línea literal se RETIRA del render. Dos intentos
  // sobre la proyección lo dejaron claro — como tubo fino sobre losas claras
  // parecía un jardín; como tubo más grueso seguía cruzando el cuadro sin
  // explicarse. La idea de trayectoria sobrevive, pero contada con lo que un
  // pabellón tiene de verdad para subir: tres peldaños de hormigón que tocan el
  // canto de cada rellano. `TRAJECTORY_CURVE` sigue siendo la ruta declarada (de
  // ahí salen las alturas de apoyo) y la proyección puede superponerla con
  // `--with-route` para auditar la relación; la escena ya no la monta.
  // Los peldaños se EMPOTRAN en la losa que reciben (0,03 y 0,07 m), que es el
  // mismo criterio constructivo que ya usan montantes y traviesa: caras enrasadas =
  // costura de z-fighting; caras embutidas = encuentro.
  {
    id: 'step-entry',
    kind: 'box',
    args: [1.6, 0.24, 0.8],
    material: 'platform',
    // 3,45 en z, no 3,6: así el peldaño embute 5 cm en la cara frontal de la losa
    // 01. Despegado 10 cm leía como un bloque suelto tirado en el pavimento, que
    // es justo el aspecto de «placeholder» que el lote prohíbe tolerar.
    position: [-4.6, 0.121, 3.45],
    role: 'circulation',
  },
  {
    id: 'step-12',
    kind: 'box',
    args: [1.1, 0.92, 1.0],
    material: 'platform',
    // Al ENCUENTRO por la izquierda, no delante: centrado, el peldaño se plantaba
    // entre la cámara y el rellano 02 y el comprobador de oclusión lo avisaba. Al
    // costado, el peldaño existe igual en la obra y no le roba la losa al encuadre.
    position: [-2.6, 0.91, 1.45],
    role: 'circulation',
  },
  {
    id: 'step-23',
    kind: 'box',
    args: [1.0, 0.92, 0.9],
    material: 'platform',
    position: [1.1, 1.97, 0.2],
    role: 'circulation',
  },

  // --- REFERENCIA HUMANA --------------------------------------------------
  // 1,80 m exactos (`HUMAN_HEIGHT`), un bulto de 30 × 6 cm apoyado en el
  // pavimento en la entrada del recorrido. No es un muñeco ni un avatar: es la
  // escala gráfica de un plano de arquitectura, plantada en la maqueta. Si en la
  // revisión se lee como placeholder, se borra esta pieza y nada más se toca.
  {
    id: 'scale-figure',
    kind: 'box',
    args: [0.3, 1.8, 0.05],
    material: 'scale',
    position: [-7.4, 0.905, 4.2],
    rotation: [0, 0.34, 0],
    role: 'context',
  },
])

/**
 * Trayectoria: la línea del recorrido, materializada como tubo. Pasa por
 * encima de los tres planos de apoyo y sale del encuadre por detrás: continuidad,
 * no adorno. Los puntos son metros absolutos.
 */
export const TRAJECTORY_CURVE = Object.freeze({
  id: 'trajectory',
  kind: 'tube',
  material: 'path',
  role: 'path',
  // Radio 0,045 m (antes 0,055) y a 0,06 m sobre la superficie que recorre: es una
  // junta de pavimento, no un cable. Un tubo más grueso sobre un material autoluminoso
  // es exactamente el «láser atravesando el cuadro» que devolvieron las capturas.
  radius: 0.045,
  tubularSegments: 88,
  radialSegments: 6,
  /**
   * Los puntos no dibujan un arco «bonito»: responden a las tres preguntas que el
   * lote exigía (¿de dónde viene?, ¿qué conecta?, ¿a dónde llega?).
   *
   *   · Entra por el pavimento, por el lado de la visita, al pie de la referencia
   *     humana de 1,80 m: hay un antes del recorrido.
   *   · Sube al rellano 01, lo cruza, vuelve al pavimento, sube al 02, lo cruza,
   *     sube al 03 y lo cruza. Cada tramo horizontal está SOBRE la losa
   *     (top + 0,06 m), así que la relación estación ↔ trayectoria es táctil, no
   *     decorativa: se puede seguir con el dedo en el plano.
   *   · Sale ascendiendo por el lado del vano: 03 no es el final, es el rellano
   *     desde el que se mira el siguiente horizonte — que es lo que dice el copy.
   *
   * En el encuentro con el canto de cada losa el tramo queda parcialmente
   * empotrado en el frente: es cómo una rampa real llega a un rellano. Se asume
   * como acierto constructivo, no como defecto a pulir, y está dicho aquí para
   * que nadie lo "arregle" elevando la línea y devolviéndola al aire.
   */
  points: Object.freeze([
    Object.freeze([-7.6, 0.06, 4.4]),
    Object.freeze([-4.9, 0.06, 3.8]),
    Object.freeze([-3.3, 0.54, 2.5]),
    Object.freeze([-1.3, 0.54, 1.0]),
    Object.freeze([0.3, 0.06, 2.5]),
    Object.freeze([1.2, 1.6, 1.4]),
    Object.freeze([2.2, 1.6, 0.0]),
    Object.freeze([3.4, 2.66, 0.5]),
    Object.freeze([4.5, 2.66, -1.0]),
    Object.freeze([6.3, 3.35, -2.4]),
  ]),
})

/**
 * Luz: una principal direccional motivada por el vano y un relleno que mantiene
 * viva la geometría en sombra. Nada más.
 *
 * El cambio del Lote 3A es el COLOR de la clave. Estaba en `theme.color.orange`,
 * que es la razón por la que toda la escena salía teñida: una luz naranja sobre
 * albedos casi negros no ilumina, pinta. Aquí la clave es el hueso del panel
 * (misma familia que el vano: lo que entra por el hueco es luz de día) y el
 * relleno es el gris tenue del texto secundario. Con eso el naranja vuelve a ser
 * SEÑAL en lugar de muleta, que era el objetivo perceptivo del lote.
 *
 * SIN sombras: es decisión de presupuesto, declarada. Consecuencia honesta: la
 * direccional no puede proyectar el rectángulo de luz en el suelo, así que la
 * lectura del vano la sostienen la losa recortada y la niebla, no una mancha
 * luminosa. Simular esa mancha con bloom o con un plano aditivo está prohibido
 * en este lote y no hace falta para juzgar escala.
 */
export const LIGHTS = Object.freeze({
  key: Object.freeze({
    color: LAB_SURFACES.bone,
    intensity: 2.05,
    // Desde el vano, hacia abajo y hacia la cámara: la dirección ES el relato
    // (la luz entra por el hueco), no un ajuste de gusto.
    position: [0.6, 5.8, -3.0],
  }),
  fill: Object.freeze({
    color: '#6b6b6b', // --ds-color-dim: el gris con el que el panel escribe lo secundario
    intensity: 0.8,
  }),
})

/**
 * Niebla: acota el fondo y separa planos sin post-proceso.
 *
 * Dos decisiones del Lote 3A:
 *  · El color pasa a ser el negro más oscuro del sitio (`theme.color.black`,
 *    #050505) y no `black2`. Con `black2` el suelo grafito (#17181a) se
 *    difuminaba CONTRA un fondo más claro que él: el plano se aclaraba al
 *    alejarse, que es lo contrario de la profundidad. Ahora el fondo es el valor
 *    mínimo de la escena y todo lo que se aleja cae hacia él.
 *  · `near` sube de 16 a 26 m. Con la cámara de 01 a ~18 m, el `near` viejo se
 *    comía el propio pabellón: la distancia a la que empieza a borroso estaba
 *    DENTRO del sujeto. El sujeto queda limpio y lo que se apaga es el pavimento
 *    del fondo, que es donde la niebla aporta algo.
 */
export const FOG = Object.freeze({
  color: theme.color.black,
  near: 26,
  far: 76,
})

/**
 * Encuadres por estación y por FAMILIA DE ASPECTO. Cada encuadre lleva sus
 * propios criterios de composición:
 *
 *   · `mustInclude`  lo que tiene que caber ENTERO (con margen) en el cuadro.
 *   · `mustBeVisible` lo que tiene que APARECER (aunque se corte).
 *
 * ## Lote 3A — cada estación compone algo distinto, a propósito
 *
 * El Lote 2 tenía tres encuadres que eran la misma idea a distinta distancia. La
 * corrección no es «meter más zoom»: es dar a cada estación una intención y dejar
 * que la cámara la ejecute. Los números se eligieron componiendo primero (eje,
 * altura del ojo, qué entra y qué se sacrifica) y midiendo después con
 * `scripts/lab-greybox-projection.mjs`, que es lo que detecta las regresiones
 * extremas; la métrica de ocupación viaja como diagnóstico, no como objetivo.
 *
 *   01 TE LEEMOS     — el punto de partida. Plano más abierto, ojo bajo (2,4 m,
 *                      altura de visita), el pavimento con sus juntas y la
 *                      referencia humana EN el cuadro: antes de entender el método
 *                      hay que entender el sitio. Las tres losas se ven subir.
 *   02 CONSTRUIMOS   — el momento estructural. La lente más cerrada del lote (36°)
 *                      y el encuadre más bajo: montante a cada lado, traviesa
 *                      cruzando arriba, losa activa en el centro. Es la estación
 *                      donde el armazón oprime, y que oprima es el asunto.
 *   03 TE ACOMPAÑAMOS— no «más cerca». Cambia de cuadrante y mira HACIA ARRIBA y
 *                      hacia el vano: la losa 03 es un rellano, la trayectoria sale
 *                      del cuadro ascendiendo y la cubierta recortada entra en el
 *                      tercio superior. Continuidad, no clímax.
 *
 * Por qué los criterios son por encuadre y no por estación: en vertical, un
 * pabellón de 11,25 m de ancho no se «encoge» para que quepa entero — eso daría un
 * dibujo diminuto en un móvil, que es el «reducir todo al 70 %» que el plan
 * prohíbe. Lo que se hace es CAMBIAR EL EJE: la cámara se pone sobre el eje del
 * recorrido para que la progresión lea en vertical.
 *
 * Los números son metros sobre el suelo y FOV vertical (convención de
 * `PerspectiveCamera`).
 */
export const VIEWS = Object.freeze({
  understand: Object.freeze({
    wide: Object.freeze({
      // Ojo a 5,9 m mirando a 1,5: picado de ~17°, el modo normal de fotografiar
      // una maqueta sobre una mesa. Con el ojo a 2,4 m (como estaba) la cámara quedaba
      // a nivel del suelo y la peana se comía la mitad del cuadro.
      position: Object.freeze([7.81, 4.49, 9.84]),
      target: Object.freeze([0.2, 1.5, 0.6]),
      fov: 42,
      mustInclude: Object.freeze(['platform-1', 'signal-understand', 'step-entry', 'scale-figure']),
      mustBeVisible: Object.freeze(['platform-2', 'platform-3', 'pier-west', 'pier-east', 'beam', 'floor']),
    }),
    narrow: Object.freeze({
      // Vertical, 01: el visitante llega por el eje del recorrido. La losa 01 entra
      // grande y las dos siguientes se apilan arriba y al fondo: la progresión se
      // lee por SUPERPOSICIÓN, que es lo único que un cuadro 0,46 puede contar.
      // Retrocede hasta los 13 m y se alinea con el CENTRO de la losa (no con su
      // borde): con el objetivo en el borde, el rincón cercano de la losa salía del
      // cuadro y el encuadre «recortaba el sujeto», que es la queja del gate.
      position: Object.freeze([-16.2, 3.2, 2.6]),
      target: Object.freeze([-3.1, 1.9, 1.4]),
      fov: 46,
      // La referencia de escala va en `mustBeVisible`, no en `mustInclude`: en
      // vertical el bulto de 1,80 m está en el tercio inferior y se corta por
      // abajo. Que se corte es correcto —lo que tiene que quedar es su altura y su
      // apoyo—; exigir que quepa entero obligaba a retroceder 4 m y devolvía el
      // pabellón-miniatura que el lote viene a quitar.
      mustInclude: Object.freeze(['platform-1']),
      mustBeVisible: Object.freeze(['step-entry', 'signal-understand', 'platform-2', 'floor']),
    }),
  }),
  build: Object.freeze({
    wide: Object.freeze({
      // Ojo a 2,0 m y 36°: el encuadre más «arquitectónico» de los tres. Los
      // montantes entran a ambos lados y la traviesa corta el tercio superior, así
      // que la losa activa queda ENMARCADELA por la estructura, no flotando.
      position: Object.freeze([-8.45, 2.01, 9.15]),
      target: Object.freeze([0.6, 2.1, -0.4]),
      fov: 40,
      // La traviesa se corta a propósito arriba (el encuadre es el más cerrado del
      // lote: 36° a 14 m). Pedir que cupieran sus 11 m enteros obligaba a retroceder
      // hasta los 26 m y la opresión — que es EL ASUNTO de esta estación — se
      // desvanecía. entra en `mustBeVisible`, que es lo que significa.
      // Sujeto único: la losa 02. La traviesa, el montante y la cubierta entran en
      // el cuadro PERO SE CORTAN, y así debe ser: un encuadre donde la traviesa de
      // 11 m cabe entera es un encuadre a 26 m, que es el que el Lote 2 ya produjo y
      // devolvió un pabellón del 4 % del alto. Aquí la estructura oprime porque
      // desborda, no porque se vea entera.
      mustInclude: Object.freeze(['platform-2', 'signal-build', 'step-12']),
      mustBeVisible: Object.freeze(['beam', 'roof-west', 'pier-west', 'pier-east', 'bar', 'platform-3']),
    }),
    narrow: Object.freeze({
      position: Object.freeze([-12.2, 3.4, 1.2]),
      target: Object.freeze([1.4, 2.3, 0.5]),
      fov: 46,
      mustInclude: Object.freeze(['platform-2', 'signal-build']),
      mustBeVisible: Object.freeze(['platform-3', 'beam', 'step-23', 'floor']),
    }),
  }),
  support: Object.freeze({
    wide: Object.freeze({
      // Se mira desde el frente-izquierdo y HACIA ARRIBA: el objetivo es el vano
      // entre las dos bandas de cubierta, con la losa 03 como rellano del que
      // salir. La verticalidad la da el montante este cortando el cuadro, no un
      // gran angular espectacular.
      //
      // DOLLY-IN (8,2 m en vez de 17): con la cámara lejos, el encuadre cumplía la
      // cobertura y salía 78 % aire — el retrato de un techo flotando. Acercando,
      // la losa, el peldaño 23, el montante y la cubierta recortada llenan el
      // fotograma sin cambiar de lente ni de asunto.
      position: Object.freeze([-3.0, 2.3, 8.6]),
      target: Object.freeze([3.0, 2.75, -1.6]),
      fov: 42,
      // En un fotograma 2,16:1 (móvil tumbado) exigir el vano ENTERO obligaba a irse
      // a 15 m y el cuadro se vaciaba: cobertura 0,21. El vano se recorta arriba a
      // propósito — es un techo, no un cuadro que colgar — y lo que tiene que caber
      // entero es el rellano del que se sale.
      mustInclude: Object.freeze(['platform-3', 'signal-support']),
      mustBeVisible: Object.freeze(['aperture', 'roof-east', 'beam', 'pier-east', 'step-23', 'floor']),
    }),
    narrow: Object.freeze({
      // Vertical 03: el rellano arriba, el peldaño debajo y el vano cortando el
      // borde superior. Sale del cuadro a propósito: 03 es el nivel desde el que se
      // mira el siguiente horizonte, no un cartel que hay que ver entero.
      //
      // Reculada 1,1 m sobre el MISMO eje y con la MISMA lente (11,0 → 12,1 m) al
      // ampliar la matriz de formatos a los cuatro verticales del plan §11: con 360
      // y 430 en la lista, el asunto declarado (losa 03 + su canto) quedaba a
      // 0,025 y 0,049 de margen NDC — no un recorte elegido, un roce con el borde.
      // Ahora respira ≥ 0,12 en los cuatro y la cobertura sigue en 0,46. No se tocó
      // el criterio: se movió la cámara.
      position: Object.freeze([-9.02, 3.51, 0.85]),
      target: Object.freeze([3.0, 3.0, -0.4]),
      fov: 46,
      mustInclude: Object.freeze(['platform-3', 'signal-support']),
      mustBeVisible: Object.freeze(['aperture', 'roof-east', 'step-23', 'floor']),
    }),
  }),
})

/** Estaciones con encuadre propio, en el orden del recorrido. */
export const STATIONS_KEYS = Object.freeze(Object.keys(VIEWS))

/** Posición de arranque del <Canvas> (Scene3D lee `params.cameraPosition`). */
export const INITIAL_VIEW_KEY = 'understand'

/**
 * Elige el encuadre según la relación de aspecto del contenedor.
 * Función PURA y tolerante: aspecto ausero o basura cae en `wide`.
 *
 * @param {string} stationKey  'understand' | 'build' | 'support'
 * @param {number} [aspect]    width / height del escenario
 * @returns {{position:number[],target:number[],fov:number}}
 */
/**
 * Enccuadre efectivo de una estación, con sus criterios de composición
 * (`mustInclude` / `mustBeVisible`) viajando junto a él: quien monta la cámara y
 * quien la verifican leen el MISMO objeto, así que el criterio no se puede
 * olvidar en uno de los dos lados.
 */
export function viewFor(stationKey, aspect) {
  const view = VIEWS[stationKey] ?? VIEWS[INITIAL_VIEW_KEY]
  const isNarrow = Number.isFinite(aspect) && aspect > 0 && aspect < NARROW_ASPECT_MAX
  return isNarrow ? view.narrow : view.wide
}

/**
 * Caja alineada con los ejes de todo lo que la cámara debe mantener en cuadro:
 * cajas (mitad de aristas) + curva. Los planos infinitos no cuentan (suelo y
 * abertura no limitan el encuadre; lo que debe caber es el cuerpo de la obra).
 *
 * @returns {{min:[number,number,number], max:[number,number,number], center:[number,number,number], radius:number}}
 */
export function stageBounds() {
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  const absorb = ([x, y, z], half = [0, 0, 0]) => {
    for (let i = 0; i < 3; i += 1) {
      const v = [x, y, z][i]
      const h = half[i]
      if (v - h < min[i]) min[i] = v - h
      if (v + h > max[i]) max[i] = v + h
    }
  }

  // `role: 'context'` queda FUERA a propósito: el pavimento y la referencia
  // humana miden 22 m y no son el sujeto del encuadre. Incluirlos obligaba a la
  // cámara a retroceder para «encuadrar el escenario entero», que es la forma
  // exacta de reproducir el cuadro vacío que esta pasada viene a corregir.
  for (const part of GEOMETRY) {
    if (part.role === 'context') continue
    if (part.kind === 'box') {
      absorb(part.position, part.args.map((a) => a / 2))
    } else if (part.kind === 'cylinder') {
      // args = [radioSuperior, radioInferior, altura, segmentos]. La barra está
      // girada 90° sobre Z: su altura corre a lo largo de X.
      const radius = part.args[0]
      const halfLength = part.args[2] / 2
      const half = part.rotation?.[2]
        ? [halfLength, radius, radius]
        : [radius, halfLength, radius]
      absorb(part.position, half)
    }
  }
  for (const p of TRAJECTORY_CURVE.points) absorb(p, [TRAJECTORY_CURVE.radius * 3, TRAJECTORY_CURVE.radius * 3, TRAJECTORY_CURVE.radius * 3])

  const center = min.map((m, i) => (m + max[i]) / 2)
  const radius = Math.max(...max.map((m, i) => Math.abs(m - center[i])))
  return { min, max, center, radius }
}
