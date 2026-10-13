import { ref } from 'vue'

/*
 * Assets are discovered by glob so a new layer needs no edit here.
 * Cover = Frame 271, in `src/assets/cover/`. Body = Frame 270's art, in `src/assets/art/`.
 */
const coverImages = Object.values(
  import.meta.glob('../assets/cover/*.webp', { eager: true, import: 'default' }),
) as string[]

const bodyImages = Object.values(
  import.meta.glob('../assets/art/*.{webp,svg}', { eager: true, import: 'default' }),
) as string[]

const coverLoaded = ref(false)
const bodyLoaded = ref(false)

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = url
    if (img.complete) {
      resolve()
    } else {
      img.onload = () => resolve()
      img.onerror = () => resolve() // resolve even on error so the app won't stall
    }
  })
}

export function usePreloadAssets() {
  async function preloadCover() {
    if (coverLoaded.value) return
    // The cover's faces too: its copy is half the scene, and a fallback face then a swap
    // would visibly re-set the couple's name as the cover assembles.
    await Promise.all([...coverImages.map(preloadImage), document.fonts?.ready])
    coverLoaded.value = true
  }

  function preloadInviteBody() {
    if (bodyLoaded.value) return
    const loadBody = () => {
      Promise.all(bodyImages.map(preloadImage)).then(() => {
        bodyLoaded.value = true
      })
    }
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadBody, { timeout: 2000 })
    } else {
      setTimeout(loadBody, 200)
    }
  }

  return {
    coverLoaded,
    bodyLoaded,
    preloadCover,
    preloadInviteBody,
  }
}
