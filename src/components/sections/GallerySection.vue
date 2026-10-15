<script setup lang="ts">
/*
 * Frame 270 band "gallery": y 9030..10200. The oval photo in its brown ring under the floral
 * crown, two arrow plates, three oval thumbnails, and the prewedding video slot under its
 * pearl swag. Art from src/lib/bands/gallery.ts (GENERATED, scripts/frame270.py).
 *
 * Everything that holds a photo is drawn here, not by BandArt, so live gallery rows replace
 * it: the ring and its photo (3014:375), the thumbnails (Frame 6, 3014:378), the arrow plates
 * and chevrons (3014:388..391, real buttons) and the video slot (Rectangle 1, 3014:392).
 * The rings, plates and masks are all plain ellipses, so CSS draws them exactly.
 *
 * "Buat video prewed" (3014:503) is the designer's note on the video slot, not copy.
 */
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/gallery'
import { art } from '../../lib/artAssets'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'

const { el, shown } = useReveal(0.15)
const { galleryPhotos, designData, videoPrewed, hasPrewedVideo } = useWedding()

type Photo = { src: string; caption: string; design?: boolean }

/*
 * The design's four photos, in the order the frame shows them: the oval, then the three
 * thumbnails. All four are 2:3, and Figma places them `contain` inside a box larger than
 * their mask; `design` keeps that exact placement (see .is-design below).
 */
const DESIGN_PHOTOS: Photo[] = [1, 2, 3, 4].map((n) => ({
  src: art[`photo-gallery-${n}.webp`],
  caption: '',
  design: true,
}))

const photos = computed<Photo[]>(() => {
  if (galleryPhotos.value.length) return galleryPhotos.value
  return designData.value ? DESIGN_PHOTOS : []
})

// The design render shows its own photo in the video slot; a live wedding needs a video.
const hasVideo = computed(() => hasPrewedVideo.value || designData.value)
const hasPhotos = computed(() => photos.value.length > 0)

const youtubeId = computed(() => {
  const m = String(videoPrewed.value || '').match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?/]{11})/,
  )
  return m ? m[1] : null
})

/*
 * Three layouts. With no video the band ends under the thumbnails; with no photos the
 * oval, its crown and florals go and the video moves up under the heading.
 */
const VIDEO_TOP = 866 // Rectangle 1 at y 9896
const videoTop = computed(() => (hasPhotos.value ? VIDEO_TOP : 230))
const bandHeight = computed(() => {
  if (!hasVideo.value) return 880
  if (!hasPhotos.value) return 640
  return BAND_HEIGHT
})

const layers = computed(() =>
  LAYERS.map((l) => (l.id === '3014:395' ? { ...l, y: l.y - VIDEO_TOP + videoTop.value } : l)),
)
const skipLayers = computed(() => [
  ...(hasPhotos.value ? [] : ['3014:173', '3023:268']), // the crown and florals frame the oval
  ...(hasVideo.value ? [] : ['3014:395']), // the pearl swag drapes the video
])

const active = ref(0)
watch(photos, () => (active.value = 0))

const step = (d: number) => {
  const n = photos.value.length
  if (n) active.value = (active.value + d + n) % n
}

/*
 * The thumbnail row FOLLOWS the active photo -- the three after it, wrapping -- so the arrows
 * and the thumbnails both reach every photo, and the design's own four show exactly the
 * three the render shows.
 */
// Frame 6 at x 126.45: 111.092-wide ellipses 7.624 apart, so its axis is x 300.71. Fewer
// than four photos give fewer thumbnails, still centred on that axis.
const THUMB_W = 111.092
const THUMB_GAP = 7.624
const thumbs = computed(() => {
  const n = photos.value.length
  const count = Math.min(3, Math.max(0, n - 1))
  const start = 300.71 - (count * THUMB_W + (count - 1) * THUMB_GAP) / 2
  return Array.from({ length: count }, (_, i) => {
    const at = (active.value + i + 1) % n
    return { x: start + i * (THUMB_W + THUMB_GAP), at, photo: photos.value[at] }
  })
})

// --- Auto-slide ---
let autoTimer: ReturnType<typeof setInterval> | null = null
const isHovered = ref(false)
const isInteracting = ref(false)
const zoomed = ref(false)

/*
 * Never under reduced motion: content that moves on its own is exactly what that setting
 * asks to stop (WCAG 2.2.2), and the arrows and thumbnails still reach every photo.
 */
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function startAutoSlide() {
  stopAutoSlide()
  if (photos.value.length > 1 && !reducedMotion()) {
    autoTimer = setInterval(() => {
      if (!isHovered.value && !isInteracting.value && !zoomed.value) step(1)
    }, 3800)
  }
}

