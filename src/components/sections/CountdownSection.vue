<script setup lang="ts">
/*
 * Frame 270 band "countdown": y 1160..2230. "Save The Date", and the four counters inside
 * the Regency mirror frame, over the three chairs. Art from src/lib/bands/countdown.ts
 * (GENERATED, scripts/frame270.py).
 *
 * The four "0" placeholders are live: the band counts down to the first acara with a
 * parseable date (or the wedding's countdown_date). The design render has no data, so it
 * counts to the design's own akad, Sunday 17 March 2027 at 10:00.
 */
import { computed, onUnmounted, ref } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'
import { parseEventStart, remainingUntil } from '../../lib/format'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/countdown'

const { el, shown } = useReveal(0.15)
const { acara, wedding, isDesign } = useWedding()

const now = ref(Date.now())
const timer = window.setInterval(() => (now.value = Date.now()), 1000)
onUnmounted(() => window.clearInterval(timer))

const target = computed(() => {
  if (wedding.value?.countdown_date) {
    const raw = wedding.value.countdown_date
    const at = raw instanceof Date ? raw : new Date(String(raw).trim().replace(' ', 'T'))
    if (!Number.isNaN(at.getTime())) return at
  }
  for (const a of acara.value as any[]) {
    const at = parseEventStart(a?.event_date, a?.event_time)
    if (at) return at
  }
  return isDesign.value ? parseEventStart('2027-03-17', '10:00') : null
})

const left = computed(() => remainingUntil(target.value, now.value))

// 3014:230 -- the design folds the line itself; the box keeps `white-space: pre-line`.
const TITLE = 'Save\nThe Date'

/*
 * 3014:252 / 257 / 262 / 267 -- four 154.392-wide containers, 10.74 padding, the figure's
 * line box 81 tall and the label's 34, 10.74 apart. Band-local tops.
 */
const CELLS = [
  { key: 'days', label: 'Days', x: 158, y: 415 },
  { key: 'hours', label: 'Hours', x: 284.2, y: 415 },
  { key: 'minutes', label: 'Minutes', x: 158, y: 541.11 },
  { key: 'seconds', label: 'Seconds', x: 284.2, y: 541.11 },
] as const
</script>

<template>
  <section :ref="el" class="band countdown" :class="{ 'is-in': shown }" aria-labelledby="save-the-date">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- z-index is each node's GLOBAL Figma paint order (see HeroSection for the rule). -->
    <h2 id="save-the-date" class="countdown__title">{{ TITLE }}</h2>

    <template v-for="(c, i) in CELLS" :key="c.key">
      <p
        class="countdown__n one-line"
        :style="{
          left: `calc(${c.x + 10.74} * var(--px))`,
          top: `calc(${c.y + 10.74} * var(--px))`,
          '--delay': `${200 + i * 80}ms`,
        }"
      >
        {{ left[c.key] }}
      </p>
      <p
        class="countdown__l one-line"
        :style="{
          left: `calc(${c.x + 10.74} * var(--px))`,
          top: `calc(${c.y + 102.48} * var(--px))`,
          '--delay': `${260 + i * 80}ms`,
        }"
      >
        {{ c.label }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.countdown {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

/* 3014:230 -- Pinyon Script 77.443/91.964, #700f06, in a 481.6 box at x 57. */
.countdown__title {
  --delay: 60ms;
  z-index: 57;
  top: calc(31 * var(--px));
  left: calc(57 * var(--px));
  width: calc(481.6 * var(--px));
  font-family: var(--font-pinyon);
  font-weight: 400;
  font-size: calc(77.443 * var(--px));
  line-height: calc(91.964 * var(--px));
  white-space: pre-line;
  color: var(--save-date-ink);
}

/*
 * The figures. A live two-digit value is wider than the design's "0", so it centres in the
 * container's whole content width; the seconds tick every second, so tabular-nums keeps
 * the column from shuffling.
 */
.countdown__n {
  z-index: 67;
  width: calc(132.912 * var(--px));
  font-family: var(--font-ibarra);
  font-weight: 400;
  font-style: italic;
  font-size: calc(64.442 * var(--px));
  line-height: calc(81 * var(--px));
  font-variant-numeric: tabular-nums;
  color: var(--countdown-ink);
}

.countdown__l {
  z-index: 67;
  width: calc(132.912 * var(--px));
  font-family: var(--font-ibarra);
  font-weight: 400;
  font-size: calc(26.851 * var(--px));
  line-height: calc(34 * var(--px));
  color: var(--countdown-ink);
}
</style>
