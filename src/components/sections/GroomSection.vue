<script setup lang="ts">
/*
 * Frame 270 band "groom": y 2400..3690 -- person slot 1. The white castle, the groom in his
 * garden (csac 2, 3014:302), his call name beside the castle, his name and parents under the
 * flower bed, and the "And" that hands over to slot 2. Art from src/lib/bands/groom.ts
 * (GENERATED, scripts/frame270.py).
 *
 * `order_groom_first: false` puts the bride in this slot -- see usePerson().
 */
import BandArt from '../invite/BandArt.vue'
import PersonDetails from './PersonDetails.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/groom'
import { useReveal } from '../../composables/useReveal'
import { usePerson } from '../../composables/usePerson'

const { el, shown } = useReveal(0.15)
const { callName, fullName, parents, instagram, instagramUrl, photo, photoStyle } = usePerson(1)
</script>

<template>
  <section :ref="el" class="band groom" :class="{ 'is-in': shown }" aria-labelledby="person-1-name">
    <BandArt :layers="LAYERS" :skip="photo ? ['3014:302'] : []" :shown="shown" />

    <!--
      A live portrait stands where the design's cut-out does (z 37: over the castle and the
      garden steps, under the flower bed that runs across its foot). A photo is a rectangle,
      not a cut-out, so its edges are feathered into the scene.
    -->
    <div v-if="photo" class="band-art groom__portrait" :class="{ 'is-in': shown }">
      <img :src="photo" alt="" :style="photoStyle" decoding="async" />
    </div>

    <!-- 3026:333 -- the call name, set left of the castle. z is the GLOBAL Figma paint order. -->
    <p class="groom__call one-line">{{ callName }}</p>

    <!-- 3014:274 -- name, parents, Instagram. -->
    <PersonDetails
      class="groom__details"
      heading-id="person-1-name"
      :full-name="fullName"
      :parents="parents"
      :instagram="instagram"
      :instagram-url="instagramUrl"
    />

    <!-- 3014:327 -- the hand-off to slot 2. -->
    <p class="groom__and one-line" aria-hidden="true">And</p>
  </section>
</template>

<style scoped>
.groom {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

.groom__portrait {
  position: absolute;
  z-index: 37;
  top: calc(250 * var(--px));
  left: calc(10 * var(--px));
  width: calc(300 * var(--px));
  height: calc(520 * var(--px));
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
  mask-image: radial-gradient(ellipse 72% 62% at 50% 42%, #000 62%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 72% 62% at 50% 42%, #000 62%, transparent 100%);
}

.groom__portrait.is-in {
  visibility: visible;
  animation: portrait-in 2700ms cubic-bezier(0.16, 1, 0.28, 1) 440ms backwards;
}

.groom__portrait img {
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
}

@keyframes portrait-in {
  from {
    opacity: 0;
    transform: translate3d(calc(-60 * var(--px)), calc(30 * var(--px)), 0) scale(0.94);
  }
}

/* 3026:333 -- Roben Elegante 28.11, #b94765, centred on x 264.37 in a 594.74 box. */
.groom__call {
  --delay: 80ms;
  z-index: 178;
  top: calc(183 * var(--px));
  left: calc(-33 * var(--px));
  width: calc(594.74 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(28.11 * var(--px));
  line-height: calc(50 * var(--px));
  color: var(--name-pink);
}

/* 3014:274 -- the stack's name line at y 3310, centred on x 298. */
.groom__details {
  --delay: 200ms;
  z-index: 176;
  top: calc(910 * var(--px));
  left: calc(38 * var(--px));
  width: calc(520 * var(--px));
}

/* 3014:327 -- Rose Gard 99.091 in a 1119.727 box centred on 297.86, #bf2983. The design's own face. */
.groom__and {
  --delay: 360ms;
  z-index: 72;
  top: calc(1181 * var(--px)); /* 3014:327 box y 3581, band-local 1181 */
  left: calc(-262 * var(--px));
  width: calc(1119.727 * var(--px));
  font-family: var(--font-and);
  font-weight: 400;
  font-size: calc(99.091 * var(--px));
  line-height: normal;
  color: var(--magenta);
}

@media (prefers-reduced-motion: reduce) {
  .groom__portrait.is-in {
    animation: none;
  }
}
</style>
