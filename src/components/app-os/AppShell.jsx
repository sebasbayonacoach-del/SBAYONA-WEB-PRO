/**
 * BAYONA OS · App Shell.
 *
 * Desktop: barra lateral + zona de mando. Móvil: barra superior de contexto
 * + navegación inferior. No es una «sidebar gigante»: cinco destinos.
 *
 * Accesibilidad: enlace de salto al contenido, `nav` con nombre, `aria-current`
 * en el destino activo y estado activo señalado por posición + línea + peso
 * tipográfico (no solo por color).
 */
import { Link, Outlet, useLocation } from 'react-router-dom'
import { APP_OS_PRIMARY_NAV, resolveSectionId } from './navConfig.js'
import { DataBadge } from './StateBlock.jsx'

function NavMark({ icon }) {
  return <span className={`os-mark os-mark--${icon}`} aria-hidden="true" />
}

export function AppShell({
  identity = '',
  tierLabel = 'GRATIS',
  sourceTone = 'empty',
  sectionLabel = '',
  dateLabel = '',
  children = null,
}) {
  const { search } = useLocation()
  const activeId = resolveSectionId(search)

  return (
    <div className="os-shell">
      <a className="os-skip" href="#os-main">Saltar al contenido de tu panel</a>

      <aside className="os-sidebar">
        <div className="os-brand">
          <span className="os-brand__name">BAYONA</span>
          <span className="os-brand__os">OS</span>
        </div>

        <nav className="os-nav" aria-label="Secciones de tu panel">
          <ul>
            {APP_OS_PRIMARY_NAV.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className={`os-nav__link${activeId === item.id ? ' is-active' : ''}`}
                  aria-current={activeId === item.id ? 'page' : undefined}
                >
                  <NavMark icon={item.icon} />
                  <span className="os-nav__label">{item.label}</span>
                  {item.available
                    ? null
                    : <span className="os-nav__pending" title="En preparación">·</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="os-identity">
          <p className="os-identity__mail" title={identity}>{identity || 'Sesión local'}</p>
          <p className="os-identity__tier">
            <span>{tierLabel}</span>
            <DataBadge tone={sourceTone} />
          </p>
        </div>
      </aside>

      <div className="os-body">
        <header className="os-topbar">
          <p className="os-topbar__section">
            BAYONA OS{sectionLabel ? <span> · {sectionLabel}</span> : null}
          </p>
          {dateLabel ? <p className="os-topbar__date">{dateLabel}</p> : null}
        </header>

        {/*
          `div`, no `main`: desde el pase de 22-09 el panel vuelve a montar el
          chrome del sitio, y `App.jsx` ya envuelve la ruta en
          `<main id="main-content">`. Dos `main` anidados duplican el hito de
          navegación y refuerzan justo la sensación de «otra aplicación» que la
          dirección de producto pide eliminar (§7). El enlace de salto y su
          destino siguen siendo los mismos.
        */}
        <div id="os-main" className="os-main" tabIndex={-1}>
          {children ?? <Outlet />}
        </div>

        <nav className="os-bottomnav" aria-label="Secciones principales">
          <ul>
            {APP_OS_PRIMARY_NAV.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className={`os-bottomnav__link${activeId === item.id ? ' is-active' : ''}`}
                  aria-current={activeId === item.id ? 'page' : undefined}
                >
                  <NavMark icon={item.icon} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default AppShell