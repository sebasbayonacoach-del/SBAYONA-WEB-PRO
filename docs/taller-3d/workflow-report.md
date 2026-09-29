# Informe de flujo multi-agente — demo rack 3D/AR

Skill: `multi-agent-workflow` v1.0.2 (5 pasos: recibir →拆分 → asignar roles → 并行执行 → 汇总).
Fecha: 2026-09-19. Tarea recibida: convertir la demo GLB del workspace en una oferta vendible y
saber qué le falta para ser honesta y técnicaamente correcta.

## Nota sobre la propia skill

`scripts/workflow.py` **no orquesta nada**: es un clasificador de palabras clave que devuelve JSON
con un rol. Verificado ejecutándolo:

- `assign_task()` solo reconoce palabras en chino (`写`, `分析`, `代码`, `审核`), así que asigna
  `researcher` al 100 % de las tareas en español. Cuatro tareas de naturaleza distinta → mismo rol.
- `split_task()` no divide: replica la descripción con sufijos `- 第1部分`, `- 第2部分`…
- Su salida lo admite: `"此配置可用于调用OpenClaw的sessions_spawn执行"` — necesita un lanzador
  externo que aquí no existe.

Se usó su método y su taxonomía de 4 roles; la ejecución real y en paralelo se hizo con la
herramienta Agent.

## Roles y resultados

| Rol (skill) | Tarea real | Estado | Resultado clave |
|---|---|---|---|
| 研究员 researcher | Límites oficiales GLB para AR (Amazon, Shopify, Scene Viewer, iOS) | completed | **Fallamos Amazon**: exige mapas de textura ≥2048² y pivote centrado en X/Z; tenemos 0 texturas. Shopify y Android: OK. iOS: falta USDZ. |
| 开发者 developer | Fila de agujeros en postes sin booleanos | completed | Ganador: cajas oscuras incrustadas de 26 mm, 12 filas, patrón lineal. 530 nodos, 175 KB, validado 0 errores. Verificado en 4 renders, no solo en el validador. |
| 内容专家 content_expert | Correo de contacto + tarifas | completed | `pitch/correo-propuesta.md`. 150 palabras, primera persona, sin testimonios ni métricas inventadas; precios marcados como hipótesis. |
| 审核员 reviewer | Auditoría de defectos | completed | 9 defectos, 4 de ellos de honestidad comercial (ver abajo). |

Agregado: 4 totales, 4 completados, 0 fallidos, 0 pendientes.

## Lo que la auditoría destapó (esto es lo valioso del flujo)

1. **El botón "Ver en mi espacio (AR)" no hace AR.** Solo descarga el GLB, y iOS ni siquiera lo abre.
   El rótulo "Vista en tu casa" también es falso: es una escena de estudio.
2. **Datos de producto inventados en la ficha**: "Carga máx. 450 kg" (idéntico para las tres tallas),
   "Pasadores Ajuste 25 mm" (no hay pasadores en la geometría), y un peso salido de una fórmula
   arbitraria. En una página pensada para convencer a un vendedor, esto es un disparo en el pie.
3. **"Hueco libre" mal medido**: los 120 × 130 cm son el exterior entre postes. El hueco real es
   104 × 114 cm y la huella en suelo 128 × 160 cm (las patas sobresalen 4 cm y los pasadores 26 cm
   hacia atrás). Un cliente que mida su sitio se equivoca comprando.
4. **Inmóvil roto**: rejilla `1fr 340px` sin breakpoint deja ~50 px de lienzo en un móvil de 390 px.
   Justo el dispositivo donde se mira AR.
5. **three.js desde unpkg**: sin red o si cambia el CDN, pantalla en negro; y `loader.load` no tiene
   callback de error, así que un 404 deja el precio en "—" en silencio.
6. **Geometría**: las torretas de la barra de dominadas flotan 4,6 cm por debajo de los travesaños;
   los topes rojos de los brazos de seguridad quedan enterrados dentro del poste, así que no retienen
   nada; los pasadores de discos están perfectamente horizontales (los discos se caerían).
7. **Variantes no reproducibles**: `rack-home-compact/` y `rack-xl/` no tienen su `solution.mjs`, y el
   JSON del programa declara `parameters: []`. Nadie que no sea Sebastián puede regenerarlas.

## Decisiones tomadas tras agregar

- Adoptar la fila de agujeros en el entregable principal: sigue siendo un asset ligero (175 KB frente
  al límite de Amazon de 200.000 triángulos) y es el rasgo que hace reconocible un power rack.
- Retirar o marcar como "dato de ejemplo" todo valor que no salga de la geometría real.
- No prometer "compatible con AR de Amazon/Shopify" hasta hornear texturas y exportar USDZ.

## Ronda 2 (los mismos roles, ejecutados en paralelo otra vez)

