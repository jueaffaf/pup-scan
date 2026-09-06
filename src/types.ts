export type Phase =
  | 'BOOT'        // model + camera warming up
  | 'SEARCHING'   // no dog in frame
  | 'DETECTED'    // dog held long enough, booth unlocked
  | 'COUNTDOWN'   // 3 / 2 / 1 before the first cut
  | 'CAPTURING'   // cuts 2-4
  | 'LOST'        // dog left mid-session
  | 'RESULT'

/** Dog box in normalised video space (0-1), origin top-left, un-mirrored. */
export interface DogBox {
  x: number
  y: number
  w: number
  h: number
}

export interface Detection {
  box: DogBox
  score: number
}

/** Non-dog classes the model saw, kept only to render the IGNORED list. */
export interface IgnoredObject {
  label: string
  count: number
}

export interface SessionMeta {
  id: string
  date: string
  time: string
  confidence: number
}
