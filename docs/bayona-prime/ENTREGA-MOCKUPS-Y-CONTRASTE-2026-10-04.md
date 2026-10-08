# BAYONA PRIME — Mockups variados y contraste en la siguiente escena

Fecha: 2026-10-04. Rama: `bayona-prime/device-gallery-contrast-20261004`.
Base: commit `60c0e41`, branch PR #1 `bayona-prime/shop-unified-20261004`.

## Correcciones implementadas

- Se mantienen diez imágenes **reales, diferentes y locales** y la narrativa de scroll. No hay descarga externa ni imágenes añadidas al catálogo de productos.
- La forma del plano depende del contenido: **cinco móviles**, **dos pantallas de ordenador portátiles** y **tres encuadres deportivos orgánicos** sin marco cuadrado. Los teléfonos tienen borde, barra superior y una interfaz conceptual identificada como BAYONA; las pantallas tienen barra, imagen panorámica y base; el resto utiliza silueta editorial.
- No se añadió un renderer WebGL adicional: la profundidad de cámara usa los MotionValues, transformaciones CSS 3D y las fotos WebP existentes.
- Se elimina la doble etiqueta al pie de los teléfonos para dejar la lectura limpia.
- En el bloque `#problemas` el titular negro (`rgb(10,10,10)`) y párrafo negro translúcido sobre fondo oscuro se sustituyen por blanco `#f7f7f3` y blanco al 78 %, respectivamente. El título dispone de mayor ancho en tablet y móvil.
- La tienda mantiene su regla de tarjetas sin imágenes porque los marcos 3D emplean `.vision-spatial-frame` como elemento de galería, no una clase de producto.
- No hay cambios en productos, precios, pagos, rutas ni producción.

## Evidencia

- Navegador Chromium a 390, 726 y 1440px, sin desbordamiento horizontal, errores JS ni fotografías ausentes: confirmado.
- Computed styles `#problemas`: titular `rgb(247,247,243)`; cuerpo `rgba(247,247,243,.78)`, antes negro sobre negro.
- `e2e/vision-devices-contrast.spec.js`, `vision-spatial.spec.js` y `vision-elite.spec.js`: 8 pruebas correctas, incluyendo reduced-motion.
- `npm run build`: exit 0, con aviso previo del peso de `vendor-three`.
- Batería Vitest completa y ESLint: resultados registrados en los logs `/tmp/bayona-device-final-unit.log` y `/tmp/bayona-device-final-lint.log`.

## Alcance

Vista previa local `http://127.0.0.1:4285/`. Las fotos ilustran el entrenamiento; los móviles y ordenadores son maquetas conceptuales, no capturas verificadas de la aplicación. Ninguna afirmación de disponibilidad o rendimiento deportivo se deduce de estas imágenes.

## Resultado final confirmado
- Playwright: **8/8 correctas** (las tres rutas de pruebas de visión y contraste).
- Vitest completo: **111/111 suites**, **780 passed**, **1 skipped**, **0 failed**.
- Vite: `npm run build` finalizó con exit 0.
- ESLint: exit 0, **0 errors, 823 warnings** ya presentes.
- `git diff --check`: exit 0.
- La compilación aún contiene el aviso conocido de paquete `vendor-three` grande; no procede de los mockups CSS.
