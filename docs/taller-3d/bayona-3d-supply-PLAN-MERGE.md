# Plan de montaje — cerrar el hueco de 3D en BAYONA

Medido sobre el código el 2026-09-19 a las 19:41, en **solo lectura**. La otra
sesión seguía escribiendo (`About.jsx`, `about.css`), así que aquí no se toca
nada del repo: esto es la orden de trabajo para cuando esté libre.

## El número real

67 secciones clasificadas en 8 rutas. Puntos de montaje 3D existentes:

| Variante | Capa que la monta | Página | Estado |
|---|---|---|---|
| `globe` | `src/components/about/AboutGlobeLayer.jsx:13` | `/about` | **activa** |
| `showcase` | `src/components/app/AppShowcaseLayer.jsx:13` | `/app` | **activa** |
| `showroom` | prop `scene=` en `src/pages/Programs.jsx:458` | `/programs` | **activa** |
| `hero` | `src/components/home/Hero3DLayer.jsx:15` | `/` | `enabled:false` |
| `parkour` | `src/components/parkour/ParkourPathLayer.jsx:19` | `/parkour-academy` | `enabled:false` |
| `hologram` | `src/components/shop/ShopHologramLayer.jsx:19` | `/shop` | `enabled:false` |
| `trajectory` | `src/components/lab/TrajectoryStage.jsx:43` | `/design-system` | laboratorio, `noindex` |
| `signature` | solo tests | — | declarada, sin montar |

**Rutas sin ninguna capa 3D: `/resources` (18 secciones), `/community` (16),
`/faq` (2). Son 36 de 67 secciones, el 54 % del sitio.**

## Dos cosas que comprobé y resultaron no ser

Conviene dejarlas escritas para que nadie las vuelva a proponer sobre mi palabra:

1. **No hay 33 capas 3D pidiendo variantes inexistentes.** `variant: 'subtle'`
   (18) y `variant: 'accent'` (15) vienen de `sceneBackgroundProps()` en
   `src/components/SceneBackground.jsx:34`: son variantes de **fondo**, no del
   motor 3D. Lo sospeché, lo leí en contexto y era falso.
2. **Contar `SceneMount` por fichero de página no vale.** Las páginas montan a
   través de componentes de capa; un `grep` ingenuo da "About: 0" y es mentira.

## Arquitectura: 67 secciones ≠ 67 lienzos

Un `<Canvas>` por sección mataría el móvil. Lo que sostiene el objetivo es:

- **Un solo `SceneMount` por ruta**, anclado al contenedor de la página, que
  **cambia de variante** según el progreso de scroll en vez de montar otro lienzo.
  El motor ya tiene lo necesario: `Scene3D.jsx:63` congela a `frameloop:'demand'`
  fuera del viewport y `resolveSceneConfig` degrada por dispositivo.
- **Máximo un lienzo visible a la vez.** Con `IntersectionObserver` por sección se
  dice cuál manda; las demás quedan en reposo.
- **El resto del "3D" de cada scroll no es WebGL**: perspectiva CSS, profundidad
  por capas, movimiento de cámara sobre una imagen. Vale para las secciones que
  solo necesitan profundidad, y cuesta 0 kB.

## La demo ya existe: un lienzo, ocho tramos

`harness/scroll.html` + `harness/scroll.jsx` montan la petición literal —**cada
vez que bajas hay algo 3D**— sobre una página larga de ocho secciones, y
verifican la arquitectura recomendada antes de tocar BAYONA.

Medido con `harness/scroll-demo-test.cjs`:

| Comprobación | Resultado |
|---|---|
| Lienzos WebGL simultáneos | **1 en los 8 tramos** y 1 en móvil |
| Escena activa por tramo | cambia con el scroll: bridge → method → barbell → punchbag → levels → timeline → vault → habitat |
| Errores de página | **0** |
| Tramos con contenido pintado | 8/8 (21-68 KB por captura, ninguno negro) |

Dos cosas que la demo exigió y que hay que arrastrar al merge:

- **El objeto se desplaza hacia el lado que no ocupa el texto.** Sin desplazamiento
  por tramo, el 3D tapa el titular y la composición se convierte en ruido. Ojo: en
  la demo se resolvió envolviendo la escena en un `<group position={offset}>`, y
  eso **no existe pasando por `SceneMount`** — ver la sección del cycler.
- **El suelo de una escena de producto no puede medir 6 × 4 m**: su borde corta el
  encuadre en diagonal y delata el decorado. Ampliado a 24 × 18.

`timeline` se deja centrada a propósito: es un pasillo que se atraviesa, y
desplazarlo rompería la idea.

## La pieza que faltaba: `SceneCycler`

`harness/engine/scene/SceneCycler.jsx` es el componente que convierte "un lienzo
por ruta" en algo que se pueda escribir una vez y usar en las 8 rutas. Recibe una
lista de `{ id, variant, sectionId, params }`, observa las secciones con
`IntersectionObserver` y monta **un** `SceneMount` cuya `config.variant` cambia.

Probado en `harness/cycler.html` contra el motor **auténtico** (copia verbatim de
`SceneMount.jsx`, `Scene3D.jsx`, `sceneConfig.js`, `capabilities.js` y
`CapabilityProvider.jsx` del repo; solo `ExperienceProvider` y `analytics` son
stubs declarados). Medido con navegador real, no con lint:

| Comprobación | Resultado |
|---|---|
| Lienzos WebGL en 9 secciones | **1**, y sigue siendo 1 tras cambiar desktop↔mobile |
| Variante activa por sección | 9/9 correctas (bridge→method→barbell→punchbag→dumbbells→levels→timeline→vault→habitat) |
| Hit-test `elementFromPoint` en los 4 CTAs | los 4 reciben el clic; ninguno queda tapado por el lienzo |
| Errores de consola | **0** |
| Degradación móvil sobre el motor | `instanceCount` 12→8 y 48→8 al pasar a mobile |

