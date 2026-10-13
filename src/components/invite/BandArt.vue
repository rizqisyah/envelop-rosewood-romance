<script setup lang="ts">
import type { BandLayer } from '../../lib/bandLayer'

const props = withDefaults(
  defineProps<{
    layers: BandLayer[]
    /** Layer ids this band draws itself -- an API photo standing in for a design plate. */
    skip?: string[]
    /** Whether the band has scrolled into view; layers hold still until it has. */
    shown?: boolean
    /** Stagger between layers, back to front. */
    step?: number
  }>(),
  { skip: () => [], shown: true, step: 150 },
)

const FRAME_W = 596 // the sheet frame's own width -- see SLICING.md

const px = (n: number) => `calc(${n} * var(--px))`

/*
 * Two elements per layer. The outer one is placed and owns the entrance animation, which
 * drives `transform`; the inner one owns the layer's own geometry (Figma's rotation and
 * flip, its crop window, radius, shadow, mask), so the entrance never fights the design.
 */
const outerStyle = (l: BandLayer, i: number): Record<string, string> => ({
  zIndex: String(l.z),
  left: px(l.x),
  top: px(l.y),
  width: px(l.w),
  height: px(l.h),
  /*
   * Through a custom property rather than straight onto `opacity`: the entrance animation
   * drives opacity too, and its `to` frame has to land on the layer's own value or a faded
   * plate would flash to full strength as it arrives.
   */
  '--a': String(l.a ?? 1),
  ...entrance(l, i),
})

const innerStyle = (l: BandLayer): Record<string, string> => {
  const s: Record<string, string> = {}
  if (l.r) s.rotate = `${l.r}deg`
  if (l.fy) s.scale = '1 -1'
  if (l.radius) s.borderRadius = px(l.radius)
  if (l.crop || l.radius) s.overflow = 'hidden'
  /*
   * Figma's drop shadow follows the image's alpha (the wax seals cast seal-shaped shadows,
   * not square ones), which is `drop-shadow`, not `box-shadow`.
   */
  const filters: string[] = []
  if (l.shadow) {
    const [x, y, blur, c] = l.shadow
    filters.push(`drop-shadow(${px(x)} ${px(y)} ${px(blur)} ${c})`)
  }
  if (l.inset && !l.radius) filters.push(`url(#${insetId(l)})`)
  if (filters.length) s.filter = filters.join(' ')
  // Unprefixed: Vue adds the -webkit- prefix itself on an engine that only knows that one.
  if (l.mask) {
    s.maskImage = `url("${l.mask.src}")`
    s.maskSize = `${px(l.mask.w)} ${px(l.mask.h)}`
    s.maskPosition = `${px(l.mask.x)} ${px(l.mask.y)}`
    s.maskRepeat = 'no-repeat'
  }
  return s
}

const imgStyle = (l: BandLayer): Record<string, string> => {
  if (!l.crop) return { objectFit: l.fit ?? 'cover' }
  const [left, top, width, height] = l.crop
  return {
    position: 'absolute',
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
  }
}

/*
 * An inner shadow on a ROUNDED box is the box's own shape, so CSS draws it. On a plain image
 * fill Figma shades along the image's alpha (the event cards' scalloped edge), which only an
 * SVG filter can do -- in objectBoundingBox units, so it scales with the sheet.
 */
const insetId = (l: BandLayer) => `inset-${l.id.replace(':', '-')}`
const alphaInsets = () => visible().filter((l) => l.inset && !l.radius)
const insetBox = (l: BandLayer) => {
  const [x, y, blur, c] = l.inset!
  return {
    dx: x / l.w,
    dy: y / l.h,
    sd: `${blur / 2 / l.w} ${blur / 2 / l.h}`,
    color: c,
  }
}

