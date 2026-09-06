/** Deterministic Code-39-ish bar widths derived from a session id. */
export function barsFromSeed(seed: string, width = 240): number[] {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const next = () => {
    h = (Math.imul(h, 1103515245) + 12345) & 0x7fffffff
    return h / 0x7fffffff
  }
  const bars: number[] = []
  let x = 0
  while (x < width) {
    const bar = 1 + Math.floor(next() * 3)
    const gap = 1 + Math.floor(next() * 3)
    if (x + bar > width) break
    bars.push(bar, -gap)
    x += bar + gap
  }
  return bars
}
