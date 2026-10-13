// Eyeball the build the way a guest meets it: a phone (390 x 844 @3x) and a desktop
// (1440 x 900), motion ON, the cover, the open, and a walk down the sheet with each band
// given time to assemble. Also reports console errors.
//
//   npm run dev &   node scripts/shot.mjs [port] [outDir] [path]
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const PORT = process.argv[2] || 5174
const OUT = process.argv[3] || '.figma-tmp/shots'
const PATH = process.argv[4] || '/TemaRosewoodRomance/'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const errors = []

async function run(name, viewport, dpr, stops) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: dpr })
  page.on('pageerror', (e) => errors.push(`${name}: ${e}`))
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`))
  await page.goto(`http://localhost:${PORT}${PATH}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.cover__frame--ready')
  await page.waitForTimeout(3200)
  await page.screenshot({ path: `${OUT}/${name}-cover.png` })
  await page.click('.cover__hit')
  await page.waitForTimeout(4200)
  await page.screenshot({ path: `${OUT}/${name}-open.png` })

  const scroller = await page.evaluate(() => {
    const col = document.querySelector('.desktop-right-column')
    return col && col.scrollHeight > col.clientHeight + 10 ? '.desktop-right-column' : null
  })
  for (const sel of stops) {
    await page.evaluate(
      ([s, sc]) => {
        const el = document.querySelector(s)
        if (!el) return
        if (sc) {
          const col = document.querySelector(sc)
          col.scrollTop = el.offsetTop + el.offsetParent.offsetTop - 40
        } else {
          window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40)
        }
      },
      [sel, scroller],
    )
    await page.waitForTimeout(3600)
    await page.screenshot({ path: `${OUT}/${name}-${sel.replace(/[^a-z]/g, '')}.png` })
  }
  await page.close()
}

await run('phone', { width: 390, height: 844 }, 3, ['.countdown', '.groom', '.akad', '.gallery', '.wishes', '.closing'])
await run('desktop', { width: 1440, height: 900 }, 1, ['.bride', '.gift'])

await browser.close()
console.log(errors.length ? 'errors:\n' + errors.join('\n') : 'no console errors')
console.log(`wrote ${OUT}`)
