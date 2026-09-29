import { describe, expect, it } from 'vitest'
import appSource from '../App.jsx?raw'
import {
  buildWhatsAppUrl,
  membershipPlans,
  WHATSAPP_NUMBER,
} from '../config/offerings.js'
import packageManifest from '../../package.json'
import { INTERNAL_ROUTES } from './conversionRegression.config.js'


const PUBLIC_ROUTES = Object.freeze([
  '/',
  '/about',
  '/programs',
  '/parkour-academy',
  '/plan/raiz',
  '/plan/fuerza',
  '/plan/rendimiento',
  '/plan/elite',
  '/shop',
  '/app',
  '/community',
  '/resources',
  '/faq',
  '/checkout',
  '/order-confirmation',
  '/onboarding',
  '/entrar',
])

/**
 * Las rutas internas (hoy: el playground del Design System) se inventarían
 * en conversionRegression.config.js junto a las públicas: el contrato no
 * admite rutas sin declarar en ninguna de las dos listas.
 */

const CANONICAL_PLANS = Object.freeze([
  { id: 'RAIZ', name: 'RAÍZ', priceCop: 149000 },
  { id: 'FUERZA', name: 'FUERZA', priceCop: 299000 },
  { id: 'RENDIMIENTO', name: 'RENDIMIENTO', priceCop: 499000 },
  { id: 'ELITE', name: 'ELITE', priceCop: 899000 },
])

// Validates: Requirements 3.5, 3.8, 13.2, 17.3, 17.4, 17.5
describe('contrato baseline de BAYONA', () => {
  it('inventaría las rutas públicas declaradas sin duplicados', () => {
    const declaredRoutes = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
      .map(([, path]) => path)
    const internalRoutes = declaredRoutes.filter((path) => INTERNAL_ROUTES.includes(path))
    const publicRoutes = declaredRoutes.filter(
      (path) => path !== '*' && !INTERNAL_ROUTES.includes(path),
    )

    expect(publicRoutes).toHaveLength(PUBLIC_ROUTES.length)
    expect(new Set(publicRoutes)).toEqual(new Set(PUBLIC_ROUTES))
    expect(internalRoutes).toEqual([...INTERNAL_ROUTES])
    expect(new Set(declaredRoutes).size).toBe(declaredRoutes.length)
    expect(declaredRoutes.filter((path) => path === '*')).toEqual(['*'])
  })

  it('fija ids, nombres y precios COP de los planes canónicos', () => {
    expect(
      membershipPlans.map(({ id, name, priceCop }) => ({ id, name, priceCop })),
    ).toEqual(CANONICAL_PLANS)
  })

  it('fija el origen, número oficial y contexto del canal de WhatsApp', () => {
    const context = 'Contrato baseline BAYONA'
    const url = new URL(buildWhatsAppUrl(context))

    expect(WHATSAPP_NUMBER).toBe('34614988006')
    expect(url.origin).toBe('https://wa.me')
    expect(url.pathname).toBe(`/${WHATSAPP_NUMBER}`)
    expect(url.searchParams.get('text')).toBe(context)
  })

  it('inventaría el stack de ejecución y pruebas actual', () => {
    expect({
      react: packageManifest.dependencies.react,
      reactDom: packageManifest.dependencies['react-dom'],
      reactRouterDom: packageManifest.dependencies['react-router-dom'],
      vite: packageManifest.devDependencies.vite,
      viteReactPlugin: packageManifest.devDependencies['@vitejs/plugin-react'],
      vitest: packageManifest.devDependencies.vitest,
    }).toEqual({
      react: '^18.3.1',
      reactDom: '^18.3.1',
      reactRouterDom: '^7.1.3',
      vite: '^6.0.7',
      viteReactPlugin: '^4.3.4',
      vitest: '^3.2.7',
    })

    expect(packageManifest).toMatchObject({
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        test: 'vitest --run',
      },
    })
  })
})