Tres cosas que solo salen escribiéndolo contra el motor:

1. **`SceneMount` no reenvía `scrollProgress`** (`Scene3D` sí lo acepta). El
   engine publica además un único `MotionValue` con el progreso de **toda** la
   página, así que una escena por sección vería su animación comprimida en un
   tramo de 0.1. Resuelto **sin tocar el motor**: el cycler provee
   `ScrollContext` con una fuente local 0→1 calculada sobre la sección activa
   (0 al entrar por abajo, 0.5 centrada, 1 al salir por arriba). Es un objeto
   mutable con `.get()`, que es lo que acepta `readScroll`, así que cambiar de
   sección no re-renderiza React.
2. **El encuadre por variante estaba roto en el motor, y no se veía en las
   capturas.** R3F aplica la prop `camera` del `<Canvas>` **al crearlo**, no cuando
   cambia. `Scene3D.jsx:77` pasa `camera={{ position: config.params.cameraPosition }}`
   y con un lienzo que recorre nueve variantes las nueve se veían con la cámara de
   la primera. Medido con `harness/engine/scene/probe.jsx`: en la sección de
   mancuernas la cámara viva seguía en `[-0.95, 0.2, 3.6]` (la del bridge) mientras
   el registro pedía `[-1.1, 1, 3]`. Con un `SceneMount` por ruta y una sola
   variante no se nota porque el lienzo nace con esa cámara; con el cycler es
   bloqueante.
   **Parche propuesto** (ya validado en el banco, ver la tabla de abajo): un
   `SceneCamera` dentro del `<Canvas>` que hace `camera.position.set(...)` en un
   `useEffect` indexado por los tres números. Son ~12 líneas en `Scene3D.jsx`, no
   tocan DPR ni frameloop ni sombras, y arreglan también `/programs`, que cambia de
   variante con la prop `scene=` sin desmontar el lienzo.
   El banco lleva el fichero con el parche aplicado y una cabecera
   `DESVIACIÓN DEL FICHERO DE BAYONA` que marca exactamente qué se añadió, para que
   nadie crea que es el original.
3. **El recorte móvil puede romper un objeto.** `MOBILE_MAX_INSTANCES = 8` se
   aplica sobre `params.instanceCount`, y en `vault` dejaba 8 billetes finos: no
   era una pila más pequeña, era una pegatina. Corregido en `VaultScene` escalando
   la separación y el grueso con el número de instancias, de modo que la **silueta
   mide lo mismo** con 48 que con 8. Verificado con dos capturas, desktop y
   móvil, misma altura de pila.

Y una regla que salió del revés: `PunchBagScene` **no** lee `instanceCount`. Sus
eslabones salen de la caída y el paso de cadena; recortarlos a 8 dejaría el saco
colgando del aire. Ahí la degradación buena es la densidad de segmentos
(`lod(caps)`: menos caras en el cilindro y los anillos), que baja triángulos y
respeta la silueta. Lo mismo en `dumbbells`, donde sí es seguro: 8 mancuernas
repartidas en 3/3/2 siguen siendo un mueble.

### Medición con la sonda del grafo (no con la vista)

`harness/engine/scene/probe.jsx` envuelve cada variante del registro del banco y
publica en `window.__probe` la cámara viva y el `count` de cada `InstancedMesh`.
Con el parche de cámara aplicado, recorriendo las 9 secciones en orden:

| Sección | Cámara pedida | Cámara viva | Instancias en el grafo |
|---|---|---|---|
| entrada | [-0.95, 0.2, 3.6] | **igual** | — |
| metodo | [1.05, 0.25, 3.4] | **igual** | — |
| barra | [1.15, 0.75, 2.6] | **igual** | — |
| saco | [1.35, 1.35, 2.6] | **igual** | 60 eslabones en 1 malla |
| mancuernas | [-1.1, 1, 3] | **igual** | 24 cabezas + 12 mangos en 2 mallas |
| niveles | [1, 0, 3.6] | **igual** | — |
| historia | [0, 0.2, 4] | **igual** | — |
| caja | [1, 0.35, 2.8] | **igual** | 48 billetes en 1 malla |
| casa | [-0.85, 0.4, 4.4] | **igual** | — |

**9/9 encuadres correctos, 1 solo `<Canvas>` en todo el recorrido.** En móvil, las
mismas secciones dan 16+8 (mancuernas) y 8 (billetes): la degradación del motor
llega al grafo, no solo al `params`.



Medidas con `harness/verify-a11y-mobile.cjs` y `harness/audit-scenes.cjs`, sobre
el banco con las mismas versiones de three/R3F que BAYONA:

| Comprobación | Resultado |
|---|---|
| Contrato de escena (9 ficheros) | **9/9** — parse JSX con el esbuild del proyecto, `export default`, props, cero imports fuera del contrato, cero referencias a assets |
| Integridad espacial | **8/8 sin NaN**, todas dentro de cámara |
| `reduced-motion` (R7.4) | **8/8**: dos capturas separadas 1,8 s a la misma pose salen **idénticas** con la opción activada, y distintas sin ella |
| Móvil 390×844 sobre la demo | **1 lienzo**, sin desborde horizontal, titular a 34 px, 0 errores |
| Tipografía de las etiquetas 3D | Repintadas tras `document.fonts.ready`; verificado cargando el `montserrat-normal-900-latin.woff2` **real de BAYONA** en el banco |

