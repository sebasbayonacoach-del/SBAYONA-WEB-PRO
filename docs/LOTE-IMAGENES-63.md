# BAYONA · lote de imágenes que falta (comentarios 1 y 37)

**Por qué existe este fichero.** El comentario 37, literal: «tenías que diseñar
más de 70 mil imágenes, en el sentido de que cada zona, o sea, cada página,
subpágina y demás, debe tener imágenes totalmente diferentes. Entonces, y si hay
programas, academia, experiencias, tienda… y cada una tiene diez, once, doce
secciones, pues multiplica las imágenes». El comentario 1 pide que la imagen de
referencia sea **entrenador + persona entrenando**, con el fondo desenfocado,
en toda la web.

**Lo medido, hoy.**

| Página | Secciones (`<section>`) |
|---|---|
| Home | 9 |
| About | 5 |
| Programs | 10 |
| ParkourAcademy | 7 |
| Community | 11 |
| Resources | 12 |
| FAQ | 4 |
| Shop | 7 |
| AppExperience | 15 |
| **Total** | **80** |

Ficheros de escena en `public/images/scenes/`: **19** (17 declarados en
`siteMedia.js` + 2 sin usar). O sea: para cumplir el 37 con una imagen propia
por sección hacen falta del orden de **60**, y con el reparto óptimo que permite
el banco actual (una escena por sección contigua, sin repetir en la misma
página) se quedan **~25 huecos reales** por página tras la de-collision.

**Estado del bloqueo.** La generación de imágenes está cerrada en la cuenta:
`ImageGen` responde `403 {"code":"112","pricingUrl":"https://qoder.com/pricing?client=qoder"}`
(probrado dos veces, 09:07 y 09:07). No hay otra vía de generación conectada en
esta sesión: `mcp_list keyword=image` solo devuelve utilidades de lectura de
diseño y el REPL. **Al habilitar créditos, este lote se ejecuta de una pasada.**

## Ancla de estilo (repetir este enunciado base en todas)

> Cinematic editorial photograph, premium fitness brand. [SUJETO]. Low-key
> lighting, deep charcoal background, single warm amber rim light from the
> right, faint haze. Shallow depth of field: subject crisp, background
> dissolving into soft bokeh toward the right. 35mm lens, natural skin texture,
> no exaggerated musculature. Muted palette of charcoal, warm sand and one
> burnt-orange accent. Right third visually quiet for overlaid typography. No
> text, no logos, no watermarks, no visible screens.

Tamaño: `1792x1024` para fondo de sección y hero; `1024x768` para tarjeta.

## Inventario por página

Las que van con **[crítico]** son secciones que el dueño nombró en sus
anotaciones y hoy se ven planas o repetidas.

- **Home (9)** — hero (hoy `escena-playa`, válida: Gandía es su marca y él la
  pidió, no la vetó) · problemas · método [crítico, comment 2: «quiero que
  coloques una imagen en los espacios en negro»] · cambio/solución [crítico,
  comment 3] · experiencia/proceso · valor gratuito [crítico, comment 6: «que
  la persona vea el artefacto que recibe»] · membresías [crítico, comment 7] ·
  configurador [crítico, comment 9-10] · puente a About.
- **Programs (10)** — hero [crítico, comment 19: fuera montaña + mancuernas +
  «pepitas»] · etapas de edad (4: niños, jóvenes, adultos, atletas) [crítico,
  comment 21: imagen al lado y texto al frente, alternando] · método ·
  visualización [crítico, comment 24: «el cuadrado gigante con checks se ve
  horrible»] · cierre.
- **Planes (4 × ~8 bloques)** — cada plan con escena propia [crítico, comment
  8: «las imágenes deben ser fitness, representar cada plan»]; hoy `FUERZA` y
  `ELITE` comparten hero y `RENDIMIENTO` comparte playa con `RAIZ`. Faltan 4.
- **ParkourAcademy (7)** — técnica, seguridad, niveles, método [crítico,
  comment 36: «imagen de escalera que no suma»], logística. Faltan 3-4.
