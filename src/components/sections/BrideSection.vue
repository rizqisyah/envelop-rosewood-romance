<script setup lang="ts">
/*
 * Frame 270 band "bride": y 3690..4750 -- person slot 2, the groom band's mirror. The castle
 * flipped to the left, the bride (csac 3, 3026:334) on the right, her call name above her
 * shoulder, and her name and parents under the flowers. Art from src/lib/bands/bride.ts
 * (GENERATED, scripts/frame270.py).
 *
 * Its stack is NOT on the frame's axis: 3026:339 sits 6px left of 3014:274, so the name
 * centres on 291.82. That is the design -- reproduced, not snapped.
 */
import BandArt from '../invite/BandArt.vue'
import PersonDetails from './PersonDetails.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/bride'
import { useReveal } from '../../composables/useReveal'
import { usePerson } from '../../composables/usePerson'

const { el, shown } = useReveal(0.15)
const { callName, fullName, parents, instagram, instagramUrl, photo, photoStyle } = usePerson(2)
</script>

<template>
  <section :ref="el" class="band bride" :class="{ 'is-in': shown }" aria-labelledby="person-2-name">
    <BandArt :layers="LAYERS" :skip="photo ? ['3026:334'] : []" :shown="shown" />

    <!-- z 36, where the design's cut-out stands; feathered like slot 1's. -->
    <div v-if="photo" class="band-art bride__portrait" :class="{ 'is-in': shown }">
      <img :src="photo" alt="" :style="photoStyle" decoding="async" />
    </div>

    <!-- 3026:349 -- the call name, above her shoulder. -->
    <p class="bride__call one-line">{{ callName }}</p>

    <!-- 3026:339 -- name, parents, Instagram. -->
    <PersonDetails
      class="bride__details"
      heading-id="person-2-name"
      :full-name="fullName"
      :parents="parents"
      :instagram="instagram"
      :instagram-url="instagramUrl"
    />
  </section>
</template>

<style scoped>
.bride {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.bride__portrait {
  position: absolute;
  z-index: 36;
  top: calc(280 * var(--px));
  left: calc(296 * var(--px));
  width: calc(300 * var(--px));
  height: calc(520 * var(--px));
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 72% 62% at 50% 42%, #000 62%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 72% 62% at 50% 42%, #000 62%, transparent 100%);
}

.bride__portrait.is-in {
  visibility: visible;
  animation: portrait-in 2700ms cubic-bezier(0.16, 1, 0.28, 1) 440ms backwards;
}

.bride__portrait img {
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
}

@keyframes portrait-in {
  from {
    opacity: 0;
    transform: translate3d(calc(60 * var(--px)), calc(30 * var(--px)), 0) scale(0.94);
  }
}

/* 3026:349 -- Roben Elegante 28.11, #b94765, centred on x 373.37 in a 594.74 box. */
.bride__call {
  --delay: 80ms;
  z-index: 180;
  top: calc(180 * var(--px));
  left: calc(76 * var(--px));
  width: calc(594.74 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(28.11 * var(--px));
  line-height: calc(50 * var(--px));
  color: var(--name-pink);
}

/* 3026:339 -- the stack's name line at y 4604, centred on x 291.82. */
.bride__details {
  --delay: 200ms;
  z-index: 179;
  top: calc(914 * var(--px));
  left: calc(31.82 * var(--px));
  width: calc(520 * var(--px));
}

@media (prefers-reduced-motion: reduce) {
  .bride__portrait.is-in {
    animation: none;
  }
}
</style>
