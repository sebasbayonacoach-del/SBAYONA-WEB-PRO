// Qué objeto real representa cada tramo, por ruta.
//
// Datos, no lógica: `RouteSceneCycler` hace lo mismo en todas las rutas. Lo único
// que cambia es el guion, y aquí está escrito aparte para poder tocar el relato de
// una página sin abrir componentes.
//
// REGLA DE ESTE FICHERO: el repertorio son SOLO objetos de sala reconocibles. Las
// escenas abstractas que había antes (aros que se rellenan, cajas que se abren,
// marcos con años) quedan fuera del ciclo: un aro no enseña nada, y el usuario
// tiene razón en rechazarlo.
//
// REGLA DE COMPOSICIÓN (medida con `scripts/inventario-3d.mjs` el 2026-09-20):
// el lienzo del cycler se portaliza dentro de la sección activa y el objeto cae
// SIEMPRE en el centro de esa banda — no hay palanca de colocación: mover
// `cameraPosition.y` una semialtura entera desplazó la barra ~40 px—. Así que la
// única decisión honesta es si el hueco libre de la sección aguanta el objeto.
// Alturas reales a 900 px de banda, con `FILL` 0,58 y las cotas de `SIZE`:
//   recovery 234 · kettlebell 272 · barbell 381 · y TODO lo demás 522
//   (scale, timer, punchbag, weightstack, platetree, dumbbells, plyobox 522-524).
// Por eso cada ruta lista ARRIBA sus tramos que sí cobran 3D y `cycle: [null]`
// deja sin decorado al resto. Un objeto sobre un titular no es inmersión: es el
// defecto que el dueño reportó ("el 3D se monta sobre los textos").
//
// Las secciones con fondo CLARO (hueso) van siempre sin objeto: el texto se sube
// a `z-index: 1` por encima del lienzo, así que las letras no se tapan, pero un
// artefacto oscuro detrás de texto oscuro sobre crema baja el contraste y la
// segunda línea se vuelve ilegible. Medido en `/about` y en `/resources`.

// Doce objetos de sala. Los cuatro de la segunda tanda (báscula con tallímetro,
// cronómetro de intervalos, kit de recuperación y barra fija con colchoneta)
// salen del inventario de titulares: `INVENTARIO-OBJETOS.md` dice qué frase pide
// qué objeto, y aquí se escribe esa correspondencia.
const REAL = [
  'barbell', 'dumbbells', 'kettlebell', 'weightstack', 'plyobox', 'punchbag',
  'bench', 'platetree', 'scale', 'timer', 'recovery', 'pullupbar',
]

// `null` = "esta sección no lleva decorado". `RouteSceneCycler` la deja sin paso
// y, como el lienzo está recortado dentro del paso activo, al bajar a ella no
// pinta nada: cero coste de GPU y cero objeto sobre el texto.
const NADA = [null]

const DEFAULTS = { rules: [], cycle: REAL }

// La home final utiliza fotografía a pantalla completa (brief 2026-10-05).
// No superponer los objetos del guion anterior ni abrir un contexto WebGL
// detrás de estas imágenes. Las demás rutas conservan sus escenas.
const HOME = {
  idPrefix: 'home-sec',
  rules: [],
  cycle: NADA,
}

const RESOURCES = {
  idPrefix: 'res-sec',
  rules: [
    // «Lee. Guarda. Vuelve cuando quieras»: 449 px de hueco, la barra de por
    // medio es el único objeto de la página que lo aguanta.
    [/lee\.\s*guarda|vuelve\s*cuando/i, 'barbell'],
  ],
  // El reto de 30 días (265 px), la calculadora y los CTA finales no tienen
  // banda libre: ahí el reloj y la pila de pesos salían encima de la tabla
  // semanal y del formulario.
  cycle: NADA,
}

const COMMUNITY = {
  idPrefix: 'com-sec',
  rules: [
    // «La mayoría no abandona por falta de información»: 359 px, cabe la hilera
    // baja (272).
    [/mayor[ií]a no abandona|falta de info/i, 'kettlebell'],
    // «Una persona BAYONA» (435) y «Tres niveles» (440): barra de por medio,
    // separadas por un tramo sin objeto.
    [/una persona bayona/i, 'barbell'],
    [/tres niveles/i, 'barbell'],
    // «Conversación, recursos y práctica»: 556 px, la fila de mancuernas lee
    // como la estantería de una sala real.
    [/conversaci[oó]n,\s*recursos/i, 'dumbbells'],
  ],
  // «Imagina esto», «Tres momentos», «Historias reales», «Entrar es simple» y
  // el cierre: 160-330 px de hueco. El reloj que iba en «Tres momentos» medía
  // 522 px de alto.
  cycle: NADA,
}

