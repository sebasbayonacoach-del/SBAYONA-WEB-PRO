# Suministro 3D para BAYONA — 10 escenas nuevas y el componente que las sirve

**Por qué está esto fuera de `C:\Users\sevis\BAYONA`:** una sesión hermana está
escribiendo en ese repo ahora mismo (286 rutas sin commitear; `Programs.jsx` y
`sectionBlueprints.js` modificados minutos antes de esta entrega). Nada de aquí
toca ese árbol. Las rutas de `import` están escritas **para el destino final**
(`src/engine/scene/`), así que copiar y pegar funciona sin reescribir nada.

**Dos entregas, y la segunda es la que cierra el hueco:**

- `scenes/` — 10 variantes nuevas (6 arquetipos de layout + 3 objetos de producto
  reales + `StudioEnvironment`, que es infraestructura de iluminación).
- `harness/engine/scene/SceneCycler.jsx` — el componente que hace que "cada vez
  que bajo haya algo 3D" cueste **un** contexto WebGL por ruta, no uno por sección.
- `host/RouteSceneCycler.jsx` + `host/routeSceneRules.js` — el montaje a nivel de
  router: descubre las secciones de la ruta, elige variante por titular y encuadra
  contra el hueco que deja el texto. `routeSceneRules.js` son datos, no lógica, así
  que el guion de una página se toca sin abrir componentes. Verificado en 4 rutas. Probado contra el motor auténtico; los números y el parche de cámara
  que salió del están en **`PLAN-MERGE.md`**, sección "La pieza que faltaba".

## Qué hay aquí y qué no

La sesión hermana acaba de crear `src/config/sectionBlueprints.js`: un vocabulario
cerrado de 17 layouts y un medidor anti-repetición. Eso es **el mapa**, y ya está.
Lo que faltaba es **el suministro**: hay 8 variantes de escena en
`src/engine/config/sceneRegistry.js` y 3 están apagadas. Para que "cada vez que
baje haya algo 3D" hacen falta más arquetipos, no más documentos.

Estas 6 escenas son procedurales, sin assets, sin dependencias nuevas y respetando
el contrato del motor.

| Variante | Layout que sirve | Qué idea representa (pregunta del §39) | Coste |
|---|---|---|---|
| `timeline` | `timeline` | El recorrido de la marca: bajar es caminar los años | 3 meshes, 9 geometurías |
| `vault` | `dashboard`, `interactive` | El dinero ficticio que se acumula al explorar | 1 `instancedMesh` (48 billetes, 1 draw call) |
| `bridge` | `bridge` | Cambiar de planta: un corredor con salida iluminada | 2 meshes |
| `method` | `editorial`, `closing` | "No es magia es método": el bloque se desmonta en capas | 1 grupo, 6 cajas |
| `levels` | `data` | Los 4 niveles de acompañamiento llenándose de dentro a fuera | 8 toros |
| `habitat` | `immersive-3d` | La habitación vacía que se amuebla entrenando (teaser del dashboard) | 10 meshes |

## Pegar en `src/engine/config/sceneRegistry.js`

Estos `defaults` son **los que se han medido en el banco**, no los del primer
borrador: las cámaras se retocaron una a una tras ver las capturas.

```js
  timeline: {
    component: lazy(() => import('../scene/TimelineScene.jsx')),
    defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.25, dissolve: 0, glowIntensity: 0.2, cameraPosition: [0, 0.2, 4.0] },
    assets: [],
  },
  vault: {
    component: lazy(() => import('../scene/VaultScene.jsx')),
    defaults: { particleCount: 0, instanceCount: 48, bloomIntensity: 0.4, dissolve: 0, glowIntensity: 0.3, cameraPosition: [0, 0.35, 2.6] },
    assets: [],
  },
  bridge: {
    component: lazy(() => import('../scene/BridgeScene.jsx')),
    defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0, dissolve: 0, glowIntensity: 0.2, cameraPosition: [0, 0.2, 3.4] },
    assets: [],
  },
  method: {
    component: lazy(() => import('../scene/MethodScene.jsx')),
    defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.3, dissolve: 0, glowIntensity: 0.25, cameraPosition: [0, 0.25, 3.2] },
    assets: [],
  },
  levels: {
    component: lazy(() => import('../scene/LevelsScene.jsx')),
    defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.35, dissolve: 0, glowIntensity: 0.4, cameraPosition: [0, 0, 3.4] },
    assets: [],
  },
  habitat: {
    component: lazy(() => import('../scene/HabitatScene.jsx')),
    defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.3, dissolve: 0, glowIntensity: 0.25, cameraPosition: [0, 0.4, 4.2] },
    assets: [],
  },
  barbell: {
    component: lazy(() => import('../scene/BarbellScene.jsx')),
    defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [2.3, 0.75, 1.8] },
    assets: [],
  },
  punchbag: {
    component: lazy(() => import('../scene/PunchBagScene.jsx')),
    // instanceCount 0 a propósito: los eslabones salen de la caída y el paso de
    // cadena. Declararlos aquí permitiría que el móvil los recortara a 8 y el
    // saco quedaría colgando del aire. Se degrada por densidad de segmentos.
    defaults: { particleCount: 0, instanceCount: 0, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [1.7, 1.35, 2.3] },
    assets: [],
  },
  dumbbells: {
    component: lazy(() => import('../scene/DumbbellRackScene.jsx')),
    // instanceCount = mancuernas: 12 en escritorio, 8 en móvil. Quitar mancuernas
    // sí es una degradación que respeta el objeto (el reparto por pisos se
    // recalcula sobre las que hay).
    defaults: { particleCount: 0, instanceCount: 12, bloomIntensity: 0.2, dissolve: 0, glowIntensity: 0.25, cameraPosition: [1.7, 1.0, 2.7] },
    assets: [],
  },
```

