/**
 * BAYONA OS · pantalla TODAY (la más importante del panel).
 *
 * Jerarquía: saludo e identidad → TU SIGUIENTE MOVIMIENTO (una sola acción
 * primaria) → instrumento de progreso → métricas de la semana.
 *
 * Honestidad de datos: la rutina es un EJEMPLO publicado y se rotula como
 * tal; las métricas son conteos reales (nube o dispositivo) y, cuando no
 * hay registro, el bloque declara su estado vacío en vez de pintar un 0 %.
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, Check, Cpu, Lock, NotebookPen, Radar, ShieldCheck, Target } from 'lucide-react'
import { ProgressRing } from '../ProgressRing.jsx'
import { StateBlock, DataBadge } from '../StateBlock.jsx'
import { ROUTINE_EXAMPLE } from '../../../lib/app-os/progressStore.js'
import { useClientProgram } from '../../../lib/app-os/clientProgram.js'
import { useVisitorJourney } from '../../../lib/onboarding/VisitorJourneyProvider.jsx'
import { useRewards } from '../../../lib/rewards/RewardsProvider.jsx'
import { whatsAppLink } from '../../../config/site.config.js'
import WhatsAppMark from '../../companion/WhatsAppMark.jsx'
import { selectCartCount, selectCartTotalCOP, useCartStore } from '../../../store/cartStore.js'

const WEEK_DAYS = 7

/**
 * Funciones reservadas al acceso anticipado (§7). Se enuncian como piezas en
 * preparación, nunca como candados sobre algo que ya existiera: el panel no
 * puede enseñar como «bloqueado» un producto que todavía no se ha entregado.
 */
const LOCKED_FOR_SUBSCRIBERS = Object.freeze([
  Object.freeze({ title: 'Lectura de carga y recuperación', copy: 'En definición. Depende de un registro por ejercicio que aún no existe.' }),
  Object.freeze({ title: 'Historial con tu entrenador', copy: 'El hilo de revisión vive hoy en WhatsApp, no dentro del panel.' }),
  Object.freeze({ title: 'Plan personal en la app', copy: 'La app está en preparación: no hay descarga ni cuentas de app.' }),
])

/** Consulta: el panel no registra consultas, así que no finge tenerlas. */
const CONSULT_URL = whatsAppLink('Hola BAYONA, quiero abrir una consulta desde mi centro de mando.')

