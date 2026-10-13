<script setup lang="ts">
/*
 * Frame 270 band "greeting": y 2230..2400. The salam and the sentence it opens, closed by
 * "journey together" in Activists. Art from src/lib/bands/greeting.ts (GENERATED).
 *
 * The greeting is set in Perpetua, the design's own face, self-hosted.
 */
import BandArt from '../invite/BandArt.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/greeting'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'

const { el, shown } = useReveal(0.15)
const { bismillahGreeting, bismillahHighlight } = useWedding()
</script>

<template>
  <section :ref="el" class="band greeting" :class="{ 'is-in': shown }">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 3014:298 -- two authored lines; the box keeps white-space: pre-wrap. -->
    <p class="greeting__salam">{{ bismillahGreeting }}</p>

    <!-- 3014:299 -- the sentence's last words, set as their own node. -->
    <p v-if="bismillahHighlight" class="greeting__journey one-line">{{ bismillahHighlight }}</p>
  </section>
</template>

<style scoped>
.greeting {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

/* 3014:298 -- Perpetua 29.229/43.844, #2c4b34, centred in Frame 3's 655 box at x -30. */
.greeting__salam {
  --delay: 80ms;
  z-index: 68;
  top: calc(38 * var(--px)); /* Frame 3 y 2268, band-local 38 */
  left: calc(-30 * var(--px));
  width: calc(655 * var(--px));
  font-family: var(--font-greeting);
  font-weight: 400;
  font-size: calc(29.229 * var(--px));
  line-height: calc(43.844 * var(--px));
  white-space: pre-wrap;
  color: var(--greeting-ink);
}

/*
 * 3014:299 -- Activists 65.044/67.077, #b72d76, centred on x 298.04 in a 1002 box. The
 * lowercase string IS the render's capitals in this face -- no text-transform. `top` is
 * Figma's 136 + 5: Chrome sets this face's caps 5px higher in the same line box (measured).
 */
.greeting__journey {
  --delay: 220ms;
  z-index: 69;
  top: calc(141 * var(--px));
  left: calc(-203 * var(--px));
  width: calc(1002.087 * var(--px));
  font-family: var(--font-caps);
  font-weight: 400;
  font-size: calc(65.044 * var(--px));
  line-height: calc(67.077 * var(--px));
  color: var(--journey);
}
</style>
