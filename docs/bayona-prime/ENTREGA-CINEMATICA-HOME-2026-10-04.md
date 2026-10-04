# BAYONA — ENTREGA CINEMATOGRÁFICA HOME / 2026-10-04

Rama de trabajo: `bayona-prime/cinematic-journey-20261004`, destinada al PR #1 `bayona-prime/shop-unified-20261004`.

## Cambios concretos

- `PainUnlockStage`: sustitución de candados por estaciones de progreso sin prometer contenido bloqueado. 4 estaciones numeradas e indicador de avance.
- `CommunityImmersiveStage`: consola tecnológica inspirada en interfaces premium (original, no réplica de marcas), mensajes ilustrativos con avatares sobrios y mejor separación. El ejemplo de dolor de rodilla ya no diagnostica por chat ni supone una posición de la rodilla no observada. Mantiene /community.
- `ImmersiveMethodStage`: nueva trayectoria de cámara espacial con nave, estelas, 3 paradas y telemetría `LEER → DISEÑAR → AJUSTAR`. CSS 3D/SVG/Motion, sin renderer de WebGL añadido.
- `BenefitsOrbitStage`: elementos de distracción que se desplazan y desvanecen según scroll; escalera conceptual de claridad/criterio/progreso.
- `ExperienceProof`: fotogramas laterales que viajan de derecha a izquierda, con foco principal más oscuro para conservar contraste; las historias y recursos de imagen del proyecto se mantienen.
- `FreeValue`: el fragmento `RETO 30 DÍAS` se presenta en una sala de proyección con pantalla editorial y CTA /resources. El CTA dinámico es accesible: se eliminó `aria-hidden` de la sección que lo contenía.
- `CinematicOfferGate`: apertura del capítulo 05 como pedestal tecnológico con aproximación de cámara, escala, pitch y estelas vinculadas al scroll con `useScroll` + `useTransform`; no hay temporizadores ni scroll bloqueado. Conserva planes y precios.
- Consistencia tipográfica de títulos y cuerpo; `DESIGN.md` documenta identidad y pautas de motion para siguientes agentes.
- Se conserva `prefers-reduced-motion` con escena estática legible y estelas deshabilitadas. El sitio no adopta un nuevo motor de scroll ni instala dependencias.

## QA visual

- Playwright de 20 casos: **20/20 superados** para escenarios cinematográficos, galería hero anterior, tablet, móvil, escritorio y modo reducido.
- Playwright adicional de capítulo 05: **1/1 superado**, valida cámara activa al entrar, cámara estable al terminar y modo reducido sin estelas.
- Fotografías de revisión: capturas Chromium en 390/726/1440, revisión iterada de consola, experiencias y capítulo 05, sin desbordamiento horizontal ni excepciones JS.
- Tests específicos de Home: **18/18 superados** antes y después de añadir movimiento a capítulo 05.
- Verificación final de producción: `npm run build` finaliza exit 0 y conserva aviso conocido de `vendor-three` grande. Registrar el resto (Vitest, lint) solo cuando terminen.

## Límites conocidos

- El ejemplo de comunidad es ilustrativo, no un chat real ni testimonio verificado.
- Los efectos conceptuales de cohete/galaxia/avión son una narrativa visual CSS/SVG/scroll; no constituyen juego WebXR ni simulación física.
- No se alteraron `main`, producción, precios, pagos, rutas ni datos personales.

## Certificación de la rama antes del PR (confirmado)
- **Build Vite:** exit 0; aviso conocido de `vendor-three` ~893 kB.
- **Vitest:** 112 suites correctas, 784 tests correctos, 1 omitido, 0 fallidos.
- **ESLint:** exit 0, 0 errores y 831 advertencias no bloqueantes.
- **Playwright:** 20/20 tests generales de galería, cámaras, mobile, tablet, desktop y accesibilidad; 1/1 test adicional para la transición scroll-driven del capítulo 05, incluidos finales y modo reducido.
- **Preview compilada 4285:** Chromium a 390/726/1440, estaciones, consola, nave, ruido, fotogramas, portal 05 presentes, cámara con transform activo, sin overflow horizontal y sin errores de JavaScript.
- `git diff --check` y `git diff --cached --check`: sin problemas.
- Producción queda fuera de alcance; merge y push solo a rama del PR.
