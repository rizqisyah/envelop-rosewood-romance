import { computed } from 'vue'
import { useWedding } from './useWedding'
import { formatEventDate, formatEventTime } from '../lib/format'

/*
 * The two event cards of Frame 270: 0 = the akad (y 5830..7030), 1 = the reception
 * (y 7030..8190). Each prints its date in the cartouche above it ("Sunday," over
 * "17 MARCH / 2027") and its title, time, venue and address on the card.
 *
 * All or nothing, never a mix: once the API sends any event, an empty slot stays empty
 * rather than printing the design's venue under a real invitation.
 */
const DESIGN = [
  // The design's line 1 is "Wedding Ceremony " and its trailing space centres with the
  // line; a no-break space keeps it from hanging.
  { title: 'Wedding Ceremony \n(Akad)', time: '10:00 AM' },
  { title: 'Wedding Reception', time: '12:00 PM' },
]
const DESIGN_VENUE = 'Rimbunan Abdul Samad'
const DESIGN_ADDRESS = "63, Jalan Abdul Samad, Kampung Bahru,\n80100 Johor Bahru, Johor Darul Ta'zim"

export function useEvent(index: 0 | 1) {
  const { liveAcara, isDesign } = useWedding()
  const event = computed<any>(() => liveAcara.value[index] || null)

  // "17 March 2027" -> "17 MARCH\n2027": Cinzel's caps, and the year on its own line.
  const stamp = computed(() => {
    if (isDesign.value) return { weekday: 'Sunday,', date: '17 MARCH\n2027' }
    const when = formatEventDate(event.value?.event_date)
    if (!when) return { weekday: '', date: '' }
    const cut = when.date.lastIndexOf(' ')
    return {
      weekday: `${when.weekday},`,
      date: `${when.date.slice(0, cut).toUpperCase()}\n${when.date.slice(cut + 1)}`,
    }
  })

  const card = computed(() => {
    if (isDesign.value) {
      return { ...DESIGN[index], venue: DESIGN_VENUE, address: DESIGN_ADDRESS, maps: '' }
    }
    const e = event.value
    return {
      title: e?.title || e?.name || (index === 0 ? 'Akad Nikah' : 'Resepsi'),
      time: formatEventTime(e?.event_time),
      venue: e?.location_name || '',
      address: e?.address || '',
      maps: e?.maps_url || '',
    }
  })

  return { isDesign, event, stamp, card }
}
