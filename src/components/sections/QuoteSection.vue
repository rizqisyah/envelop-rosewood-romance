<script setup lang="ts">
/*
 * Frame 270 band "quote": y 4750..5830. The valley and the garden path behind the green
 * shield cartouche, the verse credit and the ayah inside it. Art from
 * src/lib/bands/quote.ts (GENERATED, scripts/frame270.py).
 */
import BandArt from '../invite/BandArt.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/quote'
import { useFitText } from '../../composables/useFitText'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'

const { el, shown } = useReveal(0.15)
const { quoteText, quoteVerse, quoteArabic } = useWedding()

// A live ayah can run far longer than the design's six words, and the shield cannot grow,
// so it may shrink further than a name may.
const fitAyah = useFitText(0.55)
</script>

<template>
  <section :ref="el" class="band quote" :class="{ 'is-in': shown }" aria-labelledby="quote-verse">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 3014:331 -- the credit, and the band's heading. Two authored lines. -->
    <h2 id="quote-verse" class="quote__verse">{{ quoteVerse }}</h2>

    <!--
      3014:332 -- one node, three paragraphs: an empty first line (a zero-width space in
      the design), the Arabic, then the translation wrapped by the node's 252.72 box.
    -->
    <blockquote :ref="fitAyah" class="quote__ayah">
      <p v-if="quoteArabic" class="quote__arabic" lang="ar" dir="rtl">{{ quoteArabic }}</p>
      <p class="quote__text">{{ quoteText }}</p>
    </blockquote>
  </section>
</template>

<style scoped>
.quote {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

/*
 * 3014:331 -- Cinzel Bold 31.667/47.5, #c04935, centred on x 297.53. `pre-wrap` for the
 * design's double space after "Q.S.".
 */
.quote__verse {
  --delay: 120ms;
  z-index: 73;
  top: calc(546 * var(--px));
  left: calc(57.53 * var(--px));
  width: calc(480 * var(--px));
  font-family: var(--font-cinzel);
  font-weight: 700;
  font-size: calc(31.667 * var(--px));
  line-height: calc(47.5 * var(--px));
  white-space: pre-wrap;
  color: var(--quote-ink);
}

/*
 * 3014:332 -- Times New Roman 31.082/44.136, #c04935, centred in a 252.72 box at x 172.
 * The height runs to just above the divider ornament (3026:381, its rule at y ~5725) -- the
 * constraint useFitText shrinks a long ayah against.
 */
.quote__ayah {
  --delay: 260ms;
  z-index: 74;
  top: calc(622 * var(--px));
  left: calc(172 * var(--px));
  width: calc(252.72 * var(--px));
  height: calc(338 * var(--px));
  font-family: var(--font-times);
  font-weight: 400;
  font-size: calc(31.082 * var(--px) * var(--fit, 1));
  line-height: calc(44.136 * var(--px) * var(--fit, 1));
  color: var(--quote-ink);
}

/* The design's first line is empty; the Arabic sits on the second. */
.quote__arabic {
  margin-top: calc(44.136 * var(--px) * var(--fit, 1));
  font-family: var(--font-arabic);
}
</style>
