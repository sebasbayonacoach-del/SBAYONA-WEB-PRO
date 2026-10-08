# BAYONA PRIME — Galería editorial sin colisiones

Fecha: 2026-10-04
Rama: `bayona-prime/spatial-luxury-spacing-20261004`

## Incidencia visual
En la captura del usuario, el móvil principal, las fotografías secundarias, el título y el indicador se superponían. La inspección de Chromium estableció que, entre 390 y 726 px, `.vision-shift-copy` empezaba aproximadamente **50–70 px antes** del borde inferior de `.vision-shift-visual`. No era un problema de la fotografía, sino de asignación de espacio entre áreas y de demasiados planos con opacidad apreciable.

## Corrección aplicada
- Se separó la región visual y la narrativa: layout móvil/tablet con flex column, reserva de altura del escenario, margen real antes del copy y contención `overflow: clip`.
- Se redujo la visibilidad de imágenes alejadas de la imagen activa: protagonista nítida, solo un adelanto discreto de vecinos; `zIndex` sigue al progreso real del scroll.
- La composición usa estética editorial tipo galería: un protagonista, ambiente sobrio, espacio negativo y un overline BAYONA. Menos grid, menos marcos y ninguna leyenda redundante superpuesta.
- Se ocultó la línea de diez marcas en dispositivos pequeños; el contador de las cinco etapas sigue disponible y el CTA se mantiene.
- En tablet el dispositivo se reduce ligeramente para dejar espacio bajo el menú.
- En escritorio se preserva la composición horizontal con separación entre galería y relato.
- No se cambió la fuente de las diez fotografías, el mensaje aprobado, las rutas, los precios ni el checkout.
- Se conserva la alternativa estática de movimiento reducido.

## Criterio verificable
`e2e/vision-gallery-no-overlap.spec.js` comprueba cinco posiciones de scroll a 390/726/1440 px: para móvil y tablet el título arranca al menos 12 px después del bloque visual, en escritorio el titular queda al menos 24 px a la derecha y el CTA no colisiona con el cuerpo. Sin desbordamiento horizontal.

## Estado
Las evidencias finales (Playwright conjunto, Vitest completo, build y lint) deben cotejarse con los logs de ejecución antes de declarar esta entrega apta. Producción no se despliega.

## Verificación final confirmada
- Playwright completo de la experiencia (visión, dispositivos, movimiento reducido, espacial y no solapamientos): **11 correctas, 0 fallidas**.
- Vitest: **111 suites, 780 pruebas correctas, 1 omitida, 0 fallidas**.
- `npm run build`: exit 0. `npm run lint`: exit 0, cero errores, 823 warnings heredados. `git diff --check`: exit 0.
- Preview compilada en `http://127.0.0.1:4285/`: escena de 726×950 en progreso 0.38, **74 px de separación** visual→titular, 10 marcos presentes, overline presente, progreso de fotos oculto en tablet, sin overflow ni excepciones JS. Captura local `/tmp/bayona-luxury-preview-726.png`.
- Se mantiene el aviso preexistente del tamaño de `vendor-three` (~893 kB minificado).
