const routeLoaders = {
  '/about': () => import('../../pages/About.jsx'),
  '/programs': () => import('../../pages/Programs.jsx'),
  '/parkour-academy': () => import('../../pages/ParkourAcademy.jsx'),
  '/shop': () => import('../../pages/Shop.jsx'),
  '/app': () => import('../../pages/AppExperience.jsx'),
  '/community': () => import('../../pages/Community.jsx'),
  '/resources': () => import('../../pages/Resources.jsx'),
  '/faq': () => import('../../pages/FAQ.jsx'),
  '/entrar': () => import('../../pages/Entrar.jsx'),
  '/onboarding': () => import('../../pages/Onboarding.jsx'),
}

const warmedRoutes = new Set()

export function prefetchRoute(pathname) {
  const load = routeLoaders[pathname]
  if (!load || warmedRoutes.has(pathname)) return

  warmedRoutes.add(pathname)
  void load().catch(() => {
    warmedRoutes.delete(pathname)
  })
}
