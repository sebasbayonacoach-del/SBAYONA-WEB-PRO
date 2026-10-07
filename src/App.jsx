import { Suspense, lazy, useEffect } from 'react'
import './styles/route-fallback-prime.css'
import './styles/shop-boutique-prime.css'
import './styles/faq-prime-fix.css'
import { RouteSceneCycler } from './components/RouteSceneCycler.jsx'
import { routeSceneRules } from './config/routeSceneRules.js'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer, Navbar, WhatsAppButton } from './components/Layout'
import { ScrollProgress } from './components/Experience'
import { PageTransition, CustomCursor } from './engine'
import { MotionDebug } from './engine/debug/MotionDebug.jsx'
import PremiumRouteChrome from './components/PremiumRouteChrome'
import { useAuth } from './lib/auth/AuthContext.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'
import { useRecedeWhileScrolling } from './lib/ui/useRecedeWhileScrolling.js'
import RouteSeo from './components/seo/RouteSeo.jsx'
import RouteEffects from './components/RouteEffects.jsx'
import ConsentBanner from './components/consent/ConsentBanner.jsx'
import Breadcrumb from './components/navigation/Breadcrumb.jsx'
import TranslateOffer from './components/TranslateOffer.jsx'
import Home from './pages/Home'

/**
 * Home se importa de forma estática porque es la ruta de entrada y determina
 * el LCP: retrasarla con un chunk aparte empeoraría la primera impresión.
 *
 * El resto de páginas se cargan bajo demanda. Antes eran 16 imports estáticos,
 * así que la primera visita descargaba las 16 páginas y sus 24 hojas de estilo
 * aunque solo se viera una. Con `lazy` cada ruta baja su propio chunk y su CSS.
 */
const About = lazy(() => import('./pages/About'))
const Programs = lazy(() => import('./pages/Programs'))
const ParkourAcademy = lazy(() => import('./pages/ParkourAcademy'))
const PlanPresentation = lazy(() => import('./pages/PlanPresentation'))
const Shop = lazy(() => import('./pages/Shop'))
/*
 * Dos cosas distintas, dos puertas distintas (2026-09-20, por pedido de
 * Sebastián):
 *  - `/app` vuelve a ser la página oficial larga de BAYONA+ (`AppExperience`),
 *    la que explica todo. Es pública: el propio componente se mira la sesión y
 *    sin ella muestra el recorrido completo, con ella el panel del miembro.
 *    `RequireAuth` aquí sobra y cerraba la página a quien quería leerla.
 *  - `/panel` es el mando nuevo de cinco pantallas (BAYONA OS, 2026-09-18). No
 *    se toca su contenido: solo se le da su propia dirección, que es lo que
 *    antes vivía dentro de `/app`.
 */
const AppExperience = lazy(() => import('./pages/AppExperience'))
const AppOS = lazy(() => import('./pages/AppOS'))

/*
 * `/app` tiene dos caras y una sola dirección, resuelta por sesión y no por
 * ruta nueva: probar `/app/os` inflaba cuatro censos de gobernanza (sitemap
 * indexable, inventario de rutas públicas, blueprints del documento y destinos
 * internos), que son justo la alarma de «has abierto una puerta sin registrar».
 * El carril de BAYONA OS ya había documentado la misma razón para usar `?s=`.
 *  - sin sesión: la página oficial larga, pública y legible (AppExperience)
 *  - con sesión: el mando de cinco pantallas (AppOS), con su cargador
 */
function AppEntry() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <section className="app-entry-loading" role="status" aria-live="polite" aria-label="Preparando acceso BAYONA">
        <div className="app-entry-loading__panel">
          <p className="app-entry-loading__eyebrow">BAYONA OS · ACCESO</p>
          <h1>Preparando tu espacio.</h1>
          <p>
            Verificando tu sesión, créditos y tablero personal antes de abrir el
            sistema. Nada de ruido: solo tu mando listo para entrenar y construir.
          </p>
          <div className="app-entry-loading__rail" aria-hidden="true">
            <span>Identidad</span>
            <span>Plan</span>
            <span>Panel</span>
          </div>
        </div>
      </section>
    )
  }
  return user ? <AppOS /> : <AppExperience />
}
const Community = lazy(() => import('./pages/Community'))
const Resources = lazy(() => import('./pages/Resources'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const Entrar = lazy(() => import('./pages/Entrar'))
const NotFound = lazy(() => import('./pages/NotFound'))
/*
 * Modo selección (?edit=1): chunk aparte que SOLO se descarga con el query
 * param. El visitante normal no lo paga ni lo ejecuta: App lo monta solo si
 * la URL lo pide. Ver src/components/EditMode.jsx.
 */
const EditMode = lazy(() => import('./components/EditMode.jsx'))

function isEditMode() {
  try {
    return new URLSearchParams(window.location.search).get('edit') === '1'
  } catch {
    return false
  }
}
/*
 * Playground del Design System (Fase 3): ruta INTERNA, no indexable y fuera
 * del sitemap (ver routeMeta.js y robots.txt). No forma parte del itinerario
 * público; existe para validar el sistema visual antes de migrar las páginas.
 */
const DesignSystem = lazy(() => import('./pages/DesignSystem'))

/** Estado de carga de una ruta diferida. Anunciado para lectores de pantalla. */
function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <div className="route-fallback__frame">
        <span className="route-fallback__brand" aria-hidden="true">BAYONA</span>
        <div className="route-fallback__copy">
          <small>PREPARANDO EXPERIENCIA</small>
          <strong>ENTRANDO.</strong>
        </div>
        <span className="route-fallback__track" aria-hidden="true">
          <i />
        </span>
      </div>
      <span className="sr-only">Cargando página</span>
    </div>
  )
}