function stopAutoSlide() {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
}

// --- Swipe ---
let startX = 0
let startY = 0
let dragging = false

function onTouchStart(e: TouchEvent) {
  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isInteracting.value = true
  stopAutoSlide()
}

function onTouchEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - startX
  const dy = e.changedTouches[0].clientY - startY
  isInteracting.value = false
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 35) step(dx < 0 ? 1 : -1)
  startAutoSlide()
}

let swiped = false
function onPointerDown(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  startX = e.clientX
  dragging = true
  swiped = false
  isInteracting.value = true
  stopAutoSlide()
}

function onPointerUp(e: PointerEvent) {
  if (!dragging) return
  const dx = e.clientX - startX
  dragging = false
  isInteracting.value = false
  if (Math.abs(dx) > 35) {
    swiped = true
    step(dx < 0 ? 1 : -1)
  }
  startAutoSlide()
}

// --- Lightbox ---
function openZoom() {
  if (swiped) {
    swiped = false
    return
  }
  zoomed.value = true
  stopAutoSlide()
}

function closeZoom() {
  zoomed.value = false
  startAutoSlide()
}

function onKey(e: KeyboardEvent) {
  if (!zoomed.value) return
  if (e.key === 'Escape') closeZoom()
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'ArrowRight') step(1)
}

watch(zoomed, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})

watch(photos, startAutoSlide)
onMounted(startAutoSlide)
onUnmounted(() => {
  stopAutoSlide()
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})

const chevron = art['chevron.svg']
const poster = art['photo-gallery-4.webp']
</script>

