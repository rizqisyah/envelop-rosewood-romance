// Render the sheet against a MOCKED getHome payload, to exercise the live-data paths the
// design render never takes: order, real photos, long names, three accounts, five photos,
// a prewedding video, a longer verse, five wishes, and the forms' POSTs.
//
//   npm run dev &   node scripts/live-shot.mjs [port] [outDir]
//
// Needs a dev server WITHOUT VITE_DESIGN_MODE, so the app actually calls the API.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const PORT = process.argv[2] || 5174
const OUT = process.argv[3] || '.figma-tmp'
mkdirSync(OUT, { recursive: true })
const base = `http://localhost:${PORT}/TemaRosewoodRomance`
const photo = (n) => `${base}/src/assets/art/photo-gallery-${n}.webp`

const payload = {
  success: true,
  data: {
    wedding: {
      title: 'Aiman & Zuzie',
      order_groom_first: true,
      music_url: '',
      image_spouse: `${base}/src/assets/art/photo-closing.webp`,
      theme_override: {
        words: { hashtag: '#AimanFoundHisZuzie' },
        quote: {
          verse: 'Q.S. Ar-Rum: 21',
          text: '“And of His signs is that He created for you from yourselves mates that you may find tranquillity in them; and He placed between you affection and mercy.”',
          arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا',
        },
        dresscode: { colors: ['#ffffff', '#f1e4d4', '#f3f5e8'], note: 'Soft pastels and earth tones, please.' },
      },
    },
    guest: { guest_name: 'Encik Hafiz & Family', phone: '0123456789' },
    content: {
      pengantin: [
        {
          type: 'groom',
          name: 'Noraiman Aqil bin Masnawi',
          nickname: 'Aiman',
          child_of: 'Second son of',
          father_name: 'Mr. Masnawi bin Salim',
          mother_name: 'Mrs. Norapizah binti Ali',
          instagram: 'aiman.aqil',
          photo_url: photo(1),
        },
        {
          type: 'bride',
          name: 'Noor Zuzie Fariatie binti Zulkifli',
          nickname: 'Zuzie',
          child_of: 'Last daughter of',
          father_name: 'Mr. Zulkifli bin Che Matt',
          mother_name: 'Mrs. Azilah Mohd Shariff',
          instagram: '',
          photo_url: photo(3),
        },
      ],
      acara: [
        {
          title: 'Akad Nikah',
          event_date: '2027-03-17',
          event_time: '10:00 AM - 11:30 AM',
          location_name: 'Masjid Sultan Abu Bakar',
          address: 'Jalan Skudai, 80200 Johor Bahru, Johor',
          maps_url: 'https://maps.google.com/?q=Masjid+Sultan+Abu+Bakar',
        },
        {
          title: 'Majlis Resepsi',
          event_date: '2027-03-17',
          event_time: '12:00 PM - 4:00 PM',
          location_name: 'Rimbunan Abdul Samad',
          address: "63, Jalan Abdul Samad, Kampung Bahru, 80100 Johor Bahru, Johor Darul Ta'zim",
          maps_url: 'https://maps.google.com/?q=Rimbunan+Abdul+Samad',
        },
      ],
      gallery: [1, 2, 3, 4, 1].map((n, i) => ({ image_url: photo(n), caption: `Moment ${i + 1}` })),
      rekening: [
        { bank_name: 'Maybank', account_number: '1511 3812 7044', account_name: 'Zuzie Fariatie' },
        { bank_name: 'CIMB Bank', account_number: '7012 3456 7890', account_name: 'Noraiman Aqil' },
        { bank_name: 'Bank Islam', account_number: '1234 5678 9012', account_name: 'Noraiman Aqil bin Masnawi' },
      ],
      ucapan: [
        { guest_name: 'Satrio & Istri', message: 'Selamat pengantin baru! Semoga berbahagia hingga ke Jannah.', created_at: '2027-01-02 09:00:00' },
        { guest_name: 'Nadia', message: 'Congratulations Aiman & Zuzie! So happy for you both.', created_at: '2027-01-03 10:15:00' },
        { guest_name: 'Pak Long', message: 'Barakallahu lakuma wa baraka alaikuma wa jama’a bainakuma fi khair.', created_at: '2027-01-04 20:30:00' },
        { guest_name: 'Farah', message: 'Wishing you both a lifetime of love and laughter.', created_at: '2027-01-05 08:00:00' },
        { guest_name: 'Hakim', message: 'Tahniah!', created_at: '2027-01-06 12:00:00' },
      ],
    },
  },
}

/*
 * VARIANT=sparse: the other branches -- the bride first, a custom hero photo, ONE event, and no
 * photos, accounts or wishes. Resepsi, gallery and gift drop out; the guest book is empty.
 */
if (process.env.VARIANT === 'sparse') {
  const d = payload.data
  d.wedding.order_groom_first = false
  d.wedding.theme_override.images = { foto_mempelai_setelah_buka: photo(4) }
  d.content.acara = d.content.acara.slice(0, 1)
  d.content.gallery = []
  d.content.rekening = []
  d.content.ucapan = []
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 596, height: 1183 }, deviceScaleFactor: 1, reducedMotion: 'reduce' })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const posts = []
await page.route('**/api/v1/service/menu/**', async (route) => {
  const req = route.request()
  if (req.method() === 'POST') {
    posts.push(`${req.url().split('/menu/')[1]} ${req.postData()}`)
    return route.fulfill({ json: { success: true, data: { id: 'x', ...JSON.parse(req.postData() || '{}'), created_at: '2027-01-07 09:00:00' } } })
  }
  return route.fulfill({ json: payload })
})

await page.goto(`${base}/rosewood-romance?to=Encik%20Hafiz`, { waitUntil: 'networkidle' })
await page.waitForSelector('.cover__frame--ready')
await page.waitForTimeout(600)
await page.locator('.cover__frame').screenshot({ path: `${OUT}/live-cover.png` })
await page.click('.cover__hit')
await page.waitForTimeout(2600)
const h = await page.evaluate(() => document.documentElement.scrollHeight)
for (let y = 0; y < h; y += 500) {
  await page.evaluate((t) => window.scrollTo(0, t), y)
  await page.waitForTimeout(120)
}

// Exercise the forms: a wish, an RSVP, and Show more.
await page.fill('#wish-message', 'Semoga bahagia selalu!')
await page.click('.wishes__send')
await page.waitForTimeout(500)
await page.keyboard.press('Escape')
await page.locator('.wish-modal__btn').click().catch(() => {})
await page.locator('.wishes__more').click().catch(() => {})
await page.selectOption('#rsvp-attendance', 'hadir')
await page.fill('#rsvp-guests', '3')
await page.click('.rsvp__send')
await page.waitForTimeout(600)
await page.locator('.rsvp-modal__btn').click().catch(() => {})
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(500)
await page.addStyleTag({ content: '.floating-music { display: none !important }' })

const box = await page.locator('.sheet').boundingBox()
console.log(`sheet ${box.width} x ${box.height}`)
console.log((await page.$$eval('.sheet > section', (els) => els.map((e) => `${e.className.split(' ')[1]} ${Math.round(e.getBoundingClientRect().height)}`))).join('\n'))
await page.locator('.sheet').screenshot({ path: `${OUT}/live-sheet${process.env.VARIANT ? '-' + process.env.VARIANT : ''}.png` })
console.log('POSTs:\n' + posts.join('\n'))
if (errors.length) console.log('page errors:\n' + errors.join('\n'))
await browser.close()
