# BAYONA / DESIGN.MD — SISTEMA CINEMATOGRÁFICO 2026

**Proyecto:** BAYONA (entrenamiento guiado, ciencia del movimiento y comunidad). **Tipo:** web de marca y venta; no una app de diagnósticos. **Meta de Home:** entender el proceso y elegir libremente un siguiente paso verificable.

## Identidad
- Fondo carbono `#050505`, planos elevados `#111317`, blanco cálido `#F7F7F3`, naranja cobre `#F4A261`, línea cobre transparente. Evitar azul brillante y degradados multicolor.
- Titulares: fuente display ya instalada en `--type-family-display`, 700–900, MAYÚSCULAS, tracking negativo moderado y ancho suficiente para no crear una palabra por línea.
- Cuerpo: familia `--type-family-body`, capitalización natural, alto contraste, 45–70 caracteres por línea, tamaño mínimo legible; nunca usar letras expandidas mono en párrafos largos.
- Microetiquetas: `--type-family-mono`, mayúsculas, tracking hasta .16em solo en numeración/telemetría.
- La identidad se construye con **silencio visual, instrumentación y trayectoria**, no con marcos grises repetidos ni decoración gratuita.

## Recorrido editorial aprobado — 2026-10-05

La home es una secuencia fotográfica, con objetos tangibles y transiciones que
conectan el relato. Los títulos hablan de posibilidades y del proceso, no de
resultados garantizados. Los precios y las prestaciones mantienen su fuente en
`src/config/offerings.js`.

1. **Visión:** dispositivos con una fotografía protagonista y cuerpo de texto visible.
2. **Punto de partida:** la introducción y las cuatro situaciones tienen fondo fotográfico.
3. **Comunidad:** cinco mensajes dentro de un móvil original. Al terminar, el scroll
   amplía el dispositivo y funde su pantalla con la fotografía que abre el método.
4. **Método:** entender, diseñar y acompañar; tres capítulos con fotografía y lectura clara.
5. **Proceso:** cuaderno editorial completo, numeración correcta y límites de evidencia visibles.
6. **Biblioteca:** tres recursos educativos y un dossier reales, descargables sin registro,
   con portadas físicas; en móvil se apilan para mantener accesibles las descargas.
7. **Acompañamiento:** cuatro niveles comparables, vídeos locales con controles y
   folletos descargables. Se invita a explorar sin bloquear la elección.
8. **Configuración:** decisiones separadas y un resumen cuyo precio siempre se lee completo.
9. **Cierre:** dos preguntas locales para ordenar el punto de partida y abrir un dossier.
   No se pide contacto, no se guardan respuestas, y existe descarga directa alternativa.
   Se retira el segundo cierre repetido de `NextChapter` solo en la home.

## Tipografía del recorrido

`src/styles/home-master-journey.css` es el adaptador de Home sobre las familias
canónicas `--type-family-display`, `--type-family-body` y `--type-family-mono`:
Montserrat para títulos, Inter para lectura, DM Mono para etiquetas.
Tres niveles: `--journey-display` (36–72 px según ancho), `--journey-body` (18 px),
`--journey-label` (12 px). Los documentos físicos conservan una escala interna
para que su contenido completo quepa en la portada; los importes se adaptan al
espacio sin partir cifras ni divisa. Ningún párrafo largo se usa como etiqueta mono.

## Política de movimiento
- Usar el motor StickyStage y Framer Motion ya existentes. No añadir GSAP en paralelo a StickyStage: el *pin* doble puede romper mediciones y generar jumps.
- `useTransform` cambia *transform/opacity* fuera del ciclo de renders React. Motion por scroll, control del usuario, sin tiempos de espera forzados.
- No animar el elemento que actúa como sticky; solo capas interiores. No bloquear scroll, clicks, enlaces o foco.
- `prefers-reduced-motion`: capítulos estáticos legibles, sin ruido de carteles ni velocidad, todos los CTA conservados.
- `overflow-x`: cero en viewport 390/726/1440; evitar superposición de texto contra figuras.
- Móviles (≤760px): escenario visual arriba, copy después. Escritorio: composición separada. Verificar ambos.

## Referencias técnicas (consultadas)
- Motion official scroll/transform: https://motion.dev/docs/react-use-scroll y https://motion.dev/docs/react-use-transform.
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ (evaluado, **no instalado** para esta fase por coexistencia con motor actual).
- Three / R3F ya instalados para otras escenas: evitar otro canvas para elementos que CSS 3D resuelve, protegiendo RAM/GPU.

## Reglas de entrega
Conservar estructura, datos de programas, políticas, acceso de comunidad, enlaces y CTA. Probar Vitest, Playwright, build, lint, capturas de 390/726/1440, modo reducido. Trabajar en rama del PR sin afectar producción. La inspiración tecnológica no implica copiar UI o marcas de terceros.
