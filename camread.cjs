const { chromium } = require('C:/Users/sevis/AppData/Roaming/npm/node_modules/playwright')
;(async () => {
  const b = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } })
  await p.goto('http://127.0.0.1:4321/', { waitUntil: 'load' })
  await p.waitForSelector('canvas', { state: 'attached', timeout: 15000 })
  for (const y of [0, 4935, 9870, 14804]) {
    await p.evaluate((v) => scrollTo({ top: v, behavior: 'instant' }), y)
    await p.waitForTimeout(1600)
    console.log(y, await p.evaluate(() => JSON.stringify({
      step: document.querySelector('[data-scene-cycler]')?.getAttribute('data-scene-cycler'),
      req: document.documentElement.dataset.bayonaCam,
      live: document.documentElement.dataset.bayonaCamLive,
    })))
  }
  await b.close()
})()
