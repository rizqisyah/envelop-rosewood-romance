import { ref, computed, onMounted } from 'vue'

import { resolveSlug, getHome, submitUcapan, DESIGN_MODE } from '../lib/api'

const state = ref<{
  loading: boolean
  error: string | null
  data: any | null
}>({
  loading: !DESIGN_MODE,
  error: null,
  data: null,
})

/*
 * theme_config.colors (and the wedding's theme_override) drive the tokens in
 * src/style/tokens.css that are marked as theme hooks.
 */
function applyTheme(themeData: any, weddingData: any) {
  const cfg = themeData?.theme_config
  let override = weddingData?.theme_override
  if (typeof override === 'string') {
    try {
      override = JSON.parse(override)
    } catch {
      override = {}
    }
  }
  override = override || {}

  const root = document.documentElement
  const colors = { ...(cfg?.colors || {}), ...(override?.colors || {}) }
  const fonts = { ...(cfg?.fonts || {}), ...(override?.fonts || {}) }

  if (colors.primary) root.style.setProperty('--rose', colors.primary)
  if (colors.secondary) root.style.setProperty('--maroon', colors.secondary)
  if (colors.accent) root.style.setProperty('--sage', colors.accent)
  if (colors.bg_body) {
    root.style.setProperty('--bg-body', colors.bg_body)
    root.style.setProperty('--sheet', colors.bg_body)
  }
  if (colors.paper) root.style.setProperty('--paper', colors.paper)
  if (colors.sheet) root.style.setProperty('--sheet', colors.sheet)

  if (fonts.script) root.style.setProperty('--font-script', fonts.script)
  if (fonts.hand) root.style.setProperty('--font-hand', fonts.hand)
}

/*
 * Every band calls useWedding(), and they all mount in the same tick. Hold the first
 * promise so the rest see it and skip -- only the explicit `refetch` bypasses this.
 */
let inflight: Promise<void> | null = null

function getGuestCode(): string {
  if (typeof window === 'undefined') return ''
  const searchParams = new URLSearchParams(window.location.search)
  return (
    searchParams.get('to') ||
    searchParams.get('k') ||
    searchParams.get('code') ||
    searchParams.get('guest') ||
    ''
  ).trim()
}

const slug = ref(resolveSlug())
const guestCode = ref(getGuestCode())

async function fetchWeddingData() {
  if (DESIGN_MODE) return
  slug.value = resolveSlug()
  guestCode.value = getGuestCode()
  state.value.loading = true
  state.value.error = null
  try {
    const data = await getHome(slug.value, guestCode.value)
    state.value.data = data
    if (data?.theme || data?.wedding) {
      applyTheme(data.theme, data.wedding)
    }
    if (data?.wedding?.title) {
      document.title = `${data.wedding.title} - Undangan Pernikahan`
    }
  } catch (err: any) {
    console.error('Failed to load wedding data:', err)
    state.value.error = err.message
  } finally {
    state.value.loading = false
  }
}

// Live preview messages from the admin dashboard ("Mode Imajinasi").
if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'QINVI_PREVIEW_UPDATE') {
      const { wedding: previewWedding, theme: previewTheme, content: previewContent, refetch } = event.data

      if (previewWedding) {
        const resolvedWedding = { ...previewWedding }
        if (typeof resolvedWedding.theme_override === 'string') {
          try {
            resolvedWedding.theme_override = JSON.parse(resolvedWedding.theme_override)
          } catch (e) {
            console.error('Failed to parse theme_override:', e)
          }
        }

        const existingOverride = state.value.data?.wedding?.theme_override || {}
        const mergedOverride = {
          ...existingOverride,
          ...(resolvedWedding.theme_override || {}),
        }

        state.value.data = {
          ...(state.value.data || {}),
          wedding: {
            ...(state.value.data?.wedding || {}),
            ...resolvedWedding,
            theme_override: mergedOverride,
          },
        }
      }

      if (previewTheme) {
        state.value.data = {
          ...(state.value.data || {}),
          theme: previewTheme,
        }
      }

      /*
       * Draft lists from the dashboard tabs as they are typed: { pengantin, acara, rekening,
       * gallery, ucapan }. Each key present replaces that whole list; the rest are kept. A
       * save or `refetch` later brings the real rows back.
       */
      if (previewContent && typeof previewContent === 'object') {
        const data = state.value.data || {}
        state.value.data = { ...data, content: { ...(data.content ?? data), ...previewContent } }
      }

      if (state.value.data?.theme || state.value.data?.wedding) {
        applyTheme(state.value.data.theme, state.value.data.wedding)
      }

      if (refetch) {
        inflight = null
        fetchWeddingData()
      }
    }
  })
}