Y montar en la sección que corresponda:

```jsx
<SceneMount
  config={{ variant: 'timeline', postProcessing: false }}
  style={{ pointerEvents: 'none' }}
/>
```

`pointerEvents: 'none'` **no es opcional** en capas decorativas: es justo el bug
que la sesión hermana persiguió en `Scene3D.jsx:81` (el canvas se comía los CTAs).
`SceneMount` lo propaga a `interactive`.

## Cómo cubrir "3D en cada scroll" sin cargarse el móvil

Con 8 + 6 = **14 variantes** y 17 layouts, la regla práctica es:

- **Una escena 3D por tramo de scroll, nunca dos simultáneas visibles.** No
  montando un `SceneMount` por sección, que eran 67 contextos WebGL: montando
  **uno por ruta** con `SceneCycler`, que le cambia la variante según qué sección
  manda. `SceneMount` ya congela el frameloop a `demand` cuando el lienzo sale del
  viewport (`Scene3D.jsx:63`), así que la restricción real es de memoria GPU, no
  de CPU.
- **`postProcessing: false` en todo lo que no sea héroe.** El bloom es el coste
  grande; `bridge` y `method` lo apagan por defecto a propósito.
- **Las escenas de datos (`levels`, `vault`) van sin partículas.** No les aportan
  nada y son lo más caro.
- **Techos concretos antes de tocar nada:** `vendor-three` 240 kB gzip cargando
  **solo en `/`** y LCP móvil 272 ms (`3D-PERFORMANCE-BASELINE.md:24-31`). Si al
  montar estas escenas en más rutas el chunk de three se descarga en `/programs`
  o `/shop`, el plan está mal: hay que quedarse en las 3 rutas que ya lo cargan.

Y la parte incómoda: **"3D en cada scroll" choca con el §38 de tu propio brief**,
que prohíbe el 3D ornamental, y con `3D-ADMISSION-RECORD.md`, donde el gate G2
está en rojo diciendo que hay alternativa 2D que comunica igual a 0 kB. Lo que sí
se puede cumplir sin pelearse con eso es la versión buena de la petición: **que
nunca haya un tramo de scroll sin movimiento**, y que donde haya 3D, el 3D
represente una idea. Estas 6 escenas están escritas para eso, no para rellenar.

## Escenas de objeto real (segunda dirección, tras el «no quiero figuras»)

Las escenas abstractas (`levels`, `vault`) resuelven layouts que muestran un
dato. Para lo que el brief quiere como **mundo** hacen falta objetos
reconocibles, con cotas de producto. Ahí han salido tres fallos que ninguna
comprobación estática avisaba:

| Fallo | Qué pasaba | Cómo se detectó |
|---|---|---|
| **Metal sin entorno = negro** | `metalness` 0,9 con `roughness` 0,3 no refleja nada si no hay IBL: la barra salía casi invisible. | Mirar la captura. Se arregla con `StudioEnvironment.jsx`, que genera el entorno con `RoomEnvironment` **en memoria** —sin descargar HDR, `assets: []` intacto— y libera el render target al desmontar. |
| **`position={[x]}` de un solo elemento** | R3F deja `y`/`z` en `undefined`, la pieza cae a **NaN** y desaparece sin lanzar un solo error. Ocurrió con las 8 caras de disco y las 8 tapas: la barra se veía sin color en los discos y no había ningún síntoma. | `harness/audit-scenes.cjs`, que recorre el grafo y proyecta cada pieza a pantalla. |
| **`cylinderGeometry` nace en el eje Y** | Los dos manguitos quedaban **verticalmente de pie**, como pilares de 41 cm, y el tope parecía suelto en el aire. | La captura, y después la posición leída en el grafo. |

