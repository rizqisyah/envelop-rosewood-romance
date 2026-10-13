<script setup lang="ts">
/*
 * Frame 270 band "gift": y 10200..10990. The heading, the invitation to give, and the
 * account cards between two banks of trees and florals. Art from src/lib/bands/gift.ts
 * (GENERATED, scripts/frame270.py).
 *
 * The design draws two cards 204 apart (3014:401, 3014:415). Live data can hold any number,
 * so the band grows or shrinks by 204 per card beyond two and the florals that flank the
 * cards ride down with them; the trees at the band's top stay put.
 */
import { computed, ref } from 'vue'
import BandArt from '../invite/BandArt.vue'
import { BAND_HEIGHT, LAYERS } from '../../lib/bands/gift'
import { useReveal } from '../../composables/useReveal'
import { useWedding } from '../../composables/useWedding'

const { el, shown } = useReveal(0.15)
const { giftAccounts, designData } = useWedding()

type Card = { bank: string; number: string; owner: string }

// The design's two accounts, the second of them its template's placeholder.
const DESIGN: Card[] = [
  { bank: 'Maybank', number: '1511 3812 7044', owner: 'Zuzie Fariatie' },
  { bank: 'Bank Bca (014)', number: '7402004234', owner: 'Alexander James Whitmore' },
]

const cards = computed<Card[]>(() => {
  if (giftAccounts.value.length) return giftAccounts.value
  return designData.value ? DESIGN : []
})

const CARD_TOP = 296 // 3014:401 at y 10496
const CARD_GAP = 204
const extra = computed(() => (Math.max(1, cards.value.length) - 2) * CARD_GAP)
const bandHeight = computed(() => BAND_HEIGHT + extra.value)

// Everything below the first card's top moves with the card stack.
const layers = computed(() =>
  extra.value === 0 ? LAYERS : LAYERS.map((l) => (l.y > CARD_TOP ? { ...l, y: l.y + extra.value } : l)),
)

/*
 * Clipboard is permission-gated and absent over plain http, so a failure is not an error
 * worth surfacing -- the number is on screen either way. The label confirms the copy for a
 * moment; `aria-live` announces that swap.
 */
const copied = ref(-1)
async function copy(i: number, text: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text.replace(/\s+/g, ''))
    copied.value = i
    window.setTimeout(() => (copied.value = -1), 1600)
  } catch {
    /* no clipboard: leave the label alone */
  }
}
</script>

<template>
  <section
    v-if="cards.length"
    :ref="el"
    class="band gift"
    :class="{ 'is-in': shown }"
    aria-labelledby="gift-title"
  >
    <BandArt :layers="layers" :shown="shown" />

    <!-- 3014:450 -- the heading. -->
    <h2 id="gift-title" class="gift__title one-line">Wedding Gift</h2>

    <!-- 3014:400 -- the invitation to give. -->
    <p class="gift__lede">
      Should you wish to leave a token of affection for the happy couple, you may kindly do so below.
    </p>

    <!-- 3014:401 / 3014:415 -- one card per account, 204 apart. -->
    <div
      v-for="(card, i) in cards"
      :key="i"
      class="gift__card"
      :style="{ top: `calc(${CARD_TOP + i * CARD_GAP} * var(--px))`, '--delay': `${280 + i * 160}ms` }"
    >
      <p class="gift__bank">{{ card.bank }}</p>
      <p class="gift__number">{{ card.number }}</p>
      <p class="gift__owner-label">Account Owner</p>
      <p class="gift__owner">{{ card.owner }}</p>
      <button type="button" class="gift__copy" aria-live="polite" @click="copy(i, card.number)">
        {{ copied === i ? 'Copied' : 'Copy' }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.gift {
  height: calc(v-bind(bandHeight) * var(--px));
  transition: height 300ms ease;
}

/* 3014:450 -- Roben Elegante 36.3, #4e685c, centred on x 298.5; auto line box 65. */
.gift__title {
  --delay: 80ms;
  z-index: 103;
  top: calc(107.5 * var(--px)); /* 3014:450 box y 10306 + 1.5: Roben's line box, measured */
  left: calc(98.5 * var(--px));
  width: calc(400 * var(--px));
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(36.3 * var(--px));
  line-height: calc(65 * var(--px));
  color: var(--sage);
}

/* 3014:400 -- Ibarra Real Nova 20/30, black, three lines wrapped by its own 380 box. */
.gift__lede {
  --delay: 180ms;
  z-index: 97;
  top: calc(196 * var(--px));
  left: calc(108 * var(--px));
  width: calc(380 * var(--px));
  font-family: var(--font-ibarra);
  font-weight: 400;
  font-size: calc(20 * var(--px));
  line-height: calc(30 * var(--px));
  color: #000;
}

/*
 * A card is the design's flow: bank, number, "Account Owner" (16px, its auto line box 20)
 * 4 above the owner, then the Copy pill 8 below. Wider than the design's 380 so a long bank
 * or owner name stays on its line.
 */
.gift__card {
  z-index: 97;
  left: calc(48 * var(--px));
  width: calc(500 * var(--px));
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 3014:404 / 3014:406 / 3014:409 -- Ibarra Real Nova SemiBold 20/30, #ab205e. */
.gift__bank,
.gift__number,
.gift__owner {
  font-family: var(--font-ibarra);
  font-weight: 600;
  font-size: calc(20 * var(--px));
  line-height: calc(30 * var(--px));
  color: var(--berry);
}

/* The design's string is "Maybank"; the node sets it `uppercase`. */
.gift__bank {
  text-transform: uppercase;
}

/* 3014:408 -- Ibarra Real Nova 16, #4e685c. */
.gift__owner-label {
  font-family: var(--font-ibarra);
  font-weight: 400;
  font-size: calc(16 * var(--px));
  line-height: calc(20 * var(--px));
  color: var(--sage);
}

.gift__owner {
  margin-top: calc(4 * var(--px));
}

/* 3014:413 -- #4e685c pill, padding 8/24, min-width 70; label Ibarra Real Nova 20, #f5f5f5. */
.gift__copy {
  margin-top: calc(8 * var(--px));
  min-width: calc(70 * var(--px));
  padding: calc(8 * var(--px)) calc(24 * var(--px));
  border: 0;
  border-radius: 999px;
  background: var(--sage);
  font-family: var(--font-ibarra);
  font-weight: 400;
  font-size: calc(20 * var(--px));
  line-height: calc(25 * var(--px));
  color: #f5f5f5;
  cursor: pointer;
  /* `scale`, not a transform: the band's reveal owns `transform` and would win. */
  transition:
    background 240ms ease,
    scale 240ms ease;
}

.gift__copy:hover,
.gift__copy:focus-visible {
  background: #3d5449;
  scale: 1.04;
}

@media (prefers-reduced-motion: reduce) {
  .gift__copy {
    transition: none;
  }
}
</style>
