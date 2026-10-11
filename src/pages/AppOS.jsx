/**
 * BAYONA OS · página del área de miembros (sustituye al recorrido conceptual
 * en la ruta `/app`, que sigue existiendo como componente y como test).
 *
 * Estructura: App Shell + pantalla según la ruta. Cinco destinos, una sola
 * acción primaria por pantalla y procedencia declarada en cada bloque.
 *
 * Honestidad: el panel NO inventa métricas. Solo enseña datos reales de la
 * cuenta (Supabase) o del dispositivo, y estados vacíos cuando no hay dato.
 */
import { useLayoutEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { AppShell } from '../components/app-os/AppShell.jsx'
import { findNavBySectionId, resolveSectionId } from '../components/app-os/navConfig.js'
import { useAppData } from '../lib/app-os/useAppData.js'
import { BAYONA_APP_ENTRY_URL } from '../config/bayonaAppIntegration.js'
import TodayScreen from '../components/app-os/screens/TodayScreen.jsx'
import TrainingScreen from '../components/app-os/screens/TrainingScreen.jsx'
import ProgressScreen from '../components/app-os/screens/ProgressScreen.jsx'
import JourneyScreen from '../components/app-os/screens/JourneyScreen.jsx'
import ProfileScreen from '../components/app-os/screens/ProfileScreen.jsx'
// app.css viaja con la ruta desde la fase anterior; app-os.css es la capa nueva.
import '../styles/app.css'
import '../styles/app-os.css'

const DATE_FORMAT = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function formatDateLabel(date = new Date()) {
  try {
    const text = DATE_FORMAT.format(date)
    return text.charAt(0).toUpperCase() + text.slice(1)
  } catch {
    return ''
  }
}

function ScreenFor({ id, data, dateLabel }) {
  switch (id) {
    case 'training':
      return <TrainingScreen data={data} />
    case 'progress':
      return <ProgressScreen data={data} />
    case 'journey':
      return <JourneyScreen data={data} />
    case 'profile':
      return <ProfileScreen data={data} />
    default:
      return <TodayScreen data={data} dateLabel={dateLabel} />
  }
}

export default function AppOS() {
  const data = useAppData()
  const { search } = useLocation()

  /*
   * Modo OS: mientras se está dentro del panel, la barra de navegación y las
   * migas del sitio de marketing no se superponen (el shell y la barra superior
   * del panel ya cumplen esa función). El PIE NO se oculta nunca: ahí viven el
   * aviso legal y los enlaces obligatorios.
   *
   * Se aplica con `useLayoutEffect` para que ocurra ANTES del primer pintado y
   * no se vea un parpadeo. La clase se retira al salir del panel.
   */
  useLayoutEffect(() => {
    document.body.classList.add('os-mode')
    return () => document.body.classList.remove('os-mode')
  }, [])

  const nav = findNavBySectionId(resolveSectionId(search))
  const dateLabel = formatDateLabel()

  if (data.status === 'loading') {
    return (
      <div className="section-shell os-boot" role="status" aria-live="polite">
        <p className="os-label">BAYONA OS</p>
        <p>Sincronizando tu centro de mando…</p>
      </div>
    )
  }

  return (
    <AppShell
      identity={data.name || data.user?.email || ''}
      tierLabel={data.tierLabel}
      sourceTone={data.sources.tier === 'cloud' ? 'real' : 'empty'}
      sectionLabel={nav.fullLabel}
      dateLabel={dateLabel}
    >
      <ScreenFor id={nav.id} data={data} dateLabel={dateLabel} />

      <aside className="os-disclosure" aria-label="Estado del panel">
        <p>
          <strong>Producto vivo. Claridad antes que ruido.</strong> Este panel solo muestra datos reales de tu
          cuenta o de este dispositivo. Si todavía no existe información suficiente,
          BAYONA te lo dice y te conduce al siguiente paso en lugar de inventar progreso.
        </p>
        <p>La aplicación independiente tiene su propio acceso; los datos de este panel no se transfieren automáticamente.</p>
        <p className="os-disclosure__links">
          <Link className="os-link" to="/resources">Recursos abiertos</Link>
          <Link className="os-link" to="/community">Comunidad</Link>
          <Link className="os-link" to="/faq">Preguntas frecuentes</Link>
          <a className="os-link" href={BAYONA_APP_ENTRY_URL} target="_blank" rel="noopener noreferrer">Abrir BAYONA App · Mi App / Coach Studio ↗</a>
        </p>
      </aside>
    </AppShell>
  )
}
