<script setup lang="ts">
/*
 * Frame 270 band "closing": y 13060..15058 -- the last one. Candelabra and blooms on both
 * edges, the thank-you and its signature, the toile wall behind the couple in their oval
 * frame with the heart seal, the envelope, the banquet table, and the credit bar.
 * Art from src/lib/bands/closing.ts (GENERATED, scripts/frame270.py).
 *
 * The signature is the couple's live nickname. The design prints "Ahamd & Salma" there --
 * its template's leftover, not this couple.
 */
import { computed } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/closing'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'

const { el, shown } = useReveal(0.15)
const { closingTitle, closingMessage, closingSignature, customSpousePhoto } = useWedding()

/*
 * Title, message and sign-off out of one string: a short first line is the title ("Thank
 * You !"), and a last line ending in a comma is the sign-off ("With Love,"), each set as its
 * own node in the design.
 */
const parsed = computed(() => {
  let lines = closingMessage.value.trim().split('\n')
  let title = closingTitle.value.trim()
  if (!title && lines.length > 1 && lines[0].trim().length <= 35) {
    title = lines[0].trim()
    lines = lines.slice(1)
  }
  while (lines.length && !lines[0].trim()) lines = lines.slice(1)
  let signOff = ''
  const last = lines[lines.length - 1]?.trim() || ''
  if (lines.length > 1 && last.length <= 24 && last.endsWith(',')) {
    signOff = last
    lines = lines.slice(0, -1)
  }
  return { title, body: lines.join('\n').trim(), signOff }
})

// 3024:307 -- the couple in the oval frame. A live photo keeps the frame and the seal.
const PHOTO = { x: 149.2345, y: 737.23, w: 303.451, h: 482.709, r: 181.154 }
</script>

<template>
  <section :ref="el" class="band closing" :class="{ 'is-in': shown }" aria-labelledby="closing-title">
    <BandArt :layers="LAYERS" :skip="customSpousePhoto ? ['3024:307'] : []" :shown="shown" />

    <!-- 3014:496 / 3014:495 / 3024:308 / 3014:497 -- one flow, so a longer message moves the rest. -->
    <div class="closing__copy">
      <h2 v-if="parsed.title" id="closing-title" class="closing__title">{{ parsed.title }}</h2>
      <p v-if="parsed.body" class="closing__message">{{ parsed.body }}</p>
      <p v-if="parsed.signOff" class="closing__sign-off">{{ parsed.signOff }}</p>
      <p class="closing__signature">{{ closingSignature }}</p>
    </div>

    <!-- z 168, between Rectangle 158 (the toile, z 167) and the heart seal (z 169). -->
    <div
      v-if="customSpousePhoto"
      class="band-art closing__photo"
      :class="{ 'is-in': shown }"
      :style="{
        left: `calc(${PHOTO.x} * var(--px))`,
        top: `calc(${PHOTO.y} * var(--px))`,
        width: `calc(${PHOTO.w} * var(--px))`,
        height: `calc(${PHOTO.h} * var(--px))`,
        borderRadius: `calc(${PHOTO.r} * var(--px))`,
      }"
    >
      <img :src="customSpousePhoto" alt="" loading="lazy" decoding="async" />
    </div>

    <!-- 3014:535 -- the credit bar at the foot of the sheet. -->
    <div class="closing__bar" aria-hidden="true"></div>
    <p class="closing__credit one-line">Created by 25ribuaja x Qinvi</p>
  </section>
</template>

<style scoped>
.closing {
  height: calc(v-bind(BAND_HEIGHT) * var(--px));
}

/*
 * The copy, from the title's line box at y 13243 down: 33.8 to the message, 58.04 to the
 * sign-off, 4.51 to the signature -- Roben Elegante's own "auto" line boxes throughout
 * (1.78 x the size), all #a43759.
 */
.closing__copy {
  --delay: 120ms;
  z-index: 125;
  top: calc(184 * var(--px)); /* 3014:496 box y 13243 + 1: Roben's line box, measured */
  left: calc(-20 * var(--px));
  width: calc(636.4 * var(--px));
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-script);
  font-weight: 400;
  color: var(--rose-deep);
}

/* 3014:496 -- 40, its box 486 wide centred on 298. */
.closing__title {
  font-weight: 400;
  font-size: calc(40 * var(--px));
  line-height: calc(71.2 * var(--px));
}

/* 3014:495 -- 25.556, wrapped by its 397 box centred on 297.5. */
.closing__message {
  margin-top: calc(34.8 * var(--px)); /* 33.8 + 1, measured */
  max-width: calc(397 * var(--px));
  font-size: calc(25.556 * var(--px));
  line-height: calc(45.49 * var(--px));
  white-space: pre-line;
}

/* 3024:308 -- 25.556, "With Love,". */
.closing__sign-off {
  margin-top: calc(58.04 * var(--px));
  font-size: calc(25.556 * var(--px));
  line-height: calc(45.49 * var(--px));
}

/* 3014:497 -- 39.467 / 1.78, in a 636.4 box. */
.closing__signature {
  margin-top: calc(2.51 * var(--px)); /* 4.51 - 2, measured */
  font-size: calc(39.467 * var(--px));
  line-height: calc(70.25 * var(--px));
}

.closing__title:only-child,
.closing__signature:first-child {
  margin-top: 0;
}

.closing__photo {
  position: absolute;
  z-index: 168;
  overflow: hidden;
  visibility: hidden;
  pointer-events: none;
}

.closing__photo.is-in {
  visibility: visible;
  animation: closing-photo-in 2700ms cubic-bezier(0.16, 1, 0.28, 1) 590ms backwards;
}

.closing__photo img {
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  object-position: center 30%;
}

@keyframes closing-photo-in {
  from {
    opacity: 0;
    transform: translate3d(0, calc(44 * var(--px)), 0) scale(0.9);
  }
}

/* 3014:536 -- 596 x 51 at y 15007, #bf2983. */
.closing__bar {
  --delay: 300ms;
  z-index: 134;
  top: calc(1947 * var(--px));
  left: 0;
  width: 100%;
  height: calc(51 * var(--px));
  background: var(--magenta);
}

/* 3014:537 -- Roben Elegante 16.429, white, centred on x 297.56; auto line box 29.24. */
.closing__credit {
  --delay: 440ms;
  z-index: 134;
  top: calc(1959 * var(--px));
  left: calc(97.96 * var(--px));
  width: calc(399.21 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(16.429 * var(--px));
  line-height: calc(29.24 * var(--px));
  color: #ffffff;
}

@media (prefers-reduced-motion: reduce) {
  .closing__photo.is-in {
    animation: none;
  }
}
</style>
