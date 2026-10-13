<script setup lang="ts">
/*
 * Frame 270 band "resepsi": y 7030..8190. The akad band again -- cartouche, then the card --
 * with the reception's copy in it. Art from src/lib/bands/resepsi.ts (GENERATED,
 * scripts/frame270.py).
 *
 * The reception is the SECOND live acara. InviteBody drops this band when the API sends
 * exactly one; on the design render it prints the design's reception.
 */
import BandArt from '../invite/BandArt.vue'
import EventDetails from './EventDetails.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/resepsi'
import { useEvent } from '../../composables/useEvent'
import { useFitText } from '../../composables/useFitText'
import { useReveal } from '../../composables/useReveal'

const { el, shown } = useReveal(0.15)
// The cartouche holds "Sunday,"; "Wednesday," has to shrink to stay inside its scrolls.
const fitDay = useFitText(0.6)
const { isDesign, stamp, card } = useEvent(1)
</script>

<template>
  <section :ref="el" class="band resepsi" :class="{ 'is-in': shown }" aria-labelledby="resepsi-title">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 3026:351 / 3026:350 -- the cartouche. -->
    <p :ref="fitDay" class="resepsi__day">{{ stamp.weekday }}</p>
    <p class="resepsi__date">{{ stamp.date }}</p>

    <!-- 3026:363 -- the card's copy, title first. -->
    <EventDetails
      class="resepsi__card"
      heading-id="resepsi-title"
      :title="card.title"
      :time="card.time"
      :venue="card.venue"
      :address="card.address"
      :maps="card.maps"
      :time-gap="31.02"
      :placeholder="isDesign"
    />
  </section>
</template>

<style scoped>
.resepsi {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

/* 3026:351 -- Pinyon Script 40/36, #b03b65, centred on x 299. */
.resepsi__day {
  --delay: 80ms;
  z-index: 182;
  /* A shrunk weekday keeps its baseline (~29 into the 36 line box), not its top. */
  top: calc((134 + 29 * (1 - var(--fit, 1))) * var(--px));
  left: calc(204 * var(--px));
  width: calc(190 * var(--px));
  height: calc(36 * var(--px) * var(--fit, 1));
  font-family: var(--font-pinyon);
  font-weight: 400;
  font-size: calc(40 * var(--px) * var(--fit, 1));
  line-height: calc(36 * var(--px) * var(--fit, 1));
  color: var(--rose);
}

/* 3026:350 -- Cinzel Bold 20/21, #b03b65, two lines in a 226 box centred on 299. */
.resepsi__date {
  --delay: 180ms;
  z-index: 181;
  top: calc(174 * var(--px));
  left: calc(186 * var(--px));
  width: calc(226 * var(--px));
  font-family: var(--font-cinzel);
  font-weight: 700;
  font-size: calc(20 * var(--px));
  line-height: calc(21 * var(--px));
  white-space: pre-line;
  color: var(--rose);
}

/* 3026:376's title line at y 7556, centred on 298.5. */
.resepsi__card {
  --delay: 320ms;
  z-index: 183;
  top: calc(526 * var(--px));
  left: calc(98.5 * var(--px));
  width: calc(400 * var(--px));
}
</style>
