# BAYONA — Archivo real incorporado a la web (19/10/2026)

## No hay rostros generados en esta sección

La página de Inicio incorpora `src/components/home/BayonaRealArchive.jsx`, con vídeos del archivo audiovisual localizado en el ordenador. Se ha descartado expresamente utilizar las maquetas generadas por IA que mostraban otra cara, cifras ficticias y supuestos reels con millones de visualizaciones.

## Corrección de identidad — 19/10/2026

El propietario indicó explícitamente que las fotografías de las personas presentadas en la web **NO son suyas**. Se retiraron las fotografías y retratos no confirmados de los recursos públicos del proyecto. Su inclusión y descripción como retratos de Sebastián fue un error. No se borraron los originales de la biblioteca privada de trabajo.

La sección /about ahora muestra exclusivamente un fotograma de paisaje del clip de archivo \`broll-rio.webp\`; el asistente vuelve a mostrar un monograma tipográfico «SB» y el Inicio presenta únicamente clips de lugares y movimiento sin rostro atribuido. Los retratos pendientes deben validarse con el propietario en un panel privado, jamás directamente en la web.

## Vídeos auténticos

Fuente: `CONTENIDO_BAYONA/SELECTED_VIDEO/` — clips marcados previamente `APTO_REVISION_FINAL`. Se seleccionaron secuencias sin personas identificables en los fotogramas revisados.

- `broll-rio.mp4` ← `BROLL_ESPANA/APTO_REVISION_FINAL/2025-12-15_34_VID_20251215_154122.mp4`.
- `movimiento-entorno.mp4` ← `ENTORNO_DEPORTIVO/APTO_REVISION_FINAL/2025-12-17_20_VID_20251217_165152.mp4`.
- `movimiento-pov.mp4` ← `MOVIMIENTO_POV/APTO_REVISION_FINAL/2025-12-17_09_VID_20251217_162721.mp4`.

Cada uno tiene un fragmento de **hasta ocho segundos**, sin audio, redimensionado a 540 px con MP4 H.264 para no saturar la web. Las portadas WebP se han obtenido de cada clip original. El vídeo se reproduce silenciado al aparecer en pantalla, se pausa fuera del campo visual y se detiene por `prefers-reduced-motion`. No se indican reproducciones, testimonios ni estadísticas ficticias.

## Privacidad y derechos

La carpeta `REQUIERE_CONSENTIMIENTO` está excluida. Los vídeos personales de `REVISION_PRIVACIDAD` también están excluidos. No se ha publicado en redes sociales ni desplegado en la web pública; estos cambios residen solamente en la rama `audit/bayona-sitewide-20261018`.

Antes de desplegar públicamente conviene que el propietario confirme que los tres fragmentos son publicables, incluida la ausencia de personas que requieran consentimiento. La inspección de fotogramas es parcial y no equivale a un visionado legal exhaustivo.

## Verificación

`e2e/bayona-archivo-real-20261019.spec.js`: ausencia de fotos sin identidad confirmada, tres vídeos originales, fuentes MP4, rendimiento responsive y asistente sin retrato.

**Prohibición editorial:** ningún retrato generado por IA se presentará como una fotografía de Sebastián Bayona si no se ha demostrado la correspondencia facial con una referencia real.
