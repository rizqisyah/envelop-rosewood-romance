/*
 * Frame 271 (3014:538), the cover, 596 x 1183 -- its three image children, in Figma paint
 * order, with Figma's own geometry (get_design_context). Coordinates are frame px.
 *
 *   3014:538  the frame's own fill: the paper texture, object-fit cover over the frame
 *   3017:547  the envelope, its fill CROPPED inside a 511 x 519 box (crop = left, top,
 *             width, height of the image in % of that box)
 *   3017:549  the heart wax seal, 108 x 108, centred on the frame's axis
 *
 * The four text nodes sit between them in CoverSection.vue.
 */
import paper from '../assets/cover/paper.webp'
import envelope from '../assets/cover/envelope.webp'
import heartSeal from '../assets/cover/heart-seal.webp'

export const COVER_PAPER = paper

export type CoverLayer = {
  id: string
  src: string
  x: number
  y: number
  w: number
  h: number
  crop?: [number, number, number, number]
}

export const COVER_ENVELOPE: CoverLayer = {
  id: '3017:547',
  src: envelope,
  x: 53,
  y: 314,
  w: 511,
  h: 519,
  crop: [-20.63, -18.75, 139.05, 136.87],
}

export const COVER_SEAL: CoverLayer = {
  id: '3017:549',
  src: heartSeal,
  x: 244,
  y: 573,
  w: 108,
  h: 108,
}
