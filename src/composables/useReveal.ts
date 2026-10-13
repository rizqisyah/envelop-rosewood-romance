import { onUnmounted, ref, type ComponentPublicInstance, type Ref } from "vue";

/**
 * Flips `shown` the first time the element scrolls into view.
 * Section entrance animations are gated on this so each one fires on scroll,
 * not all at load.
 *
 * `el` is a callback ref, not a `ref()` holding the node: a plain ref would have
 * to be bound as `ref="el"`, which `noUnusedLocals` reads as never used.
 *
 *   const { el, shown } = useReveal()
 *   <section :ref="el" :class="{ 'is-in': shown }">
 */
export function useReveal(
  threshold = 0,
  // A band can be 1000+ design px tall, so a plain threshold fires while its top
  // edge is still below the fold and the whole reveal plays where nobody is
  // looking. Requiring it to clear the bottom 12% of the viewport fixes that; a
  // band taller than the viewport would never satisfy a percentage threshold anyway.
  rootMargin = "0px 0px -12% 0px"
): {
  el: (node: Element | ComponentPublicInstance | null) => void;
  shown: Ref<boolean>;
} {
  const shown = ref(false);
  let obs: IntersectionObserver | null = null;
  let onScroll: (() => void) | null = null;
  let frame = 0;

  function disconnect(): void {
    obs?.disconnect();
    obs = null;
    if (onScroll) document.removeEventListener("scroll", onScroll, { capture: true });
    onScroll = null;
    cancelAnimationFrame(frame);
  }

  function reveal(): void {
    shown.value = true;
    disconnect();
  }

  function el(node: Element | ComponentPublicInstance | null): void {
    disconnect();
    if (!(node instanceof Element) || shown.value) return;

    obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reveal();
      },
      { threshold, rootMargin }
    );
    obs.observe(node);

    /*
     * A jump -- a fling, an anchor, a restored scroll position -- can carry a band from
     * below the fold to above it between two frames. The observer sees no crossing and
     * never fires, and the band's art stays hidden even though layers from it paint into
     * the bands below. So a band that has gone ABOVE the viewport is revealed too.
     * Capture on the document catches the desktop column's scroll as well as the page's.
     */
    onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (node.getBoundingClientRect().bottom < 0) reveal();
      });
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  }

  onUnmounted(disconnect);

  return { el, shown };
}