Nota sobre la última fila: sin la fuente web instalada en el banco, cualquier
prueba de tipografía miente — sale el fallback del sistema y parece correcto. Por
eso se copiaron los woff2 del proyecto a `harness/fonts/`.

## Montado sobre la home REAL (copia aislada, 2026-09-19 22:36)

Para no tocar el repo ocupado se construyó `../bayona-live`: copia de `src/`,
`vite/`, `index.html` y `package.json`, con `node_modules` y `public` como
**junctions** de lectura y `cacheDir: '.vite-cache'` + `port 5199` para que el
servidor no escriba ni pise el `vite preview` que ya estaba en 4173. Sobre esa
copia, con el suministro, el parche de cámara y el cycler cableados en `Home.jsx`:

| Medición | Antes | Después |
|---|---|---|
| Lienzo WebGL visible bajando por `/` | **0 de 15 tramos** | **19 de 21 tramos** |
| `<canvas>` totales en la página | 0 | **1** |
| Variante por tramo | — | bridge → method → vault → punchbag → dumbbells → habitat → timeline (7 distintas) |
| CTA con el lienzo puesto | — | `RECLAMAR` recibe el clic en su centro |
| Contexto WebGL vivo | — | sí (`webgl2`/`webgl` obtenido del nodo) |

Los 2 tramos sin lienzo son el 95 % y el 100 %: el pie legal y el cierre, que se
excluyen a propósito.

**Dos defectos que salieron midiendo en la página real, no en el banco:**

1. **El `IntersectionObserver` se queda con referencias y se congela.** La home
   monta y sustituye secciones después del primer render (`StickyStage`,
   `LeadMagnet`, lazy), el observer acaba mirando nodos muertos y el paso activo
   deja de cambiar: medido con `dumbbells` siendo "la sección más visible" del
   42 % al 75 % mientras en pantalla había otra distinta. Cambiado a un listener
   de scroll con `requestAnimationFrame` que **re-consulta cada sección por id**
   en cada cuadro: inmune a la sustitución, y cuesta 8 `getBoundingClientRect`
   por frame. Con esto la cobertura pasó de 6/13 a 19/21.
2. **`position: relative` con `z-index: auto` no crea contexto de apilamiento**,
   así que la capa con `z-index: -1` se iba detrás del fondo opaco de la sección.
   El host necesita `isolation: isolate`, que es lo que hace que "-1" signifique
   "detrás del contenido pero delante de mi fondo".

**Lo que NO está bien, dicho sin adornos:** el mecanismo funciona pero el
**direction de arte no**. En la captura del tramo del método, la escena se ve
como un ladrillo terracota plano sobre una sección color crema — las escenas
están diseñadas y encuadradas contra fondo negro (`theme.color.black`), y varias
secciones de la home son claras. Hace falta, por sección: encuadre con la
`cameraPosition` real de esa sección, y decidir si la escena va sobre fondo
oscuro o se le baja el contraste. Con 19/21 tramos cubiertos y 1 solo lienzo, la
parte de arquitectura está; la de gusto no.

**Nada de esto está en `C:\Users\sevis\BAYONA`.** La sesión hermana escribió por
última vez a las 22:18 (`Home.jsx`, `sectionBlueprints.js`,
`measure-hierarchy-and-mobile.mjs`) y seguía activa al empezar esta fase, así que
el árbol real no se ha tocado: todo lo anterior es la copia `../bayona-live`.


### Pase de encuadre (segunda vuelta sobre la home real)

El primer render sobre la página destapó que el problema **no era de color sino
de encuadre**, y tuvo que corregirse tres veces midiendo:

1. **El lienzo medía la sección, no la pantalla.** Con la capa en
   `position: absolute; inset: 0` dentro de una sección de 1556 px, R3F pintaba un
   canvas de 1556 px y la cámara (fov 45 vertical) quedaba con una aspect
   imposible: solo se veía una franja y el bloque del método tapaba la sección
   entera. Cambiando la capa a `position: fixed` el canvas pasa a medir una
   pantalla (423×308 medidos) y el objeto se lee como lo que es.
2. **`fixed` desborda a la sección vecina** — se veía el arco del timeline pintado
   sobre la sección crema de arriba. La capa se recorta ahora a la banda visible de
   su sección (`top = max(0, rect.top)`, `height = min(rect.bottom, view) - top`),
   escribiendo el estilo directo y no por estado, para no re-renderizar por
   fotograma.
3. **El recorte se calculaba antes de re-portalizar.** Al cambiar de sección React
   mueve la capa a otro padre *después* de la última medida, así que el primer
   fotograma conservaba la banda anterior. Añadido un refresco en un efecto
   indexado al anfitrión + un `requestAnimationFrame`.

Estado medido tras los tres pasos, barriendo las 21 posiciones de la home:
**21/21 tramos con escena montada**, 7 variantes distintas, `z-index: -1`
(detras del texto, sobre el fondo de su sección), **1 solo `<canvas>`**.

**Defecto abierto → cerrado.** El sangrado bajó de 6 tramos a 2 y quedó un
desbordamiento de **1779 px**. Instrumentado el fotograma que fallaba, la causa no
era ninguna carrera con el portal: el anfitrión activo (`lead-magnet`) estaba
**entero fuera de pantalla** (`rect.top = -2504`) y el suelo de 120 px que había
puesto en el recorte obligaba a pintar un lienzo encima del pie legal. Corregido:
si la banda visible de la sección es menor que 120 px, **la capa se oculta**. Sin
sección visible no hay escena, y eso es lo correcto — el cierre legal no lleva 3D.

Medición final de la home, barriendo las 21 posiciones:

