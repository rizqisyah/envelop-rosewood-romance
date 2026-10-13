<script setup lang="ts">
/*
 * Frame 270 band "rsvp": y 11904..13060. The flowered cabinet, the heading on its white
 * oval plate, a line of copy, four fields and Send. Art from src/lib/bands/rsvp.ts
 * (GENERATED, scripts/frame270.py); the form is live.
 *
 * `submitRsvp` comes from lib/api directly -- that is where DESIGN_MODE is enforced. In
 * design mode the form answers locally so it still works end to end.
 */
import { computed, ref, watch, watchEffect } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/rsvp'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { DESIGN_MODE, submitRsvp } from '../../lib/api'

const { el, shown } = useReveal(0.15)
const { slug, guest, guestName, hasGuest } = useWedding()

const name = ref('')
const phone = ref('')
const attendance = ref('')
const guests = ref('')
const sending = ref(false)
const error = ref('')
const done = ref(false)
const showSuccess = ref(false)

watch(
  () => guest.value,
  (g) => {
    if (g?.guest_name || g?.name) name.value = String(g.guest_name || g.name)
    if (g?.phone && !phone.value) phone.value = String(g.phone)
  },
  { immediate: true },
)

watchEffect(() => {
  if (!name.value && hasGuest.value) name.value = String(guestName.value)
})

// A guest who cannot come brings nobody; one who can brings at least themself.
watch(attendance, (val) => {
  if (val === 'hadir') {
    if (!guests.value) guests.value = '1'
  } else {
    guests.value = ''
  }
})
const attending = computed(() => attendance.value === 'hadir')

/*
 * The button is NOT disabled until the form is valid: the render draws it at full strength,
 * and a control that greys out before anything is typed reads as broken. Validation answers
 * on submit, in the line under it.
 */