- **Community (11)** — club, pulso semanal, niveles, historias. Faltan 5.
- **Resources (12)** — biblioteca, revista, dossier, reto 30, consulta.
  Faltan 6.
- **Shop (7)** — **4 fotos de producto distintas** hoy están duplicadas:
  `camiseta-manga-larga` y `camiseta-compresion` comparten foto;
  `reloj-inteligente-bayona` y `bascula-inteligente` comparten
  `fitness-tracker.jpg`. Enseñar la misma foto a dos productos que se venden
  por separado es un defecto de venta.
- **FAQ (4)**, **About (5)**, **App (15)** — App es la que más sufre: 15
  secciones sobre 6 escenas.

## Regla de admisión cuando se generen

1. Nombrar en `escenas` de `src/config/siteMedia.js` con clave semántica
   (`bayonaScenes.<cosa>`), y declarar el fichero en
   `public/images/scenes/` con prefijo `escena-`.
2. Registrar el `alt` describiendo el encuadre real de la foto generada — el
   `alt` no puede quedar describiendo otra imagen.
3. No meter binarios en el pipeline 3D: `sceneRegistry.js` mantiene `assets: []`
   (contrato de escena procedural) y `docs/DECISIONS.md` D-009 veta
   dependencias nuevas. Las JPEG de fondo de sección **no** son assets 3D, así
   que no lo rompen; verificar con `npx vitest run src/test/fase7aSceneGovernance.test.js`.
4. Peso: `public/images/scenes` va hoy a 5,0 MB con 19 ficheros. 60 más serían
   ~15 MB en el repo y más LCP; se sirven con `srcSet`, así que generar también
   la variante 256 w y 960 w (ver `testimonialVariant` en `ExperienceProof.jsx`).

---

## Estado de integración — 22-09-2026 18:20 (coordinador)

Medido con `scripts/auditar-huecos-imagenes.mjs` (nueva) y
`scripts/probe-imagenes-que-cargan.mjs` (nueva).

**Punto de partida.** 101 huecos declarados con `cinematicScene(...)`. 80 tenían
su PNG del banco nuevo y estaban registrados. **21 no**, y un PNG
(`community-entry.png`) estaba en disco sin ningún hueco que lo pidiera.

**Colocadas 7, todas con original del propio banco, conservándolo:**

| Hueco | Archivo creado | De dónde sale |
|---|---|---|
| `parkour-hero` | `parkour-hero.png` | `bank-teen-landing.png` |
| `parkour-levels` | `parkour-levels.png` | `bank-child-supported-vault.png` |
| `parkour-safety` | `parkour-safety.png` | `bank-senior-woman-step.png` |
| `parkour-closing` | `parkour-closing.png` | `bank-grandfather-child-vault.png` |
| `onboarding-threshold` | `onboarding-threshold.png` | `bank-child-precision-jump.png` |
| `faq-hero` | `faq-hero.png` | `bank-senior-man-balance.png` |
| `community-group` | `community-group.png` | `community-entry.png` (huerfano) |

Cada nombre está añadido a `GENERATED_BAYONA_SCENES` con su comentario al lado.
Resultado: **87 de 101** con imagen propia y registrada.

**Reutilización declarada (regla del brief).** Los seis `bank-*` se usan una sola
vez cada uno. La copia `community-entry → community-group` es la única
colocación discutible: el texto del hueco pide un grupo y la foto es una sola
persona escribiendo al atardecer. Aun así es un original de BAYONA sin dueño, y
la alternativa era repetir en Comunidad la escena que ya usa otra sección.

**14 huecos pendientes, todos en `/resources`:** `resources-magazine`,
`resources-fresh-nutrition` y las doce tarjetas `resources-topic-*` (training,
nutrition, mindset, rest, health, motivation, relationship, meditation, business,
data, security, creativity). Siguen con su escena de respaldo, que es correcta
para el mensaje. No se colocó nada a la fuerza: ninguna imagen existente habla de
nutrición, datos, negocio, creatividad o seguridad con la honestidad que pide el
brief.