| | resultado |
|---|---|
| Tramos con escena montada | **19 / 21** (los 2 restantes son pie legal y cierre) |
| Sangrado sobre sección vecina | **0 px en 0 tramos** |
| `<canvas>` en la página | **1** |
| Variantes distintas sirviendo | 7 |

Y el banco, con el MISMO componente ya a tres consumidores de estilo (`portal`
activado solo en la home): **9/9 encuadres, 1 lienzo, CTA que recibe el clic y
registra el evento**.

### Segunda ruta y consolidación: `RouteSceneCycler`

Lo que descubrió `/resources` es que el autodescubrimiento de secciones no puede
depender de la forma de una página concreta. El atajo de "hermanas de la primera
`<section>`" funciona en `/` (14 secciones), pero en `/resources` las 11 cuelgan de
un contenedor intermedio y no encontraba más que 1 → la capa quedaba oculta en los
21 tramos. Regla estructural correcta: **`section:not(section section)`**, una
sección sin otra sección por encima.

Con esa regla se consolidó un único componente de montaje, `RouteSceneCycler`
(reglas variante-por-titular + ciclo de reserva + encuadre), y `HomeSceneCycler`
quedó reducido a configuración. Medido en las dos rutas con el mismo mecanismo:

| Ruta | Tramos con escena | Sangrado a vecina | `<canvas>` | Variantes | Errores JS |
|---|---|---|---|---|---|
| `/` | **19 / 21** | **0 px** | **1** | 8 | **0** |
| `/resources` | **19 / 21** | **0 px** | **1** | 5 | 0 |

Faltan por cablear `/community` (11 secciones) y `/faq` (3), que es copiar el
montaje de `/resources` con sus reglas; el mecanismo ya no cambia.

### Cuatro rutas con un solo mecanismo (montaje a nivel de router)

Los montajes por página se movieron a `App.jsx`, junto al `<Routes>`, con
`key={pathname}` para que la capa se re-descubra al cambiar de ruta. Las reglas
variantes-por-tramo salieron a `src/config/routeSceneRules.js`: datos, no lógica.
Y el descubrimiento necesitó un reintento por `requestAnimationFrame`, porque las
rutas van con `React.lazy` dentro de un `<Suspense>` y en el primer efecto puede
que la página aún no tenga secciones en el DOM — sin eso, `/community` y `/faq` se
quedaban sin pasos para siempre.

Medido barriendo cada ruta (9 posiciones, navegador real, misma copia):

| Ruta | Secciones nivel 1 | Tramos con escena | Sangrado | `<canvas>` | Variantes |
|---|---|---|---|---|---|
| `/` | 14 | **8 / 9** | **0 px** | **1** | 5 |
| `/resources` | 11 | **8 / 9** | **0 px** | **1** | 5 |
| `/community` | 13 | **8 / 9** | **0 px** | **1** | 5 |
| `/faq` | 4 | **6 / 9** | **0 px** | **1** | 2 |

El tramo que falta en cada ruta larga es el pie legal, donde la capa se oculta a
propósito. `/faq` es corta (4 secciones) y su último tercio es cierre y enlaces.

**Cuatro rutas, un componente, un lienzo por ruta, cero desbordes.** Faltan por
cablear `/about`, `/programs`, `/shop`, `/parkour-academy` y los planes: mismo
montaje, reglas nuevas.

### Barrido de las 8 rutas del sitio

Al mover el montaje al router, las rutas que no tenían capa propia heredaron el
ciclo por defecto sin tocar su JSX. Medido barriendo 9 posiciones por ruta:

| Ruta | Secciones nivel 1 | Tramos con 3D | Dos lienzos a la vez | `<canvas>` en la ruta |
|---|---|---|---|---|
| `/` | 14 | 8 / 9 | 0 | 1 |
| `/resources` | 11 | 8 / 9 | 0 | 1 |
| `/community` | 13 | 8 / 9 | 0 | 1 |
| `/faq` | 4 | 6 / 9 | 0 | 1 |
| `/about` | 9 | 7 / 9 | **1** | **2** |
| `/programs` | 13 | 7 / 9 | 0 | **2** |
| `/shop` | 7 | 8 / 9 | 0 | 1 |
| `/parkour-academy` | 10 | 8 / 9 | 0 | 1 |

**El hallazgo incómodo:** `/about` y `/programs` ya montan su propia capa (`globe`
y `showroom`), así que el cycler les sumaba un **segundo contexto WebGL** y dos
escenas pintando en el mismo tramo. Arreglado parcialmente: el cycler ahora
**descarta las secciones que ya tienen un `<canvas>`**, y con eso `/programs` pasa
de solaparse a 0 tramos dobles (en `/about` queda 1, porque el globo es una capa
fija del hero que sigue en pantalla mientras bajas).

**Decisión abierta para el merge, y es tuya:** en esas dos rutas hay dos caminos
igualmente válidos — (a) dejar que `globe`/`showroom` sean un paso más del cycler
y quedarte con **1 contexto** en todo el sitio, o (b) mantener sus capas propias y
aceptar 2 contextos ahí. (a) es lo coherente con el presupuesto de carga, pero
significa tocar `AboutGlobeLayer.jsx` y el prop `scene=` de `Programs.jsx`, que
son justo los ficheros que la otra sesión está moviendo.

El tramo que falta en cada ruta es el pie legal / el cierre de enlaces, donde la
capa se oculta a propósito.

## Medido en BUILD de producción, no solo en dev — y sale caro

Todo lo anterior está medido sobre `vite dev`. Construí la copia aislada
(`outDir` y `cacheDir` propios, el `dist/` del repo no se toca) y serví el build.
A/B con la misma ruta, misma máquina, misma herramienta:

