import { useCallback, useEffect, useRef, useState } from 'react'
import type { Phase, SessionMeta } from '../types'
import { captureCut } from '../utils/capture'
import { makeSessionMeta } from '../utils/session'

const READY_MS = 1200   // "PHOTO BOOTH UNLOCKED" beat before counting
const TICK_MS = 1000    // 3 . 2 . 1
const CUT_GAP_MS = 1400 // cuts 2-4
const LOST_MS = 1400    // how long "PUP LOST" stays up
const ABORT_AFTER_MS = 2200 // sustained absence before a run is called off
const CUTS = 4

interface DetectionState {
  present: boolean
  stable: boolean
  score: number
}

export function usePhotoSession(
  videoRef: React.MutableRefObject<HTMLVideoElement | null>,
  det: DetectionState,
  armed: boolean,
) {
  const [phase, setPhase] = useState<Phase>('BOOT')
  const [count, setCount] = useState(3)
  const [cuts, setCuts] = useState<string[]>([])
  const [flash, setFlash] = useState(false)
  const [meta, setMeta] = useState<SessionMeta | null>(null)

  const cutsRef = useRef<string[]>([])
  const scoreRef = useRef(0)
  scoreRef.current = det.score
  /** A manually started run ignores detection entirely. */
  const manualRef = useRef(false)
  const phaseRef = useRef<Phase>('BOOT')

  phaseRef.current = phase

  const shoot = useCallback(() => {
    const video = videoRef.current
    if (!video) return 0
    const cut = captureCut(video)
    cutsRef.current = [...cutsRef.current, cut]
    setCuts(cutsRef.current)
    setFlash(true)
    window.setTimeout(() => setFlash(false), 260)
    return cutsRef.current.length
  }, [videoRef])

  const reset = useCallback(() => {
    cutsRef.current = []
    manualRef.current = false
    setCuts([])
    setCount(3)
    setMeta(null)
    setPhase('SEARCHING')
  }, [])

  /**
   * Escape hatch. Detection is the point of the machine, but a session that
   * cannot be started on demand is useless to film, so this skips straight to
   * the countdown and stops detection from interrupting the run.
   */
  const forceStart = useCallback(() => {
    const current = phaseRef.current
    if (current === 'RESULT' || current === 'COUNTDOWN' || current === 'CAPTURING') return
    manualRef.current = true
    cutsRef.current = []
    setCuts([])
    setCount(3)
    setPhase('COUNTDOWN')
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.code !== 'Enter') return
      e.preventDefault()
      forceStart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [forceStart])

  // BOOT -> SEARCHING once camera + model are both up
  useEffect(() => {
    if (phase === 'BOOT' && armed) setPhase('SEARCHING')
  }, [phase, armed])

  // SEARCHING -> DETECTED
  useEffect(() => {
    if (phase === 'SEARCHING' && armed && det.stable) setPhase('DETECTED')
  }, [phase, armed, det.stable])

  // DETECTED -> COUNTDOWN
  useEffect(() => {
    if (phase !== 'DETECTED') return
    // `?hold` parks the session on the detected state so the tracking
    // graphics can be looked at; SHOOT NOW still overrides it
    if (import.meta.env.DEV && new URLSearchParams(location.search).has('hold')) return
    const t = window.setTimeout(() => {
      setCount(3)
      setPhase('COUNTDOWN')
    }, READY_MS)
    return () => window.clearTimeout(t)
  }, [phase])

  // COUNTDOWN ticks, then the first cut
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return
    const t = window.setTimeout(() => {
      if (count > 1) {
        setCount((c) => c - 1)
      } else {
        setMeta(makeSessionMeta(scoreRef.current))
        shoot()
        setPhase('CAPTURING')
      }
    }, TICK_MS)
    return () => window.clearTimeout(t)
  }, [phase, count, shoot])

  // remaining cuts
  useEffect(() => {
    if (phase !== 'CAPTURING') return
    if (cuts.length >= CUTS) {
      const t = window.setTimeout(() => setPhase('RESULT'), 700)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(shoot, CUT_GAP_MS)
    return () => window.clearTimeout(t)
  }, [phase, cuts.length, shoot])

  /*
   * The pup left before we got going. Debounced hard: a Pomeranian that turns
   * its head, or a frame the model simply fluffs, must not tear down a run the
   * user is standing in front of. Only a sustained absence counts.
   */
  useEffect(() => {
    if (manualRef.current) return
    if (phase !== 'DETECTED' && phase !== 'COUNTDOWN') return
    if (det.present) return
    const t = window.setTimeout(() => setPhase('LOST'), ABORT_AFTER_MS)
    return () => window.clearTimeout(t)
  }, [phase, det.present])

  useEffect(() => {
    if (phase !== 'LOST') return
    const t = window.setTimeout(reset, LOST_MS)
    return () => window.clearTimeout(t)
  }, [phase, reset])

  return { phase, count, cuts, flash, meta, restart: reset, forceStart, totalCuts: CUTS }
}
