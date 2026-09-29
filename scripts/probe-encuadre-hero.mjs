// ¿Por qué el titular del hero aparece pegado a la izquierda en una ventana y
// muy entrado en otra? Este probe no opina: mide a varios anchos el hueco
// izquierdo real, quién lo produce (el eslabón de la cadena cuyo `left` deja de
// ser 0) y si el tamaño de letra cambia, porque las dos cosas se confunden en
// pantalla y solo una de ellas es un defecto.
//
// Uso: MSYS_NO_PATHCONV=1 node scripts/probe-encuadre-hero.mjs http://127.0.0.1:4188
import { chromium } from '@playwright/test'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function findBrowser() {
  const cache = join(process.env.LOCALAPPDATA || '', 'ms-playwright')
  if (cache && existsSync(cache)) {
    for (const b of readdirSync(cache).filter((d) => d.startsWith('chromium-')).sort().reverse()) {
      const exe = join(cache, b, 'chrome-win64', 'chrome.exe')
      if (existsSync(exe)) return exe
    }
  }
  return null
}

const BASE = process.argv.slice(2).find((a) => a.startsWith('http')) || 'http://127.0.0.1:4188'
const ANCHOS = (process.env.ANCHOS || '1280,1305,1440,1590,1920').split(',').map(Number)
const browser = await chromium.launch({ executablePath: findBrowser(), headless: true })

for (const ancho of ANCHOS) {
  const p = await browser.newPage({ viewport: { width: ancho, height: 900 } })
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(2200)

  const dato = await p.evaluate(() => {
    const h1 = document.querySelector('main section h1')
    if (!h1) return { error: 'no hay H1 en main section' }
    const cs = getComputedStyle(h1)
    const cadena = []
    for (let n = h1; n && n !== document.documentElement; n = n.parentElement) {
      const s = getComputedStyle(n)
      cadena.push({
        quien: n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).split(' ')[0] : ''),
        left: Math.round(n.getBoundingClientRect().left),
        padInline: s.paddingLeft === s.paddingRight ? s.paddingLeft : `${s.paddingLeft}/${s.paddingRight}`,
        maxWidth: s.maxWidth,
        marginInline: s.marginLeft === s.marginRight ? s.marginLeft : `${s.marginLeft}/${s.marginRight}`,
        display: s.display,
        width: Math.round(n.getBoundingClientRect().width),
        justify: s.justifyContent,
        align: s.alignItems,
        grid: s.gridTemplateColumns,
        gap: s.gap,
      })
    }
    return {
      innerWidth: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      dpr: window.devicePixelRatio,
      zoom: window.visualViewport ? window.visualViewport.scale : null,
      h1Left: Math.round(h1.getBoundingClientRect().left),
      h1FontSize: cs.fontSize,
      h1Width: Math.round(h1.getBoundingClientRect().width),
      cadena: cadena.slice(0, 7),
    }
  })

  if (dato.error) {
    console.log(`${ancho} px → ${dato.error}`)
  } else {
    // El H1 casi nunca es el culpable: su `left` es consecuencia de que un
    // ancestro centre una columna. Se busca el ancestro MÁS PROFUNDO (el primero
    // subiendo desde el H1, excluido el H1) cuyo left ya sea > 0: ese es el que
    // introduce el hueco.
    const masAllaDelH1 = dato.cadena.slice(1)
    const responsable = masAllaDelH1.find((c) => c.left > 0) || masAllaDelH1[masAllaDelH1.length - 1]
    console.log(
      `${String(ancho).padStart(4)} px  H1.left=${String(dato.h1Left).padStart(4)}  ` +
        `letra=${dato.h1FontSize.padStart(7)}  anchoTexto=${String(dato.h1Width).padStart(4)}  ` +
        `scrollbar=${dato.innerWidth - dato.clientWidth}  dpr=${dato.dpr}  zoom=${dato.zoom}`,
    )
    console.log(`        cadena: ${dato.cadena.map((c) => `${c.quien}@${c.left}`).join(' → ')}`)
    console.log(`        introduce el hueco: ${responsable.quien} left=${responsable.left} pad=${responsable.padInline} max=${responsable.maxWidth} margin=${responsable.marginInline}`)
    console.log(`        por qué: display=${responsable.display} width=${responsable.width} justify=${responsable.justify} align=${responsable.align} gap=${responsable.gap} grid=${responsable.grid}`)
  }
  await p.close()
}

await browser.close()
