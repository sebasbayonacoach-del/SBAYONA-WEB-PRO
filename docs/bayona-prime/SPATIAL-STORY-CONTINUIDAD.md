# BAYONA PRIME — SPATIAL STORY 10× / CONTINUIDAD

**Fecha:** 2026-10-04. **Rama de trabajo:** `bayona-prime/spatial-story-continuidad-20261004`.

## Decisión visual
La antigua foto inclinada única de `VisionShiftStage` se sustituye por una **galería de diez planos con perspectiva CSS 3D** y profundidad de campo escénica. Un eje de scroll de hasta 440vh recorre los diez hitos fotográficos mientras el texto explica cinco cambios de comportamiento. El movimiento lo calcula Framer Motion mediante MotionValues y transformaciones `translate3d`, `rotateY` y `scale` sin renderizar React en cada pixel. No se introdujo una escena WebGL adicional porque implicaría carga GPU y dependencia superior para un efecto posible con CSS 3D nativo.

## Activos verificados
Imágenes locales WebP 960: `jogger-laces-up`, `one-arm-push-up`, `woman-strong-band-exercise`, `weighted-squat-exercise`, `person-stretching-in-fitness-clothing`, `man-running-at-the-track`, `core-strength-fitness`, `woman-lifts-free-weights`, `sunset-hike-to-the-summit`, `strong-women-planking`. Confirmados en `public/images/burst/`. Tamaño agregado en disco alrededor de 592K. Sin servicios externos de imágenes.

## Interacción y venta
El quinto estado, «CONTINUIDAD», conserva el titular «Dejas de vivir reiniciando.» y añade: «Sin entrenar por rachas. Un proceso que puedes adaptar a tu vida, incluso cuando cambia tu semana.» El CTA «DESCUBRE TU PROGRAMA» abre `/programs`; no promete resultados ni simula pagos.

## Accesibilidad y rendimiento
- El relato para lectores de pantalla permanece como lista ordenada semántica.
- La galería de diez fotografías es decoración `aria-hidden`, con textos de estado accesibles por separado y sin anuncios de imágenes redundantes.
- `prefers-reduced-motion` degrada a cinco capítulos estáticos legibles, sin galería dinámica, con CTA final funcional.
- No se usan librerías nuevas.
- Las reglas globales que ocultan medios de tarjetas en la tienda no afectan esta experiencia: se utiliza `.vision-spatial-frame` para planos, no una clase `*-card`.

## Pruebas
- `e2e/vision-spatial.spec.js`: continuidad visual, diez recursos distintos, HTTP 200 de fotos, transformaciones a dos posiciones de scroll, CTA visible, ausencia de desbordamiento y alternativa estática móvil/escritorio.
- `e2e/vision-elite.spec.js`: preserva titular de la introducción y secuencia estática.
- `src/pages/Home.test.jsx` y `Home.contract.test.jsx`: el contenido editorial anterior se conserva.
- La verificación completa de build/Vitest/ESLint se registra en el informe de ejecución, no se declara superada hasta finalizar.
- Vista previa local: `http://127.0.0.1:4285/` cuando se complete la compilación.

No se toca `main` ni el despliegue público.