| `/faq` | cycler OFF | cycler ON |
|---|---|---|
| JS descargado | **235 kB** | **470 kB** |
| `vendor-three` | **no se pide** | **232 kB gzip** |
| `<canvas>` | 0 | 1 |

**El montaje global en `App.jsx` mete `vendor-three` (237 kB gzip) en el chunk de
entrada de TODAS las rutas**, incluidas las cinco que hoy no cargan three. Eso
viola la regla que el propio proyecto se puso (`vendor-three` solo en `/`,
`3D-PERFORMANCE-BASELINE.md`) y anula el argumento de "un solo lienzo por ruta es
barato": el lienzo sale barato, la **descarga** no.

Lo intenté arreglar quitando el `import { sceneRegistry }` estático de
`RouteSceneCycler` (los `z` de encuadre ahora son datos locales), y **no funcionó**:
el build sigue pidiendo vendor-three en `/faq`. El mecanismo exacto sigue sin
aislar; la sospecha es que `SceneCycler → SceneMount` entra en el grafo del entry y
`SceneMount` ya no basta para mantener `Scene3D` detrás del límite dinámico.

**Y apareció un fallo que en dev no existía:** en el build, `/faq` tiene el
`<canvas>` montado pero la capa está `display: none` en los **9/9** tramos
(0 % de cobertura). En dev, con el mismo código, daba 6/9. Es decir, **las
coberturas de las 8 rutas que reporté antes son medidas en dev y no están
confirmadas en producción.**

### Lo que hay que decidir antes de mergear nada

1. **Montaje global vs por ruta.** Con el global, cada ruta paga three aunque no
   tenga escena. Alternativa: montar el cycler solo en las rutas donde el 3D aporta
   (las 3 que ya cargan three hoy) y cubrir el resto con movimiento 2D.
2. **Por qué el build oculta la capa** en rutas cortas. Hasta tener esto medido, la
   afirmación honesta es "funciona en dev en 8 rutas", no "funciona en el sitio".

Nada de esto está en `C:\Users\sevis\BAYONA`.











## Cómo se retoma (estado al 2026-09-19 21:15)

Servidores que dejé levantados, todos fuera del repo: `vite dev` de la copia en
**5199**, `vite preview` del build de la copia en **4174**, y el banco del
`SceneCycler` en **5188**. El `vite preview` original de BAYONA sigue en 4173, sin
tocar. Para parar los míos: `npx kill-port 5199 4174 5188`.

**No hay nada pendiente de guardar ni de limpiar**: `bayona-live/` es una copia de
trabajo con `dist/`, `.vite-cache/` y `node_modules`/`public` como junctions de
solo-lectura. Se puede borrar entera sin tocar BAYONA.

Orden recomendado al retomar, de menor a mayor riesgo:

1. **Elegir el alcance del montaje.** La evidencia dice que el global es caro:
   mete `vendor-three` (232 kB gzip) en `/faq`, `/resources`, `/community`,
   `/shop` y `/parkour-academy`, que hoy no cargan three. Lo conservador es montar
   el cycler **solo en las rutas que ya lo cargan** (`/`, `/about`, `/programs`) y
   tratar el resto como tramos de movimiento 2D. Sigue cumpliendo "bajes donde
   bajes hay algo en movimiento" sin romper el presupuesto.
2. **Arreglar el enlazado en producción antes que ninguna otra cosa.** Síntoma:
   `/faq` da 3/9 tramos en el build y 6/9 en dev. Causa probable: las `<section>`
   de la ruta saliente viven unos cientos de ms más de lo que tarda el escaneo, y
   el re-escaneo por `MutationObserver` todavía enlaza con el árbol equivocado.
   El siguiente paso concreto es registrar, en el fotograma que falla, `steps` vs
   `document.contains()` vs el `rect` de cada sección — no tocar código a ciegas.
3. Después, el pase de gusto: variante y encuadre por sección, que ahora son una
   primera pasada automática por regex del titular.

Lo que **sí** está verificado y es reutilizable tal cual: las 10 escenas (contrato
10/10), el parche de cámara en `Scene3D`, la degradación móvil llegando al grafo,
y el hit-test de CTAs.



## Bug de produccion aislado (2026-09-20 01:54): el paso activo no cambia

Barrido `/faq` sobre el **build** (puerto 4174), 9 posiciones, leyendo el DOM real:

| % scroll | `data-scene-cycler` | anfitrion del portal | capa visible |
|---|---|---|---|
| 0 | `1-dumbbells` | `faq-contact` | no |
| 12,5 | `1-dumbbells` | `faq-section` | si |
| 25 | `1-dumbbells` | `faq-contact` | no |
| 37,5 | `1-dumbbells` | `faq-section` | si |
| 50 | `1-dumbbells` | `faq-contact` | si |
| 62,5 | `1-dumbbells` | `faq-section` | no |
| 75 | `1-dumbbells` | `faq-contact` | si |
| 100 | `1-dumbbells` | `faq-contact` | no |

Dos hechos que no cuadran juntos y ahi esta la pista:

1. **`activeId` no cambia en toda la pagina.** La seleccion del paso esta helada
   en el indice 1, asi que el 3D que se ve es siempre el mismo objeto.
2. **El anfitrion del portal si cambia**, alternando entre dos secciones.

Es decir: el nodo que recibe la capa no es el que corresponde al paso declarado.
En dev no pasa (alli la cobertura subia a 6/9 y las variantes rotaban), asi que la
diferencia esta en lo que el build hace y el dev no: **los ids se asignan durante
el re-escaneo que dispara el `MutationObserver`**, y en produccion el arbol llega
montado en otro orden por el `React.lazy` + `AnimatePresence`. Tambien pesa que
`RouteSceneCycler` filtra `!node.querySelector('canvas')`: en cuanto la capa se
portaliza dentro de una seccion, esa seccion pasa a tener un canvas y **queda
excluida en el siguiente escaneo**, lo que reindexa los pasos y congela la
selection. Esa es ahora mismo la hipotesis con mas supporte de los datos, y es la
que hay que comprobar primero.

