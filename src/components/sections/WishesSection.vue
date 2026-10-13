<script setup lang="ts">
/*
 * Frame 270 band "wishes": y 10990..11904. The heading, the two-field form and the guest
 * book. No art of its own -- the florals either side belong to the bands around it.
 *
 * The guest book is a FLOW, not absolute boxes: a live message is any number of lines, and
 * "Show more" has to move with them. Laid out at the first card's origin, the design's own
 * two cards and their button land on the render's rows (32.3 between each). The band's
 * height follows the flow, so a long book pushes the RSVP band down rather than under it.
 */
import { computed, onMounted, onUnmounted, ref, watch, watchEffect } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/wishes'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { formatWishStamp } from '../../lib/format'
import { DESIGN_MODE } from '../../lib/api'

const { el, shown } = useReveal(0.15)
const { wishes, sendWish, guest, guestName, hasGuest } = useWedding()

type Wish = { guest_name?: string; message?: string; created_at?: string | null }

// Frame 270 prints the same card twice -- its mock data, reproduced on the design render.
const DESIGN_MESSAGE =
  'Wishing you a lifetime filled with endless love, gentle laughter, and countless beautiful moments together. Happy Wedding!'
const DESIGN: Wish[] = [
  { guest_name: 'Satrio & Istri', message: DESIGN_MESSAGE, created_at: '2025-06-09 09:00:00' },
  { guest_name: 'Satrio & Istri', message: DESIGN_MESSAGE, created_at: '2025-06-09 09:00:00' },
  {
    guest_name: 'Nadia & Family',
    message: 'Congratulations to you both. May Allah bless your union with sakinah, mawaddah, wa rahmah.',
    created_at: '2025-06-09 09:00:00',
  },
]

/*
 * In DESIGN MODE the only live rows are the ones this visitor just posted, so keep the
 * design's cards under them. On live data the API's list is the whole truth.
 */
const list = computed<Wish[]>(() => {
  const live = (wishes.value as Wish[]).filter((w) => w?.guest_name || w?.message)
  return DESIGN_MODE ? [...live, ...DESIGN] : live
})

const PAGE = 2
const shownCount = ref(PAGE)
const visible = computed(() => list.value.slice(0, shownCount.value))
const hasMore = computed(() => shownCount.value < list.value.length)
const showMore = () => (shownCount.value += 4)

// --- the form ---
const name = ref('')
const message = ref('')
const sending = ref(false)
const error = ref('')
const showSuccess = ref(false)

watch(
  () => guest.value,
  (g) => {
    if (g?.guest_name || g?.name) name.value = String(g.guest_name || g.name)
  },
  { immediate: true },
)

watchEffect(() => {
  if (!name.value && hasGuest.value) name.value = String(guestName.value)
})

async function send() {
  error.value = ''
  if (!name.value.trim()) {
    error.value = 'Please write your name.'
    return
  }
  if (!message.value.trim()) {
    error.value = 'Please write your wish first.'
    return
  }
  sending.value = true
  try {
    await sendWish({ guest_name: name.value.trim(), message: message.value.trim() })
    message.value = ''
    showSuccess.value = true
    shownCount.value = Math.max(shownCount.value, PAGE)
  } catch (err: any) {
    error.value = err?.message || 'Your wish could not be sent. Please try again.'
  } finally {
    sending.value = false
  }
}

/*
 * The band's height: the book's top (433.25, the first card at y 11423.25) plus however
 * tall the book has grown, measured in design px. The design's own book ends exactly at the
 * band's 914.
 */
const BOOK_TOP = 433.25
const bookEl = ref<HTMLElement | null>(null)
const sectionEl = ref<HTMLElement | null>(null)
const bookHeight = ref(BAND_HEIGHT - BOOK_TOP)
// Whole design px: a fractional height leaves a hairline seam against the next band.
const bandHeight = computed(() => Math.max(560, Math.round(BOOK_TOP + bookHeight.value)))

let resize: ResizeObserver | null = null
function measure() {
  const book = bookEl.value
  const band = sectionEl.value
  if (!book || !band || !band.offsetWidth) return
  bookHeight.value = book.offsetHeight / (band.offsetWidth / 596)
}

onMounted(() => {
  resize = new ResizeObserver(() => requestAnimationFrame(measure))
  if (bookEl.value) resize.observe(bookEl.value)
  if (sectionEl.value) resize.observe(sectionEl.value)
  measure()
})
onUnmounted(() => resize?.disconnect())

const setSection = (node: any) => {
  sectionEl.value = node instanceof HTMLElement ? node : null
  el(node)
}
</script>

