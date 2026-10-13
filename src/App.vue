<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watchEffect } from 'vue'
import CoverSection from './components/cover/CoverSection.vue'
import InviteBody from './components/invite/InviteBody.vue'
import BottomNav from './components/sections/BottomNav.vue'
import VideoSection from './components/sections/VideoSection.vue'
import { usePreloadAssets } from './composables/usePreloadAssets'
import { useWedding } from './composables/useWedding'
import { COVER_PAPER } from './lib/coverLayers'

const { guestName, guestGroup, wedding, coupleNickname, quoteText, quoteVerse } = useWedding()
const { coverLoaded, preloadCover, preloadInviteBody } = usePreloadAssets()

const isOpen = ref(false)
// The column cannot scroll while the cover owns the screen, or a stray wheel event
// scrolls the invitation behind it before it has been opened.
const isLocked = ref(true)
const contentVisible = ref(false)

const coupleName = coupleNickname

// The desktop panel: the wedding's own backdrop when it has one, else the cover's paper.
const leftBackgroundStyle = computed(() => {
  const img = wedding.value?.image_bg1 || wedding.value?.image_cover || COVER_PAPER
  return { backgroundImage: `url(${img})` }
})

/*
 * The cover animates its layers in. Holding the reveal until they are decoded keeps a
 * real phone from assembling the scene out of half-loaded images.
 */
onMounted(async () => {
  await preloadCover()
  preloadInviteBody()
})

async function openInvitation() {
  isOpen.value = true
  /*
   * Released here, not when the cover has finished leaving: the cover is still in flow
   * above the sheet for its 2.4s leave, and holding the lock clips the sheet out of the
   * viewport, so the hero's reveal could not fire until the cover unmounted.
   */
  isLocked.value = false
  await nextTick()
  requestAnimationFrame(() => {
    contentVisible.value = true
  })
}

/*
 * The lock has to sit on the document, not on the column: iOS Safari's 100vh is taller
 * than what is on screen, so a column-level lock still let the page scroll by the height
 * of the toolbar and the invitation peeked out from under the cover.
 */
watchEffect(() => {
  document.documentElement.classList.toggle('is-cover-locked', isLocked.value)
})
</script>

<template>
  <main class="app-shell">
    <!-- Desktop only: the invitation is a 430px column, this fills the rest. -->
    <div class="desktop-left-column" :style="leftBackgroundStyle">
      <div class="left-overlay"></div>
      <div class="left-content">
        <div class="left-header">
          <p class="left-subtitle">The Wedding Of</p>
          <!--
            A <p>, not an <h1>: this panel only reprints the sheet's own title and is
            display:none below 768px. The document's one real heading is the cover's <h1>
            before it is opened and the hero band's after.
          -->
          <p class="left-title">{{ coupleName }}</p>
        </div>
        <div class="left-quote-container">
          <!-- quoteText carries the design's own quotation marks -- do not add a second pair. -->
          <p class="left-quote">{{ quoteText }}</p>
          <span class="left-quote-verse">{{ quoteVerse }}</span>
        </div>
      </div>
    </div>

    <div class="desktop-right-column" :class="{ 'is-locked': isLocked }">
      <Transition name="splash">
        <CoverSection
          v-if="!isOpen"
          :guest-name="guestName"
          :guest-group="guestGroup"
          :couple-name="coupleName"
          :ready="coverLoaded"
          @open="openInvitation"
        />
      </Transition>

      <div
        v-show="isOpen"
        id="invite"
        class="invitation-content"
        :class="{ 'is-visible': contentVisible }"
      >
        <VideoSection />
        <InviteBody />
      </div>

      <BottomNav v-if="isOpen" />
    </div>
  </main>
</template>

<style>
/*
 * The cover is lifted like the flap of the envelope it shows -- it rises away and
 * dissolves -- while the sheet comes up out of the blur behind it.
 *
 * Taken OUT OF FLOW for the leave, so the sheet holds the screen from the tap and the cover
 * recedes over the top of it instead of pushing the invitation below the fold.
 */
.splash-leave-active {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10;
  transition:
    opacity 2.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 2.4s cubic-bezier(0.16, 1, 0.3, 1),
    filter 2.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  will-change: opacity, transform, filter;
}

.splash-leave-to {
  opacity: 0 !important;
  transform: translateY(-6%) scale(1.08) !important;
  filter: blur(12px) !important;
}

/* Held back 0.8s so the cover has visibly receded before this rises to meet it. */
.invitation-content {
  opacity: 0;
  transform: translateY(28px) scale(0.965);
  filter: blur(10px);
  transition:
    opacity 2.3s cubic-bezier(0.16, 1, 0.3, 1) 0.8s,
    transform 2.7s cubic-bezier(0.16, 1, 0.3, 1) 0.8s,
    filter 2.3s cubic-bezier(0.16, 1, 0.3, 1) 0.8s;
  will-change: opacity, transform, filter;
}

.invitation-content.is-visible {
  opacity: 1;
  transform: translateY(0);
  filter: blur(0);
}

@media (prefers-reduced-motion: reduce) {
  .splash-leave-active,
  .invitation-content {
    transition: opacity 0.2s linear !important;
  }

  .splash-leave-to {
    transform: none !important;
    filter: none !important;
  }

  .invitation-content {
    transform: none;
    filter: none;
  }
}

@media (min-width: 768px) {
  .app-shell {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: #1c0f0b;
  }

  .desktop-left-column {
    display: flex;
    flex: 1;
    height: 100vh;
    position: relative;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    background-color: var(--paper);
    color: #fff;
    overflow: hidden;
  }

  /* Warm, not grey: the panel sits beside a cream-and-maroon sheet. */
  .left-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, rgba(83, 31, 6, 0.62), rgba(64, 18, 24, 0.78));
    z-index: 1;
  }

  .left-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    padding: 60px;
  }

  .left-subtitle {
    margin-bottom: 16px;
    font-family: var(--font-lancelot);
    font-size: 22px;
    letter-spacing: 0.04em;
    opacity: 0.9;
  }

  .left-title {
    margin: 0;
    font-family: var(--font-script);
    font-size: 60px;
    font-weight: 400;
    line-height: 1.4;
    color: #f6e3cf;
  }

  .left-quote-container {
    max-width: 480px;
    margin-top: auto;
    margin-bottom: 40px;
  }

  .left-quote {
    margin-bottom: 12px;
    font-family: var(--font-serif);
    font-size: 19px;
    font-style: italic;
    line-height: 1.6;
    opacity: 0.92;
  }

  .left-quote-verse {
    font-family: var(--font-cinzel);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.05em;
    white-space: pre-line;
    opacity: 0.8;
  }

  /* Exactly --card-max: the sheet fills it, so the art has no gutter beside it. */
  .desktop-right-column {
    width: var(--card-max);
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    position: relative;
    background: var(--sheet);
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
  }

  .desktop-right-column.is-locked {
    overflow: hidden !important;
  }
}

@media (max-width: 767px) {
  .app-shell {
    width: 100%;
    overflow-x: hidden;
  }

  .desktop-left-column {
    display: none;
  }

  .desktop-right-column {
    position: relative; /* containing block for the cover's out-of-flow leave */
    width: 100%;
    overflow-x: hidden;
  }

  .desktop-right-column.is-locked {
    overflow: hidden !important;
    height: 100dvh;
  }
}
</style>