/*
 * Wishes posted while in design mode. Kept outside `state` on purpose: seeding state.data
 * to hold them would make `wedding` non-null, and every band would drop its design
 * fallback mid-session.
 */
const designWishes = ref<any[]>([])

/** "Aiman & Zuzie" -- the couple both frames print. */
export const DESIGN_COUPLE = { first: 'Aiman', second: 'Zuzie' }

export function useWedding() {
  onMounted(() => {
    if (DESIGN_MODE) return
    const currentCode = getGuestCode()
    const currentSlug = resolveSlug()
    if (state.value.data && slug.value === currentSlug && guestCode.value === currentCode) {
      return
    }
    slug.value = currentSlug
    guestCode.value = currentCode
    inflight ??= fetchWeddingData().finally(() => {
      inflight = null
    })
  })

  const wedding = computed(() => state.value.data?.wedding ?? null)
  const theme = computed(() => state.value.data?.theme ?? null)
  const guest = computed(() => state.value.data?.guest ?? null)
  /** No live wedding, and none on its way: the bands print the design's own copy. */
  const isDesign = computed(() => !wedding.value && !state.value.loading)

  const guestName = computed(() => {
    if (guest.value?.guest_name) return guest.value.guest_name
    if (guest.value?.name) return guest.value.name
    const code = getGuestCode()
    return code || 'Guest'
  })
  const hasGuest = computed(() => guestName.value !== 'Guest')
  const guestGroup = computed(() => guest.value?.group_name || '')

  /*
   * getHome nests every list under `data.content`. Read `content` first, then the flat key,
   * so a payload of either shape works.
   */
  const content = computed(() => state.value.data?.content ?? state.value.data ?? null)
  const pengantin = computed(() => content.value?.pengantin ?? [])
  const acara = computed(() => content.value?.acara ?? [])
  const gallery = computed(() => content.value?.gallery ?? [])
  // The API calls the account list `rekening`.
  const gift = computed(() => content.value?.rekening ?? content.value?.gift ?? [])
  const wishes = computed(() =>
    designWishes.value.length ? designWishes.value : content.value?.ucapan ?? content.value?.wishes ?? [],
  )

  // Writes `ucapan` back where `content` reads it from, or the new row is invisible.
  function putWishes(list: any[]) {
    const data = state.value.data
    if (!data) return
    state.value.data = data.content
      ? { ...data, content: { ...data.content, ucapan: list } }
      : { ...data, ucapan: list }
  }

  /**
   * Post a wish and get it into the list without a refetch. The API may answer with the
   * refreshed list, with just the created row, or with neither, so all three are handled.
   */
  async function sendWish(body: { guest_name: string; message: string }): Promise<any> {
    // Design mode must not write to the live backend; the form still works end to end.
    if (DESIGN_MODE) {
      const row = { id: `local-${Date.now()}`, ...body, created_at: new Date().toISOString() }
      designWishes.value = [row, ...designWishes.value]
      return { success: true, data: row }
    }
    const res = await submitUcapan(slug.value, body)
    if (!state.value.data) return res

    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : null
    if (list) {
      putWishes(list)
      return res
    }

    const row =
      res?.data && typeof res.data === 'object' && !Array.isArray(res.data)
        ? res.data
        : { id: `local-${Date.now()}`, ...body, created_at: new Date().toISOString() }
    putWishes([row, ...(Array.isArray(wishes.value) ? wishes.value : [])])
    return res
  }

  const groom = computed(() => pengantin.value.find((p: any) => p.type === 'groom') || null)
  const bride = computed(() => pengantin.value.find((p: any) => p.type === 'bride') || null)

  const isGroomFirst = computed(() => wedding.value?.order_groom_first !== false)

  const coupleNickname = computed(() => {
    if (groom.value?.name && bride.value?.name) {
      const gName = groom.value?.nickname?.trim() || groom.value.name.split(' ')[0]
      const bName = bride.value?.nickname?.trim() || bride.value.name.split(' ')[0]
      return isGroomFirst.value ? `${gName} & ${bName}` : `${bName} & ${gName}`
    }
    if (wedding.value?.title) return wedding.value.title
    // Frames 270 and 271 print "Aiman & Zuzie", so an unconfigured render matches the design.
    return isGroomFirst.value
      ? `${DESIGN_COUPLE.first} & ${DESIGN_COUPLE.second}`
      : `${DESIGN_COUPLE.second} & ${DESIGN_COUPLE.first}`
  })

  const parsedOverride = computed(() => {
    let ov = wedding.value?.theme_override
    if (typeof ov === 'string') {
      try {
        ov = JSON.parse(ov)
      } catch {
        ov = {}
      }
    }
    return ov || {}
  })

  // The design's own hashtag prints only on the design render; a real wedding without one
  // gets no hashtag line rather than the demo couple's.
  const hashtag = computed(() => {
    const own = String(parsedOverride.value?.words?.hashtag || wedding.value?.hashtag || '').trim()
    if (own) return own
    return isDesign.value ? '#AimanFoundHisZuzie' : ''
  })

  // 3014:332 -- the translation. The design wraps it in curly quotes itself.
  const quoteText = computed(
    () =>
      parsedOverride.value?.quote?.text ||
      parsedOverride.value?.words?.quote_text ||
      '“And He brought their hearts together.”',
  )

  // 3014:331 -- two authored lines, and the double space after "Q.S." is the design's.
  const quoteVerse = computed(
    () =>
      parsedOverride.value?.quote?.verse ||
      parsedOverride.value?.words?.quote_verse ||
      'Q.S.  Surah\nAl-Anfal 8:63',
  )

  const quoteArabic = computed(
    () =>
      parsedOverride.value?.quote?.arabic ||
      parsedOverride.value?.words?.quote_arabic ||
      'َأَلَّفَ بَيْنَ قُلُوبِهِمْ',
  )

  // 3014:298 -- the second line opens with a space in the design; pre-wrap keeps it.
  const bismillahGreeting = computed(
    () =>
      parsedOverride.value?.bismillah_greeting ||
      parsedOverride.value?.words?.bismillah_greeting ||
      "Assalamu'alaikum Warahmatullahi Wabarakatuh\n With grateful hearts, we begin this sacred ",
  )

  // 3014:299 -- lowercase on purpose: Activists draws its lowercase as the render's capitals.
  const bismillahHighlight = computed(
    () =>
      parsedOverride.value?.bismillah_highlight ||
      parsedOverride.value?.words?.bismillah_highlight ||
      'journey together',
  )

  // 3014:369 -- the four ellipses of Frame 4, in order.
  const DESIGN_SWATCHES = ['#ffffff', '#f1e4d4', '#f3f5e8', '#fbf0eb']
  const dresscode = computed(() => {
    const ov = parsedOverride.value
    let colors = Array.isArray(ov?.dresscode?.colors)
      ? ov.dresscode.colors.filter((c: any) => typeof c === 'string' && c.trim() !== '')
      : []
    if (!ov?.dresscode || (!ov.dresscode.colors && colors.length === 0)) {
      colors = DESIGN_SWATCHES
    }
    const enabled = ov?.dresscode?.enabled !== false && ov?.dresscode?.show !== false
    return {
      enabled,
      note:
        ov?.dresscode?.note !== undefined
          ? ov.dresscode.note
          : 'Kindly dress in shades of our wedding palette.',
      colors,
    }
  })

  const showDresscode = computed(() => dresscode.value.enabled)

  const liveAcara = computed(() =>
    (acara.value as any[]).filter((a) => a?.title || a?.name || a?.event_date),
  )
  // The reception card is the second event: it goes when a live wedding has only one (or none).
  const hasMultipleAcara = computed(() => isDesign.value || liveAcara.value.length > 1)

  const videoPrewed = computed(
    () =>
      parsedOverride.value?.words?.video_prewed ||
      parsedOverride.value?.video_prewed ||
      '',
  )

  const videoUrl = computed(
    () =>
      wedding.value?.video_url ||
      parsedOverride.value?.words?.video_url ||
      parsedOverride.value?.words?.video_opening ||
      parsedOverride.value?.video_opening ||
      '',
  )

  const musicUrl = computed(
    () =>
      wedding.value?.music_url ||
      parsedOverride.value?.words?.music_url ||
      'https://qinvi-worker.kesone01.workers.dev/Music/Brian McKnight - Back At One (Lyrics) (mp3cut.net).mp3',
  )

  /*
   * The design's own photos and accounts stand in ONLY in design mode. A live wedding whose
   * request failed must not fall back to them: a guest would transfer money to the demo
   * account. Copy fallbacks (names, venue lines) follow `isDesign` instead.
   */
  const designData = computed(() => DESIGN_MODE && !wedding.value)

  const galleryPhotos = computed(() =>
    ((gallery.value as any[]) || [])
      .map((g) => ({ src: String(g?.image_url || '').trim(), caption: String(g?.caption || '') }))
      .filter((p) => p.src),
  )
  const hasGalleryPhotos = computed(() => galleryPhotos.value.length > 0 || designData.value)
  const hasPrewedVideo = computed(() => String(videoPrewed.value || '').trim() !== '')
  const hasGallerySection = computed(() => hasGalleryPhotos.value || hasPrewedVideo.value)

  const giftAccounts = computed(() =>
    ((gift.value as any[]) || [])
      .map((g) => ({
        bank: String(g?.bank_name || '').trim(),
        number: String(g?.account_number || '').trim(),
        owner: String(g?.account_name || '').trim(),
      }))
      .filter((c) => c.bank || c.number || c.owner),
  )
  const hasGiftSection = computed(() => giftAccounts.value.length > 0 || designData.value)

  const customHeroPhoto = computed(
    () =>
      parsedOverride.value?.images?.foto_mempelai_setelah_buka ||
      theme.value?.theme_config?.images?.foto_mempelai_setelah_buka ||
      wedding.value?.foto_mempelai_setelah_buka ||
      '',
  )

  const customSpousePhoto = computed(
    () =>
      wedding.value?.image_spouse ||
      wedding.value?.['image-spouse'] ||
      content.value?.image_spouse ||
      parsedOverride.value?.images?.image_spouse ||
      parsedOverride.value?.images?.foto_pasangan ||
      theme.value?.theme_config?.images?.image_spouse ||
      '',
  )

  const transformOf = (t: any) => ({
    scale: typeof t?.scale === 'number' ? t.scale : 1,
    x: typeof t?.x === 'number' ? t.x : 50,
    y: typeof t?.y === 'number' ? t.y : 50,
  })
  const fotoMempelaiTransform = computed(() => transformOf(parsedOverride.value?.foto_mempelai_transform))
  const brideTransform = computed(() => transformOf(parsedOverride.value?.foto_wanita_transform))
  const groomTransform = computed(() => transformOf(parsedOverride.value?.foto_pria_transform))

  /*
   * The closing band's copy, Frame 270's own: 3014:496 / 3014:495 / 3024:308. A live
   * message may carry a short first line (the title) and a sign-off as its last line.
   */
  const DESIGN_CLOSING =
    'Thank You !\n\nAnd So, Our Story Begins\nWith hearts full of love, we look forward to celebrating this beautiful beginning with you.\nWith Love,'

  const closingTitle = computed(
    () =>
      parsedOverride.value?.words?.footer_title ||
      parsedOverride.value?.words?.closing_title ||
      parsedOverride.value?.words?.thank_you_title ||
      '',
  )

  const closingMessage = computed(() => {
    const raw =
      parsedOverride.value?.words?.footer_message ||
      parsedOverride.value?.words?.closing_message ||
      parsedOverride.value?.words?.footer_message_en ||
      wedding.value?.pesan_penutup ||
      wedding.value?.closing_message
    return raw && typeof raw === 'string' && raw.trim() ? raw.trim() : DESIGN_CLOSING
  })

  const closingSignature = computed(
    () =>
      parsedOverride.value?.words?.closing_signature ||
      parsedOverride.value?.words?.footer_signature ||
      coupleNickname.value,
  )

  return {
    slug,
    guestCode,
    loading: computed(() => state.value.loading),
    error: computed(() => state.value.error),
    isDesign,
    designData,
    wedding,
    theme,
    guest,
    guestName,
    hasGuest,
    guestGroup,
    pengantin,
    acara,
    liveAcara,
    hasMultipleAcara,
    gallery,
    galleryPhotos,
    hasGalleryPhotos,
    hasPrewedVideo,
    hasGallerySection,
    gift,
    giftAccounts,
    hasGiftSection,
    wishes,
    sendWish,
    groom,
    bride,
    isGroomFirst,
    coupleNickname,
    hashtag,
    quoteText,
    quoteVerse,
    quoteArabic,
    bismillahGreeting,
    bismillahHighlight,
    dresscode,
    showDresscode,
    videoPrewed,
    videoUrl,
    musicUrl,
    closingTitle,
    closingMessage,
    closingSignature,
    customHeroPhoto,
    customSpousePhoto,
    fotoMempelaiTransform,
    brideTransform,
    groomTransform,
    refetch: fetchWeddingData,
  }
}
