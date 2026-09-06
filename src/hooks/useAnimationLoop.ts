import { useEffect, useRef } from 'react'

/**
 * requestAnimationFrame with a timer backstop. rAF is paused outright when the
 * window is occluded or the tab is throttled, which would freeze the tracking
 * graphics mid-session. The interval keeps things moving at a coarser rate;
 * when rAF is healthy it does virtually all of the work.
 */
export function useAnimationLoop(callback: () => void) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    let raf = 0
    let lastRun = 0

    const run = () => {
      lastRun = performance.now()
      cbRef.current()
    }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      run()
    }
    raf = requestAnimationFrame(tick)

    // only fires when rAF has gone quiet
    const backstop = window.setInterval(() => {
      if (performance.now() - lastRun > 100) run()
    }, 60)

    return () => {
      cancelAnimationFrame(raf)
      window.clearInterval(backstop)
    }
  }, [])
}
