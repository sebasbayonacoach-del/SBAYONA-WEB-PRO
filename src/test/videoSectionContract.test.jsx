// Contrato de integración de material humano — Fase 10.1 PREP (Turno 003).
//
// CONTEXTO: FASE 10.0 detectó que los 3 VideoSection (Home, Programs, App)
// están montados SIN videoId/videoUrl — son placeholders honestos ("VIDEO
// PRÓXIMAMENTE", botón deshabilitado) hasta que Sebastián entregue el material
// real. ESTA FASE NO AÑADE VIDEO: prepara el mecanismo para que la
// integración sea quirúrgica y para que NADIE pueda fingir que está hecho.
//
// Regla del arquitecto (Turno 003): READY ≠ CONFIGURED ≠ RUNNING ≠ PROVEN.
// Este test fija los tres primeros estados del contrato:
//   1. READY: sin videoId → placeholder legítimo, botón deshabilitado,
//      aria-label "Video próximamente" — NUNCA un embed vacío.
//   2. CONFIGURED: con videoId válido → embed youtube-nocookie correcto,
//      botón activo, label "VIDEO BAYONA".
//   3. CONFIGURED-rechazos: ID inválido (URL completa, ID con espacios,
//      demasiado corto) → se trata como SIN vídeo (fail-closed, no crash).
// Cuando el vídeo real corra contra la web, PROVEN se verifica con los
// gates E2E descritos en FASE10.0-HUMAN-MATERIAL-AUDIT.md §7 (fuera de aquí).
//
// Si este test se pone rojo al llegar material real, NO es un bug del test:
// es que la integración violó el contrato (embed sin nocookie, ID sucio,
// placeholder eliminado sin vídeo).

import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import VideoSection from '../components/VideoSection.jsx'

vi.mock('framer-motion', () => ({
  useReducedMotion: vi.fn(() => false),
}))

const POSTER = '/images/burst/test-poster.jpg'

describe('contrato VideoSection — material humano 10.1 (READY/CONFIGURED)', () => {
  it('READY: sin videoId/videoUrl renderiza placeholder honesto con botón deshabilitado', () => {
    render(
      <VideoSection
        title="EL MÉTODO BAYONA EN 2 MIN"
        subtitle="Sebastián resume el método."
        poster={POSTER}
        duration="2 MIN"
      />,
    )
    expect(screen.getByText('VIDEO PRÓXIMAMENTE')).toBeInTheDocument()
    const play = screen.getByRole('button')
    expect(play).toBeDisabled()
    expect(play).toHaveAttribute(
      'aria-label',
      'Video próximamente: EL MÉTODO BAYONA EN 2 MIN',
    )
    // Sin iframe y sin <video>: el placeholder NUNCA monta un reproductor.
    expect(document.querySelector('iframe')).toBeNull()
    expect(document.querySelector('video')).toBeNull()
  })

  it('CONFIGURED: videoId válido activa embed youtube-nocookie y botón reproducible', () => {
    render(
      <VideoSection
        title="VÍDEO REAL"
        poster={POSTER}
        videoId="dQw4w9WgXcQ"
        duration="2 MIN"
      />,
    )
    expect(screen.getByText('VIDEO BAYONA')).toBeInTheDocument()
    const play = screen.getByRole('button')
    expect(play).not.toBeDisabled()
    expect(play).toHaveAttribute('aria-label', 'Reproducir VÍDEO REAL')
    // El embed solo aparece TRAS el clic (0 bytes de YouTube antes).
    expect(document.querySelector('iframe')).toBeNull()
    act(() => {
      play.click()
    })
    const iframe = document.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe.getAttribute('src')).toContain(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    )
    // Tras un clic del usuario el autoplay=1 es correcto (gesto explícito);
    // sin reduced-motion arranca solo. El caso reduce se prueba aparte.
    expect(iframe.getAttribute('src')).toContain('autoplay=1')
    expect(iframe.getAttribute('loading')).toBe('lazy')
  })

  it('CONFIGURED: reduced-motion NO fuerza autoplay en el embed', async () => {
    const { useReducedMotion } = await import('framer-motion')
    useReducedMotion.mockReturnValue(true)
    render(<VideoSection title="VÍDEO RM" poster={POSTER} videoId="abc123XYZ_9" />)
    act(() => {
      screen.getByRole('button').click()
    })
    const src = document.querySelector('iframe').getAttribute('src')
    expect(src).toContain('autoplay=0')
  })

  it('fail-closed: ID inválido (URL entera) se degrada a placeholder, no a embed roto', () => {
    render(
      <VideoSection
        title="ID SUCIO"
        poster={POSTER}
        videoId="https://www.youtube.com/watch?v=abc123XYZ_9"
      />,
    )
    expect(screen.getByText('VIDEO PRÓXIMAMENTE')).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('fail-closed: ID con espacios o demasiado corto no pasa la validación', () => {
    const { rerender } = render(<VideoSection title="T" poster={POSTER} videoId="abc 123" />)
    expect(screen.getByRole('button')).toBeDisabled()
    rerender(<VideoSection title="T" poster={POSTER} videoId="ab" />)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(document.querySelector('iframe')).toBeNull()
  })

  it('videoUrl propio: se monta <video> con poster y captions cuando se da la URL', () => {
    render(
      <VideoSection
        title="VÍDEO LOCAL"
        poster={POSTER}
        videoUrl="/media/founder/v1-metodo.mp4"
        captionsSrc="/media/founder/v1-metodo.vtt"
      />,
    )
    act(() => {
      screen.getByRole('button').click()
    })
    const video = document.querySelector('video')
    expect(video).not.toBeNull()
    expect(video.getAttribute('src')).toBe('/media/founder/v1-metodo.mp4')
    expect(video.getAttribute('poster')).toBe(POSTER)
    const track = video.querySelector('track')
    expect(track.getAttribute('kind')).toBe('captions')
    expect(track.getAttribute('srcLang')).toBe('es')
  })
})
