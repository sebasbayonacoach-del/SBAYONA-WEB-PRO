# BAYONA / DESIGN.MD — SISTEMA CINEMATOGRÁFICO 2026

**Proyecto:** BAYONA (entrenamiento guiado, ciencia del movimiento y comunidad). **Tipo:** web de marca y venta; no una app de diagnósticos. **Meta de Home:** entender el proceso y elegir libremente un siguiente paso verificable.

## Identidad
- Fondo carbono `#050505`, planos elevados `#111317`, blanco cálido `#F7F7F3`, naranja cobre `#F4A261`, línea cobre transparente. Evitar azul brillante y degradados multicolor.
- Titulares: fuente display ya instalada en `--type-family-display`, 700–900, MAYÚSCULAS, tracking negativo moderado y ancho suficiente para no crear una palabra por línea.
- Cuerpo: familia `--type-family-body`, capitalización natural, alto contraste, 45–70 caracteres por línea, tamaño mínimo legible; nunca usar letras expandidas mono en párrafos largos.
- Microetiquetas: `--type-family-mono`, mayúsculas, tracking hasta .16em solo en numeración/telemetría.
- La identidad se construye con **silencio visual, instrumentación y trayectoria**, no con marcos grises repetidos ni decoración gratuita.

## Escenas después de VisionShift
1. **Punto de partida:** cuatro estaciones vectoriales de observación, avance lineal; no candados ni sensación artificial de bloqueo.
2. **Comunidad:** interfaz original estilo terminal premium, preguntas/respuestas legibles en panel equilibrado, etiquetado como *conversación ilustrativa*. La salud no se diagnostica por chat.
3. **El método:** vuelo orbital en tres estaciones `LEER → DISEÑAR → AJUSTAR`, cámara a través de profundidad y señalización verdaderamente secuencial.
4. **Claridad:** estímulos comerciales ficticios se desprenden y aparece un sistema con tres hitos de lectura; el usuario recorre claridad, no saturación.
5. **Experiencias:** personas/fotografías publicadas conservadas; retrato oscurecido para legibilidad, fotogramas siguientes se deslizan horizontalmente.
6. **Kit gratuito:** el `RETO 30 DÍAS` abre una sala de proyección conceptual y paso visible hacia `/resources`, sin fingir que un vídeo está reproduciéndose.
7. **Membresías 05:** entrada cinematográfica oscura con líneas de velocidad y objeto tipo pedestal de feria tecnológica; después mantiene el explorador y precios reales.
8. **06 y cierre:** animaciones de llegada solo en cabeceras secundarias; las interacciones, precios, checkout y texto legal permanecen funcionales.

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