**Por qué no se generaron.** `ImageGen` responde
`403 {"code":"112","pricingUrl":".../pricing"}` en esta cuenta (probado de nuevo
hoy, no es un recuerdo). Sin generación no hay forma de producir 14 originales
distintos, y copiar fotos de gimnasio de otro contexto habría roto más reglas de
las que arregla.

**Los 263 JPG de `public/images/bayona-visuals/` NO sirven, y esto conviene
tenerlo escrito.** Se inspeccionaron las tres carpetas (`coach-trainee-100`,
`trainer-client-100-final`, `extra-batch`) leyendo sus propias hojas de contacto:
llevan **doble exposición con un círculo translucido quemado en la imagen**,
aparecen gimnasios cerrados y a veces tres o cuatro personas, y son 1600×1000
(ratio 1,60) en vez del 16:9 del resto del banco. Ninguna está referenciada por
`src/`. Son un lote descartado, no material sin usar.

**Dos fallos de instrumento corregidos en el camino, que eran peores que el
defecto:**

1. `probe-imagenes-que-cargan.mjs` contaba solo `<img>`. `/faq` y `/about`
   daban «0 imágenes, sin rotas» porque sus escenas se pintan por
   `background-image` en pseudo-elementos. Ahora mide `<img>`, fondo y `::before`
   /`::after`: `/about` pasa de 0 a 4 (todas del banco nuevo), `/parkour-academy`
   de 1 a 4.
2. `/onboarding` seguía mostrando la escena vieja **aunque su hueco estuviera
   registrado**: la recepción tenía un `<img>` fijo a `bayonaScenes.casa` por
   encima del fondo del hueco. Se cambió a
   `siteMedia?.onboarding?.threshold?.src ?? bayonaScenes?.casa?.src`, que es el
   orden que el sistema de imágenes ya prometía.

**Verificación.** `npm run build` y `vite build` correctos (solo el aviso
conocido de `vendor-three`). Suite **744/744**. 0 imágenes rotas y 0 peticiones
404 de imagen en las 13 rutas comerciales, en 1440 y en 390. Comprobado a ojo el
hero de `/parkour-academy` en escritorio y en móvil: la cara del adolescente y
la acción quedan libres, el titular sobre la zona oscura, sin texto dentro de la
foto. Todas las imágenes del banco mantienen ratio 1,78.

### Y una trampa: los 14 huecos pendientes SI existen, pero en el lote malo

Al buscar de dónde sacar las catorce que faltan apareció esto: en
`public/images/bayona-visuals/` (la raíz, no las tres subcarpetas) están **los
mismos catorce nombres** —`resources-fresh-nutrition.jpg`,
`resources-magazine.jpg` y las doce `resources-topic-*.jpg`—, más otros quince
(`community-group-food`, `entrar-*`, `faq-*`, `onboarding-*`). Parece que el
trabajo está hecho y solo hay que copiar. **No se puede copiar.**

Medido y mirado, no intuido:

- El banco limpio es **1672×941 (ratio 1,777) en sus 94 archivos**. El lote de
  `bayona-visuals` es **1792×1024 (1,750) en 99 archivos**. El tamaño separa los
  dos lotes sin abrir una sola imagen, y `auditar-huecos-imagenes.mjs` ahora lo
  comprueba: cualquier 1792×1024 que entre en el banco salta como problema.
- Hojas de contacto a 620 px de `resources-fresh-nutrition`,
  `resources-topic-health`, `resources-topic-rest`,
  `resources-topic-motivation` (y las otras diez a 430 px): **una franja
  horizontal de otro tono cruza el encuadre** en casi todas. Es la segunda
  imagen superpuesta del proceso de aquel lote, no un degradado del diseño.
- Además, tres incumplen tus reglas de contenido, no de gusto:
  `resources-topic-mindset` tiene **cuatro personas** y ninguna cara,
  `resources-topic-data` es un grupo de seis en una terraza, y
  `resources-topic-security` lleva un **periódico con titulares legibles**
  dentro del encuadre (prohibido: sin texto).
- `public/images/burst/` queda descartado de antemano: son fotos de banco
  externo descargadas (nombres tipo `a-person-mid-jump-on-a-country-road`,
  variantes `-960.webp`/`-1600.webp` de CDN), y el brief lo veta.

