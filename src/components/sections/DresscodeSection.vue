<script setup lang="ts">
/*
 * Frame 270 band "dresscode": y 8190..9030. The heading, the four palette swatches, one line
 * of copy, then the dressed table on its meadow under the lace and pearls that carry the
 * sheet into the gallery. Art from src/lib/bands/dresscode.ts (GENERATED).
 *
 * The swatches are Frame 4 (3014:369): four solid ellipses with one drop shadow each, so
 * they are drawn here in CSS -- live colours from theme_override.dresscode, the design's own
 * four when none are set. The flex row centres any count on Frame 4's own axis (298.04).
 */
import { computed } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/dresscode'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'

const { el, shown } = useReveal(0.15)
const { dresscode, showDresscode } = useWedding()

const swatches = computed(() => (dresscode.value?.colors || []) as string[])
</script>

<template>
  <section :ref="el" class="band dresscode" :class="{ 'is-in': shown }" aria-labelledby="dresscode-title">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- Only the dresscode copy goes when it is switched off; the scene stays. -->
    <template v-if="showDresscode">
      <!-- 3014:448 -- the heading. -->
      <h2 id="dresscode-title" class="dresscode__title one-line">Dresscode</h2>

      <div v-if="swatches.length" class="dresscode__palette" aria-hidden="true">
        <span v-for="(c, i) in swatches" :key="`${c}-${i}`" class="dresscode__swatch" :style="{ background: c }" />
      </div>

      <!-- 3014:374 -- the instruction. -->
      <p v-if="dresscode.note" class="dresscode__note">{{ dresscode.note }}</p>
    </template>
  </section>
</template>

<style scoped>
.dresscode {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

/* 3014:448 -- Roben Elegante 37.099, #b03b65, centred on 298.04; its auto line box is 66. */
.dresscode__title {
  --delay: 80ms;
  z-index: 101;
  top: calc(52 * var(--px)); /* 3014:448 box y 8240 + 2: Roben's line box, measured */
  left: calc(36.03 * var(--px));
  width: calc(524.02 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(37.099 * var(--px));
  line-height: calc(66 * var(--px));
  color: var(--rose);
}

/* Frame 4 at y 8333.91: ellipses 78.835 x 82.313, 125.209 apart (a 46.374 gap). */
.dresscode__palette {
  --delay: 220ms;
  z-index: 88;
  top: calc(143.91 * var(--px));
  left: 0;
  width: calc(596.08 * var(--px));
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: calc(16 * var(--px)) calc(46.374 * var(--px));
}

/* Each ellipse's drop shadow: dy 4, blur 4, black at 25%. */
.dresscode__swatch {
  flex: none;
  width: calc(78.835 * var(--px));
  height: calc(82.313 * var(--px));
  border-radius: 50%;
  box-shadow: 0 calc(4 * var(--px)) calc(4 * var(--px)) rgba(0, 0, 0, 0.25);
}

/* 3014:374 -- Ibarra Real Nova 23.187/34.78, #4e685c, centred in Frame 5's 568.077. */
.dresscode__note {
  --delay: 380ms;
  z-index: 88;
  top: calc(239.22 * var(--px));
  left: calc(14 * var(--px));
  width: calc(568.077 * var(--px));
  font-family: var(--font-ibarra);
  font-weight: 400;
  font-size: calc(23.187 * var(--px));
  line-height: calc(34.78 * var(--px));
  color: var(--sage);
}
</style>
