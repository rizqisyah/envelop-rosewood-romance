<script setup lang="ts">
/*
 * Frame 270 band "akad": y 5830..7030. The pink cartouche with the date, then the akad card:
 * the white scalloped plate (dbfb, with its teal inner shadow), the faded ornate frame over
 * it, and the arches-and-sofa decor masked to the plate's own outline. Art from
 * src/lib/bands/akad.ts (GENERATED, scripts/frame270.py).
 */
import BandArt from '../invite/BandArt.vue'
import EventDetails from './EventDetails.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/akad'
import { useEvent } from '../../composables/useEvent'
import { useFitText } from '../../composables/useFitText'
import { useReveal } from '../../composables/useReveal'

const { el, shown } = useReveal(0.15)
// The cartouche holds "Sunday,"; "Wednesday," has to shrink to stay inside its scrolls.
const fitDay = useFitText(0.6)
const { isDesign, stamp, card } = useEvent(0)
</script>

<template>
  <section :ref="el" class="band akad" :class="{ 'is-in': shown }" aria-labelledby="akad-title">
    <BandArt :layers="LAYERS" :shown="shown" />

    <!-- 3014:350 / 3014:349 -- the cartouche. A decorative repeat of the event's date. -->
    <p :ref="fitDay" class="akad__day">{{ stamp.weekday }}</p>
    <p class="akad__date">{{ stamp.date }}</p>

    <!-- 3014:509 + 3014:507 -- the card's copy, as one flow from the title down. -->
    <EventDetails
      class="akad__card"
      heading-id="akad-title"
      :title="card.title"
      :time="card.time"
      :venue="card.venue"
      :address="card.address"
      :maps="card.maps"
      :time-gap="38.04"
      :placeholder="isDesign"
    />
  </section>
</template>

<style scoped>
.akad {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

/* 3014:350 -- Pinyon Script 40/36, #b03b65, centred on x 297. */
.akad__day {
  --delay: 80ms;
  z-index: 84;
  /* A shrunk weekday keeps its baseline (~29 into the 36 line box), not its top. */
  top: calc((263 + 29 * (1 - var(--fit, 1))) * var(--px));
  left: calc(202 * var(--px));
  width: calc(190 * var(--px));
  height: calc(36 * var(--px) * var(--fit, 1));
  font-family: var(--font-pinyon);
  font-weight: 400;
  font-size: calc(40 * var(--px) * var(--fit, 1));
  line-height: calc(36 * var(--px) * var(--fit, 1));
  color: var(--rose);
}

/* 3014:349 -- Cinzel Bold 20/21, #b03b65, two lines in a 226 box centred on 299. */
.akad__date {
  --delay: 180ms;
  z-index: 83;
  top: calc(303 * var(--px));
  left: calc(186 * var(--px));
  width: calc(226 * var(--px));
  font-family: var(--font-cinzel);
  font-weight: 700;
  font-size: calc(20 * var(--px));
  line-height: calc(21 * var(--px));
  white-space: pre-line;
  color: var(--rose);
}

/* 3014:509's title line at y 6452, centred on 297.5; the details (z 130) follow it. */
.akad__card {
  --delay: 320ms;
  z-index: 131;
  top: calc(622 * var(--px));
  left: calc(97.5 * var(--px));
  width: calc(400 * var(--px));
}
</style>