O sea: para los catorce de `/resources` no hay material local válido. Se rellenan
el día que haya generación disponible (o cuando Sebastián entregue sus fotos), y
`auditar-huecos-imagenes.mjs` escupe la lista exacta de nombres en cuanto
existan los PNG.

### Segunda pasada: seis de esas catorce se pudieron rescatar, con criterio

La medida que decide no es «se ve mal», es **dónde** se ve mal. Para cada una de
las catorce se calculó el salto de brillo fila a fila y en cuántas columnas
aparece: si el salto está en casi todas las columnas, la franja es una **capa
uniforme** (una veladura) y se puede restar; si está en la mitad, es el recorte
de otra foto dentro del encuadre y no se puede recuperar sin inventar píxeles.

Con eso entraron seis (`resources-fresh-nutrition`, `resources-magazine`,
`resources-topic-rest`, `resources-topic-health`, `resources-topic-business`,
`resources-topic-creativity`), recortadas a 1672×941 y con el JPG de origen
intacto. Se quedaron fuera ocho, por tres motivos distintos y escritos: dos
porque la franja es un recorte (`topic-training`, `topic-relationship`), cuatro
por incumplir reglas de contenido aunque queden limpias (`topic-mindset` cuatro
personas, `topic-data` multitud, `topic-security` periódico con texto,
`topic-meditation` saco de golpeo), y dos porque **la escena que ya tenían cuenta
mejor el mensaje** (`topic-nutrition`, `topic-motivation`).

Trazabilidad completa, fila de costura y modo de revertir en
`docs/IMAGENES-REPARADAS.md`. Estado tras esto: **93 de 101** huecos con imagen
propia y registrada.

## Corrección del mismo día: el contador miraba una sola boca

«93 de 101» medía solo los huecos de `siteMedia.js`. El sitio pide fotografías por
ese camino **y** por literales `url('/images/…')` escritos en las hojas de estilo,
y por el segundo seguían sirviéndose once JPG del lote retirado en `/community`,
`/faq`, `/entrar` y `/onboarding`. Tampoco estaban contadas las 40 escenas de
Shopify Burst ni las 6 fotos enlazadas a FoodiesFeed, que el inventario del config
sí veía pero este resumen no.

Cerrado el 22-09-2026: once capas al banco limpio y a escenas curated propias,
tres escenas editoriales de Burst sustituidas, cinco entradas de FoodiesFeed
muertas borradas, y `src/test/imageSourceGovernance.test.js` vigilando ya las dos
bocas. Recuento y motivos en `docs/IMAGENES-SEGUNDA-BOCA.md`.

Segunda pasada el mismo día: `scripts/duplicados-cross-mouth.mjs` cruzó las dos
bocas por **huella binaria** y encontró que cinco de esas once capas repetían una
fotografía ya puesta —una de ellas **dentro de la misma `/faq`**, porque
`bank-senior-man-balance.png` es copia byte a byte de `faq-hero.png`—. Cuatro
reasignadas a originales que no pintaba nadie, una colisión preexistente
(`app-dashboard` entre `/` y `/resources`) dejada y explicada, y **cuatro
repeticiones declaradas a propósito** porque la única alternativa era una foto de
escritorio o de playa sin gente: se prefirió conservar parkour y decirlo.
Repetición dentro de una misma página: **0**, medida por apariencia (`scripts/duplicados-perceptuales.py`, phash + dhash) y no por bytes: desde que el banco se sirve en WebP el sha256 de `duplicados-cross-mouth.mjs` ya no ve la misma foto reenvasada, así que su «0» es solo una cota inferior. Estado honesto al cierre del 22-09:
**104 de 147** escenas resueltas sirven del banco propio, 37 son fotos de producto
de la tienda localizadas en `public/images/burst/` y 6 fotos de producto siguen
enlazadas fuera (FoodiesFeed). Las 9 escenas curated que faltaban por registrar
pasaron al banco con su nombre de hueco, así que **0 huecos pendientes** en
`siteMedia.js`; las hojas de estilo siguen pintando 7 escenas propias de BAYONA de
`public/images/scenes/`, que tampoco son externas.
