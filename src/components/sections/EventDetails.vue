<script setup lang="ts">
/*
 * One event card's copy -- 3014:509 + 3014:507 on the akad card, 3026:363 on the
 * reception's -- laid out as a flow from the title down, so a one-line live title or a
 * three-line address moves what follows it instead of overlapping it. Every gap is the
 * design's except the title-to-time one, which differs between the two cards and is
 * passed in.
 */
defineProps<{
  headingId: string
  title: string
  time: string
  venue: string
  address: string
  maps: string
  /** Design px from the title's last line to the time's line box. */
  timeGap: number
  /**
   * The design render prints "View Maps" with nowhere to go. A live event without a maps
   * link prints nothing rather than a control that does nothing.
   */
  placeholder?: boolean
}>()
</script>

<template>
  <div class="event">
    <h2 :id="headingId" class="event__title">{{ title }}</h2>
    <p v-if="time" class="event__time" :style="{ marginTop: `calc(${timeGap} * var(--px))` }">{{ time }}</p>
    <p v-if="venue" class="event__venue">{{ venue }}</p>
    <p v-if="address" class="event__address">{{ address }}</p>
    <a v-if="maps" class="event__maps" :href="maps" target="_blank" rel="noopener noreferrer">View Maps</a>
    <p v-else-if="placeholder" class="event__maps" aria-hidden="true">View Maps</p>
  </div>
</template>

<style scoped>
.event {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* 3014:509 / 3026:376 -- Kaleagnetta 38 / 1.21, #4e685c, in a 237 box. */
.event__title {
  width: calc(237 * var(--px));
  font-family: var(--font-hand);
  font-weight: 400;
  font-size: calc(38 * var(--px));
  line-height: calc(45.98 * var(--px));
  white-space: pre-line;
  color: var(--sage);
}

/* 3014:513 -- Ibarra Real Nova Bold 20/26.6, #4e685c. */
.event__time {
  font-family: var(--font-ibarra);
  font-weight: 700;
  font-size: calc(20 * var(--px));
  line-height: calc(26.6 * var(--px));
  color: var(--sage);
}

/* 3014:518 -- Ibarra Real Nova SemiBold 20/30, #bf2983; 39.4 under the time's line box. */
.event__venue {
  margin-top: calc(39.4 * var(--px));
  max-width: calc(330 * var(--px));
  font-family: var(--font-ibarra);
  font-weight: 600;
  font-size: calc(20 * var(--px));
  line-height: calc(30 * var(--px));
  color: var(--magenta);
}

/*
 * 3014:520 -- Ibarra Real Nova 16/24, #bf2983, two authored lines. The design's box runs
 * past the card's clip and loses its trailing comma; here it is centred and wraps instead.
 */
.event__address {
  max-width: calc(330 * var(--px));
  font-family: var(--font-ibarra);
  font-weight: 400;
  font-size: calc(16 * var(--px));
  line-height: calc(24 * var(--px));
  white-space: pre-line;
  overflow-wrap: anywhere;
  color: var(--magenta);
}

/* 3014:523/524 -- Ibarra Real Nova Bold 20/30, #4e685c, over a 0.8px rule; 20 under the address. */
.event__maps {
  margin-top: calc(20 * var(--px));
  border-bottom: calc(0.8 * var(--px)) solid var(--sage);
  font-family: var(--font-ibarra);
  font-weight: 700;
  font-size: calc(20 * var(--px));
  line-height: calc(30 * var(--px));
  color: var(--sage);
  text-decoration: none;
  transition: color 240ms ease;
}

a.event__maps:hover,
a.event__maps:focus-visible {
  color: #2f4238;
}
</style>
