/*
 * The couple's title as both frames set it: "Aiman  & Zuzie" -- TWO spaces before the
 * ampersand (3014:541 on the cover, 3014:531 on the hero). Roben Elegante's "&" opens with a
 * swash that crowds the name before it; the extra space is the design's own fix, worth 12px
 * of measure at the title's size. A no-break space keeps both without `white-space: pre`.
 */
export function coupleTitle(name: string): string {
  return name.replace(/\s+&\s+/, '  & ')
}
