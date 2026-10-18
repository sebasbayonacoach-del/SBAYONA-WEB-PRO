import { Suspense, lazy, useEffect } from 'react'
import './styles/route-fallback-prime.css'
import './styles/shop-boutique-prime.css'
import './styles/faq-prime-fix.css'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer, Navbar, WhatsAppButton } from './components/Layout'
import { ScrollProgress } from './components/Experience'
import { PageTransition, CustomCursor } from './engine'
import { MotionDebug } from './engine/debug/MotionDebug.jsx'
import PremiumRouteChrome from './components/PremiumRouteChrome'
import EditorialOutro from './components/EditorialOutro.jsx'
import { useRecedeWhileScrolling } from './lib/ui/useRecedeWhileScrolling.js'
import RouteSeo from './components/seo/RouteSeo.jsx'
import RouteEffects from './components/RouteEffects.jsx'
import ConsentBanner from './components/consent/ConsentBanner.jsx'
import Breadcrumb from './components/navigation/Breadcrumb.jsx'
import TranslateOffer from './components/TranslateOffer.jsx'
import { BAYONA_APP_ENTRY_URL } from './config/bayonaAppIntegration.js'
import Home from './pages/Home'
import JourneyGuide from './components/journey/JourneyGuide.jsx'
import JourneyCompass from './components/experience/JourneyCompass.jsx'
import JourneySectionMoments from './components/experience/JourneySectionMoments.jsx'
import { JourneyExperienceProvider } from './components/experience/JourneyExperienceContext.jsx'
import './styles/bayona-glass-experience.css'

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
const AdaptedMovement = lazy(() => import('./pages/AdaptedMovement.jsx'))
const ParkourAcademy = lazy(() => import('./pages/ParkourAcademy'))
const PlanPresentation = lazy(() => import('./pages/PlanPresentation'))
const Shop = lazy(() => import('./pages/Shop'))
/*
 * BAYONA App · integración 2026-10-12:
 *  - /app es la presentación pública del producto.
 *  - /mi-app/index.html?source=pwa es la aplicación real integrada.
 *  - /entrar y /panel se conservan únicamente como rutas de compatibilidad.
 * La sesión web antigua nunca sustituye la presentación pública de /app.
 */
const AppExperience = lazy(() => import('./pages/AppExperience'))
function AppEntry() {
  // /app is now the public product story. The real product lives at /mi-app/.
  // publicOnly prevents an old browser-only WEB session from reopening the
  // legacy members area and creating a second account experience.
  return <AppExperience publicOnly />
}

function IntegratedAppRedirect() {
  useEffect(() => {
    window.location.replace(BAYONA_APP_ENTRY_URL)
  }, [])

  return (
    <section className="app-entry-loading" role="status" aria-live="polite" aria-label="Abriendo BAYONA App">
      <div className="app-entry-loading__panel">
        <p className="app-entry-loading__eyebrow">BAYONA APP · UNA SOLA CUENTA</p>
        <h1>Abriendo Mi App.</h1>
        <p>Entrenamiento, progreso y Coach Studio viven ahora en el producto integrado.</p>
        <a className="app-primary-cta" href={BAYONA_APP_ENTRY_URL}>CONTINUAR A MI APP</a>
      </div>
    </section>
  )
}
const Community = lazy(() => import('./pages/Community'))
const Resources = lazy(() => import('./pages/Resources'))
const FAQ = lazy(() => import('./pages/FAQ'))
const Checkout = lazy(() => import('./pages/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'))
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
          <small>PREPARANDO BAYONA</small>
          <strong>CARGANDO.</strong>
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
      {showEditorialChrome ? <JourneyCompass /> : null}
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
              <Route path="/movimiento-adaptado" element={<AdaptedMovement />} />
              <Route path="/parkour-academy" element={<ParkourAcademy />} />
              <Route path="/plan/raiz" element={<PlanPresentation planId="raiz" />} />
              <Route path="/plan/fuerza" element={<PlanPresentation planId="fuerza" />} />
              <Route path="/plan/rendimiento" element={<PlanPresentation planId="rendimiento" />} />
              <Route path="/plan/elite" element={<PlanPresentation planId="elite" />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/app" element={<AppEntry />} />
              {/* Compatibilidad histórica: el panel antiguo converge en Mi App. */}
              <Route path="/panel" element={<IntegratedAppRedirect />} />
              <Route path="/community" element={<Community />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/faq" element={<FAQ />} />
              {/* Checkout permanece público: el precio se muestra antes de pedir cuenta. */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/onboarding" element={<Navigate to="/#empieza" replace />} />
              {/* Compatibilidad histórica: el acceso antiguo converge en Mi App. */}
              <Route path="/entrar" element={<IntegratedAppRedirect />} />
              <Route path="/design-system" element={<DesignSystem />} />
              {/*
                404 real. Antes esta ruta devolvía <Home />, lo que generaba un
                "soft 404": cualquier URL inexistente respondía 200 con la home.
              */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
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
          {showEditorialChrome ? <JourneySectionMoments /> : null}
          {showEditorialChrome ? <PremiumRouteChrome /> : null}
          {showEditorialChrome ? <JourneyGuide /> : null}
          {showEditorialChrome ? <EditorialOutro /> : null}
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
  return <JourneyExperienceProvider><Site /></JourneyExperienceProvider>
}