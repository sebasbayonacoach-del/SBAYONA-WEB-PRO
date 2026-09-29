/**
 * BAYONA · CRÉDITO Y SELLOS DE LA VISITA
 * ---------------------------------------------------------------------------
 * El dueño lo pidió así: la persona llega a la portada y recibe un BONO DE
 * LLEGADA ("acabas de ganar 70.000 pesos… guárdalos bien, porque es el dinero
 * con el que podrás comprar tu primer plan personalizado"). Y fue él mismo
 * quien puso el límite: "no quiero que empiece a imaginar que les vamos a dar
 * dinero". Por eso todo aquí se llama CRÉDITO BAYONA: una cortesía que se
 * canjea por un plan, nunca dinero retirable.
 *
 * LAS DOS COSAS QUE SEPARA ESTE FICHERO (dirección de 22-09, §6, comentario 23
 * y Fase 0). Son dos estados distintos y antes estaban fundidos en uno:
 *
 *   · DESCUBIERTO = la visita encontró un sello. `award()` / `discover()` solo
 *     registran el hallazgo, NO entregan valor. Pueden dispararse al navegar.
 *   · RECLAMADO = la persona pulsó RECLAMAR sobre ese sello. Solo lo reclamado
 *     suma a `totalEur`, que es el saldo canjeable.
 *
 * La regla de producto literal del brief: «El usuario debe descubrir y hacer
 * clic para reclamar regalos. No se regalan por scroll pasivo», y la queja del
 * dueño en la anotación 23: «la persona ha deslizado toda la página y se le ha
 * sumado todo este dinero… no debe sumarse automáticamente». Por eso aquí
 * navegar produce hallazgos pendientes, nunca crédito.
 *
 * Cada sello vive su propio ciclo con los cuatro estados que pide §6
 * («encontrado, pendiente de reclamar, reclamado, usado»), y
 * `stateOf(id)` los devuelve ya escritos. `claimSeal(id)` es idempotente y
 * NUNCA inventa un sello: reclamar algo no descubierto no hace nada.
 *
 * ALMACENAMIENTO: exactamente el mismo contrato que VisitorJourneyProvider.
 * Todo vive EN MEMORIA: sobrevive a la navegación interna, desaparece al
 * recargar o al cerrar. No toca localStorage, sessionStorage, cookies ni
 * ningún servidor. La moneda se deriva del país (REGIONS), como en la
 * recepción: nunca se pasa suelta para que no haya dos cifras para lo mismo.
 *
 * Los valores viven en euros y se formatean SIEMPRE con `formatMoney` de
 * `src/lib/commerce/money.js`. Los dos bonos se anclan a cifras redondas en
 * COP porque Colombia es el mercado principal: 70.000 y 20.000 pesos exactos.
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DEFAULT_CURRENCY, formatMoney } from '../commerce/money.js'
import { regionById } from '../onboarding/questions.js'

/** Bono de llegada: $70.000 COP exactos al formatear (≈ €16,28). */
export const ARRIVAL_BONUS_EUR = 70000 / 4300

/** Bono por compartir a un amigo: $20.000 COP exactos al formatear. */
export const SHARE_BONUS_EUR = 20000 / 4300

const RewardsContext = createContext(null)

/**
 * Estado inicial. La región por defecto es Colombia: es el mercado del que
 * hablaba el dueño cuando dictó la copia ("70.000 pesos"), y el selector de
 * país de la tarjeta permite cambiarla a España, Europa u otro país.
 */
const EMPTY_REWARDS = Object.freeze({
  regionId: 'colombia',
  /*
    Sellos ENCONTRADOS. Cada uno arranca `reclamado: false, usado: false`:
    descubrir es gratis, canjear exige el clic (§6).
  */
  seals: Object.freeze([]),
  /* El crédito de bienvenida NO existe todavía: aparece como pase pendiente y
     solo suma al total cuando la persona abre la tarjeta y pulsa RECLAMAR. */
  bonusClaimed: false,
  shareClaimed: false,
  /** true cuando la persona cerró la tarjeta: queda el widget flotante. */
  dismissed: true,
})

/** Los cuatro estados de §6, con el nombre con el que se leen en el pase. */
export const SEAL_STATES = Object.freeze({
  descubierto: 'Descubierto',
  pendiente: 'Pendiente de reclamar',
  reclamado: 'Reclamado',
  usado: 'Usado',
})

