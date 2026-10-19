# BAYONA WEB 4.0 — Archivo cinematográfico (19/10/2026)

## Estado y procedencia
Se continúa la rama `audit/bayona-sitewide-20261018` desde `3e10669`, usando una rama de trabajo separada: `feature/web4-archive-20261019`.

La galería de `src/components/home/BayonaRealArchive.jsx` contiene ocho secuencias originales del banco local `CONTENIDO_BAYONA/SELECTED_VIDEO/*/APTO_REVISION_FINAL`. Ningún clip proviene de `REVISION_PRIVACIDAD` ni de `REQUIERE_CONSENTIMIENTO`.

Tres vídeos previamente integrados:
- `broll-rio`
- `movimiento-entorno`
- `movimiento-pov`

Cinco nuevas versiones ligeras, generadas para este trabajo:
- `skyline-espana` ← `BROLL_ESPANA/APTO_REVISION_FINAL/2025-12-15_36_VID_20251215_173018.mp4` (8 s desde 3 s)
- `entorno-abierto` ← `ENTORNO_DEPORTIVO/APTO_REVISION_FINAL/2025-12-17_12_VID_20251217_162844.mp4` (8 s desde 12 s)
- `arquitectura-deportiva` ← `ENTORNO_DEPORTIVO/APTO_REVISION_FINAL/2025-12-17_17_VID_20251217_165704.mp4` (8 s desde 0,8 s)
- `ruta-urbana` ← `MOVIMIENTO_POV/APTO_REVISION_FINAL/2025-12-17_06_VID_20251217_163656.mp4` (8 s desde 57 s)
- `campo-abierto` ← `ENTORNO_DEPORTIVO/APTO_REVISION_FINAL/2025-12-17_18_VID_20251217_165202.mp4` (6 s desde 0,2 s)

Los recursos se comprimieron a 540 × 960, H.264 sin audio, con posters WebP independientes. El contenido original se conserva fuera de la web.

## Diseño y rendimiento
- Negro/gris editorial, títulos cinematográficos, ocho capítulos y numeración.
- Cuadrícula de cuatro tarjetas en escritorio, dos en tablet y carrusel táctil en móvil.
- Portada WebP con botón de reproducción accesible. Sólo se monta un vídeo tras pulsarlo; no hay reproducción automática por desplazamiento ni descargas simultáneas de los ocho vídeos. El vídeo seleccionado está silenciado y se pausa fuera de la pantalla.
- Los controles de vídeo permanecen visibles cuando el usuario abre un clip y sin subtítulos superpuestos. El panel flotante de misión se oculta mientras la galería está a la vista.

## Identidad y publicación
**No hay selfies identificadas de Sebastián incorporadas.** El 19/10/2026 se comprobó en `3e10669` que los retratos anteriores se habían atribuido erróneamente: el propietario los rechazó y fueron retirados. Antes de producir imágenes de IA con su rostro, hay que seleccionar y verificar una fotografía auténtica con él. No se deben volver a utilizar las atribuciones anteriores.

Los ocho vídeos siguen siendo material de revisión final, no autorización legal definitiva. Debe completarse la revisión de posibles personas reconocibles, marcas de terceros y derechos antes de publicar en producción. Los reels existentes en redes sociales tampoco se han importado ni duplicado sin comprobar sus URLs, titularidad y permisos.

## Verificación técnica
- Build con Vite: satisfactorio el 19/10/2026 (19,85 s), con advertencia del chunk vendor-three >700 kB que ya existía.
- E2E objetivo: `e2e/bayona-archivo-real-20261019.spec.js`.
- No se ha desplegado ni fusionado en producción automáticamente.
