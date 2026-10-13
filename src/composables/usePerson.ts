import { computed } from 'vue'
import { useWedding } from './useWedding'
import { parentLine } from '../lib/format'

/*
 * The two person slots of Frame 270: slot 1 is the groom's scene (y 2400..3690), slot 2 the
 * bride's (y 3690..4750). `order_groom_first: false` swaps who stands in them, so a slot
 * resolves its person by order rather than by type.
 *
 * DESIGN is each slot's own copy, used only when no live person fills it. The Instagram
 * handle "@Syifahadju" is the design's placeholder on both slots; it prints on the design
 * render only, never under a live couple.
 */
const DESIGN = {
  groom: {
    call: 'Aiman Aqil',
    name: 'Noraiman Aqil bin Masnwi',
    parents: ' Second son of Mr.Masnawi bin Salim \n& Mrs. Norapizah binti Ali',
    instagram: 'Syifahadju',
  },
  bride: {
    call: 'Zuzie',
    name: 'Noor Zuzie Fariatie binti Zulkifli',
    parents: 'Last daughter of Mr. Zulkifli bin Che Matt \n& Mrs. Azilah Mohd Shariff',
    instagram: 'Syifahadju',
  },
}

export function usePerson(slot: 1 | 2) {
  const { groom, bride, isGroomFirst, isDesign, groomTransform, brideTransform } = useWedding()

  // Which of the couple stands in this slot.
  const isGroom = computed(() => (slot === 1) === isGroomFirst.value)
  const person = computed<any>(() => (isGroom.value ? groom.value : bride.value))
  const design = computed(() => (isGroom.value ? DESIGN.groom : DESIGN.bride))

  const fullName = computed(() => person.value?.name?.trim() || design.value.name)

  const callName = computed(() => {
    if (person.value?.nickname?.trim()) return person.value.nickname.trim()
    if (person.value?.name?.trim()) return person.value.name.trim().split(/\s+/)[0]
    return design.value.call
  })

  const parents = computed(() => parentLine(person.value) || (person.value ? '' : design.value.parents))

  // pengantin.instagram is a bare username (qinvi-be normalises it); the link is built here.
  const instagram = computed(() => {
    const own = String(person.value?.instagram || '').replace(/^@/, '').trim()
    if (own) return own
    return !person.value && isDesign.value ? design.value.instagram : ''
  })
  const instagramUrl = computed(() =>
    instagram.value ? `https://www.instagram.com/${encodeURIComponent(instagram.value)}/` : '',
  )

  const photo = computed<string>(() => String(person.value?.photo_url || '').trim())
  const transform = computed(() => (isGroom.value ? groomTransform.value : brideTransform.value))
  const photoStyle = computed(() => ({
    objectPosition: `${transform.value.x}% ${transform.value.y}%`,
    transformOrigin: `${transform.value.x}% ${transform.value.y}%`,
    transform: `scale(${transform.value.scale})`,
  }))

  return { isGroom, person, fullName, callName, parents, instagram, instagramUrl, photo, photoStyle }
}
