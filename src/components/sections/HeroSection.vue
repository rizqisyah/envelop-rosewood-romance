<script setup lang="ts">
/*
 * Frame 270 band "hero": y 0..1160. The paper, the couple in their framed toile plate under
 * the wax seal, and the florals banked down both edges.
 *
 * Art comes from src/lib/bands/hero.ts, which is GENERATED (scripts/frame270.py) and must be
 * regenerated rather than hand-nudged. Only the three text nodes live here, because they stay
 * live so useWedding() can drive them.
 */
import { computed } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/hero'
import { art } from '../../lib/artAssets'
import { coupleTitle } from '../../lib/text'
import { useFitText } from '../../composables/useFitText'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'

/*
 * The hero is the band the invitation OPENS on, so it must not wait for a scroll: while the
 * cover plays its leave it is still in flow above the sheet. A bottom rootMargin of 100%
 * counts the band as on screen the instant the sheet is displayed.
 */
const { el, shown } = useReveal(0, '0px 0px 100% 0px')
const { coupleNickname, hashtag, customHeroPhoto, fotoMempelaiTransform } = useWedding()

// The one box whose content is live and can run long -- see the rule on .hero__couple.
const fitCouple = useFitText()

/*
 * 3014:220 (the toile) and 3014:221 (the couple) fill Frame 2's plate. A live photo takes
 * both their places, cut to the plate's own outline: the toile's alpha IS that outline, so
 * it serves as the mask and the photo lands exactly where the design's couple stands.
 */
const PLATE = { x: 80, y: 409, w: 437, h: 688 }
const skipLayers = computed(() => (customHeroPhoto.value ? ['3014:220', '3014:221'] : []))
const plateMask = `url("${art['hero-toile.webp']}")`
const photoStyle = computed(() => ({
  objectPosition: `${fotoMempelaiTransform.value.x}% ${fotoMempelaiTransform.value.y}%`,
  transformOrigin: `${fotoMempelaiTransform.value.x}% ${fotoMempelaiTransform.value.y}%`,
  transform: `scale(${fotoMempelaiTransform.value.scale})`,
}))
</script>

<template>
  <section :ref="el" class="band hero" :class="{ 'is-in': shown }">
    <BandArt :layers="LAYERS" :skip="skipLayers" :shown="shown" />

    <!-- z 53/54: between the paper's florals and the frame 3014:223 (z 55) that edges it. -->
    <div
      v-if="customHeroPhoto"
      class="band-art hero__photo"
      :class="{ 'is-in': shown }"
      :style="{
        left: `calc(${PLATE.x} * var(--px))`,
        top: `calc(${PLATE.y} * var(--px))`,
        width: `calc(${PLATE.w} * var(--px))`,
        height: `calc(${PLATE.h} * var(--px))`,
        maskImage: plateMask,
      }"
    >
      <img :src="customHeroPhoto" alt="" :style="photoStyle" decoding="async" />
    </div>

    <!-- 3018:629 -- the group sits at z 133, above every hero layer but the late florals. -->
    <p class="hero__eyebrow one-line">The Wedding Of</p>
    <h1 :ref="fitCouple" class="hero__couple">{{ coupleTitle(coupleNickname) }}</h1>
    <p v-if="hashtag" class="hero__hashtag one-line">{{ hashtag }}</p>
  </section>
</template>

<style scoped>
/*
 * The band's height is the distance to the NEXT band's top, not the extent of its own
 * children -- the florals at the bottom run on into the countdown, which is the design.
 */
.hero {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

/* `band-art`, so the live-copy reveal in style.css leaves it alone: it enters like art. */
.hero__photo {
  position: absolute;
  z-index: 54;
  overflow: hidden;
  mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  visibility: hidden;
  pointer-events: none;
}

.hero__photo.is-in {
  visibility: visible;
  animation: hero-photo-in 2700ms cubic-bezier(0.16, 1, 0.28, 1) 440ms backwards;
}

.hero__photo img {
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
}

@keyframes hero-photo-in {
  from {
    opacity: 0;
    transform: translate3d(0, calc(44 * var(--px)), 0) scale(0.86);
  }
}

/* 3014:228 -- Lancelot 22.993/34.489, #822617, centred on x 301.13. */
.hero__eyebrow {
  --delay: 300ms;
  z-index: 133;
  top: calc(99 * var(--px));
  left: calc(92.63 * var(--px));
  width: calc(417 * var(--px));
  font-family: var(--font-lancelot);
  font-weight: 400;
  font-size: calc(22.993 * var(--px));
  line-height: calc(34.489 * var(--px));
  color: var(--maroon);
}

/*
 * 3014:531 -- Roben Elegante 51.095/94.526, #822617, in a 500.73 box at x 48.
 *
 * NO text-transform: this face draws its capitals as a swashed set, so uppercasing swaps the
 * name onto glyphs the render never uses. `height` exists only as the constraint useFitText
 * measures against; a nickname long enough to wrap shrinks instead of running off the paper.
 * `top` is Figma's 139.88 + 2, the same line-box offset the cover's title measured.
 */
.hero__couple {
  --delay: 450ms;
  z-index: 133;
  top: calc(141.88 * var(--px));
  left: calc(48 * var(--px));
  width: calc(500.73 * var(--px));
  height: calc(94.526 * var(--px) * var(--fit, 1));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(51.095 * var(--px) * var(--fit, 1));
  line-height: calc(94.526 * var(--px) * var(--fit, 1));
  color: var(--maroon);
}

/* 3014:229 -- Lancelot 22.993/34.489, #822617, centred on x 299.78. */
.hero__hashtag {
  --delay: 600ms;
  z-index: 133;
  top: calc(239.51 * var(--px));
  left: calc(91.28 * var(--px));
  width: calc(417 * var(--px));
  font-family: var(--font-lancelot);
  font-weight: 400;
  font-size: calc(22.993 * var(--px));
  line-height: calc(34.489 * var(--px));
  color: var(--maroon);
}
</style>