<template>
  <section
    :ref="setSection"
    class="band wishes"
    :class="{ 'is-in': shown }"
    aria-labelledby="wishes-title"
  >
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 3014:451 -- the heading. -->
    <h2 id="wishes-title" class="wishes__title one-line">Wedding Wishes</h2>

    <!-- 3014:462 / 3014:456 / 3014:458 -- name, wish, Send. -->
    <form class="wishes__form" @submit.prevent="send">
      <label class="sr-only" for="wish-name">Name</label>
      <input id="wish-name" v-model="name" class="wishes__name" type="text" placeholder="Name" autocomplete="name" />
      <label class="sr-only" for="wish-message">Your wish</label>
      <textarea id="wish-message" v-model="message" class="wishes__message" placeholder="Give your wish" />
      <button class="wishes__send" type="submit" :disabled="sending">
        {{ sending ? 'Sending…' : 'Send' }}
      </button>
      <p v-if="error" class="wishes__error" role="alert">{{ error }}</p>
    </form>

    <!-- 3014:464..469 + 3014:460 -- the guest book and its Show more. -->
    <div ref="bookEl" class="wishes__book">
      <p v-if="list.length === 0" class="wishes__empty">
        No wishes yet.<br />Be the first to send your prayers and wishes to the couple.
      </p>

      <article v-for="(w, i) in visible" :key="i" class="wishes__card">
        <p class="wishes__from">{{ w.guest_name || 'Guest' }}</p>
        <p class="wishes__when">{{ formatWishStamp(w.created_at) }}</p>
        <p class="wishes__body">{{ w.message }}</p>
      </article>

      <button v-if="hasMore" type="button" class="wishes__more" @click="showMore">Show more</button>
    </div>

    <Teleport to="body">
      <Transition name="wish-modal">
        <div
          v-if="showSuccess"
          class="wish-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wish-modal-title"
          @click.self="showSuccess = false"
        >
          <div class="wish-modal__card">
            <div class="wish-modal__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 id="wish-modal-title" class="wish-modal__title">Thank You!</h3>
            <p class="wish-modal__desc">
              Your prayers and wishes have been sent. They mean the world to us.
            </p>
            <button type="button" class="wish-modal__btn" @click="showSuccess = false">Close</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.wishes {
  height: calc(v-bind(bandHeight) * var(--px));
}

/* 3014:451 -- Roben Elegante 38.274, #4e685c, centred on x 293.79; auto line box 68. */
.wishes__title {
  --delay: 80ms;
  z-index: 104;
  top: calc(24.5 * var(--px)); /* 3014:451 box y 11013 + 1.5: Roben's line box, measured */
  left: calc(93.79 * var(--px));
  width: calc(400 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(38.274 * var(--px));
  line-height: calc(68 * var(--px));
  color: var(--sage);
}

/* The form, at the wish field's x (44.98) and the name field's y (11118.25). */
.wishes__form {
  --delay: 180ms;
  z-index: 110;
  top: calc(128.25 * var(--px));
  left: calc(44.98 * var(--px));
  width: calc(511.92 * var(--px));
  text-align: left;
}

/*
 * 3014:462 -- 509.522 x 66.979, white, radius 9.568, a 0.957 white rule; its placeholder
 * Bellefair 23.921 at #757575 50%, 15.31 in.
 */
.wishes__name,
.wishes__message {
  display: block;
  border: calc(0.957 * var(--px)) solid #ffffff;
  background: #ffffff;
  font-family: var(--font-bellefair);
  font-weight: 400;
  font-size: calc(23.921 * var(--px));
  color: #3f3f3f;
}

.wishes__name {
  margin-left: calc(1.2 * var(--px));
  width: calc(509.522 * var(--px));
  height: calc(66.979 * var(--px));
  padding: 0 calc(14.353 * var(--px));
  border-radius: calc(9.568 * var(--px));
  line-height: calc(27 * var(--px));
}

/* 3014:456 -- 510.718 x 107.645, radius 13.157, padding 14.353, lines 35.882. */
.wishes__message {
  margin-top: calc(16.75 * var(--px));
  width: calc(510.718 * var(--px));
  height: calc(107.645 * var(--px));
  padding: calc(14.353 * var(--px));
  border-radius: calc(13.157 * var(--px));
  line-height: calc(35.882 * var(--px));
  resize: none;
}

.wishes__name::placeholder,
.wishes__message::placeholder {
  color: rgba(117, 117, 117, 0.5);
}

.wishes__name:focus-visible,
.wishes__message:focus-visible {
  outline: calc(2 * var(--px)) solid var(--rose-deep);
  outline-offset: calc(1 * var(--px));
}

/* 3014:458 / 3014:460 -- 509.522 wide, padding 14.353 / 28.705, #a43759, fully rounded. */
.wishes__send,
.wishes__more {
  display: block;
  width: calc(509.522 * var(--px));
  height: calc(64.588 * var(--px));
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--rose-deep);
  font-family: var(--font-bellefair);
  font-weight: 400;
  font-size: calc(23.921 * var(--px));
  line-height: calc(35.882 * var(--px));
  color: #ffffff;
  text-align: center;
  cursor: pointer;
  /* `scale`, not a transform: the band's reveal owns `transform` and would win. */
  transition:
    background 240ms ease,
    scale 240ms ease;
}

