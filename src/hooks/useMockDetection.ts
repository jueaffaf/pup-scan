import { useEffect, useRef, useState } from 'react'
import type { DogBox, IgnoredObject } from '../types'

const IGNORED: IgnoredObject[] = [
  { label: 'PERSON', count: 1 },
  { label: 'CHAIR', count: 1 },
  { label: 'CELL PHONE', count: 1 },
]

/**
 * Dev-only stand-in for the detector so the full session can be rehearsed
 * without a dog (or a camera) present. Enable with `?mock` in development.
 */
export function useMockDetection(enabled: boolean) {
  const boxRef = useRef<DogBox | null>(null)
  const [present, setPresent] = useState(false)
  const [stable, setStable] = useState(false)

  useEffect(() => {
    if (!enabled) return
    boxRef.current = { x: 0.3, y: 0.22, w: 0.4, h: 0.66 }
    const a = window.setTimeout(() => setPresent(true), 1600)
    const b = window.setTimeout(() => setStable(true), 2500)
    return () => {
      window.clearTimeout(a)
      window.clearTimeout(b)
    }
  }, [enabled])

  return {
    ready: true,
    error: null as string | null,
    present,
    stable,
    score: 0.987,
    ignored: IGNORED,
    boxRef,
    preds: [] as { label: string; score: number; accepted: boolean }[],
    misses: 0,
    modelBase: 'mock',
  }
}
