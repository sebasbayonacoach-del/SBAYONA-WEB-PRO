import { existsSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import appSource from '../App.jsx?raw'
import checkoutSource from '../pages/Checkout.jsx?raw'
import planPresentationSource from '../pages/PlanPresentation.jsx?raw'
import programsSource from '../pages/Programs.jsx?raw'
import { membershipPlans } from '../config/offerings.js'
import { planPresentations } from '../config/planPresentations.js'
import PlanExplorer from '../components/conversion/PlanExplorer.jsx'
import { CONSERVATIVE_PLAN_ORDER } from '../lib/conversion/recommendation.js'
import { ROUTE_MATRIX, mapAnswersToRoute, hasCompleteAnswers } from '../lib/onboarding/routeMap.js'
import { resolveRouteMeta } from '../lib/seo/routeMeta.js'

const PUBLIC_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../public')

/** Slug de ruta de un plan canónico: misma regla que routeMeta y que las páginas. */
const planSlug = (planId) => String(planId).toLowerCase()

describe('sincronización comercial: catálogo → rutas → recomendador → PDFs', () => {
  it('el orden canónico del recomendador cubre exactamente el catálogo, sus rutas /plan/* y sus presentaciones', () => {
    expect(Object.keys(planPresentations).sort()).toEqual([...CONSERVATIVE_PLAN_ORDER].sort())

    for (const planId of CONSERVATIVE_PLAN_ORDER) {
      const plan = membershipPlans.find(({ id }) => id === planId)
      expect(plan, `plan canónico ${planId} ausente del catálogo`).toBeDefined()

      const slug = planSlug(planId)
      const meta = resolveRouteMeta(`/plan/${slug}`)
      expect(meta.isNotFound, `ruta /plan/${slug} sin metadatos`).toBe(false)
      expect(meta.planId).toBe(planId)
      expect(meta.noindex).toBe(false)

      expect(appSource).toContain(`<Route path="/plan/${slug}"`)
      expect(planPresentations[planId], `presentación ausente para ${planId}`).toBeDefined()
    }
  })

  it('el Inicio Guiado no produce slugs fantasma: las 36 combinaciones aterrizan en planes y rutas canónicas', () => {
    const catalogNameBySlug = new Map(
      membershipPlans.map((plan) => [planSlug(plan.id), plan.name]),
    )
    const producedSlugs = new Set()

    for (const [goal, byExperience] of Object.entries(ROUTE_MATRIX)) {
      for (const [experience, byAvailability] of Object.entries(byExperience)) {
        for (const availability of Object.keys(byAvailability)) {
          const answers = { goal, experience, availability }
          expect(hasCompleteAnswers(answers), `combinación sin ruta: ${goal}/${experience}/${availability}`).toBe(true)

          const route = mapAnswersToRoute(answers)
          expect(route).not.toBeNull()
          expect(catalogNameBySlug.has(route.id), `slug fantasma en routeMap: ${route.id}`).toBe(true)
          expect(route.plan).toBe(catalogNameBySlug.get(route.id))
          expect(route.planHref).toBe(`/plan/${route.id}`)
          expect(resolveRouteMeta(route.planHref).isNotFound).toBe(false)
          producedSlugs.add(route.id)
        }
      }
    }

    // Toda la escalera comercial queda alcanzable desde el embudo.
    expect([...producedSlugs].sort()).toEqual(
      membershipPlans.map((plan) => planSlug(plan.id)).sort(),
    )
  })

  it('los cuatro PDFs de plan existen en public/docs y presentationUrl apunta al fichero real', () => {
    for (const plan of membershipPlans) {
      const slug = planSlug(plan.id)
      expect(plan.presentationUrl).toBe(`/docs/plan-${slug}.pdf`)

      const filePath = resolve(PUBLIC_DIR, `docs/plan-${slug}.pdf`)
      expect(existsSync(filePath), `falta el PDF ${filePath}`).toBe(true)
      expect(statSync(filePath).size).toBeGreaterThan(10_000)
    }
  })

  it('los anclajes #plan-* que usa el recomendador existen en el showroom de planes', () => {
    const { unmount } = render(
      <MemoryRouter>
        <PlanExplorer />
      </MemoryRouter>,
    )

    for (const plan of membershipPlans) {
      const anchor = document.getElementById(`plan-${planSlug(plan.id)}`)
      expect(anchor, `ancla plan-${planSlug(plan.id)} ausente en PlanExplorer`).not.toBeNull()
    }

    unmount()
  })

  // Fase 4 (DP-2 y DP-3): los activos comerciales dejan de estar huérfanos.
  it('la ficha de plan enlaza el PDF de presentación y el configurador, y el embudo queda conectado de punta a punta', () => {
    // DP-2: el PDF ya no es un activo muerto — la ficha lo expone.
    expect(planPresentationSource).toContain('plan.presentationUrl')
    // DP-3: la ficha y los programas llevan al configurador con el plan precargado.
    expect(planPresentationSource).toContain('/checkout?plan=')
    expect(programsSource).toContain('to="/checkout"')
    // El configurador acepta la precarga y ofrece el siguiente paso del embudo.
    expect(checkoutSource).toContain("searchParams.get('plan')")
    expect(checkoutSource).toContain('to="/order-confirmation"')
  })
})
