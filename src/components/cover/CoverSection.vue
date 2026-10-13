<script setup lang="ts">
import { COVER_ENVELOPE, COVER_PAPER, COVER_SEAL, type CoverLayer } from '../../lib/coverLayers'
import { coupleTitle } from '../../lib/text'
import { useFitText } from '../../composables/useFitText'

// `ready` gates the reveal on the layers being decoded -- see App.vue.
defineProps<{ guestName: string; guestGroup?: string; coupleName: string; ready: boolean }>()
defineEmits<{ open: [] }>()

const px = (n: number) => `calc(${n} * var(--px))`
const box = (l: CoverLayer) => ({ left: px(l.x), top: px(l.y), width: px(l.w), height: px(l.h) })

const crop = (l: CoverLayer) => {
  const [left, top, width, height] = l.crop!
  return { left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }
}

// The couple name is the one box whose content is live and can run long -- see its rule.
const fitCouple = useFitText()
// So is the guest's name: a family name can be three words.
const fitGuest = useFitText()
</script>

<template>
  <!-- Figma Frame 271 (3014:538), 596 x 1183. Coords below are frame-local design px. -->
  <section class="cover" :style="{ backgroundImage: `url(${COVER_PAPER})` }">
    <div class="cover__frame" :class="{ 'cover__frame--ready': ready }">
      <!-- 3014:538's own fill: the paper, object-fit cover over the frame. -->
      <img class="cover__paper" :src="COVER_PAPER" alt="" />

      <!-- 3014:542 / 3014:541, in Figma paint order. -->
      <p class="cover__eyebrow">The Wedding Of</p>
      <h1 :ref="fitCouple" class="cover__couple">{{ coupleTitle(coupleName) }}</h1>

      <!-- 3014:543 -- the two lines of the guest block, 32px into each other as authored. -->
      <p class="cover__dear">Dear Mr/ Mrs/ Ms</p>
      <p :ref="fitGuest" class="cover__guest">{{ guestName }}</p>
      <p v-if="guestGroup" class="cover__group">{{ guestGroup }}</p>

      <!-- 3017:548 -- set left of the axis in the design, under the envelope's corner. -->
      <p class="cover__cta" aria-hidden="true">Click to open</p>

      <!-- 3017:547 -- the fill is cropped inside its box, so the box clips. -->
      <div class="cover__envelope" :style="box(COVER_ENVELOPE)">
        <img :src="COVER_ENVELOPE.src" alt="" :style="crop(COVER_ENVELOPE)" />
      </div>

      <!-- 3017:549 -- the heart seal, on the envelope's join. -->
      <img class="cover__seal" :src="COVER_SEAL.src" alt="" :style="box(COVER_SEAL)" />

      <!--
        The whole card is the hit area: "Click to open" sits off to one side, so a guest who
        taps the envelope or the seal -- the obvious targets -- must open it too. The
        envelope carries the affordance: it breathes, and it lifts on hover and focus.
      -->
      <button type="button" class="cover__hit" @click="$emit('open')">
        <span class="sr-only">Open the invitation</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
/*
 * The paper is also the section's own background, so a viewport wider than the frame's
 * aspect continues the same sheet past its edges instead of showing a seam.
 */
.cover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
  background-color: var(--paper);
  background-position: center;
  background-size: cover;
}

/*
 * One design pixel = 1cqw / 596, so the whole composition scales as a unit instead of
 * reflowing. Width is driven by the viewport height so the card fills the screen; on screens
 * too narrow for that width, `.cover`'s `overflow: hidden` crops the sides evenly. `max()`,
 * not the bare height-derived width: Safari's dvh excludes the toolbars, so the derived width
 * lands short of the screen and leaves a gutter down both sides.
 */
.cover__frame {
  container-type: inline-size;
  position: relative;
  overflow: hidden;
  /* flex-shrink: 0 -- otherwise the 430px column squashes the width-driven frame back down */
  flex: 0 0 auto;
  width: max(100%, calc(100dvh * 596 / 1183));
  aspect-ratio: 596 / 1183;
}

.cover__frame > * {
  --px: calc(100cqw / 596);
  position: absolute;
  margin: 0;
  text-align: center;
  /*
   * Held until the layers are decoded. `animation-play-state` rather than `display` so the
   * images are still in the document and actually fetching while hidden.
   */
  visibility: hidden;
  animation-play-state: paused;
}

.cover__frame--ready > * {
  visibility: visible;
  animation-play-state: running;
}

/*
 * 3014:538's fill. 736 x 1308 against a 596 x 1183 frame, so `cover` scales it to the
 * frame's height and crops ~35px off each side -- what Figma's FILL mode does.
 */
.cover__paper {
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  animation: settle 2400ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

/*
 * The entrances drive `transform` and the hover lift drives `translate`, so the two never
 * fight. Each breath starts only after its entrance has finished with the same property.
 */
.cover__envelope {
  overflow: hidden;
  pointer-events: none;
  transition: translate 320ms cubic-bezier(0.16, 1, 0.3, 1);
  animation:
    rise 2200ms cubic-bezier(0.16, 1, 0.3, 1) 240ms backwards,
    breathe 5200ms ease-in-out 2800ms infinite;
}

.cover__envelope img {
  position: absolute;
  max-width: none;
}

/* The seal rides the envelope, so it shares the breath -- and lands last, pressed on. */
.cover__seal {
  max-width: none;
  pointer-events: none;
  transition: translate 320ms cubic-bezier(0.16, 1, 0.3, 1);
  animation:
    press 1400ms cubic-bezier(0.34, 1.56, 0.64, 1) 1300ms backwards,
    breathe 5200ms ease-in-out 2800ms infinite;
}

.cover__eyebrow,
.cover__couple,
.cover__dear,
.cover__guest,
.cover__group,
.cover__cta {
  animation: rise 2400ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0ms) backwards;
}

