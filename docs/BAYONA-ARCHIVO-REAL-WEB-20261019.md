# BAYONA — Archivo real incorporado a la web (19/10/2026)

## No hay rostros generados en esta sección

La página de Inicio incorpora `src/components/home/BayonaRealArchive.jsx`, con fotos y vídeo **extraídos del archivo personal en el ordenador**. Se ha descartado expresamente utilizar las maquetas generadas por IA que mostraban otra cara, cifras ficticias y supuestos reels con millones de visualizaciones.

## Fotografías originales

- `selfie-exterior-2026-04-11.jpg` ← `CONTENIDO_BAYONA/SELECTED/04_LIFESTYLE/REVISION/2026-04-11_LIFESTYLE_12.jpg`, misma suma SHA256 `49cc46e8a860d9ea314e20f4e1567398feb08b2da77796fb5e35f55b44268371`; coincide con foto adjunta del archivo conversacional `selfie_exterior_2026-04-11.jpg`.
- `selfie-azotea-2026-01-07.webp` ← `SELECTED/01_HISTORIA/REVISION/2026-01-07_HISTORIA_01.webp`, conserva texto sobrepuesto del original.
- `recorrido-montana-2026-02-23.jpg` ← `SELECTED/03_MOVIMIENTO/REVISION/2026-02-23_MOVIMIENTO_06.jpg`.

La selfie exterior se emplea además en `/about` y el avatar del asistente, en lugar de `retrato-frontal.webp` procedente de un proyecto anterior cuya identidad no estaba confirmada contra esta selfie.

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

`e2e/bayona-archivo-real-20261019.spec.js`: fotos accesibles, tres vídeos originales, fuentes MP4, rendimiento responsive y retrato consistente entre Nosotros y el asistente.

**Prohibición editorial:** ningún retrato generado por IA se presentará como una fotografía de Sebastián Bayona si no se ha demostrado la correspondencia facial con una referencia real.