**Barra olímpica** (`BarbellScene.jsx`): barra de 2,200 m, puño de 28 mm con las
marcas de knurling, manguitos de 50 mm × 415 mm, cuatro discos por lado de
450 mm de diámetro y 28 mm de grosor con su cara de color y su buje de acero,
collarín apretando el último disco (no flotando a mitad del manguito) y tope
rojo en la punta. 34 piezas, cero NaN, sobre suelo de goma.

**Saco de boxeo** (`PunchBagScene.jsx`): saco de 1,200 m × Ø350 mm, cuatro
ramales de cadena cuyo largo se **deriva del paso del eslabón** (fijar "35 cm de
caída" y "6 eslabones" por separado hacía que la cadena terminara 25 cm por
encima del saco, flotando), correa de reparto, casquetes para que no acabe en
canto plano, franja de marca y placa de techo con giratoria. El pivote del
balanceo está **en el anclaje**, no en el centro del objeto: un péndulo real.

Coste: las 60 cadenas eran 60 nodos de escena y 60 draw calls; ahora son **una
sola `InstancedMesh`** con 60 matrices. La escena pasó de 68 mallas a 8 mallas +
1 instanciada, con el mismo aspecto en pantalla.

**Mueble de mancuernas** (`DumbbellRackScene.jsx`): rack de 1,80 × 0,60 × 0,78 m
a tres pisos, doce mancuernas hexagonales en progresión de 75 a 160 mm de cabeza
(batería de 5 a 20 kg), mango cromado de 300 mm. 24 cabezas y 12 mangos en **dos
`InstancedMesh`**: 36 piezas en dos draw calls sobre 13 mallas de mueble.

Tres errores de concepto que solo salen renderizando, y que salieron:

1. Cabeza puesta en el **centro del mango** en vez de en cada extremo (aritmética,
   no render).
2. Mango **atravesado** a lo ancho del mueble. En un rack real el mango va de
   frente a fondo, que es como se agarra; cruzado parece una barra corta.
3. Parejas **una al lado de otra**. Con la de 20 kg, cuatro cabezas de 160 mm en
   paralelo desbordan 1,20 m y se fusionan en una masa. Van en fila, y el mueble
   mide 1,80 m, que es la medida de una batería de seis juegos.

**Lección de presupuesto:** en móvil, el enemigo no son los triángulos, son los
draw calls. Todo lo que se repite —eslabones, discos, mancuernas, agujeros de un
poste— va en una instancia, o no va.

**Herramienta nueva:** `harness/audit-scenes.cjs` audita las 10 escenas y reporta
meshes, sprites, piezas NaN y piezas fuera de cámara. Salida actual: **7/7 OK**.
Es el chequeo que faltaba — un NaN en runtime es invisible para cualquier lint
estático y para una captura si la pieza no se esperaba ver.

## Verificación hecha y verificación pendiente

**Hecho — contrato** (`node verify-scenes.cjs`), 6/6:

- parse JSX con el **esbuild de BAYONA** (mismo transformador que su build)
- `export default` presente (lo exige `React.lazy` del registro)
- props `params` / `scrollProgress` / `caps` en la firma
- solo imports del contrato; **cero** referencias a `GLTFLoader`, `useGLTF`, `useTexture`, `.glb`, `.png`
- guarda `caps?.reducedMotion` en cada bucle de animación (R7.4)
- scroll leído con `readScroll` dentro de `useFrame`, sin re-render por fotograma (R19.2)
- cada token `theme.color.*` existe en `src/engine/config/theme.js`
- sin `Math.random()` en código (el comprobador lo pillaba antes también en
  comentarios; corregido el comprobador, no rebajado el chequeo)

**Hecho — render real** (`harness/`, banco de pruebas propio con **las mismas
versiones que BAYONA**: three 0.172.0, R3F 8.18.0, drei 9.122.0,
postprocessing 2.19.1, React 18.3.1, Vite 6.4.3):

`node capture.cjs` monta las 6 escenas en un `<Canvas>` que replica el de
`Scene3D.jsx` y las fotografía en p=0,15 y p=0,85. 12 capturas, **0 errores de
página y 0 errores de consola**. En `harness/shots/`.