.wishes__send {
  margin-top: calc(16.745 * var(--px));
  margin-left: calc(1.2 * var(--px));
}

.wishes__send:hover:enabled,
.wishes__more:hover,
.wishes__send:focus-visible,
.wishes__more:focus-visible {
  background: #8d2c4a;
  scale: 1.02;
}

.wishes__send:disabled {
  cursor: progress;
  opacity: 0.7;
}

.wishes__error {
  margin: calc(8 * var(--px)) 0 0 calc(4 * var(--px));
  font-family: var(--font-bellefair);
  font-size: calc(18 * var(--px));
  color: #a3401f;
}

/* The book, at 3014:466's origin (46.18, 11423.25); its cards and button are a flow. */
.wishes__book {
  --delay: 320ms;
  z-index: 116;
  top: calc(433.25 * var(--px));
  left: calc(44.98 * var(--px));
  width: calc(511.92 * var(--px));
  text-align: left;
}

.wishes__card + .wishes__card {
  margin-top: calc(32.3 * var(--px));
}

/* 3014:466 -- Abhaya Libre ExtraBold 23.921/35.882, #286549. */
.wishes__from {
  margin-left: calc(1.2 * var(--px));
  font-family: var(--font-abhaya);
  font-weight: 800;
  font-size: calc(23.921 * var(--px));
  line-height: calc(35.882 * var(--px));
  color: var(--forest);
}

/* 3014:464 -- Bellefair 21.529/32.294, #286549. */
.wishes__when {
  margin-left: calc(1.2 * var(--px));
  font-family: var(--font-bellefair);
  font-weight: 400;
  font-size: calc(21.529 * var(--px));
  line-height: calc(32.294 * var(--px));
  color: var(--forest);
}

/* 3014:468 -- Bellefair 23.921/35.882, #286549, wrapped by its 510.718 box. */
.wishes__body {
  width: calc(510.718 * var(--px));
  font-family: var(--font-bellefair);
  font-weight: 400;
  font-size: calc(23.921 * var(--px));
  line-height: calc(35.882 * var(--px));
  white-space: pre-line;
  overflow-wrap: anywhere;
  color: var(--forest);
}

/* 3014:460 sits 7px left of the form (x 39), and 32.3 under the last card. */
.wishes__more {
  margin-top: calc(32.3 * var(--px));
  margin-left: calc(-5.98 * var(--px));
}

.wishes__empty {
  margin: calc(20 * var(--px)) auto 0;
  max-width: calc(420 * var(--px));
  text-align: center;
  font-family: var(--font-bellefair);
  font-size: calc(22 * var(--px));
  line-height: calc(32 * var(--px));
  font-style: italic;
  color: var(--forest);
}

/* ===== success dialog ===== */
.wish-modal {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(28, 15, 11, 0.6);
  backdrop-filter: blur(4px);
}

.wish-modal__card {
  width: 100%;
  max-width: 380px;
  padding: 32px 24px 24px;
  border: 1px solid rgba(164, 55, 89, 0.18);
  border-radius: 20px;
  background: #fbf7f1;
  text-align: center;
  box-shadow: 0 20px 40px -15px rgba(83, 31, 6, 0.3);
}

.wish-modal__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border: 2px solid rgba(164, 55, 89, 0.35);
  border-radius: 50%;
  background: #f6e9ec;
  color: var(--rose-deep);
}

.wish-modal__title {
  margin: 0 0 10px;
  font-family: var(--font-script);
  font-size: 30px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--rose-deep);
}

.wish-modal__desc {
  margin: 0 0 24px;
  font-family: var(--font-bellefair);
  font-size: 17px;
  line-height: 1.5;
  color: var(--forest);
}

.wish-modal__btn {
  display: block;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 999px;
  background: var(--rose-deep);
  color: #ffffff;
  font-family: var(--font-bellefair);
  font-size: 18px;
  cursor: pointer;
  transition: background 200ms ease;
}

.wish-modal__btn:hover {
  background: #8d2c4a;
}

.wish-modal-enter-active,
.wish-modal-leave-active {
  transition: opacity 250ms ease;
}

.wish-modal-enter-from,
.wish-modal-leave-to {
  opacity: 0;
}

.wish-modal-enter-active .wish-modal__card,
.wish-modal-leave-active .wish-modal__card {
  transition:
    transform 250ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 250ms ease;
}

.wish-modal-enter-from .wish-modal__card,
.wish-modal-leave-to .wish-modal__card {
  opacity: 0;
  transform: scale(0.9) translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .wishes__send,
  .wishes__more,
  .wish-modal__btn {
    transition: none;
  }
}
</style>
