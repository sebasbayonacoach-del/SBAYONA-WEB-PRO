# Inventario: qué dice la web y qué objeto real lo representa

Leído el sitio entero ruta por ruta (8 rutas, 96 secciones de primer nivel, texto
extraído del DOM en ejecución, no de los documentos). Cada fila sale de un titular
que la página ya escribe; el objeto existe para que ese titular se pueda mirar.

## Lo que faltaba además de objetos

El rack de demostración no gustó por ser bonito: gustó porque **se podía inspeccionar**
— orbitar, ver las cotas medidas sobre la geometría, cambiar de versión. Las escenas
del sitio son decorado: no puedes acercarte ni preguntar cuánto mide. Así que la
pieza nueva no es solo "más objetos", es un **inspector**: `ObjectInspector` toma
cualquiera de estos objetos, le pone OrbitControls y le pinta las cotas leídas del
`Box3` en tiempo real, igual que hacía `viewer.html`.

## `/` — home

| Tramo (lo que dice la página) | Objeto | Por qué ese |
|---|---|---|
| "PASA. TE ENSEÑO BAYONA." | **rack** (el de la demo) | es la sala; el usuario entra y lo primero que ve es donde se entrena |
| "SÉ EXACTAMENTE POR QUÉ NO AVANZAS" | **reloj/cronómetro de sala** | el tiempo entrenado es el dato que falta cuando no avanzas |
| "NO ES MAGIA. ES MÉTODO. TE LEEMOS" | **báscula con tallímetro** | "leer" a alguien es medirlo: valoración, no diagnóstico a ciegas |
| "LO QUE CAMBIA CUANDO HAY DIRECCIÓN" | **barra olímpica cargándose** | la progresión se ve en los discos que se añaden |
| "GENTE REAL. PUNTOS DE PARTIDA DISTINTOS." | **batería de kettlebells** | cinco tamaños, cinco puntos de partida, mismo gesto |
| "CUATRO PLANES. DISTINTO NIVEL DE ACOMPAÑAMIENTO" | **pila de pesos selectorizada** | el pasador en un hueco u otro = el nivel que eliges |
| "TU MEMBRESÍA ES LA BASE. LOS SERVICIOS SON OPCIONALES." | **árbol de discos** | la base es el poste; los servicios son discos que se cuelgan |
| "AQUÍ NO HAY HUMO. CONTEXTO ANTES QUE DIAGNÓSTICO" | **cinta métrica y tallímetro** | contexto = datos tomados con una herramienta |
| "EMPIEZA HOY SIN PAGAR NADA" / primer rutina gratis | **shaker / botella** | el objeto de "empiezas hoy", sin barrera de equipamiento |

## `/programs`

| Tramo | Objeto |
|---|---|
| "TU EDAD, TU NIVEL Y TU OBJETIVO IMPORTAN / NIÑOS / JÓVENES" | **banco regulable** (la misma pieza a otra altura para otro cuerpo) |
| "VALORAR. PLANIFICAR. REVISAR." | **pizarra del coach** con el protocolo escrito |
| "30 DÍAS PARA EVALUARLO" | **cronómetro** con la cuenta atrás |
| "PERSONALIZA TU PLAN / RECUPERACIÓN / RENDIMIENTO" | **kit de recuperación**: foam roller, pelota, banda |
| "CONFIGURA EL TOTAL" | **árbol de discos** (base + extras) |
| "ASÍ PUEDE VERSE UN PROCESO ORDENADO / ANTES DE ELEGIR" | **caja pliométrica** girando de cara: 40 → 50 → 60 |

## `/shop` — "EQUIPAMOS TU MOVIMIENTO. Objetos para entrenar, recuperar y moverte"

La tienda dice **objetos**, y sin embargo lo destacado es un hoodie. Los que sí se
pueden inspeccionar con cotas: barra, mancuernas, kettlebell, pila, caja, banco,
saco. El hoodie se queda en 2D (una prenda procedural no se reconoce; es el error
que ya me corrigieron).

## `/about` — "DEL PARKOUR A UN MÉTODO DE TRABAJO"

| Tramo | Objeto |
|---|---|
| "EL MOVIMIENTO / LA PRÁCTICA DEL PARKOUR" | **barra fija de calle** (la de parque, con su diámetro y su altura reales) |
| "CUATRO PRINCIPIOS / CRITERIO, RESPETO" | **rieles de equilibrio** |
| "HISTORIAS EN MOVIMIENTO" | saco de boxeo (ya hecho) |

## `/community` — "TRES MOMENTOS. UN MISMO PULSO."

**Cronómetro de intervalos** con los tres tiempos marcados: es literalmente el pulso
de una sesión colectiva.

## `/parkour-academy`

| Tramo | Objeto |
|---|---|
| "LA CIUDAD SE APRENDE EN MOVIMIENTO" | **cajón de saltos** (el obstáculo, con sus 3 alturas) |
| "EL PRIMER OBSTÁCULO ES EMPEZAR" | **barra de calle** |
| "VALENTÍA NO ES IMPROVISACIÓN / SEGURIDAD ACTIVA" | **colchoneta de caída** con su grosor real |

## `/faq`

Sin objeto nuevo: dos secciones de cierre. Aquí el 3D sobra y el brief lo dice
(§38, no ornamentar).

## Orden de construcción

1. `ObjectInspector` — orbitar + cotas medidas del `Box3`. Sin esto, todo lo demás
   vuelve a ser decoración.
2. Árbol de discos (membresía + servicios) — el que más explica la página de precios.
3. ✅ **Báscula con tallímetro** (valoración) — `ScaleScene.jsx`.
4. ✅ **Kit de recuperación** (foam roller, pelota, banda) — `RecoveryKitScene.jsx`.
5. ✅ **Cronómetro de intervalos** — `IntervalTimerScene.jsx`.
6. ✅ **Barra fija de calle y colchoneta** — `PullUpBarScene.jsx`.

Los cuatro construidos el 2026-09-20, con contrato 21/21 y mirados en render uno
a uno. Cada uno salió mal en su primera pasada y se corrigió:

- **Timer**: la esfera y el bisel llevaban una rotación de más (`planeGeometry`
  ya mira a +Z y el `torus` nace en XY), así que la carátula no se veía y el
  aro cruzaba la esfera por la mitad como una pata. Además las patas no
  llegaban al suelo y el buje central saltaba por el bloom.
- **Kit**: la banda era un lazo de 2,08 m — 66 cm de diámetro de pie, se comía
  el encuadre. Es una *mini band* de 660 mm. Y tumbada en el suelo, con la
  cámara a 8 cm, se veía como un hilo de 1 px: hay que levantarla a vertical.
- **Barra + colchoneta**: el muro era un panel de 2,6 m que dejaba ver el negro
  por los cuatro costados (parecía un cartel); la riostra llevaba un ángulo a
  ojo y colgaba como una pata — ahora se calcula con el vector pared→ménsula.
- **Báscula**: bien medida, pero a `FILL = 0,42` un objeto de 2 m obligaba a
  retroceder a 6,9 m. El encuadre global subió a 0,58 y la aportación de la
  home pasó de 28,6 % a 33,4 % en el primer tramo y a 51,2 % en el suyo.
