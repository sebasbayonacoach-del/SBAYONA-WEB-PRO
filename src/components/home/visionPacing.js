// Segmentos de lectura de BAYONA. Cada etapa mantiene su mensaje estable;
// el último segmento es deliberadamente más largo para leer y usar el CTA.
// El scroll sigue bajo control del visitante: no existen temporizadores.
export const VISION_CHAPTER_BREAKS = Object.freeze([0, 0.17, 0.35, 0.53, 0.72, 1])

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : 0))
const ease = (t) => t * t * (3 - 2 * t)

export function resolveVisionChapter(progress) {
  const value = clamp(progress, 0, 1)
  for (let i = VISION_CHAPTER_BREAKS.length - 2; i >= 0; i--) {
    if (value >= VISION_CHAPTER_BREAKS[i]) return i
  }
  return 0
}

export function resolveVisionGalleryProgress(progress) {
  const value = clamp(progress, 0, 1)
  const chapter = resolveVisionChapter(value)
  const start = VISION_CHAPTER_BREAKS[chapter]
  const end = VISION_CHAPTER_BREAKS[chapter + 1]
  const local = (value - start) / (end - start)
  // La cámara se estabiliza al empezar y al terminar cada capítulo.
  // En Continuidad llega pronto al fotograma final y lo sostiene el resto.
  const begin = chapter === 4 ? 0.05 : 0.23
  const finish = chapter === 4 ? 0.46 : 0.78
  const phase = ease(clamp((local - begin) / (finish - begin), 0, 1))
  const position = chapter * 2 + (chapter === 4 ? 1 : 2) * phase
  return clamp(position / 9, 0, 1)
}