<template>
  <section
    :ref="el"
    class="band gallery"
    :class="{ 'is-in': shown }"
    aria-labelledby="gallery-title"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <BandArt :layers="layers" :skip="skipLayers" :shown="shown" />

    <!-- 3014:449 / 3014:453 -- the heading and its line. -->
    <h2 id="gallery-title" class="gallery__title one-line">Our Dearest Memories</h2>
    <p class="gallery__lede">Scenes from a love story we shall cherish evermore.</p>

    <template v-if="hasPhotos">
      <!--
        3014:376 + 3014:377 -- the ring (a 7px outside stroke, #72583d, on a #d9d9d9 ellipse)
        and the photo, masked by an ellipse 1px larger than the ring's inside.
      -->
      <div class="gallery__ring">
        <div
          class="gallery__oval"
          role="button"
          tabindex="0"
          :aria-label="`View photo ${active + 1} of ${photos.length}`"
          @click="openZoom"
          @keydown.enter.prevent="openZoom"
          @keydown.space.prevent="openZoom"
          @touchstart.passive="onTouchStart"
          @touchend="onTouchEnd"
          @pointerdown="onPointerDown"
          @pointerup="onPointerUp"
        >
          <Transition name="gallery-fade">
            <img
              :key="photos[active]?.src"
              :src="photos[active]?.src"
              :class="{ 'is-design': photos[active]?.design }"
              alt="Couple photo"
              decoding="async"
              draggable="false"
            />
          </Transition>
        </div>
      </div>

      <!-- 3014:388..391 -- the plates and their chevrons, as real buttons. -->
      <button
        v-if="photos.length > 1"
        type="button"
        class="gallery__nav gallery__nav--prev"
        aria-label="Previous photo"
        @click="step(-1); startAutoSlide()"
      >
        <img :src="chevron" alt="" />
      </button>
      <button
        v-if="photos.length > 1"
        type="button"
        class="gallery__nav gallery__nav--next"
        aria-label="Next photo"
        @click="step(1); startAutoSlide()"
      >
        <img :src="chevron" alt="" />
      </button>

      <!-- 3014:452 -- the thumbnails' heading. -->
      <p v-if="thumbs.length" class="gallery__strip-title">Portraits of Affection</p>

      <!-- Frame 6 (3014:378) -- three ellipse-masked thumbnails under one drop shadow. -->
      <button
        v-for="t in thumbs"
        :key="t.x"
        type="button"
        class="gallery__thumb"
        :style="{ left: `calc(${t.x} * var(--px))` }"
        :aria-label="`Show photo ${t.at + 1}`"
        @click="active = t.at; startAutoSlide()"
      >
        <span class="gallery__thumb-mask">
          <img
            :src="t.photo.src"
            :class="{ 'is-design': t.photo.design }"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </span>
      </button>
    </template>

    <!-- Rectangle 1 (3014:392) -- the prewedding video, or the design's photo in its place. -->
    <div v-if="hasVideo" class="gallery__video" :style="{ top: `calc(${videoTop} * var(--px))` }">
      <iframe
        v-if="hasPrewedVideo && youtubeId"
        :src="`https://www.youtube.com/embed/${youtubeId}?rel=0`"
        title="Prewedding video"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
      <video v-else-if="hasPrewedVideo" :src="videoPrewed" controls playsinline preload="metadata"></video>
      <img v-else :src="poster" alt="" loading="lazy" decoding="async" />
    </div>

    <Teleport to="body">
      <Transition name="lb">
        <div
          v-if="zoomed && photos.length"
          class="gallery__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          @click.self="closeZoom"
          @touchstart.passive="onTouchStart"
          @touchend="onTouchEnd"
        >
          <button type="button" class="gallery__lb-btn gallery__lb-close" aria-label="Close" @click="closeZoom">
            ✕
          </button>
          <button
            v-if="photos.length > 1"
            type="button"
            class="gallery__lb-btn gallery__lb-prev"
            aria-label="Previous photo"
            @click="step(-1)"
          >
            ‹
          </button>
          <div class="gallery__lb-body" @click.self="closeZoom">
            <!-- No caption: the dashboard fills it with the uploaded file's name. -->
            <img :src="photos[active]?.src" :alt="`Photo ${active + 1}`" class="gallery__lb-img" />
          </div>
          <button
            v-if="photos.length > 1"
            type="button"
            class="gallery__lb-btn gallery__lb-next"
            aria-label="Next photo"
            @click="step(1)"
          >
            ›
          </button>
          <div class="gallery__lb-count">{{ active + 1 }} / {{ photos.length }}</div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
.gallery {
  height: calc(v-bind(bandHeight) * var(--px));
  transition: height 300ms ease;
}

/* 3014:449 -- Roben Elegante 43.228, #b03b65, centred on x 306.5; auto line box 77. */
.gallery__title {
  --delay: 80ms;
  z-index: 102;
  top: calc(33 * var(--px));
  left: calc(6.5 * var(--px));
  width: calc(600 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(43.228 * var(--px));
  line-height: calc(77 * var(--px));
  color: var(--rose);
}

/* 3014:453 -- Roben Elegante 20/24, #b03b65, LEFT aligned and wrapped by its 208 box. */
.gallery__lede {
  --delay: 180ms;
  z-index: 106;
  top: calc(110 * var(--px));
  left: calc(50 * var(--px));
  width: calc(208 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(20 * var(--px));
  line-height: calc(24 * var(--px));
  text-align: left;
  color: var(--rose);
}

/* The ring: Ellipse 5's 7px outside stroke, so its outer edge is the SVG's 349.45 x 452.88. */
.gallery__ring {
  --delay: 300ms;
  z-index: 89;
  top: calc(227.34 * var(--px));
  left: calc(125.97 * var(--px));
  width: calc(349.45 * var(--px));
  height: calc(452.88 * var(--px));
  border-radius: 50%;
  background: #72583d;
}

/* 3014:377's mask: 337.451 x 440.918, 1px over the ring's inner edge on every side. */
.gallery__oval {
  position: absolute;
  top: calc(5.98 * var(--px));
  left: calc(6.01 * var(--px));
  width: calc(337.451 * var(--px));
  height: calc(440.918 * var(--px));
  border-radius: 50%;
  overflow: hidden;
  background: #d9d9d9;
  cursor: zoom-in;
  touch-action: pan-y;
  user-select: none;
}

.gallery__oval img,
.gallery__thumb img,
.gallery__video img,
.gallery__video video,
.gallery__video iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  border: 0;
}

/*
 * A design photo sits where Figma put it: `contain` in a 439.612 x 549.516 box at
 * (-50.96, -25.5) from the mask -- i.e. 108.56% x 124.63% of the mask at (-4.24%, -5.78%).
 */
.gallery__oval img.is-design {
  inset: auto;
  left: -4.24%;
  top: -5.78%;
  width: 108.56%;
  height: 124.63%;
}

.gallery__oval:focus-visible {
  outline: calc(2 * var(--px)) solid var(--rose);
  outline-offset: calc(4 * var(--px));
}

.gallery-fade-enter-active,
.gallery-fade-leave-active {
  transition: opacity 600ms ease;
}

.gallery-fade-enter-from,
.gallery-fade-leave-to {
  opacity: 0;
}

/* 3014:388 / 3014:389 -- 52.278 x 62.08 ellipses, #d9d9d9, at y 9464.72. */
.gallery__nav {
  --delay: 420ms;
  z-index: 92;
  top: calc(434.72 * var(--px));
  width: calc(52.278 * var(--px));
  height: calc(62.08 * var(--px));
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #d9d9d9;
  cursor: pointer;
  /* `scale`, not a transform: the band's reveal owns `transform` and would win. */
  transition:
    background 240ms ease,
    scale 240ms ease;
}

.gallery__nav--prev {
  left: calc(106.84 * var(--px));
}

.gallery__nav--next {
  left: calc(442.29 * var(--px));
}

/* 3014:390 / 3014:391 -- #3d78a2 chevrons; the next one is the prev one mirrored. */
.gallery__nav img {
  position: absolute;
  top: calc(17.31 * var(--px));
  width: calc(14.68 * var(--px));
  height: calc(27.5 * var(--px));
  max-width: none;
}

.gallery__nav--prev img {
  left: calc(12.57 * var(--px));
}

.gallery__nav--next img {
  left: calc(22.86 * var(--px));
  scale: -1 1;
}

.gallery__nav:hover,
.gallery__nav:focus-visible {
  background: #ececeb;
  scale: 1.08;
}

/* 3014:452 -- Roben Elegante 26.139/37.03, #b03b65, centred on x 504.19 in a 212.38 box. */
.gallery__strip-title {
  --delay: 520ms;
  z-index: 105;
  top: calc(612 * var(--px));
  left: calc(398 * var(--px));
  width: calc(212.38 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(26.139 * var(--px));
  line-height: calc(37.03 * var(--px));
  color: var(--rose);
}

/* Frame 6 at y 9717.39: 111.092 x 129.606 ellipses, drop shadow 0 4.357 2.178 at 25%. */
.gallery__thumb {
  --delay: 620ms;
  z-index: 90;
  top: calc(687.39 * var(--px));
  width: calc(111.092 * var(--px));
  height: calc(129.606 * var(--px));
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  filter: drop-shadow(0 calc(4.357 * var(--px)) calc(2.178 * var(--px)) rgba(0, 0, 0, 0.25));
  transition: scale 240ms ease;
}

/*
 * clip-path, not just radius + overflow: iOS Safari drops a rounded overflow clip under the
 * button's `filter`, and the thumbnails came out as rectangles.
 */
.gallery__thumb-mask {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  overflow: hidden;
  clip-path: ellipse(50% 50% at 50% 50%);
  background: #d9d9d9;
}

/* Figma: `contain` in 137.472 x 171.841 at (-13.15, -12.61) from the mask. */
.gallery__thumb img.is-design {
  inset: auto;
  left: -1.53%;
  top: -9.73%;
  width: 103.12%;
  height: 132.59%;
}

.gallery__thumb:hover,
.gallery__thumb:focus-visible {
  scale: 1.05;
}

/* Rectangle 1 -- 476.39 x 257 at x 68, radius 11.283, drop shadow 0 5.015 5.015 at 25%. */
.gallery__video {
  --delay: 300ms;
  z-index: 95;
  left: calc(68 * var(--px));
  width: calc(476.39 * var(--px));
  height: calc(257 * var(--px));
  border-radius: calc(11.283 * var(--px));
  overflow: hidden;
  background: #1c0f0b;
  box-shadow: 0 calc(5.015 * var(--px)) calc(5.015 * var(--px)) rgba(0, 0, 0, 0.25);
}

/* ===== Lightbox ===== */
.gallery__lightbox {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(28, 15, 11, 0.94);
  backdrop-filter: blur(8px);
  cursor: zoom-out;
  touch-action: pan-y;
}

.gallery__lb-body {
  position: relative;
  max-width: 92vw;
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gallery__lb-img {
  max-width: min(92vw, 840px);
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
  animation: lb-pop 280ms cubic-bezier(0.16, 1, 0.3, 1) both;
  cursor: default;
}

.gallery__lb-btn {
  position: absolute;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  transition:
    background 180ms ease,
    scale 180ms ease;
}

.gallery__lb-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  scale: 1.1;
}

.gallery__lb-close {
  top: 24px;
  right: 24px;
  font-size: 20px;
}

.gallery__lb-prev,
.gallery__lb-next {
  top: 50%;
  translate: 0 -50%;
}

.gallery__lb-prev {
  left: 20px;
}

.gallery__lb-next {
  right: 20px;
}

.gallery__lb-count {
  position: absolute;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.75);
  font-family: var(--font-ibarra);
  font-size: 15px;
  letter-spacing: 1.5px;
}

@keyframes lb-pop {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
}

.lb-enter-active,
.lb-leave-active {
  transition: opacity 220ms ease;
}

.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .gallery__nav,
  .gallery__thumb,
  .gallery__lb-btn {
    transition: none;
  }

  .gallery__lb-img {
    animation: none;
  }

  .gallery-fade-enter-active,
  .gallery-fade-leave-active {
    transition: none;
  }
}
</style>
