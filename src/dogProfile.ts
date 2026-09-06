/**
 * The descriptive fields on the ANALYSIS panel and the session receipt.
 *
 * These are NOT measured from the image — the detector only reports "there is
 * a dog here, this confident". This is your dog, written down once. Edit it
 * here and it updates everywhere.
 */
const BREED = 'POMERANIAN'

export const DOG_PROFILE = {
  breed: BREED,
  coat: 'CREAM CLOUD',
  fur: 'FLUFFY',
  earType: 'PRICK',
  size: 'SMALL',
  /**
   * The headline of the profile screen: the breed. Hardcoded to this dog for
   * now — the detector only ever reports "dog", so anything more specific is
   * written down here rather than invented per session.
   */
  classification: [BREED],
} as const

/** Field/value pairs in the order they appear on screen. */
export const PROFILE_ROWS: Array<[string, string]> = [
  ['BREED', DOG_PROFILE.breed],
  ['COAT', DOG_PROFILE.coat],
  ['FUR', DOG_PROFILE.fur],
  ['EAR TYPE', DOG_PROFILE.earType],
  ['SIZE', DOG_PROFILE.size],
]

/** The same rows as they read on the profile screen, where there is room. */
export const PROFILE_ROWS_LONG: Array<[string, string]> = [
  ['LIKELY BREED', DOG_PROFILE.breed],
  ['COAT', DOG_PROFILE.coat],
  ['FUR', DOG_PROFILE.fur],
  ['EAR TYPE', DOG_PROFILE.earType],
  ['SIZE', DOG_PROFILE.size],
]

export const CLASSIFICATION = DOG_PROFILE.classification.join(' ')
