<script setup lang="ts">
/*
 * The name / parents / Instagram stack under each portrait -- 3014:274 in slot 1 and its
 * twin 3026:339 in slot 2. Laid out as a flow at the name's origin rather than three
 * absolute boxes, so a name long enough to wrap pushes the parents down instead of running
 * into them. The gaps are the design's: 16 from the name's 50px line box to the parents,
 * 16.2 from the parents' two 28.4px lines to the pill.
 */
import instagramGlyph from '../../assets/art/instagram.webp'

defineProps<{
  headingId: string
  fullName: string
  parents: string
  instagram: string
  instagramUrl: string
}>()
</script>

<template>
  <div class="person">
    <h2 :id="headingId" class="person__name">{{ fullName }}</h2>
    <p v-if="parents" class="person__parents">{{ parents }}</p>
    <a
      v-if="instagram"
      class="person__ig"
      :href="instagramUrl"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img :src="instagramGlyph" alt="" />
      <span>@{{ instagram }}</span>
      <span class="sr-only">on Instagram</span>
    </a>
  </div>
</template>

<style scoped>
.person {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* 3014:276 -- Roben Elegante 28.11, #b94765; Figma's "auto" line box measures 50. */
.person__name {
  margin: 0;
  font-family: var(--font-script);
  font-weight: 400;
  font-size: calc(28.11 * var(--px));
  line-height: calc(50 * var(--px));
  color: var(--name-pink);
}

/*
 * 3014:278 -- Times New Roman 20/28.4, #b94765, two authored lines. `pre-wrap`, not
 * `pre-line`: the design's string carries a leading space, and a centred line is centred
 * including it.
 */
.person__parents {
  margin: calc(16 * var(--px)) 0 0;
  font-family: var(--font-times);
  font-weight: 400;
  font-size: calc(20 * var(--px));
  line-height: calc(28.4 * var(--px));
  white-space: pre-wrap;
  color: var(--name-pink);
}

/*
 * 3014:280 -- the pill: #6a7c4b, radius 999, padding 8/12, gap 8. Its glyph is the
 * Font Awesome Brands instagram (an exported asset, 18 wide in a 20-tall slot) and its label
 * Cormorant Infant 20/30, #f7f6f1.
 */
.person__ig {
  display: inline-flex;
  align-items: center;
  gap: calc(8 * var(--px));
  margin-top: calc(16.2 * var(--px));
  padding: calc(8 * var(--px)) calc(12 * var(--px));
  border-radius: 999px;
  background: var(--olive);
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: calc(20 * var(--px));
  line-height: calc(30 * var(--px));
  color: #f7f6f1;
  text-decoration: none;
  transition:
    background 240ms ease,
    scale 240ms ease;
}

.person__ig img {
  width: calc(18 * var(--px));
  height: calc(18 * var(--px));
}

/* `scale`, not a transform: the band's reveal owns `transform` on the stack. */
.person__ig:hover,
.person__ig:focus-visible {
  background: #56663b;
  scale: 1.04;
}

@media (prefers-reduced-motion: reduce) {
  .person__ig {
    transition: none;
  }
}
</style>
