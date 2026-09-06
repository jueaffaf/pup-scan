/**
 * Paper-emergence treatments, kept switchable so they can be compared in
 * context rather than argued about.
 *
 *  now — what we had: photo slot, flat paper, no shadow, mismatched widths
 *  a   — keep the slot render's slight top-down angle and match the paper to
 *        it: perspective tilt, emergence shadow, widths tuned to the aperture
 *  b   — commit to the flat editorial projection: vector slot drawn head-on,
 *        paper stays flat, same shadow and width work
 */
export type Look = 'now' | 'a' | 'b'

export const LOOKS: Look[] = ['now', 'a', 'b']

export const LOOK_LABEL: Record<Look, string> = {
  now: 'NOW',
  a: 'A · TILT',
  b: 'B · FLAT',
}

export function readLook(): Look {
  const v = new URLSearchParams(location.search).get('look')
  return LOOKS.includes(v as Look) ? (v as Look) : 'a'
}

export function setLook(look: Look) {
  const p = new URLSearchParams(location.search)
  p.set('look', look)
  location.search = p.toString()
}
