import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => readFileSync(join(ROOT, file), 'utf8')
const style = read('styles/21st-sitewide-patterns.css')
const main = read('main.jsx')
const faq = read('pages/FAQ.jsx')

const areas = [
  ['navigation', '.gym-primary-nav'],
  ['home', '.start-journey__progress-points'],
  ['service paths', '.services-path-card'],
  ['plans', '.plan-comparison-item'],
  ['services catalog', '.services-catalog-details'],
  ['about', '.about-chronicle-mobile__item'],
  ['shop', '.shop-product-card'],
  ['app', '.app-features-grid'],
  ['community', '.community-live-card'],
  ['resources', '.resources-hero-library-card'],
  ['faq', '.faq-search__field'],
  ['parkour', '.academy-progression__card'],
]

describe('21st.dev — sitewide component integration', () => {
  it.each(areas)('covers %s with a real page selector', (_, selector) => {
    expect(style).toContain(selector)
  })

  it('keeps the original global owner order while V4 owns audited routes', () => {
    const imports = [...main.matchAll(/import '\.\/styles\/([^']+\.css)'/g)].map(x => x[1])
    expect(imports).not.toContain('21st-sitewide-patterns.css')
    expect(imports.slice(-3)).toEqual(['ds-experience.css','ds-atelier.css','home-atelier.css'])
    for (const page of ['Home','Programs','Shop','Community','Resources','AppExperience','ParkourAcademy','FAQ']) {
      expect(read(`pages/${page}.jsx`)).toContain("import '../styles/bayona-final-visual-v4.css'")
    }
    expect(style).toContain("data-experience-scope='brand'")
    expect(style).not.toMatch(/@import\b|@font-face/)
  })

  it('adds accessible functional FAQ search without changing question source', () => {
    expect(faq).toContain('const [questionSearch, setQuestionSearch] = useState')
    expect(faq).toContain('questionCategories.reduce')
    expect(faq).toContain('matchesQuestion(item)')
    expect(faq).toContain('if (!matchesQuestion(item)) return null')
    expect(faq).toContain('role="search"')
    expect(faq).toContain('role="status"')
    expect(faq).toContain('aria-describedby="faq-search-count"')
    expect(faq).toContain('Limpiar búsqueda')
    expect(faq).not.toContain('fetch(')
  })
})