/**
 * Estado de un sello sobre la mesa, en el orden del ciclo de §6.
 * Un sello solo existe si fue descubierto, así que `descubierto` es la base.
 */
function sealStateOf(seal) {
  if (!seal) return SEAL_STATES.descubierto
  if (seal.usado) return SEAL_STATES.usado
  if (seal.reclamado) return SEAL_STATES.reclamado
  return SEAL_STATES.pendiente
}

export function RewardsProvider({ children }) {
  const [rewards, setRewards] = useState(EMPTY_REWARDS)

  /** País → moneda. Se reutiliza REGIONS de la recepción: una sola fuente. */
  const setRegion = useCallback((regionId) => {
    if (!regionById(regionId)) return
    setRewards((prev) => ({ ...prev, regionId }))
  }, [])

  /**
   * API imperativa para el resto del sitio: cada sección registra el SELLO que
   * la persona acaba de ENCONTRAR (idempotente por id). Registrar NO es regalar:
   * el sello queda pendiente hasta que se reclama en el pase.
   * `award({ id: 'metodo', label: 'Descubriste el método', eur: 5 })`
   *
   * `discover` es el mismo contrato con el nombre que describe lo que hace.
   * Se mantiene `award` porque las secciones ya lo llaman con ese nombre y
   * renombrarlas desde aquí sería tocar ficheros de otros carriles.
   */
  const discover = useCallback(({ id, label = '', eur = 0 } = {}) => {
    const key = String(id ?? '').trim()
    if (key === '') return
    setRewards((prev) => {
      if (prev.seals.some((seal) => seal.id === key)) return prev
      const value = Math.max(0, Number(eur) || 0)
      return {
        ...prev,
        seals: [
          ...prev.seals,
          Object.freeze({ id: key, label: String(label), eur: value, reclamado: false, usado: false }),
        ],
      }
    })
  }, [])

  /**
   * RECLAMAR un sello concreto. Idempotente, y solo sobre algo YA descubierto:
   * no se puede reclamar lo que no se encontró (§6, comentario 23).
   */
  const claimSeal = useCallback((id) => {
    const key = String(id ?? '').trim()
    if (key === '') return
    setRewards((prev) => {
      if (!prev.seals.some((seal) => seal.id === key)) return prev
      let changed = false
      const seals = prev.seals.map((seal) => {
        if (seal.id !== key || seal.reclamado || seal.usado) return seal
        changed = true
        return Object.freeze({ ...seal, reclamado: true })
      })
      return changed ? { ...prev, seals } : prev
    })
  }, [])

  /** Reclama de golpe todos los hallazgos pendientes (el gesto del pase). */
  const claimAllSeals = useCallback(() => {
    setRewards((prev) => {
      if (!prev.seals.some((seal) => !seal.reclamado && !seal.usado)) return prev
      return {
        ...prev,
        seals: prev.seals.map((seal) =>
          seal.reclamado || seal.usado ? seal : Object.freeze({ ...seal, reclamado: true }),
        ),
      }
    })
  }, [])

  /**
   * Un sello canjeado deja de ser saldo disponible: pasa a `usado`.
   * Lo llama la pasarela cuando el crédito se aplica a un plan.
   */
  const markSealUsed = useCallback((id) => {
    const key = String(id ?? '').trim()
    if (key === '') return
    setRewards((prev) => {
      const target = prev.seals.find((seal) => seal.id === key)
      if (!target || target.usado) return prev
      return {
        ...prev,
        seals: prev.seals.map((seal) =>
          seal.id === key ? Object.freeze({ ...seal, reclamado: true, usado: true }) : seal,
        ),
      }
    })
  }, [])

  /**
   * RECLAMAR el pase: guarda el bono de llegada y todos los sellos encontrados,
   * y colapsa la tarjeta en el widget. Un solo gesto desde el pase completo;
   * `claimSeal` sigue existiendo para reclamar sellos de uno en uno.
   */
  const claimBonus = useCallback(() => {
    setRewards((prev) => ({
      ...prev,
      bonusClaimed: true,
      seals: prev.seals.map((seal) =>
        seal.reclamado || seal.usado ? seal : Object.freeze({ ...seal, reclamado: true }),
      ),
      dismissed: true,
    }))
  }, [])

  /** Suma el crédito por compartir (una sola vez) cuando se abre WhatsApp. */
  const claimShareReward = useCallback(() => {
    setRewards((prev) => (prev.shareClaimed ? prev : { ...prev, shareClaimed: true }))
  }, [])

  /** La X no borra nada: colapsa la tarjeta en el widget flotante. */
  const collapseCard = useCallback(() => {
    setRewards((prev) => (prev.dismissed ? prev : { ...prev, dismissed: true }))
  }, [])

  /** Vuelve a abrir la tarjeta desde el widget. */
  const openCard = useCallback(() => {
    setRewards((prev) => (prev.dismissed ? { ...prev, dismissed: false } : prev))
  }, [])

  const value = useMemo(() => {
    const currency = regionById(rewards.regionId)?.currency ?? DEFAULT_CURRENCY
    const sealsEur = rewards.seals.reduce((total, seal) => total + seal.eur, 0)
    const claimedSealsEur = rewards.seals
      .filter((seal) => seal.reclamado && !seal.usado)
      .reduce((total, seal) => total + seal.eur, 0)
    /** Saldo que SÍ se puede canjear: reclamado y no gastado. */
    const totalEur =
      (rewards.bonusClaimed ? ARRIVAL_BONUS_EUR : 0) +
      claimedSealsEur +
      (rewards.shareClaimed ? SHARE_BONUS_EUR : 0)
    /**
     * Lo que la visita ENCONTRÓ y todavía no se ha gastado, se haya reclamado
     * o no. Es la cifra del pase plegado: "hay esto sobre la mesa, pulsa para
     * guardarlo". No es saldo canjeable: ese es `totalEur`.
     */
    const foundEur =
      ARRIVAL_BONUS_EUR +
      rewards.seals.filter((seal) => !seal.usado).reduce((total, seal) => total + seal.eur, 0) +
      (rewards.shareClaimed ? SHARE_BONUS_EUR : 0)

    const pendingSeals = rewards.seals.filter((seal) => !seal.reclamado && !seal.usado)

    return {
      ...rewards,
      currency,
      sealCount: rewards.seals.length,
      /** Sellos encontrados todavía sin reclamar: los que ofrecen el clic. */
      pendingSealCount: pendingSeals.length,
      claimedSealCount: rewards.seals.filter((seal) => seal.reclamado && !seal.usado).length,
      usedSealCount: rewards.seals.filter((seal) => seal.usado).length,
      sealsEur,
      /** Crédito acumulado y GUARDADO (bono reclamado + sellos reclamados + compartir). */
      totalEur,
      foundEur,
      /** Valor de los hallazgos que aún esperan un clic. */
      pendingEur: pendingSeals.reduce((total, seal) => total + seal.eur, 0),
      /** Estado de §6 para un sello: descubierto/pendiente/reclamado/usado. */
      stateOf: (id) => sealStateOf(rewards.seals.find((seal) => seal.id === id)),
      /** Formatea euros a la moneda del país elegido. */
      format: (valueEur) => formatMoney(valueEur, currency),
      setRegion,
      award: discover,
      discover,
      claimSeal,
      claimAllSeals,
      markSealUsed,
      claimBonus,
      claimShareReward,
      collapseCard,
      openCard,
    }
  }, [rewards, setRegion, discover, claimSeal, claimAllSeals, markSealUsed, claimBonus, claimShareReward, collapseCard, openCard])

  return <RewardsContext.Provider value={value}>{children}</RewardsContext.Provider>
}

/**
 * Lee el crédito y los sellos de la visita.
 *
 * Devuelve un objeto seguro incluso sin proveedor, para que cualquier
 * componente o test pueda renderizarse aislado sin envolverlo.
 */
export function useRewards() {
  const context = useContext(RewardsContext)

  if (!context) {
    const currency = DEFAULT_CURRENCY
    return {
      ...EMPTY_REWARDS,
      currency,
      sealCount: 0,
      pendingSealCount: 0,
      claimedSealCount: 0,
      usedSealCount: 0,
      sealsEur: 0,
      totalEur: 0,
      foundEur: 0,
      pendingEur: 0,
      stateOf: () => SEAL_STATES.descubierto,
      format: (valueEur) => formatMoney(valueEur, currency),
      setRegion: () => {},
      award: () => {},
      discover: () => {},
      claimSeal: () => {},
      claimAllSeals: () => {},
      markSealUsed: () => {},
      claimBonus: () => {},
      claimShareReward: () => {},
      collapseCard: () => {},
      openCard: () => {},
    }
  }

  return context
}