El render encontró un bug que el contrato no veía: **`timeline` y `bridge`
viajaban en el eje equivocado**. Colocaban la geometría hacia +Z y movían el
grupo hacia +Z, pero la cámara mira hacia −Z, así que a mitad del scroll todo
quedaba por detrás de la cámara y el fotograma salía **negro del todo**
(`bridge-p085` pesaba 4,5 KB). Corregido el signo en ambas; la misma captura
pasa a 29 KB y ahora se ven los arcos anidados con el aro de salida naranja.

**Corregido tras la primera tanda de capturas** (tres defectos que el contrato
no veía y la pantalla sí):

1. `timeline` y `bridge` **viajaban en el eje contrario**: negro total a partir de
   mitad del scroll. Signo corregido en ambas.
2. `timeline` **no mostraba los años**: ahora cada marco lleva su etiqueta (sprite
   con `CanvasTexture`, memorizada con `useMemo` para no crear texturas por frame).
   Sin el dato, la escena era un pasillo bonito y no una línea temporal.
3. El desvanecimiento solo tocaba a `isMesh`, así que **las etiquetas nunca se
   apagaban** y los cuatro años se apilaban sobre el centro del encuadre. Ahora
   entra también `isSprite` y la curva es `near ** 1.8`.
4. El hilo que une hitos era una caja de 11 m vista de canto: se desproporcionaba
   con la perspectiva y cruzaba el encuadre como un triángulo naranja. Partido en
   tramos cortos, hijos de cada marco, para que se apague con él.

Estado en `harness/shots/timeline-fade-0.75.png` y `timeline-final.png`.

**Defectos que quedan, dichos en voz alta:**

1. `habitat` en p bajo está casi vacío por diseño (la habitación se amuebla
   bajando), pero en una captura suelta parece una escena rota. Si se usa, que
   sea en un tramo donde el usuario ya haya avanzado.
2. **Móvil**: probado con el `mode: 'mobile'` del motor forzado en el banco
   (`harness/cycler.html`), y la degradación se ha verificado **en el grafo**, no
   en el `params` (16+8 instancias de mancuerna, 8 billetes). Lo que sigue sin
   medirse es un **teléfono físico**: DPR real, GPU real, temperatura. El banco
   corre en escritorio con capacidades de móvil.
3. **`frameloop: 'demand'` no llega a activarse nunca en el cycler.** El pausa de
   `Scene3D.jsx:63` se dispara cuando el contenedor sale del viewport, y una capa
   `position: fixed; inset: 0` **no sale nunca**: el frameloop queda en `always`
   de punta a punta de la página. Lo que ahorra GPU ahí es tener una sola escena
   montada, no la pausa. Si alguna vez el sitio va con el lienzo en flujo normal
   (no fijo), la pausa vuelve a funcionar sola.
4. Las etiquetas de año **sí** se generan ya tras `document.fonts.ready` y se
   comprueba con el `montserrat-normal-900-latin.woff2` real de BAYONA copiado a
   `harness/fonts/` — sin la fuente web instalada en el banco, cualquier prueba de
   tipografía miente.
5. No están medidas contra `measure-universe-scale.mjs` ni contra el baseline de
   LCP: eso exige montarlas en el repo, y el repo está ocupado.

**Pendiente:**

1. **Medición de repetición:** `node scripts/measure-section-repetition.mjs` es la
   herramienta correcta y ya existe. **No la he ejecutado**: importa
   `writeFileSync`/`mkdirSync` y no puedo garantizar que no escriba en el árbol que
   está ocupado.
2. **Admisión:** cada variante que llegue a ruta pública necesita su entrada en
   `3D-ADMISSION-RECORD.md` y su sitio en `SCENE_ALLOWLIST` de
   `src/test/fase7aSceneGovernance.test.js:23-30`. Sin eso, el test la tumba.

## Orden de merge sugerido (cuando el repo esté libre)

1. `git -C C:\Users\sevis\BAYONA status` → confirmar que la otra sesión terminó.
2. **Primero el parche de cámara** en `src/engine/scene/Scene3D.jsx` (el bloque
   `SceneCamera` marcado en la copia del banco). Sin él, cualquier escena que
   cambie de variante sin desmontar el lienzo sale mal encuadrada, y es invisible
   en una captura suelta.
3. Copiar `scenes/*.jsx` y `harness/engine/scene/SceneCycler.jsx` a
   `src/engine/scene/`.
4. Pegar las 9 entradas en `sceneRegistry.js`.
5. Montar el cycler **en una sola ruta** (`/about`, con `timeline` de primera
   variante) y medir LCP móvil contra el baseline y `vendor-three`.
6. Solo si el número aguanta, abrir el laboratorio con las otras cinco.

El detalle de mediciones, hueco real por ruta y verificaciones obligatorias está
en **`PLAN-MERGE.md`**.
