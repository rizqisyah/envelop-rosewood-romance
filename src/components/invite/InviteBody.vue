<script setup lang="ts">
// The invitation sheet, Frame 270 (3014:151), 596 x 15058. One component per band, in
// Figma order; each band positions its own children relative to its own top, so a band that
// grows (more accounts, more wishes) or drops out pushes the rest down instead of
// overlapping them. Band map and layer inventory: ../../../SLICING.md
import HeroSection from '../sections/HeroSection.vue'
import CountdownSection from '../sections/CountdownSection.vue'
import GreetingSection from '../sections/GreetingSection.vue'
import GroomSection from '../sections/GroomSection.vue'
import BrideSection from '../sections/BrideSection.vue'
import QuoteSection from '../sections/QuoteSection.vue'
import AkadSection from '../sections/AkadSection.vue'
import ResepsiSection from '../sections/ResepsiSection.vue'
import DresscodeSection from '../sections/DresscodeSection.vue'
import GallerySection from '../sections/GallerySection.vue'
import GiftSection from '../sections/GiftSection.vue'
import WishesSection from '../sections/WishesSection.vue'
import RsvpSection from '../sections/RsvpSection.vue'
import ClosingSection from '../sections/ClosingSection.vue'
import { useWedding } from '../../composables/useWedding'

const { hasMultipleAcara, hasGallerySection, hasGiftSection } = useWedding()
</script>

<template>
  <div class="sheet">
    <HeroSection />
    <CountdownSection />
    <GreetingSection />
    <GroomSection />
    <BrideSection />
    <QuoteSection />
    <AkadSection />
    <ResepsiSection v-if="hasMultipleAcara" />
    <DresscodeSection />
    <GallerySection v-if="hasGallerySection" />
    <GiftSection v-if="hasGiftSection" />
    <WishesSection />
    <RsvpSection />
    <ClosingSection />
  </div>
</template>

<style scoped>
/*
 * One design pixel = 100cqw / 596, the same unit CoverSection uses. Declared once here so
 * every band inherits it and can place children in raw Figma coordinates.
 *
 * `container-type` also makes the sheet the one stacking context every band's layers share,
 * which is what lets a layer's global Figma z order it against its neighbours' -- so no
 * band may set a z-index of its own.
 */
.sheet {
  container-type: inline-size;
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--sheet);
}

.sheet > * {
  --px: calc(100cqw / 596);
}
</style>