/**
 * Rutas internas del sistema (playground del DS y laboratorio 3A): no reciben
 * la propagación del marco de FASE 4. Su hoja `.lab-*` es la dueña de ese
 * estado y el lote 3A está congelado, así que el marco se declara fuera.
 */
const SYSTEM_ROUTES = Object.freeze(['/design-system'])
const PRODUCT_ROUTES = Object.freeze([
  // El mando es superficie de producto, no página editorial: así no hereda el
  // cromo de márketing (Navbar/Footer de rutas), ni el pase `brand` de los
  // atelier, y cae bajo el fondo y el alcance `system` de `/app`.
  '/panel',
  '/checkout',
  '/order-confirmation',
  '/onboarding',
])
/*
  Comentario 63 de las 70 anotaciones: «Tu centro de mando» se veía como otra
  aplicación, y el brief pide que la cuenta conserve «identidad visual,
  header/footer y sensación de casa BAYONA». El navbar ya era global (se monta
  fuera de esta decisión); lo que faltaba era el pie, que es justo lo que
  devuelve la sensación de casa al salir del flujo.

  Solo `/panel`. En `/checkout`, `/order-confirmation` y `/onboarding` el pie
  sigue fuera a propósito: son flujos con foco, y ahí un enlace de márketing en
  el pie es una salida antes de tiempo.
*/
const FOOTER_ROUTES = Object.freeze(['/panel'])
const ROUTE_SCENE_DISABLED_ROUTES = Object.freeze([
  ...PRODUCT_ROUTES,
  '/app',
  '/entrar',
  '/design-system',
])