**Arreglo propuesto, y es de diseno no de parche:** el descubrimiento de secciones
y la asignacion de ids tienen que ocurrir **una sola vez por ruta**, y la capa no
puede usarse a si misma como criterio de exclusion. Eso significa marcar el
contenedor de la capa con un atributo propio (`data-scene-layer`) y excluir por
atributo, no por presencia de `<canvas>`.

## Orden de trabajo

**Fase 0 — liberar el repo.** Esperar a que la sesión hermana termine y pedirle
un commit. Sin eso nada de abajo es posible.

**Fase 1 — reabrir lo que ya está hecho** (no crea nada nuevo, solo enciende):
`hologram` en `/shop`, `parkour` en `/parkour-academy`, y decidir `hero`.
Cada una necesita su entrada en `3D-ADMISSION-RECORD.md` y su sitio en
`SCENE_ALLOWLIST` (`src/test/fase7aSceneGovernance.test.js:23-30`).

**Fase 2 — llevar el 3D a las tres rutas ciegas.** Aquí entran las escenas nuevas
de `bayona-3d-supply/scenes/`, que ya están auditadas (7/7, cero NaN):

| Ruta | Secciones sin 3D | Escena propuesta | Por qué esa |
|---|---|---|---|
| `/resources` | 18 | `timeline` + `vault` | Es un archivo vivo: el recorrido (timeline) y el reto con premio (vault) son literalmente lo que la página vende |
| `/community` | 16 | `globe` (reutilizar la de About) + `bridge` | 12 personas con su ciudad = mapa; las transiciones entre grupos = umbral |
| `/faq` | 2 | `method` | "No es magia es método": abrir el método capa a capa bajo una pregunta |

**Fase 3 — objetos reales donde la página enseña producto.** `BarbellScene` ya
está hecha y medida (34 piezas, cotas de barra de competición). Falta el resto
del inventario de sala: rack, mancuernas, saco, banco, anillas. Estas van en
`/programs` y `/shop`, que son las rutas donde el usuario decide.

## Verificación obligatoria en cada fase

1. `npm run build` + `npx vitest run` (gobernanza de escenas incluida).
2. **LCP móvil** contra `3D-PERFORMANCE-BASELINE.md` (hoy 272 ms) y **0 kB de
   three.js en rutas sin lienzo** — `vendor-three` no debe salir de `/`.
3. `node scripts/measure-section-repetition.mjs`: los techos de
   `REPEAT_CEILING` solo pueden bajar.
4. Hit-test real (`document.elementFromPoint`) sobre cada CTA con el lienzo
   puesto: es la única forma de no repetir el bug del `pointerEvents`.
5. Capturas a 1440 y a 390 **miradas**, y auditoría de NaN con
   `harness/audit-scenes.cjs`, que es donde se vieron los dos fallos que ningún
   lint veía.

---

## Estado medido 2026-09-20 (build de producción, copia aislada `bayona-live`)

Medido con `harness/coverage.cjs` sobre `vite preview` en `127.0.0.1:4321`
(nunca en dev: en dev los tres fallos de abajo no aparecen).

| ruta | tramos con 3D | lienzos | sangrado |
|---|---|---|---|
| `/` | 14/14 reales | 1 | 0 px |
| `/about` | 6/6 | 2 (globe propia) | 0 px |
| `/programs` | 10/10 | 2 (showroom propia) | 1 px |
| `/shop` | 5/5 | 1 | 0 px |
| `/resources` | 8/8 | 1 | 0 px |
| `/community` | 11/11 | 1 | 0 px |
| `/faq` | 2/2 | 1 | 0 px |

El denominador excluye un `<section>` de 0 px que el cascarón pone al principio de
todas las rutas: no puede hospedar nada y ahora se filtra por altura.

### Cuatro defectos que se cerraron hoy

1. **`/faq` caía a 1 tramo de 9.** El escaneo paraba en el primer resultado no
   vacío y en esa ruta lo único vivo al primer fotograma era `share-invite` del
   cascarón. Ahora se comitea cuando la lista de secciones se repite 12
   fotogramas seguidas (estabilidad), con techo de 150.
2. **Orden de hooks condicional en `SceneCycler`.** Tres hooks estaban debajo del
   `if (!step) return null`. Subidos arriba. Además el `setHost(null)` de limpieza
   duplicaba el desmontaje del lienzo en cada cambio de sección.
3. **El objeto se encogía al bajar.** La capa se redimensionaba a la banda visible
   de su sección, R3F recalculaba el `aspect` en cada fotograma y el encuadre —
   resuelto con otro aspect— dejaba la barra en 130 px. La capa va ahora a pantalla
   y solo se RECORTA.
4. **El recorte no se aplicaba: sangrado de 385 a 662 px en las ocho rutas.**
   `ds-atelier.css` anima `clip-path` en los hijos de la sección, y en la cascada
   una animación gana a la declaración en línea: el navegador dejaba
   `inset(0px)`. Escrito con `setProperty(..., 'important')` vuelve a valer.
   Ojo al medir: Chrome colapsa los ceros y serializa `inset(624px 0px 0px)`.

### Encuadre: lo que sí y lo que no

La distancia se despeja del tamaño real (`SIZE` en metros por variante) y del
semiancho visible: `z = rx / (FILL * tan(fov/2) * aspect)`. Con eso la barra de
2,20 m, la caja de 60×50×40 y la hilera de kettles se ven grandes y completos.

