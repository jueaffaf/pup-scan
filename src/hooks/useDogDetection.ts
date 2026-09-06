import { useCallback, useEffect, useRef, useState } from 'react'
import '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import type { DogBox, IgnoredObject } from '../types'
import { useAnimationLoop } from './useAnimationLoop'

/**
 * COCO-SSD sees ~80 classes. Only a dog is ever promoted to an active object —
 * everything else exists purely to be listed as IGNORED.
 */
const DOG = 'dog'

/*
 * Small fluffy breeds are a known weak spot for COCO: a cream Maltese reads as
 * `teddy bear`, `sheep` or `cat` more often than it reads as `dog`, especially
 * in indoor light. These classes count as a dog, but only at a higher bar than
 * a real `dog` hit so a plush toy on the sofa doesn't unlock the booth on its
 * own. Empty this set to be strict about it.
 */
const DOG_LIKE = new Set(['teddy bear', 'sheep', 'cat', 'bear'])

/*
 * A person is never a dog, and this is the class the stand-ins above leak
 * from: COCO-SSD regularly calls a human torso `teddy bear` or `bear`, which
 * would unlock a dog-only booth with no dog in the room. So a stand-in class
 * is thrown out when its box is essentially the same box as a person's.
 * IoU, not containment — a small dog HELD BY someone sits inside the person's
 * box but covers very little of it, and that has to keep working.
 */
const PERSON = 'person'
const PERSON_MIN = 0.5   // a confident enough person to veto with
const PERSON_IOU = 0.5   // above this the stand-in and the person are one box

const SCORE_MIN = 0.45      // a confident `dog`
const SCORE_MIN_LIKE = 0.55 // a dog-like class standing in for one
const RAW_MIN = 0.2         // what we ask the model for, before our own filter
const DETECT_EVERY_MS = 110
const HOLD_MS = 900   // continuous visibility before the booth unlocks
const MAX_MISSES = 14 // consecutive dog-free passes before we call it lost
                      // (~1.5s+) — a dog that turns its head is not a dog that left
const SMOOTH = 0.28

export interface RawPrediction {
  label: string
  score: number
  accepted: boolean
}

const isDog = (label: string, score: number) =>
  (label === DOG && score >= SCORE_MIN) ||
  (DOG_LIKE.has(label) && score >= SCORE_MIN_LIKE)

type Box = [number, number, number, number]

function iou(a: Box, b: Box): number {
  const w = Math.min(a[0] + a[2], b[0] + b[2]) - Math.max(a[0], b[0])
  const h = Math.min(a[1] + a[3], b[1] + b[3]) - Math.max(a[1], b[1])
  if (w <= 0 || h <= 0) return 0
  const inter = w * h
  return inter / (a[2] * a[3] + b[2] * b[3] - inter || 1)
}