function routeStartsWith(pathname, routes) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function Site() {
  const { pathname } = useLocation()
  const isSystemRoute = routeStartsWith(pathname, SYSTEM_ROUTES)
  const isProductRoute = routeStartsWith(pathname, PRODUCT_ROUTES)
  const showEditorialChrome = !isProductRoute && !isSystemRoute
  const showSiteFooter = showEditorialChrome || routeStartsWith(pathname, FOOTER_ROUTES)
  const experienceScope = isSystemRoute || isProductRoute ? 'system' : 'brand'
  const routeSceneEnabled = !routeStartsWith(pathname, ROUTE_SCENE_DISABLED_ROUTES)

  /*
   * Señal global para las capas fijas que estorban el clic. `WhatsAppButton`
   * ya lleva su propio estado para esto; el orbe del acompañante y el chip de
   * crédito no, y eran justo los que se comían el precio y el «ACTIVAR RAÍZ»
   * de las fichas de plan a 390 px. En vez de repetir el efecto en tres
   * componentes, el `<html>` lleva `is-scrolling` mientras dura el gesto y
   * cada hoja decide cómo apartarse (`companion.css`, `rewards.css`).
   */
  const moviendo = useRecedeWhileScrolling()
  useEffect(() => {
    document.documentElement.classList.toggle('is-scrolling', moviendo)
    return () => document.documentElement.classList.remove('is-scrolling')
  }, [moviendo])

  useEffect(() => {
    document.body.classList.toggle('product-route', isProductRoute)
    document.body.classList.toggle('system-route', isSystemRoute)
    /*
      El navbar es `position: fixed` (luxury-system.css / v2-surface.css), así
      que las rutas de producto nunca necesitaron hueco para él: no se pintaba.
      Al devolverle la barra al centro de mando hay que declararlo, o la primera
      pantalla del panel quedaría tapada por el menú. La clase solo existe para
      eso y vive en bayona-polish.css, junto a la regla que muestra el navbar.
    */
    document.body.classList.toggle('product-site-chrome', showSiteFooter && isProductRoute)
    return () => {
      document.body.classList.remove('product-route')
      document.body.classList.remove('system-route')
      document.body.classList.remove('product-site-chrome')
    }
  }, [isProductRoute, isSystemRoute, showSiteFooter])

  /*
   * Push nativo: se intenta UNA vez al arrancar. En web es no-op silencioso;
   * en la app Android empaquetada registra el token si hay Firebase.
   */
  useEffect(() => {
    import('./lib/push/nativePush.js')
      .then((m) => m.registerNativePush?.())
      .catch(() => undefined)
  }, [])

  return (
    <>
      <a href="#main-content" className="skip-link">Saltar al contenido</a>
      <RouteSeo />
      <RouteEffects />
      <ScrollProgress />
      {/*
        Debug del Motion Engine (Fase 5): solo existe en desarrollo y con el
        flag ?motionDebug=1. En produccion la rama se elimina del bundle.
      */}
      <MotionDebug />
      <CustomCursor />
      <Navbar />
      <PageTransition>
        {/*
          FASE 4 (4.2): el marco de la experiencia vive en el shell, no en cada
          página. `ds-frame` aporta las tokens de ritmo, superficie y foco a las
          18 rutas de una sola vez, así que ninguna página tiene que importar el
          sistema para pertenecer a él.
        */}
        <main
          id="main-content"
          className="ds-frame"
          data-award-experience="cinematic"
          data-experience-scope={experienceScope}
          data-experience-mode={showEditorialChrome ? 'editorial' : 'product'}
        >
          {/*
            Sistema de POSICIÓN (Fase 4): miga de pan visible derivada del
            mismo dato que el JSON-LD (routeMeta). Decide por ruta: no pinta
            en home, recepción ni internas. Ver Breadcrumb.jsx.
          */}
          <Breadcrumb />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/parkour-academy" element={<ParkourAcademy />} />
              <Route path="/plan/raiz" element={<PlanPresentation planId="raiz" />} />
              <Route path="/plan/fuerza" element={<PlanPresentation planId="fuerza" />} />
              <Route path="/plan/rendimiento" element={<PlanPresentation planId="rendimiento" />} />
              <Route path="/plan/elite" element={<PlanPresentation planId="elite" />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/app" element={<AppEntry />} />
              {/*
                El mando de cinco pantallas con la dirección que su propio
                comentario le prometía desde el 18-sep (`/panel` es el mando
                nuevo… solo se le da su propia dirección`). No estaba
                declarada: el único sitio vivo era `/app`, y `routeSceneRules`
                tenía una entrada para una ruta inexistente. `RequireAuth` es el
                mismo guardia del resto de destinos privados: sin sesión devuelve
                a `/entrar?next=/panel`. `/app` no cambia de comportamiento.
              */}
              <Route
                path="/panel"
                element={
                  <RequireAuth>
                    <AppOS />
                  </RequireAuth>
                }
              />
              <Route path="/community" element={<Community />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/faq" element={<FAQ />} />
              {/* La caja no pide cuenta: exigir contraseña antes de enseñar el
                  precio corta el embudo en el peor sitio. `/app` sigue protegido. */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/onboarding" element={<Onboarding />} />
              {/*
                Fase 2 SaaS: /entrar es la pantalla de acceso (correo +
                contraseña). La recepción sigue viva en /onboarding.
              */}
              <Route path="/entrar" element={<Entrar />} />
              <Route path="/design-system" element={<DesignSystem />} />
              {/*
                404 real. Antes esta ruta devolvía <Home />, lo que generaba un
                "soft 404": cualquier URL inexistente respondía 200 con la home.
              */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          {/* UN lienzo WebGL por ruta editorial: ver RouteSceneCycler.jsx.
              Las rutas de producto no llevan decorado global porque compiten
              con formularios, panel, compra y estados operativos. */}
          {routeSceneEnabled ? <RouteSceneCycler key={pathname} {...routeSceneRules(pathname)} /> : null}
          {/*
            Cierre del recorrido: anuncia la siguiente parada. Montado aquí una
            sola vez, así las 9 páginas del itinerario lo reciben sin tocar su
            JSX. Las rutas fuera del itinerario no lo pintan.
          */}
          {/*
            Compartir cierra el recorrido, antes de anunciar la siguiente
            parada: primero se ofrece pasar lo que ya es gratis, y después se
            invita a seguir. Solo en las rutas del itinerario, igual que
            NextChapter, para no aparecer en el embudo ni en el 404.
          */}
          {showEditorialChrome ? <PremiumRouteChrome /> : null}
        </main>
      </PageTransition>
      {showEditorialChrome ? <WhatsAppButton /> : null}
      {showSiteFooter ? <Footer /> : null}
      {isEditMode() ? (
        <Suspense fallback={null}>
          <EditMode />
        </Suspense>
      ) : null}
      {/* Traducción contextual solo cuando hace falta. */}
      <TranslateOffer />
      <ConsentBanner />
    </>
  )
}

export default function App() {
  return <Site />
}