**No se echa el objeto a una columna.** Se probó con `SIDE` 0,4 / 0,95 / −0,4 y
como control con la cámara fijada a mano en `x=3` (esa sí saca el objeto del
plano): el centro del objeto se movía ~30 px donde la proyección pedía 250. Mover
la cámara en x cambia la perspectiva, no desplaza limpio. La palanca correcta es
un offset sobre un `<group>` que envuelva la variante, y eso es un cambio de
motor. Hasta entonces el objeto es decorado centrado detrás del contenido.

### Pendiente de verdad, por orden de coste

- `vendor-three` (232 kB gzip) entra en las 8 rutas por montar el cycler en `App`.
  Es decisión de alcance, no bug: o se acepta 3D en todas las rutas, o el cycler
  se monta solo en las que estén en `SCENE_ALLOWLIST`.
- `/about` y `/programs` siguen con DOS contextos WebGL (su capa propia + el
  cycler en las secciones que no tienen lienzo).
- Cuatro objetos del inventario sin construir: báscula + tallímetro, cronómetro de
  intervalos, kit de recuperación, barra de dominadas + colchoneta.
- `ObjectInspector` (la vista de estructura tipo rack) no está ver a ojo todavía.
- El merge al repo real no se ha hecho: el otro agente sigue escribiendo ahí.

### Visibilidad real del 3D (no cobertura): auditada y corregida

Cobertura ≠ que se vea. Se añadió `harness/visibility-audit.cjs`: captura el
viewport con la capa encendida, la apaga, vuelve a capturar y **difiere píxeles**.
Eso es lo que responde a "tus elementos 3d no se ven", y destapó lo que ningún
otro chequeo veía.

Primera pasada — 9 tramos cambiaban **0,0 % de los píxeles** (no poco contraste:
literalmente nada). Causa: en el orden de pintura de un contexto de apilamiento,
un hijo en flujo y sin posicionar se pinta POR ENCIMA de un descendiente con
`z-index: -1`. Basta un envoltorio decorativo con degradado para tapar el lienzo.
Confirmado con control: forzando `z-index: 999` desde fuera, el banco aparecía.

Arreglo: el lienzo pasa a `z-index: 0` dentro de la sección y se suben a `1` los
hijos de la sección que llevan texto. Después, `pickOpaqueHost` (portalizarse
dentro del envoltorio opaco) se probó y **se revirtió medido**: `/about` bajaba de
5 tramos sanos a 2 y `/community 0-barbell` de 57,8 % a 0,9 %, porque dentro de un
nodo con `overflow: hidden` el recorte en coordenadas de ventana deja de cuadrar.

Después de la corrección, % de píxeles que aporta el 3D por tramo:

| ruta | tramos sanos | rango de aportación |
|---|---|---|
| `/` | 15/15 | 13,3 % – 49,7 % |
| `/about` | 5/7 | 22,2 % – 57,6 % |
| `/programs` | 15/17 | 11,6 % – 49,7 % |
| `/shop` | 6/6 | 6,5 % – 50,4 % |
| `/resources` | 9/9 | 21,2 % – 51 % |
| `/community` | 17/18 | 8,4 % – 64,2 % |
| `/faq` | 3/3 | 20,2 % – 38,8 % |

Quedan 2 tramos débiles y son los que ya tienen capa 3D propia montada con
`React.lazy` (`/about 4-plyobox` 0,6 %, `/community 8-barbell` 0,8 %): el escaneo
de secciones pasa una vez por ruta, así que esas capas aún no existían al commitear
y luego tapan la nuestra. El cycler ahora **esconde** la nuestra en ese caso
(`visibility-audit` lo confirma), que es lo correcto: en ese tramo el 3D lo pone la
página. Convertirlo en un paso del cycler es la decisión abierta (b) de arriba.

Regla 4 de verificación del propio PLAN-MERGE (hit-test de CTA) automatizada en
`harness/ctatest.cjs`: **36/36 tramos muestreados con todos los enlaces y botones
alcanzables** con el lienzo puesto.

### Cuatro objetos nuevos (2026-09-20, cierre del inventario)

`ScaleScene` (báscula con tallímetro), `IntervalTimerScene` (cronómetro tabata
40/20 con sus dos arcos de ángulo proporcional al tiempo), `RecoveryKitScene`
(rodillo de 330×150 mm, pelota de 80 mm y mini band de 660 mm) y
`PullUpBarScene` (barra de 1,20 m a 2,15 m con ménsulas, riostra calculada y
colchoneta de 1200×1000×100 mm con el grosor grabado en el canto).

Registro en `sceneRegistry.js` con `assets: []`, entrada en `SIZE` con sus metros
reales, y reglas nuevas en `routeSceneRules.js`: `/parkour` era la única ruta que
no tenía reglas propias y rotaba por el ciclo genérico.

Contrato **21/21**. Los cuatro se miraron en render y los cuatro salieron mal la
primera vez; los defectos y sus correcciones están en `INVENTARIO-OBJETOS.md`.

**Cambio global de encuadre**: `FILL` de 0,42 a 0,58. Con 0,42 un objeto de 2 m
pedía 6,9 m de cámara y ocupaba un tercio del fotograma. Medido después: `/`
sube de 28,6 % a 33,4 % en el primer tramo, `4-scale` al 51,2 %, `7-dumbbells` de
40,8 % a 51,6 % y ningún tramo por debajo del 14 %.


### `ObjectInspector` mirado por fin, y el bug de medida que tenía dentro