/* 3014:542 -- Roben Elegante 24/74, #822617, centred on x 308.05 in a 392 box. */
.cover__eyebrow {
  --delay: 700ms;
  top: calc(154 * var(--px));
  left: calc(112.05 * var(--px));
  width: calc(392 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(24 * var(--px));
  line-height: calc(74 * var(--px));
  color: var(--maroon);
}

/*
 * 3014:541 -- Roben Elegante 51.095/94.526, #822617, in a 473 box centred on 297.5.
 *
 * NO text-transform: this face draws its capitals as a swashed set, so uppercasing swaps the
 * whole name onto glyphs the render never uses. `height` exists only as the constraint
 * useFitText measures against -- one line always fits; a nickname long enough to wrap
 * shrinks instead of running past the card.
 *
 * `top` is Figma's 206 + 2: Chrome centres this face's glyphs 2px higher in the same line
 * box than Figma does (measured by ink box against the frame render, here and on the hero).
 */
.cover__couple {
  --delay: 950ms;
  top: calc(208 * var(--px));
  left: calc(61 * var(--px));
  width: calc(473 * var(--px));
  height: calc(94.526 * var(--px) * var(--fit, 1));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(51.095 * var(--px) * var(--fit, 1));
  line-height: calc(94.526 * var(--px) * var(--fit, 1));
  color: var(--maroon);
}

/* 3014:544 -- Cormorant Infant Light 28/62, #531f06, in a 373 box centred on 297.5. */
.cover__dear {
  --delay: 1500ms;
  top: calc(864 * var(--px));
  left: calc(111 * var(--px));
  width: calc(373 * var(--px));
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: calc(28 * var(--px));
  line-height: calc(62 * var(--px));
  color: var(--umber);
}

/*
 * 3014:545 -- Cormorant Infant SemiBold 28/62, 32px into the line above (mb -32 in the
 * design's own stack). Fitted, so a long name shrinks rather than wrapping onto nothing.
 */
.cover__guest {
  --delay: 1650ms;
  top: calc(894 * var(--px));
  left: calc(111 * var(--px));
  width: calc(373 * var(--px));
  height: calc(62 * var(--px) * var(--fit, 1));
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: calc(28 * var(--px) * var(--fit, 1));
  line-height: calc(62 * var(--px) * var(--fit, 1));
  color: var(--umber);
}

.cover__group {
  --delay: 1800ms;
  top: calc(950 * var(--px));
  left: calc(111 * var(--px));
  width: calc(373 * var(--px));
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: calc(18 * var(--px));
  letter-spacing: calc(1.5 * var(--px));
  line-height: calc(26 * var(--px));
  text-transform: uppercase;
  color: var(--umber);
  opacity: 0.85;
}

/* 3017:548 -- Cormorant Infant 28/62, #531f06, in a 373 box centred on x 152.5. */
.cover__cta {
  --delay: 1350ms;
  top: calc(802 * var(--px));
  left: calc(-34 * var(--px));
  width: calc(373 * var(--px));
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: calc(28 * var(--px));
  line-height: calc(62 * var(--px));
  color: var(--umber);
}

.cover__frame--ready .cover__cta {
  animation:
    rise 2400ms cubic-bezier(0.16, 1, 0.3, 1) var(--delay) backwards,
    beckon 3200ms ease-in-out 3800ms infinite;
}

/*
 * The whole card opens the invitation. The plate is invisible, so its own hover state would
 * be too -- the envelope carries it.
 */
.cover__hit {
  z-index: 20;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  background: none;
  cursor: pointer;
  /* No entrance of its own -- it is invisible, and animating it would gate the tap. */
  animation: none;
}

.cover__frame:has(.cover__hit:hover) .cover__envelope,
.cover__frame:has(.cover__hit:focus-visible) .cover__envelope,
.cover__frame:has(.cover__hit:hover) .cover__seal,
.cover__frame:has(.cover__hit:focus-visible) .cover__seal {
  translate: 0 calc(-6 * var(--px));
}

.cover__hit:focus-visible {
  outline: calc(1.5 * var(--px)) solid var(--maroon);
  outline-offset: calc(-6 * var(--px));
}

/*
 * `backwards`, not `forwards`: the end state is the element's normal state, so once the
 * animation finishes it stops applying and the hover transition gets its transform.
 */
@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(calc(18 * var(--px)));
  }
}

@keyframes settle {
  from {
    opacity: 0;
    transform: scale(1.04);
  }
}

@keyframes press {
  from {
    opacity: 0;
    transform: scale(1.6);
  }
}

@keyframes breathe {
  50% {
    transform: translateY(calc(-5 * var(--px)));
  }
}

@keyframes beckon {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.55;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cover__frame > *,
  .cover__frame--ready .cover__cta {
    animation: none;
  }
}
</style>