| Rol | Encargo | Verificado |
|---|---|---|
| 开发者 | Fusionar agujeros + arreglar torretas, topes y pasadores + hacer reproducibles las 3 variantes | Los 3 GLB `valid: true`, 0 errores. pro 530 nodos/175.960 B · home 446/166.924 B · xl 628/196.240 B, 2.912 triángulos cada uno. Cada carpeta tiene ya su `solution.mjs`. |
| 内容专家/web | Ficha con medidas reales, AR honesta, móvil, three.js autoalojado, cámara fija | `vendor/three.module.js` es r161 real (1,28 MB, cabecera MIT), no un 404 guardado como .js. Cero errores de consola en escritorio y en 390x844. |

Comprobación propia, no por informe: `verify.cjs` arranca el servidor, captura escritorio + móvil y
lee las cifras de la ficha. Devuelve Pro 240 cm / huella 128x160 / hueco 104x114 y Xtra 280 cm /
133x175 / 109x129 — exactamente lo que el auditor había calculado a mano desde las bounding boxes.
El canvas mide 390x506 en móvil (antes ~50 px). Capturas: `verify-desk-pro.png`, `verify-desk-xl.png`,
`verify-mobile.png`.

## Corrección añadida tras ver el render

El agente web puso una silueta humana de primitivas como referencia de escala; en el render se leía
como un maniquí fantasma tapando el producto. Sustituida por una **cota vertical con su número**
(`updateScaleRef` en `viewer.html`), medida también del modelo cargado. Con cámara fija, el Xtra de
280 cm se ve ahora claramente más grande que el Compacto, que es lo que justifica tres precios.

## Ronda 3 — el hallazgo que cambia la oferta, no solo el modelo

Dos cosas comprobadas directamente, no por subagente:

1. **El runtime no puede generar texturas.** `qoder-gltf capabilities` declara
   `texture.import: unsupported — Texture creation and import are outside v1`. No es un trabajo
   pendiente: es el límite de la herramienta.
2. **Amazon exige texturas obligatorias.** Leída la página oficial de requisitos técnicos con
   Chromium renderizado (un fetch plano solo devuelve el andamiaje JS): *"BaseColor map in RGB is
   required"*, *"Metallic/metalness in linear (Greyscale) is required"*, *"Roughness in linear is
   required"*, resolución 2048²-4096², cuadrada, POT, un canal por textura, y ≤200K triángulos.
   Nuestro asset tiene 0 texturas → **rechazado**, y este plugin no puede arreglarlo.

   **Corrección a lo que se dijo al principio de la sesión**: la ruta "modelos de producto para el AR
   de Amazon y Shopify" se presentó como la más rentable. Para Amazon está mal: hace falta un paso de
   texturizado con otro software (Blender o similar) que aquí no está disponible.

### Lo que sí se arregló en el modelo

Amazon y Scene Viewer piden *"floor-oriented models are centered at the base of the bottom surface in
both the X and Z Axes, pivot at 0,0,0"*. El nuestro no estaba centrado en Z: los pasadores traseros
desplazaban la envolvente ~11 cm. Añadido `pivotZ` al programa: la raíz se traslada para centrar X y
Z dejando la base en Y=0.

Regeneradas y validadas las tres variantes (0 errores, 0 avisos):

| Variante | nodos | triángulos | bytes | envolvente X/Z centrada |
|---|---|---|---|---|
| pro | 530 | 2912 | 175.960 | ±0,800 en Z |
| home | 446 | 2912 | 166.924 | ±0,675 |
| xl | 628 | 2912 | 196.240 | ±0,875 |

Encuadre del visor re-verificado con captura propia tras el desplazamiento: la cota y el producto
siguen bien colocados.

### Pendiente de verificación honesta

- **Shopify no se ha podido verificar**: su página de ayuda está tras un reto de Cloudflare que
  bloquea tanto `WebFetch` como Chromium headless. Sigue en pie como hipótesis razonable, no como
  argumento de venta.
- **USDZ para iPhone**: inexistente. Haría falta un conversor externo, no lo hace este plugin.

`pitch/correo-propuesta.md` se ha actualizado con estos datos: cifras nuevas del asset, huecos libres
correctos, y Amazon movido de "en validación" a "no cumple, no ofrecer hoy".


## Estado final y límites conocidos

- **No hay AR.** El botón descarga el GLB y así lo dice. Para AR real hace falta URL pública HTTPS +
  intent de Scene Viewer (Android) y un USDZ para iPhone Quick Look. La receta está escrita en un
  comentario del HTML.
- **Amazon: requisito confirmado y no cumplido** (ver ronda 3). Lo que sí se corrigió de esa lista es
  el pivote; lo de las texturas no se puede corregir con esta herramienta.
- **Precio y PVP son de ejemplo**, marcado en la propia página con un chip.
- La barra de dominadas va apoyada en los travesaños laterales en "portería"; en un rack real suele
  atornillarse a los postes frontales. Es lo único que el agente desarrollador señaló como discutible,
  y en el render se sostiene.