const PROGRAMS = {
  idPrefix: 'prog-sec',
  rules: [
    // «Tu edad, tu nivel y tu objetivo importan» (328): solo cabe el perfil bajo.
    [/tu edad,\s*tu nivel/i, 'kettlebell'],
    // «Cómo elegir tu camino» (622): el árbol de discos ES la progresión.
    [/c[oó]mo elegir tu camino/i, 'platetree'],
    // «Elige plan y servicios» (455): barra.
    [/elige plan y\s*servicios/i, 'barbell'],
  ],
  // Los cuatro niveles (RAÍZ/FUERZA/REN DIMIENTO/ELITE) son tarjetas con foto y
  // la pila de pesos salía sobre los textos; «30 días» y «personaliza tu plan»
  // tienen 96-221 px libres.
  cycle: NADA,
}

const SHOP = {
  idPrefix: 'shop-sec',
  rules: [
    // «Cuatro caminos. Una misma actitud» (577): la fila de mancuernas.
    [/cuatro\s*caminos/i, 'dumbbells'],
    // «Simple. Rápido. Tuyo.» (392): pesa rusa, perfil bajo.
    [/simple\.\s*r[aá]pido/i, 'kettlebell'],
  ],
  // El catálogo son 9485 px de fichas con 267 px de hueco central: cualquier
  // objeto caía sobre el eyebrow y sobre las tarjetas, que es justo lo que se
  // reportó. Las colecciones y el carrito se los apaña sin WebGL.
  cycle: NADA,
}

// `/app` es la página oficial larga de BAYONA+ (pública); el mando se fue a
// `/panel`.
//
// AQUÍ NO MANDA ESTE FICHERO. `/app` trae sus propias capas WebGL por tramo
// (`AppShowcaseLayer` en el hero y las escenas de cada bloque) y
// `RouteSceneCycler` excluye de entrada las secciones que ya llevan un `<canvas>`
// dentro. Medido con `scripts/probe-escenas.mjs`: ninguna sección de `/app` recibe
// el atributo de encuadre del cycler y en la página no existe `[data-scene-cycler]`.
// Las once reglas que había aquí estaban muertas —daban la sensación de gobernar un
// 3D que no tocan—, así que se retiran en lugar de dejarlas engañando al siguiente.
// El 3D de `/app` se decide en sus propias capas.
const APP = {
  idPrefix: 'app-sec',
  rules: [],
  // `cycle: []` = ningún tramo de `/app` cobra objeto del cycler. No es el
  // olvido: es que no puede, y declararlo así evita que la ruta caiga en
  // DEFAULTS (`cycle: REAL`) y se le monten lienzos encima de los suyos.
  cycle: [],
}

const BY_PATH = [
  ['^/resources', RESOURCES],
  ['^/community', COMMUNITY],
  ['^/programs', PROGRAMS],
  ['^/shop', SHOP],
  // Parkour: la barra fija con colchoneta es literalmente su seguridad.
  [
    '^/parkour',
    {
      idPrefix: 'par-sec',
      rules: [
        [/tres niveles|ning[uú]n atajo/i, 'pullupbar'],
        [/se enseña|confianza/i, 'kettlebell'],
        [/valent[ií]a no es/i, 'barbell'],
        [/pr[oó]ximo\s*movimiento/i, 'kettlebell'],
      ],
      cycle: NADA,
    },
  ],
  ['^/app', APP],
  // `/panel` es el mando (app-shell de cinco pantallas): no tiene <section> de
  // primer nivel, así que el cycler no monta nada y no paga three.js.
  ['^/panel', { idPrefix: 'panel-sec', rules: [], cycle: [] }],
  // `/faq` son dos secciones de acordeón con 270 y 247 px de hueco: ningún
  // objeto del repertorio cabe. Era la ruta donde la barra olímpica cruzaba las
  // preguntas y el rack tapaba los títulos de las tres tarjetas finales.
  ['^/faq', { idPrefix: 'faq-sec', rules: [], cycle: [] }],
  [
    '^/about',
    {
      idPrefix: 'about-sec',
      rules: [
        // «Del parkour a un método de trabajo»: 3841 px libres, la barra.
        [/del parkour a\s*un m[eé]todo/i, 'barbell'],
        // «Entrenamos juntos» (600) y «no es una rutina, es una decisión tras
        // otra» (1436): el tallímetro lee medida, la pila de pesos lee carga
        // acumulada decisión a decisión.
        [/entrenamos\s*juntos/i, 'scale'],
        [/decisi[oó]n tras otra/i, 'weightstack'],
      ],
      // Las dos secciones HUESO («Un plan sirve…» y «Cuatro principios») van sin
      // objeto: sobre crema, un artefacto oscuro detrás de texto oscuro hace
      // ilegible la segunda línea del titular.
      cycle: NADA,
    },
  ],
  ['^/$', HOME],
]

export function routeSceneRules(pathname) {
  for (const [re, cfg] of BY_PATH) if (new RegExp(re).test(pathname)) return cfg
  return DEFAULTS
}