async function send() {
  error.value = ''
  if (!name.value.trim()) {
    error.value = 'Please fill in your name.'
    return
  }
  if (!attendance.value) {
    error.value = 'Please let us know whether you will be joining us.'
    return
  }
  sending.value = true
  try {
    if (DESIGN_MODE) {
      await new Promise((r) => setTimeout(r, 400))
    } else {
      await submitRsvp(slug.value, {
        guest_name: name.value.trim(),
        phone: phone.value.trim(),
        attendance_status: attendance.value,
        guest_count: attending.value ? Number(guests.value) || 1 : 0,
      })
    }
    done.value = true
    showSuccess.value = true
  } catch (err: any) {
    error.value = err?.message || 'Your reply could not be sent. Please try again.'
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section :ref="el" class="band rsvp" :class="{ 'is-in': shown }" aria-labelledby="rsvp-title">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 3014:473 -- the heading, on Ellipse 9 (art). -->
    <h2 id="rsvp-title" class="rsvp__title one-line">Rsvp</h2>

    <!-- 3014:475 -- wrapped by its own 458.8 box. -->
    <p class="rsvp__lede">Kindly confirm your attendance by filling out the reservation form below.</p>

    <!-- Frame 8 (3014:476) + 3014:486 -- four fields, then Send. -->
    <form class="rsvp__form" @submit.prevent="send">
      <label class="sr-only" for="rsvp-name">Name</label>
      <input id="rsvp-name" v-model="name" class="rsvp__field" type="text" placeholder="Name" autocomplete="name" />

      <label class="sr-only" for="rsvp-phone">Phone Number</label>
      <input
        id="rsvp-phone"
        v-model="phone"
        class="rsvp__field"
        type="tel"
        placeholder="Phone Number"
        autocomplete="tel"
      />

      <label class="sr-only" for="rsvp-attendance">Will you be joining us?</label>
      <select id="rsvp-attendance" v-model="attendance" class="rsvp__field" :class="{ 'is-empty': !attendance }">
        <option value="" disabled>Will you be joining us?</option>
        <option value="hadir">Yes, I will be there</option>
        <option value="tidak">Sorry, I can't make it</option>
      </select>

      <label class="sr-only" for="rsvp-guests">Number of Guests</label>
      <input
        id="rsvp-guests"
        v-model="guests"
        class="rsvp__field"
        type="number"
        min="1"
        max="20"
        inputmode="numeric"
        placeholder="Number of Guests"
        :disabled="attendance === 'tidak'"
      />

      <button class="rsvp__send" type="submit" :disabled="sending">
        {{ sending ? 'Sending…' : done ? 'Sent' : 'Send' }}
      </button>
      <p v-if="error" class="rsvp__error" role="alert">{{ error }}</p>
    </form>

    <Teleport to="body">
      <Transition name="rsvp-modal">
        <div
          v-if="showSuccess"
          class="rsvp-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rsvp-modal-title"
          @click.self="showSuccess = false"
        >
          <div class="rsvp-modal__card">
            <div class="rsvp-modal__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 id="rsvp-modal-title" class="rsvp-modal__title">Thank You!</h3>
            <p class="rsvp-modal__desc">
              {{
                attending
                  ? 'Thank you for confirming. We look forward to celebrating with you.'
                  : 'Thank you for letting us know. Your prayers mean a great deal to us.'
              }}
            </p>
            <button type="button" class="rsvp-modal__btn" @click="showSuccess = false">Close</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.rsvp {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

/* 3014:473 -- Roben Elegante 39.798, #b03b65, centred on x 297.69; auto line box 71. */
.rsvp__title {
  --delay: 140ms;
  z-index: 118;
  top: calc(504.55 * var(--px)); /* 3014:473 box y 12407.55 + 1: Roben's line box, measured */
  left: calc(147.69 * var(--px));
  width: calc(300 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(39.798 * var(--px));
  line-height: calc(71 * var(--px));
  color: var(--rose);
}

/* 3014:475 -- EB Garamond 31/31, #b03b65, centred in a 458.8 box at x 69. */
.rsvp__lede {
  --delay: 220ms;
  z-index: 119;
  top: calc(636 * var(--px));
  left: calc(69 * var(--px));
  width: calc(458.8 * var(--px));
  font-family: var(--font-garamond);
  font-weight: 400;
  font-size: calc(31 * var(--px));
  line-height: calc(31 * var(--px));
  color: var(--rose);
}

/*
 * Frame 8 at (30, 12631), 536.243 wide: its fields 8.812 apart. The sr-only labels are
 * absolutely positioned, so they take no part in the gap.
 */
.rsvp__form {
  --delay: 320ms;
  z-index: 121;
  top: calc(727 * var(--px));
  left: calc(30 * var(--px));
  width: calc(536.243 * var(--px));
  display: flex;
  flex-direction: column;
  gap: calc(8.812 * var(--px));
  text-align: left;
}

/*
 * 3014:478 and its three twins: 67.974 tall, 8.812 apart, white, a 1.007 #67764d rule,
 * radius 13.847; the label Bellefair 25.176 at #1e3c72 50%, 16.11 in from the corner. A
 * single-line field centres its text whatever padding-top says, so the design's high-set
 * label is bought back with a deeper padding-bottom.
 */
.rsvp__field {
  display: block;
  width: 100%;
  height: calc(67.974 * var(--px));
  padding: calc(5 * var(--px)) calc(15.105 * var(--px)) calc(11.76 * var(--px));
  border: calc(1.007 * var(--px)) solid var(--field-rule);
  border-radius: calc(13.847 * var(--px));
  background: #ffffff;
  font-family: var(--font-bellefair);
  font-weight: 400;
  font-size: calc(25.176 * var(--px));
  line-height: calc(29 * var(--px));
  color: #1e3c72;
  appearance: none;
}

select.rsvp__field {
  cursor: pointer;
}

.rsvp__field::placeholder,
.rsvp__field.is-empty {
  color: rgba(30, 60, 114, 0.5);
}

.rsvp__field:disabled {
  background: #f6f3ef;
  cursor: not-allowed;
}

.rsvp__field:focus-visible {
  outline: calc(2 * var(--px)) solid var(--field-rule);
  outline-offset: calc(1 * var(--px));
}

/*
 * 3014:486 -- 536.243 x 67.974, #a43759, fully rounded, drop shadow 0 5.035 2.518 at 25%;
 * its label Bellefair 25.176/37.764 white. 27.7 under the last field: the gap plus this.
 */
.rsvp__send {
  display: block;
  width: 100%;
  height: calc(67.974 * var(--px));
  margin-top: calc(18.888 * var(--px));
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--rose-deep);
  font-family: var(--font-bellefair);
  font-weight: 400;
  font-size: calc(25.176 * var(--px));
  line-height: calc(37.764 * var(--px));
  color: #ffffff;
  cursor: pointer;
  filter: drop-shadow(0 calc(5.035 * var(--px)) calc(2.518 * var(--px)) rgba(0, 0, 0, 0.25));
  /* `scale`, not a transform: the band's reveal owns `transform` and would win. */
  transition:
    background 240ms ease,
    scale 240ms ease;
}

.rsvp__send:hover:enabled,
.rsvp__send:focus-visible {
  background: #8d2c4a;
  scale: 1.02;
}

.rsvp__send:disabled {
  cursor: progress;
  opacity: 0.7;
}

.rsvp__error {
  margin-top: calc(2 * var(--px));
  font-family: var(--font-bellefair);
  font-size: calc(19 * var(--px));
  color: #a3401f;
  text-align: center;
}

/* ===== success dialog ===== */
.rsvp-modal {
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

.rsvp-modal__card {
  width: 100%;
  max-width: 380px;
  padding: 32px 24px 24px;
  border: 1px solid rgba(164, 55, 89, 0.18);
  border-radius: 20px;
  background: #fbf7f1;
  text-align: center;
  box-shadow: 0 20px 40px -15px rgba(83, 31, 6, 0.3);
}

.rsvp-modal__icon {
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

.rsvp-modal__title {
  margin: 0 0 10px;
  font-family: var(--font-script);
  font-size: 30px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--rose-deep);
}

.rsvp-modal__desc {
  margin: 0 0 24px;
  font-family: var(--font-bellefair);
  font-size: 17px;
  line-height: 1.5;
  color: var(--forest);
}

.rsvp-modal__btn {
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

.rsvp-modal__btn:hover {
  background: #8d2c4a;
}

.rsvp-modal-enter-active,
.rsvp-modal-leave-active {
  transition: opacity 250ms ease;
}

.rsvp-modal-enter-from,
.rsvp-modal-leave-to {
  opacity: 0;
}

.rsvp-modal-enter-active .rsvp-modal__card,
.rsvp-modal-leave-active .rsvp-modal__card {
  transition:
    transform 250ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 250ms ease;
}

.rsvp-modal-enter-from .rsvp-modal__card,
.rsvp-modal-leave-to .rsvp-modal__card {
  opacity: 0;
  transform: scale(0.9) translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .rsvp__send,
  .rsvp-modal__btn {
    transition: none;
  }
}
</style>