export function TodayScreen({ data, dateLabel }) {
  const [feedback, setFeedback] = useState('')
  const [busy, setBusy] = useState(false)
  const { program, updateProgram, restoreProgram } = useClientProgram()
  const journey = useVisitorJourney()
  const rewards = useRewards()
  const cartCount = useCartStore(selectCartCount)
  const cartTotalCOP = useCartStore(selectCartTotalCOP)

  const { week, localSessions, hasCloudRows, cloud, greeting, name } = data
  const signalTone = hasCloudRows ? 'real' : localSessions > 0 ? 'derived' : 'empty'
  const displayName = name && !name.includes('@') ? name : 'TU CENTRO DE MANDO'
  const routePlan = journey.route?.plan ?? 'Sin ruta guardada'
  const resourceName = journey.route?.resource ?? 'Biblioteca abierta'
  /*
    Saldo del pase (§6 y §7): se muestran los créditos RECLAMADOS, que son los
    que se pueden canjear, y se dice lo que todavía espera un clic. El panel no
    canta como guardado lo que la visita aún no reclamó.
  */
  const creditLabel = rewards.bonusClaimed ? rewards.format(rewards.totalEur) : 'Pase pendiente'
  const creditNote = !rewards.bonusClaimed
    ? 'Reclámalo desde el pase de llegada.'
    : rewards.pendingSealCount > 0
      ? `${rewards.pendingSealCount} ${rewards.pendingSealCount === 1 ? 'sello' : 'sellos'} sin reclamar (${rewards.format(rewards.pendingEur)}): todavía puedes cobrarlos.`
      : 'Cortesía guardada para tu primer plan.'
  const cartLabel = cartCount > 0 ? `${cartCount} ${cartCount === 1 ? 'pieza' : 'piezas'}` : 'Sin selección'
  const cartValue = cartCount > 0 ? `$${cartTotalCOP.toLocaleString('es-CO')} COP` : '—'
  const purchasedLabel = data.paid ? `Plan ${data.tierLabel} activo` : 'Plan gratis'
  const purchasedNote = data.paid
    ? 'La contratación se cierra con una persona: aquí no se simulan cobros.'
    : 'Sin compra registrada. Se cierra por WhatsApp o en la tienda.'
  const consultLabel = 'Sin consulta abierta'
  const consultNote = 'Se pide por WhatsApp o desde Recursos. El panel no inventa hilos.'
  const challengeLabel = `${localSessions} ${localSessions === 1 ? 'sesión' : 'sesiones'} marcadas`
  const plusLabel = 'En preparación'

  async function handleRegister() {
    if (busy) return
    setBusy(true)
    const result = await data.registerSession()
    setBusy(false)
    setFeedback(result?.persisted
      ? 'Sesión registrada en tu cuenta.'
      : 'Sesión registrada en este dispositivo. Al conectar tu cuenta quedará en tu historial.')
  }

  return (
    <div className="os-today">
      <header className="os-today__head">
        <p className="os-eyebrow">{greeting}</p>
        <h1 className="os-today__title">{displayName}</h1>
        {dateLabel ? <p className="os-today__date">{dateLabel}</p> : null}
      </header>

      <section className="os-command-grid" aria-label="Estado operativo de BAYONA OS">
        <article className="os-command-card os-command-card--wide">
          <div className="os-command-card__icon" aria-hidden="true">
            <Cpu size={18} strokeWidth={1.5} />
          </div>
          <p className="os-command-card__label">TU PROBLEMA, ORDENADO</p>
          <h2 className="os-command-card__value">APP DEL CLIENTE · UNA SOLA DIRECCIÓN</h2>
          <p className="os-command-card__copy">
            Sin rutinas perdidas ni dudas acumuladas: aquí ves qué toca, registras lo que pasó y
            recibes el siguiente ajuste con contexto.
          </p>
        </article>

        <article className="os-command-card">
          <div className="os-command-card__icon" aria-hidden="true">
            <Activity size={18} strokeWidth={1.5} />
          </div>
          <p className="os-command-card__label">SEÑAL</p>
          <p className="os-command-card__value">{hasCloudRows ? `${week.sessions}` : localSessions}</p>
          <DataBadge tone={signalTone}>
            {hasCloudRows ? 'Semana real' : localSessions > 0 ? 'Local real' : 'Sin actividad'}
          </DataBadge>
        </article>

        <article className="os-command-card">
          <div className="os-command-card__icon" aria-hidden="true">
            <Target size={18} strokeWidth={1.5} />
          </div>
          <p className="os-command-card__label">FOCO</p>
          <p className="os-command-card__value">RAÍZ A</p>
          <DataBadge tone="concept">Ejemplo guiado</DataBadge>
        </article>

        <article className="os-command-card">
          <div className="os-command-card__icon" aria-hidden="true">
            <ShieldCheck size={18} strokeWidth={1.5} />
          </div>
          <p className="os-command-card__label">SEGURIDAD</p>
          <p className="os-command-card__value">RLS</p>
          <DataBadge tone={cloud.enabled ? 'real' : 'offline'}>
            {cloud.enabled ? 'Nube lista' : 'Modo local'}
          </DataBadge>
        </article>
      </section>

      <section className="os-program-console" aria-labelledby="os-program-console-title">
        <div className="os-program-console__hero">
          <p className="os-label">PROGRAMA ACTIVO</p>
          <h2 id="os-program-console-title">{program.name}</h2>
          <p>{program.coachNote}</p>
          <div className="os-program-console__meta" aria-label="Estado del programa">
            <span>{program.phase}</span>
            <span>{program.week}</span>
            <span>{program.nextCheckIn}</span>
          </div>
        </div>

        <div className="os-readiness-grid" aria-label="Señales del cliente">
          {program.readiness.map((item) => (
            <article className={`os-readiness-card os-readiness-card--${item.tone}`} key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>

        <ol className="os-week-plan" aria-label="Plan semanal del cliente">
          {program.weekPlan.map((day) => (
            <li className={day.status === 'Hoy' ? 'is-today' : ''} key={day.day}>
              <span>{day.day}</span>
              <strong>{day.focus}</strong>
              <small>{day.status}</small>
            </li>
          ))}
        </ol>
      </section>

      <section className="os-vault" aria-labelledby="os-vault-title">
        <div className="os-vault__intro">
          <p className="os-label">VAULT BAYONA</p>
          <h2 id="os-vault-title">LO QUE TU CUENTA CONSERVA.</h2>
          <p>
            Ruta, crédito, recursos y selección de tienda viven juntos aquí. Si algo todavía
            no está conectado, aparece como pendiente; no rellenamos el panel con ficción.
          </p>
        </div>
        <div className="os-vault__grid">
          <article>
            <span>Ruta recomendada</span>
            <strong>{routePlan}</strong>
            <small>{journey.hasRoute ? 'Desde tu recepción BAYONA' : 'Completa la recepción para personalizarla'}</small>
          </article>
          <article>
            <span>Crédito BAYONA</span>
            <strong>{creditLabel}</strong>
            <small>{creditNote}</small>
          </article>
          <article>
            <span>Pedido preparado</span>
            <strong>{cartLabel}</strong>
            <small>{cartValue}</small>
          </article>
          <article>
            <span>Recurso activo</span>
            <strong>{resourceName}</strong>
            <small>{journey.hasRoute ? 'Elegido según tu ruta' : 'Disponible aunque no tengas cuenta'}</small>
          </article>
          <article>
            <span>Compras y sesiones</span>
            <strong>{purchasedLabel}</strong>
            <small>{purchasedNote}</small>
          </article>
          <article>
            <span>Consulta pendiente</span>
            <strong>{consultLabel}</strong>
            <small>{consultNote}</small>
          </article>
          <article>
            <span>Progreso del reto</span>
            <strong>{challengeLabel}</strong>
            <small>Se alimenta de las sesiones que marcas, no de estimaciones.</small>
          </article>
          <article>
            <span>Comunidad</span>
            <strong>Entrada abierta</strong>
            <small>Gratuita: no necesita plan ni cuenta.</small>
          </article>
          <article>
            <span>BAYONA+</span>
            <strong>{plusLabel}</strong>
            <small>La app está en preparación: aquí verás tu acceso cuando exista.</small>
          </article>
        </div>
        <div className="os-vault__actions">
          <Link className="os-cta os-cta--ghost" to="/onboarding">Actualizar mi ruta</Link>
          <Link className="os-link" to="/shop">Revisar mi pedido</Link>
          <Link className="os-link" to="/resources">Abrir recursos</Link>
          <Link className="os-link" to="/community">Entrar en la comunidad</Link>
        </div>
      </section>

      {/*
        Funciones reservadas (§7 y §15 de la dirección de producto): lo que un
        plan con acceso anticipado traería. Se declaran como lo que son hoy,
        piezas en preparación, no un candado sobre algo que ya funciona.
      */}
      <section className="os-locked" aria-labelledby="os-locked-title">
        <div className="os-panel__head">
          <p className="os-label">RESERVADO A SUSCRIPTORES</p>
          <h2 id="os-locked-title">Lo que todavía no puedes abrir.</h2>
        </div>
        <ul className="os-locked__list">
          {LOCKED_FOR_SUBSCRIBERS.map((item) => (
            <li key={item.title}>
              <Lock size={15} strokeWidth={1.6} aria-hidden="true" />
              <span>
                <strong>{item.title}</strong>
                <small>{item.copy}</small>
              </span>
            </li>
          ))}
        </ul>
        <p className="os-locked__foot">
          El acceso anticipado a BAYONA+ está publicado como beneficio de RENDIMIENTO y, por
          herencia, de ELITE. Ninguna de estas funciones se ha entregado todavía.
        </p>
        <Link className="os-cta os-cta--ghost" to="/programs">COMPARAR PLANES</Link>
      </section>

      {/* Cierre humano (§7 y §8): si el panel no puede resolverlo, WhatsApp. */}
      <section className="os-handoff" aria-labelledby="os-handoff-title">
        <div>
          <p className="os-label">SIGUIENTE PASO</p>
          <h2 id="os-handoff-title">¿Prefieres que te lo resuelva una persona?</h2>
          <p>
            El panel no sustituye la conversación: horarios, lesiones, precios y cualquier cosa que
            todavía no esté publicada se confirman por WhatsApp con Sebastián.
          </p>
        </div>
        <div className="os-handoff__actions">
          <a
            className="os-cta os-cta--whatsapp"
            href={CONSULT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppMark />
            HABLAR POR WHATSAPP
          </a>
          <Link className="os-link" to="/shop">IR A LA TIENDA</Link>
        </div>
      </section>

      <section className="os-hero" aria-labelledby="os-next-move">
        <div className="os-hero__main">
          <p className="os-label" id="os-next-move">TU SIGUIENTE MOVIMIENTO</p>
          <h2 className="os-hero__title">SESIÓN DE EJEMPLO</h2>
          <p className="os-hero__meta">RAÍZ · Semana 1 · Día A · 5 bloques</p>

          <ol className="os-example">
            {ROUTINE_EXAMPLE.map((item) => <li key={item}>{item}</li>)}
          </ol>

          <div className="os-hero__actions">
            <button type="button" className="os-cta" onClick={handleRegister} disabled={busy}>
              {busy ? 'REGISTRANDO…' : 'MARCAR SESIÓN DE HOY'}
              <ArrowRight size={16} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <Link className="os-link" to="/programs">
              Ver acompañamientos
            </Link>
          </div>

          {feedback ? (
            <p className="os-feedback" role="status">
              <Check size={14} strokeWidth={2} aria-hidden="true" />
              {feedback}
            </p>
          ) : null}

          <p className="os-hero__note">
            Ejemplo orientativo publicado, no una prescripción personalizada.
            Adapta el esfuerzo a tu día; este panel no sustituye atención sanitaria.
          </p>
        </div>

        <div className="os-hero__aside">
          <DataBadge tone={hasCloudRows ? 'derived' : 'empty'} />
          <ProgressRing
            value={hasCloudRows ? week.activeDays : null}
            max={WEEK_DAYS}
            label="DÍAS ACTIVOS"
            note="esta semana"
          />
          <p className="os-hero__ring-note">
            {hasCloudRows
              ? `${week.sessions} ${week.sessions === 1 ? 'sesión' : 'sesiones'} en ${week.elapsedDays} ${week.elapsedDays === 1 ? 'día' : 'días'} de semana.`
              : 'Aún no hay registros con fecha. Marca tu primera sesión para empezar la lectura.'}
          </p>
        </div>
      </section>

      <section className="os-metrics" aria-label="Resumen de la semana">
        <article className="os-metric">
          <p className="os-metric__label">SESIONES ESTA SEMANA</p>
          <p className="os-metric__value">{hasCloudRows ? week.sessions : '—'}</p>
          <DataBadge tone={hasCloudRows ? 'real' : 'empty'} />
        </article>

        <article className="os-metric">
          <p className="os-metric__label">SESIONES EN ESTE DISPOSITIVO</p>
          <p className="os-metric__value">{localSessions}</p>
          <DataBadge tone={localSessions > 0 ? 'real' : 'empty'}>
            {localSessions > 0 ? 'Dato real' : 'Sin datos todavía'}
          </DataBadge>
        </article>

        <article className="os-metric">
          <p className="os-metric__label">RACHA DE DÍAS SEGUIDOS</p>
          <p className="os-metric__value">{hasCloudRows ? data.streak : '—'}</p>
          <DataBadge tone={hasCloudRows ? 'derived' : 'empty'} />
        </article>
      </section>

      <section className="os-ops-strip" aria-label="Arquitectura de producto">
        <article>
          <Radar size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Hoy</span>
          <strong>acción concreta</strong>
        </article>
        <article>
          <Radar size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Entreno</span>
          <strong>sesión ejecutable</strong>
        </article>
        <article>
          <Radar size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Progreso</span>
          <strong>lectura real</strong>
        </article>
        <article>
          <Radar size={16} strokeWidth={1.5} aria-hidden="true" />
          <span>Camino</span>
          <strong>narrativa del cambio</strong>
        </article>
      </section>

      <section className="os-coach-builder" aria-labelledby="os-coach-builder-title">
        <div>
          <p className="os-label">MODO COACH</p>
          <h2 id="os-coach-builder-title">Rutina estructurable por Sebastián</h2>
          <p>
            Esta zona muestra cómo debe crecer la app: tú defines objetivo, restricciones,
            fase y ajustes; el cliente recibe una experiencia simple y ejecutable.
          </p>
        </div>
        <div className="os-coach-builder__items">
          {program.coachBuilder.map((item) => (
            <article key={item.label}>
              <NotebookPen size={16} strokeWidth={1.5} aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="os-program-editor" aria-labelledby="os-program-editor-title">
        <div className="os-panel__head">
          <h2 id="os-program-editor-title">EDITOR LOCAL DE RUTINA</h2>
          <DataBadge tone="derived">Guardado en este dispositivo</DataBadge>
        </div>
        <form
          className="os-program-editor__form"
          onSubmit={(event) => event.preventDefault()}
          aria-label="Editar programa del cliente"
        >
          <label>
            <span>Nombre del programa</span>
            <input
              value={program.name}
              onChange={(event) => updateProgram({ name: event.target.value })}
            />
          </label>
          <label>
            <span>Fase</span>
            <input
              value={program.phase}
              onChange={(event) => updateProgram({ phase: event.target.value })}
            />
          </label>
          <label>
            <span>Semana</span>
            <input
              value={program.week}
              onChange={(event) => updateProgram({ week: event.target.value })}
            />
          </label>
          <label>
            <span>Próxima revisión</span>
            <input
              value={program.nextCheckIn}
              onChange={(event) => updateProgram({ nextCheckIn: event.target.value })}
            />
          </label>
          <label className="os-program-editor__wide">
            <span>Nota de coach</span>
            <textarea
              value={program.coachNote}
              rows={3}
              onChange={(event) => updateProgram({ coachNote: event.target.value })}
            />
          </label>
          <div className="os-program-editor__actions">
            <button type="button" className="os-cta os-cta--ghost" onClick={restoreProgram}>
              RESTAURAR BASE
            </button>
            <p>Base funcional para estructurar rutinas ahora; luego puede conectarse a perfiles reales.</p>
          </div>
        </form>
      </section>

      {!hasCloudRows ? (
        <StateBlock
          kind={cloud.error ? 'error' : 'empty'}
          title={cloud.error ? 'No pudimos leer tu historial ahora mismo.' : 'TU CAMINO EMPIEZA AQUÍ'}
          description={cloud.error
            ? 'Tu registro en este dispositivo sigue guardado. Puedes volver a intentarlo más tarde.'
            : cloud.enabled
              ? 'Cuando registres sesiones con tu cuenta, aquí aparecerá su lectura por semanas. Sin datos no mostramos ninguna cifra.'
              : 'Ahora mismo el panel funciona en modo local: tus marcas viven en este dispositivo.'}
        />
      ) : null}
    </div>
  )
}

export default TodayScreen