const entrance = (l: BandLayer, i: number) => {
  const isBackdrop = l.w >= FRAME_W * 0.9 && l.h > 200
  const centre = l.x + l.w / 2
  const offLeft = centre < FRAME_W * 0.34
  const offRight = centre > FRAME_W * 0.66
  const small = l.w < 130 && l.h < 180

  let tx = 0
  let ty = 44
  let rot = 0
  let scale = 0.86

  if (isBackdrop) {
    ty = 26
    scale = 1.08 // settles inward, so the scene opens up rather than rising
  } else if (offLeft || offRight) {
    const dir = offLeft ? -1 : 1
    tx = dir * 92
    ty = 30
    rot = dir * 7
    scale = 0.92
  } else if (small) {
    ty = -34 // drops in from above
    rot = (i % 2 ? 1 : -1) * 9
    scale = 0.7
  }

  return {
    '--tx': `${tx}`,
    '--ty': `${ty}`,
    '--rot': `${rot}deg`,
    '--scale': `${scale}`,
    '--dur': isBackdrop ? '3400ms' : small ? '2100ms' : '2700ms',
    // Backdrops lead; everything in front of them queues up behind, front-most last.
    animationDelay: `${Math.round((isBackdrop ? 0 : 440) + i * stagger())}ms`,
  }
}

const visible = () => props.layers.filter((l) => !props.skip.includes(l.id))

/*
 * Cap the total stagger rather than the per-layer step, so short bands get the full
 * leisurely spacing and long ones tighten up to assemble in the same window.
 */
const MAX_STAGGER = 2600
const stagger = () => Math.min(props.step, MAX_STAGGER / Math.max(1, visible().length - 1))
</script>

<template>
  <svg v-if="alphaInsets().length" class="band-art band-art__defs" aria-hidden="true" focusable="false">
    <defs>
      <filter
        v-for="l in alphaInsets()"
        :id="insetId(l)"
        :key="l.id"
        primitiveUnits="objectBoundingBox"
        color-interpolation-filters="sRGB"
      >
        <feOffset in="SourceAlpha" :dx="insetBox(l).dx" :dy="insetBox(l).dy" />
        <feGaussianBlur :stdDeviation="insetBox(l).sd" result="shifted" />
        <feComposite in="SourceAlpha" in2="shifted" operator="out" result="rim" />
        <feFlood :flood-color="insetBox(l).color" />
        <feComposite in2="rim" operator="in" result="shade" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="shade" />
        </feMerge>
      </filter>
    </defs>
  </svg>

  <div
    v-for="(layer, i) in visible()"
    :key="layer.id"
    class="band-art"
    :class="{ 'is-in': shown }"
    :style="outerStyle(layer, i)"
  >
    <div class="band-art__inner" :style="innerStyle(layer)">
      <img
        :src="layer.src"
        alt=""
        :width="Math.round(layer.w)"
        :height="Math.round(layer.h)"
        loading="lazy"
        decoding="async"
        :style="imgStyle(layer)"
      />
      <span
        v-if="layer.inset && layer.radius"
        class="band-art__inset"
        :style="{
          borderRadius: px(layer.radius),
          boxShadow: `inset ${px(layer.inset[0])} ${px(layer.inset[1])} ${px(layer.inset[2])} ${layer.inset[3]}`,
        }"
      />
    </div>
  </div>
</template>

<style scoped>
/*
 * Held in the start state by `visibility` rather than a paused animation: the animation
 * only exists once `.is-in` lands, so nothing has to be un-paused and the element still
 * fetches its image while hidden.
 */
.band-art {
  position: absolute;
  visibility: hidden;
  opacity: var(--a, 1);
  will-change: transform, opacity;
  pointer-events: none;
}

.band-art.is-in {
  visibility: visible;
  animation: layer-in var(--dur, 2700ms) cubic-bezier(0.16, 1, 0.28, 1) backwards;
}

/* Filter definitions only. Visible so every engine resolves the url(#...) references. */
.band-art__defs {
  visibility: visible;
  width: 0;
  height: 0;
  overflow: hidden;
}

.band-art__inner {
  position: relative;
  width: 100%;
  height: 100%;
}

.band-art__inner img {
  width: 100%;
  height: 100%;
  max-width: none; /* several layers are authored wider than the frame */
}

.band-art__inset {
  position: absolute;
  inset: 0;
}

@keyframes layer-in {
  from {
    opacity: 0;
    transform: translate3d(calc(var(--tx) * var(--px)), calc(var(--ty) * var(--px)), 0)
      rotate(var(--rot)) scale(var(--scale));
  }
  to {
    opacity: var(--a, 1);
    transform: none;
  }
}

/*
 * Motion this large is exactly what a vestibular disorder cannot tolerate, so the
 * reduced-motion path is not a shortened version of it -- it is no movement at all.
 */
@media (prefers-reduced-motion: reduce) {
  .band-art,
  .band-art.is-in {
    visibility: visible;
    animation: none;
    will-change: auto;
  }
}
</style>