Estaba construido pero **nunca se había visto en render**. Probado en el banco
(`?scene=viewer&object=X&structure=1`) con un script que además **arrastra el
puntero y mueve la rueda** para comprobar que se puede rodear el objeto:
`harness/insp*.cjs`, `harness/boxes.cjs`.

Funciona: la cámara orbita (`[1.9,1.1,2.3] → [-2.81,0.77,1.14]` con un
arrastre) y la jaula y las tres cotas siguen al objeto. **Pero la medida estaba
mal y era invisible a simple vista**: `Box3.setFromObject` no distingue producto
de escenario, y todas las escenas llevan un plano de suelo de 24 × 18 m. La
barra olímpica se medía como `[24, 0.46, 18]` — las cotas eran el suelo.

Arreglo en dos partes: los decorados se marcan con `userData.noMeasure` (12
suelos + el muro de la barra + la tarima de la caja pliométrica) y el inspector
poda ese subárbol al medir. Además **reintenta la medida hasta ~1,5 s**, porque
el objeto entra por `React.lazy` dentro del `<Suspense>` del viewer y medido en
el primer fotograma el grupo está vacío: sin esto, las cotas no aparecían nunca.

Caja medida por objeto, después del arreglo (metros):

| objeto | caja | es |
|---|---|---|
| barbell | 2,23 × 0,46 × 0,46 | barra olímpica + disco de 450 mm |
| plyobox | 0,40 × 0,60 × 0,50 | las tres caras de la caja |
| scale | 0,36 × 2,00 × 0,37 | plataforma + columna del tallímetro |
| pullupbar | 1,26 × 2,17 × 1,41 | vano de barra + ménsula + colchoneta |
| punchbag | 0,43 × 1,86 × 0,43 | saco + cadena + giratoria |
| dumbbells | 1,80 × 0,78 × 0,66 | mueble de 12 pares |
| kettlebell | 1,10 × 0,17 × 0,62 | tramo de la hilera |
| bench | 1,16 × 1,13 × 0,56 | banco con el respaldo subido |
| weightstack | 0,30 × 0,66 × 0,19 | pila selectorizada |
| platetree | 0,99 × 0,64 × 1,05 | árbol de tres brazos |
| timer | 0,34 × 0,47 × 0,28 | cronómetro con su pie |
| recovery | 0,90 × 0,23 × 0,24 | rodillo + pelota + mini band |

**Decisión que sigue siendo tuya:** el inspector está listo pero **no lo monta
ninguna página**. Enlazarlo en `/shop` cuesta un **segundo contexto WebGL** en
esa ruta (el del cycler + el del visor) y captura de punteros sobre la ficha del
producto, que es justo lo que el engine prohíbe por defecto
(`pointerEvents: 'none'`). O se paga eso, o el visor va en una página de
producto propia (`/shop/:slug`), donde no hay cycler que competir.


## Ensayo de merge contra el repo REAL (2026-09-20 07:20)

El repo de Sebastián cambió mucho desde que se copió la aislada (`/app` pasó a
ser la página oficial larga de BAYONA+, el mando se fue a `/panel`, `Faq.jsx`
nuevo, ~30 ficheros compartidos distintos). Se refrescó la copia desde
`C:\Users\sevis\BAYONA\src` —**solo lectura del repo, sin escribir allí**— y se
reinstaló el suministro con un script:

    node merge/aplicar-supply.cjs <ruta-BAYONA> [--dry]

Idempotente, aditivo (no reescribe las variantes existentes del registro), copia
solo las escenas referenciadas, y hace el parche de cámara en `Scene3D` y el
montaje en `App`. Build limpio contra el árbol de hoy.

Medido después del ensayo, sobre las rutas de HOY:

| ruta | tramos con 3D | sangrado |
|---|---|---|
| `/` | 14/14 | 0 px |
| `/about` | 6/6 | 0 px |
| `/programs` | 10/10 | 0 px |
| `/shop` | 5/5 | 0 px |
| `/resources` | 8/8 | 0 px |
| `/community` | 11/11 | 0 px |
| `/faq` | 2/2 | 1 px |
| `/parkour-academy` | 8/8 | 0 px |
| `/app` (página larga nueva) | 8/8 | 0 px |
| `/panel` | 0 secciones de primer nivel: es app-shell, no paga three.js | — |

Reglas nuevas para `/app` (rutina→cronómetro, progreso→pila, datos→báscula,
recursos→mancuernas, cuerpo→kettlebell, desarrollo→barra). Aportación medida por
píxel: de 4 tramos muertos a 2, y el resto entre 22 % y 52 %.

### Límite que NO se ha resuelto, y por qué

Dos o tres tramos de `/app` y uno de `/about` siguen aportando ~0 px: el lienzo
está montado y visible, pero lo tapa **un envoltorio del propio contenido que
lleva fondo opaco y texto dentro**. Con `z-index: -1` lo tapa; subiéndolo a `0`
y subiendo los hijos con texto a `1` también, porque lo que cubre es el fondo de
ese hijo. El chequeo de oclusión por punto central ya no lo pilla (el elemento
del centro sí está dentro del anfitrión).

Se probó y se descartó con números: portalizarse dentro del envoltorio opaco
(peor: `/about` de 5 tramos sanos a 2), y alinear el centro del lienzo con el
centro de la banda mediante `translateY` (no arreglaba `/app` y bajaba otros dos
tramos; revertido).

La salida limpia **no es un truco del cycler**: es que la plantilla de sección
reserve un hueco de decorado (p. ej. un `<div className="section-decor">` como
primer hijo, sin fondo), y el cycler se portalice ahí. Eso es un cambio de
markup en `sectionBlueprints`/páginas, y lo tiene que decidir quien mantiene el
diseño.
