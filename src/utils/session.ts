import type { SessionMeta } from '../types'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'

export function newSessionId(): string {
  let out = ''
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}

export function makeSessionMeta(confidence: number): SessionMeta {
  const now = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return {
    id: newSessionId(),
    date: `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`,
    time: `${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`,
    confidence,
  }
}

/**
 * Playful, non-scientific ratings. Derived from the session id so a given
 * session is stable, and deliberately labelled as entertainment in the UI.
 */
export function funRatings(id: string) {
  let h = 7
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 1000
  return {
    fluffiness: 88 + (h % 12),
    goodness: 100,
    attitude: 20 + ((h * 7) % 70),
  }
}