export function useDogDetection(
  videoRef: React.MutableRefObject<HTMLVideoElement | null>,
  active: boolean,
) {
  const boxRef = useRef<DogBox | null>(null)
  const targetRef = useRef<DogBox | null>(null)

  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [present, setPresent] = useState(false)
  const [stable, setStable] = useState(false)
  const [score, setScore] = useState(0)
  const [ignored, setIgnored] = useState<IgnoredObject[]>([])
  const [preds, setPreds] = useState<RawPrediction[]>([])
  const [misses, setMisses] = useState(0)
  const [modelBase, setModelBase] = useState('')

  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    // nothing to download if the caller is standing the detector down
    if (!active) return
    let disposed = false

    /*
     * Accuracy first, but never at the cost of not running at all. mobilenet_v2
     * is markedly better on small fluffy dogs; it is also a ~67MB download and
     * some environments fail to cache it, so we fall back rather than dying.
     */
    const BASES = ['mobilenet_v2', 'lite_mobilenet_v2'] as const

    const loadFirstAvailable = async () => {
      for (const base of BASES) {
        try {
          const m = await cocoSsd.load({ base })
          if (disposed) return
          modelRef.current = m
          setModelBase(base)
          setReady(true)
          return
        } catch (err) {
          if (import.meta.env.DEV) console.warn(`[pup.scan] base "${base}" failed`, err)
        }
      }
      if (!disposed) setError('DETECTION MODEL FAILED TO LOAD')
    }

    loadFirstAvailable()
    return () => {
      disposed = true
    }
  }, [active])

  /**
   * Inference loop. Deliberately driven by timers rather than rAF: rAF is
   * throttled or stopped outright when the window is occluded, and a photo
   * booth that quietly stops seeing dogs behind another window is worse than
   * one that costs a few idle frames.
   */
  useEffect(() => {
    if (!ready) return
    let stopped = false
    let timer = 0
    let firstSeen = 0
    let lastSeenAt = 0
    let misses = 0

    const loop = async () => {
      if (stopped) return
      const video = videoRef.current
      const model = modelRef.current

      if (video && model && video.readyState >= 2 && activeRef.current) {
        try {
          const raw = await model.detect(video, 20, RAW_MIN)
          const now = performance.now()
          const vw = video.videoWidth || 1
          const vh = video.videoHeight || 1

          const people = raw.filter((p) => p.class === PERSON && p.score >= PERSON_MIN)

          /** A real `dog` is trusted; a stand-in class has to not be a person. */
          const accepted = (p: cocoSsd.DetectedObject) => {
            if (!isDog(p.class, p.score)) return false
            if (p.class === DOG) return true
            return !people.some((h) => iou(p.bbox as Box, h.bbox as Box) >= PERSON_IOU)
          }

          const dogs = raw.filter(accepted).sort((a, b) => b.score - a.score)

          setPreds(
            [...raw]
              .sort((a, b) => b.score - a.score)
              .slice(0, 6)
              .map((p) => ({ label: p.class, score: p.score, accepted: accepted(p) })),
          )

          // Everything that is not the dog is catalogued, never tracked.
          const tally = new Map<string, number>()
          for (const p of raw) {
            if (accepted(p) || p.score < 0.5) continue
            tally.set(p.class, (tally.get(p.class) ?? 0) + 1)
          }
          setIgnored(
            [...tally.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([label, count]) => ({ label: label.toUpperCase(), count })),
          )

          if (dogs.length) {
            // a fresh run starts only when the previous one actually broke
            if (!lastSeenAt) firstSeen = now
            misses = 0
            lastSeenAt = now
            const [x, y, w, h] = dogs[0].bbox
            targetRef.current = { x: x / vw, y: y / vh, w: w / vw, h: h / vh }
            setScore(dogs[0].score)
          } else {
            misses++
          }

          /*
           * Presence is measured in consecutive passes, not elapsed time: a
           * throttled tab can stretch the loop past any fixed grace window,
           * and a booth that silently refuses to unlock is the worst failure
           * mode this thing has.
           */
          const seen = lastSeenAt > 0 && misses <= MAX_MISSES
          setMisses(misses)
          setPresent(seen)
          setStable(seen && now - firstSeen >= HOLD_MS)
          if (!seen) {
            targetRef.current = null
            boxRef.current = null
            lastSeenAt = 0
          }
        } catch (err) {
          // one bad frame shouldn't tear the loop down — but don't hide it
          if (import.meta.env.DEV) console.warn('[pup.scan] detect failed', err)
        }
      }

      if (!stopped) timer = window.setTimeout(loop, DETECT_EVERY_MS)
    }

    loop()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [ready, videoRef])

  /** Interpolation is purely cosmetic, so it can ride the shared paint loop. */
  useAnimationLoop(
    useCallback(() => {
      const t = targetRef.current
      if (!t) return
      const b = boxRef.current
      boxRef.current = b
        ? {
            x: b.x + (t.x - b.x) * SMOOTH,
            y: b.y + (t.y - b.y) * SMOOTH,
            w: b.w + (t.w - b.w) * SMOOTH,
            h: b.h + (t.h - b.h) * SMOOTH,
          }
        : t
    }, []),
  )

  return { ready, error, present, stable, score, ignored, boxRef, preds, misses, modelBase }
}
