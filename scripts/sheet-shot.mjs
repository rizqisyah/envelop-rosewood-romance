// Shoot the cover and the whole invitation sheet at exactly the design frame width (596) and
// deviceScaleFactor 1, so both line up 1:1 with the scale-1 Figma renders of Frame 271 and
// Frame 270 and need no resampling.
//
//   VITE_DESIGN_MODE=1 npm run dev &   node scripts/sheet-shot.mjs [port] [outDir]
//
// reducedMotion pins every reveal open so the shot is deterministic; it also hides a missing
// fade, so eyeball the motion separately.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const PORT = process.argv[2] || 5174
const OUT = process.argv[3] || '.figma-tmp'
const FRAME_W = 596
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: FRAME_W, height: 1183 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
})
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto(`http://localhost:${PORT}/TemaRosewoodRomance/`, { waitUntil: 'networkidle' })
await page.waitForSelector('.cover__frame--ready')
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(800)
await page.locator('.cover__frame').screenshot({ path: `${OUT}/web-cover-1x.png` })

await page.click('.cover__hit')
await page.waitForTimeout(2600)

// Every band below the fold is viewport-gated, so walk the sheet before shooting it.
const h = await page.evaluate(() => document.documentElement.scrollHeight)
for (let y = 0; y < h; y += 500) {
  await page.evaluate((t) => window.scrollTo(0, t), y)
  await page.waitForTimeout(150)
}
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(800)

// The music button is fixed over the sheet and is not in the design.
await page.addStyleTag({ content: '.floating-music { display: none !important }' })
await page.waitForTimeout(150)

const box = await page.locator('.sheet').boundingBox()
console.log(`sheet ${box.width} x ${box.height} (design 596 x 15058)`)
const bands = await page.$$eval('.sheet > section', (els) =>
  els.map((e) => `${e.className.split(' ')[1]} ${Math.round(e.getBoundingClientRect().height)}`),
)
console.log(bands.join('\n'))
await page.locator('.sheet').screenshot({ path: `${OUT}/web-sheet-1x.png` })
if (errors.length) console.log('page errors:\n' + errors.join('\n'))
await browser.close()
console.log(`wrote ${OUT}/web-cover-1x.png, ${OUT}/web-sheet-1x.png`)
