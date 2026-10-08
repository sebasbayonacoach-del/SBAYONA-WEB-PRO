# BAYONA PRIME — Smartphone Hero y pausas de lectura

Fecha: 2026-10-04. Rama de trabajo: `bayona-prime/phone-hero-reading-20261004`.

## Corrección de causa raíz

La captura del usuario mostraba una imagen vertical de poca presencia y con bordes cuadrados. Se detectaron dos causas:
1. El marco dependía de porcentajes del ancho de `vision-spatial-track`, ya limitado por media queries de tablet/móvil.
2. Un reset global `*, ::before, ::after { border-radius: 0 !important }` anulaba el radio del dispositivo, el cristal y la cámara, incluso cuando el CSS describía un smartphone.

Se desacopló el tamaño del marco del ancho reducido del track: el escenario dispone de una anchura/altura completas y cada teléfono ocupa el 91–93 % de la altura escénica, con proporción física `9/19.5`, cuerpo metálico, bisel, cristal redondeado, isla superior y controles laterales. El override de radios está limitado a la escena BAYONA, sin cambiar la política editorial de tarjetas en otras rutas. Se incorporó dentro de la pantalla un pequeño lenguaje de workbook con semana, proceso e indicadores de progreso **conceptuales**, no una captura de una app publicada.

## Ritmo y lectura

`visionPacing.js` mapea cinco intervalos de capítulo `[0, .17, .35, .53, .72, 1]` al progreso. Cada etapa inicia y termina con un tramo de estabilidad visual; el quinto capítulo ocupa el 28 % final del progreso. El décimo recurso fotográfico se estabiliza en la primera mitad del capítulo final, dejando el resto para leer el mensaje y clicar el CTA. Longitud de `StickyStage`: `500vh`, máximo validado por el motor frente a los valores anteriores 330/440vh. No hay espera cronometrada ni bloqueo del scroll: el visitante conserva control del ritmo.

La alternativa `prefers-reduced-motion` conserva los cinco capítulos legibles sin la galería dinámica.

## Evidencia en navegador

- Chromium: en 390×844 teléfono final ~186×416 px; 726×950 ~228×512 px; 1440×900 ~307×673 px, según la posición de scroll y la perspectiva.
- Relación de dimensiones y radios físicos, zona separada del copy, CTA visible, ausencia de overflow y errores JS cubiertos por `e2e/vision-phone-hero.spec.js`.
- `src/components/home/visionPacing.test.js`: mapeo monótono, inicio de capítulos y permanencia final.
- Fotos: las mismas diez imágenes WebP locales. No se añaden dependencias.

## Limitaciones

La interface del mockup es una representación conceptual; no equivale a una app BAYONA publicada. No se realizaron cambios en `main` ni despliegue público. Los logs completos de build, Vitest y lint se encuentran bajo `/tmp/bayona-phone-final-*`.

## Verificación definitiva
- Vite producción: exit 0; permanece aviso de bundle `vendor-three` grande.
- Vitest: **112 suites correctas, 784 casos correctos, 1 omitido, 0 fallidos**.
- ESLint: exit 0, 0 errores, 825 advertencias no bloqueantes.
- Playwright smartphone: **4/4**, 390/726/1440 y movimiento reducido; otras **12 pruebas de regresión** de la galería, dispositivos, lectura y scroll pasaron previamente en el mismo cambio antes de corregir el reset de radios.
- Preview Vite compilada en `127.0.0.1:4285`: comprobación real a 726×950, teléfono 228×512, radio **47,5px**, quinto estado activo, separación copy 24px, CTA completo, diez fotografías disponibles, sin overflow ni excepciones JavaScript.
