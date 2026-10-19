# BAYONA PRIME — 21 efectos procedurales distribuidos por el sitio

Fuente de inspiración visual: https://www.aidesigner.ai/backgrounds (catálogo público consultado 2026-10-19). La galería contiene **21** efectos agrupados en Gradients, Ambient y Particles. La posibilidad de previsualizar en AIDesigner es gratuita, pero no significa que su código fuente WebGL sea de dominio público.

**Implementación original:** `src/components/effects/drawProceduralEffect.js` genera interpretaciones independientes mediante Canvas 2D, y NO reproduce ni incorpora shaders originales de AIDesigner. `effectRegistry.js` define una ubicación distinta por efecto. `AmbientEffects.jsx` monta los lienzos decorativos por ruta, al cargar la sección React correspondiente.

## Los 21 efectos y su ubicación

| Nº | Efecto | Ruta BAYONA | Superficie concreta |
|---:|---|---|---|
| 01 | Fluted Glass | /about | Cierre de presentación BAYONA App |
| 02 | Riso Dither | /parkour-academy | Los tres niveles |
| 03 | Noise Shimmer | /programs | Portada Servicios |
| 04 | Dot Grid Wave | / | Tres pasos para empezar |
| 05 | Fluid Smoke | /resources | Cierre / acceso a recursos |
| 06 | Light Rays | /parkour-academy | Portada Parkour |
| 07 | Holo Foil | /shop | Producto destacado |
| 08 | Halftone | /resources | Portada Recursos |
| 09 | Caustics | /shop | Cómo funciona la tienda |
| 10 | Aurora Flow | /community | Niveles de comunidad |
| 11 | Silk Waves | /community | Cierre Comunidad |
| 12 | Liquid Metal | /app | Instalar app |
| 13 | Heatmap | /programs | Cierre Servicios |
| 14 | Liquid Glass | /app | Mi App / Coach Studio |
| 15 | Mesh Gradient | / | Primera presentación de la app |
| 16 | Starfield | /parkour-academy | Cierre Parkour |
| 17 | Bokeh Dust Drift | /community | Momentos de la semana |
| 18 | Glow Orbs | / | Recursos gratuitos |
| 19 | ASCII Plasma | /resources | Protocolo de siete días |
| 20 | Pixel Grid | /resources | Biblioteca / revista |
| 21 | Topo Lines | /movimiento-adaptado | Criterios, límites y derivación |

La fotografía de apertura `/#inicio` **no recibe un efecto adicional**: el usuario había solicitado una portada limpia y cinematográfica.

## Contrato de movimiento y accesibilidad

- Renderizado bajo demanda: intersección con la pantalla + 120 px de anticipo.
- Un bucle de animación global con límite de **24 FPS**. Cada lienzo utiliza un buffer reducido (máximo 900 × 580 px).
- Cuando una sección se aleja, deja de pintarse. Con `prefers-reduced-motion: reduce` se muestra un fotograma estático y **no se anima**.
- Todos los lienzos llevan `aria-hidden=true` y `pointer-events:none`. Son decorativos: no bloquean clics, scroll, formularios, enlaces o lectores de pantalla.
- El motor se carga diferido y **no aparece en las páginas de pagos ni en el código interno de la PWA**.
- Los shaders de terceros, librerías gráficas y el motor WebGL no son requisitos. De hecho, esta capa solo usa la API Canvas 2D que trae el navegador.

## Pruebas

```bash
npx vitest --run src/components/effects/effectRegistry.test.js
npx playwright test e2e/bayona-21-effects-20261019.spec.js
npm run build
```

Comprobación en navegador: las diez rutas se recorren en `scripts/smoke-21-effects.mjs`; checkout no recibe lienzos decorativos. La inspección de píxeles usa `scripts/smoke-effects-visual.mjs`.

## Estado

Todo lo anterior pertenece a la rama de trabajo `audit/bayona-sitewide-20261018`, no constituye publicación de producción. No se han modificado datos, suscripciones ni autenticación.

## Auditoría visual y corrección · 19/10/2026

La primera implementación resultó demasiado invasiva: los lienzos se colocaban a z-index 5, por encima de las tarjetas y la tipografía, ocupaban secciones completas y deformaban los patrones al estirar lienzos muy grandes. Las capturas mostraron especialmente ondas sobre los planes de Comunidad, puntos sobre las tarjetas de Parkour y rayas verticales sobre la imagen de Nosotros.

La corrección utiliza z-index -1 dentro de la sección aislada, posición de acento en lugar de capa a pantalla completa, tamaño máximo de 700 × 540 px (móvil hasta 440 × 340), transparencia por familia de efecto y máscara radial que desvanece los patrones antes de las zonas de lectura. El motor calcula ahora la resolución desde el rectángulo visual real del canvas y deja de distorsionarse con la altura de capítulos largos. El HUD de misión de escritorio ocupa una superficie más pequeña. Se respeta el movimiento reducido y el clic siempre atraviesa el lienzo.

Evidencia: capturas antes/después de Aurora Flow, Riso Dither, Halftone, Fluted Glass, Holo Foil y Mesh Gradient, además de pruebas Playwright de capas, límites y accesibilidad en `e2e/bayona-effects-visual-audit-20261019.spec.js`. Los 21 nombres y ubicaciones originales se mantienen.
