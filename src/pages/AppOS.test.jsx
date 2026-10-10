import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AppOS from './AppOS.jsx'

function renderOS(entry = '/app') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <AppOS />
    </MemoryRouter>,
  )
}

/** El panel arranca en 'loading' hasta que el efecto resuelve el modo local. */
async function renderReady(entry = '/app') {
  const view = renderOS(entry)
  await waitFor(() => expect(screen.queryByText(/Preparando tu panel/i)).not.toBeInTheDocument())
  return view
}

describe('BAYONA OS · arranque y shell', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('no deja ninguna sección sin guardia ni enlace de salto', async () => {
    const { container } = await renderReady()
    expect(screen.getByRole('link', { name: /Saltar al contenido/i })).toHaveAttribute('href', '#os-main')
    expect(container.querySelector('#os-main')).not.toBeNull()
    expect(screen.getByRole('navigation', { name: 'Secciones de tu panel' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Secciones principales' })).toBeInTheDocument()
  })

  it('expone exactamente cinco destinos y marca el activo sin depender del color', async () => {
    await renderReady()
    const nav = screen.getByRole('navigation', { name: 'Secciones de tu panel' })
    const links = within(nav).getAllByRole('link')
    expect(links).toHaveLength(5)
    expect(links.map((link) => link.getAttribute('aria-current')))
      .toEqual(['page', null, null, null, null])
    expect(links[0].className).toContain('is-active')
  })

  it('una sección desconocida cae en HOY (nunca en una pantalla vacía)', async () => {
    await renderReady('/app?s=loquesea')
    expect(screen.getByRole('heading', { level: 1, name: /TU CENTRO DE MANDO/i })).toBeInTheDocument()
  })

  it('ofrece el acceso a BAYONA App real sin confundir las dos sesiones', async () => {
    await renderReady()
    const link = screen.getByRole('link', { name: /Abrir BAYONA App · Mi App \/ Coach Studio/i })
    expect(link).toHaveAttribute('href', 'https://bayona-app-one.vercel.app/?source=pwa')
    expect(link).toHaveAttribute('target', '_blank')
    expect(screen.getByText(/los datos de este panel no se transfieren automáticamente/i)).toBeInTheDocument()
  })

  it('declara el estado del producto en todo el panel', async () => {
    await renderReady()
    expect(screen.getByText(/Producto vivo/i)).toBeInTheDocument()
  })

  it('no monta 3D, ni vídeo, ni iframes en el panel', async () => {
    const { container } = await renderReady()
    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelector('audio, video, iframe')).toBeNull()
  })
})

describe('BAYONA OS · TODAY es el panel de mando', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('enseña una única acción primaria y la rotula como sesión de ejemplo', async () => {
    await renderReady()
    expect(screen.getByRole('heading', { level: 2, name: /APP DEL CLIENTE/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /LO QUE TU CUENTA CONSERVA/i })).toBeInTheDocument()
    expect(screen.getByText(/Ruta, crédito, recursos y selección de tienda/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /Base atlética RAÍZ/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /MARCAR SESIÓN DE HOY/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /RESTAURAR BASE/i })).toBeInTheDocument()
    expect(screen.getByText(/no una prescripción personalizada/i)).toBeInTheDocument()
  })

  it('sin registros con fecha el instrumento NI pinta un 0 %', async () => {
    await renderReady()
    const ring = screen.getByRole('img', { name: /sin datos suficientes todavía/i })
    expect(ring).toBeInTheDocument()
    // El aro vacío se declara con raya: ni 0 % ni cifra sin respaldo.
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText(/Sin datos todavía/i).length).toBeGreaterThan(0)
  })

  it('registra la sesión de verdad y lo dice sin exagerar', async () => {
    await renderReady()
    fireEvent.click(screen.getByRole('button', { name: /MARCAR SESIÓN DE HOY/i }))

    expect(await screen.findByText(/Sesión registrada en este dispositivo/i)).toBeInTheDocument()
    expect(window.localStorage.getItem('bayona_progress_count')).toBe('1')
    // El contador real del dispositivo se refleja en la métrica correspondiente.
    expect(screen.getByText('SESIONES EN ESTE DISPOSITIVO')).toBeInTheDocument()
  })

  it('permite estructurar el programa del cliente y guardarlo localmente', async () => {
    await renderReady()
    const input = screen.getByLabelText(/Nombre del programa/i)
    fireEvent.change(input, { target: { value: 'Hipertrofia ELITE · Semana 04' } })

    expect(screen.getByRole('heading', { level: 2, name: /Hipertrofia ELITE/i })).toBeInTheDocument()
    expect(window.localStorage.getItem('bayona_client_program_v1')).toContain('Hipertrofia ELITE')
  })

  it('el estado vacío del historial es una invitación, no un «no data»', async () => {
    await renderReady()
    expect(screen.getByText(/TU CAMINO EMPIEZA AQUÍ/i)).toBeInTheDocument()
    expect(screen.queryByText(/No data/i)).not.toBeInTheDocument()
  })
})

describe('BAYONA OS · secciones', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('TRAINING tiene checklist real y declara lo que aún no existe', async () => {
    const { container } = await renderReady('/app?s=training')
    const lista = container.querySelector('.os-checklist')
    expect(within(lista).getAllByRole('checkbox')).toHaveLength(5)
    expect(screen.getByText(/0 de 5 bloques marcados/i)).toBeInTheDocument()
    expect(screen.getByText(/Editor de programa pendiente de backend/i)).toBeInTheDocument()
  })

  it('PROGRESS no dibuja gráficas sin datos y no inventa cumplimiento', async () => {
    await renderReady('/app?s=progress')
    expect(screen.getByText(/SIN DATOS DE ENTRENAMIENTO TODAVÍA/i)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /Sesiones registradas/i })).not.toBeInTheDocument()
    expect(screen.getByText(/Cumplimiento del programa/i)).toBeInTheDocument()
  })

  it('JOURNEY sin hitos no inventa progreso', async () => {
    await renderReady('/app?s=journey')
    expect(screen.getByText(/Todavía no hay hitos/i)).toBeInTheDocument()
  })

  it('PROFILE declara la membresía real y no enumera beneficios sin confirmar', async () => {
    await renderReady('/app?s=profile')
    // El plan aparece en la barra de identidad y en la ficha de membresía.
    expect(screen.getAllByText('GRATIS').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Aquí solo aparece el estado real de tu cuenta/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /CERRAR SESIÓN/i })).toBeInTheDocument()
  })

  it('PROFILE avisa de que el cierre de sesión borra el dato del dispositivo', async () => {
    await renderReady('/app?s=profile')
    expect(screen.getByText(/se borra el contador guardado en este dispositivo/i)).toBeInTheDocument()
  })
})
