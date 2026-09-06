import { useCallback, useRef } from 'react'
import type { DogBox } from '../types'
import { useAnimationLoop } from '../hooks/useAnimationLoop'

/**
 * Draws tracking graphics for the dog and nothing else. Runs on the shared
 * paint loop and writes straight to the DOM, so the box stays smooth without
 * re-rendering the app 60 times a second.
 */
export function DetectionOverlay({
  boxRef,
  videoRef,
  visible,
  score,
}: {
  boxRef: React.MutableRefObject<DogBox | null>
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
  visible: boolean
  score: number
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const frameRef = useRef<HTMLDivElement | null>(null)

  useAnimationLoop(
    useCallback(() => {
      const host = hostRef.current
      const frame = frameRef.current
      const video = videoRef.current
      if (!host || !frame || !video) return

      const box = boxRef.current
      if (!box || !visible) {
        frame.style.opacity = '0'
        return
      }

      const bw = host.clientWidth
      const bh = host.clientHeight
      const vw = video.videoWidth || 16
      const vh = video.videoHeight || 9

      // replicate object-fit: cover
      const scale = Math.max(bw / vw, bh / vh)
      const dw = vw * scale
      const dh = vh * scale
      const offX = (bw - dw) / 2
      const offY = (bh - dh) / 2
      const w = box.w * dw
      const h = box.h * dh
      const left = offX + box.x * dw
      const top = offY + box.y * dh

      frame.style.opacity = '1'
      frame.style.width = `${w}px`
      frame.style.height = `${h}px`
      // the preview is mirrored, so the box has to be mirrored with it
      frame.style.transform = `translate(${bw - left - w}px, ${top}px)`
    }, [boxRef, videoRef, visible]),
  )

  return (
    <div className="ps-track" ref={hostRef} aria-hidden>
      <div className="ps-track__frame" ref={frameRef}>
        <span className="ps-track__c ps-track__c--tl" />
        <span className="ps-track__c ps-track__c--tr" />
        <span className="ps-track__c ps-track__c--bl" />
        <span className="ps-track__c ps-track__c--br" />
        <span className="ps-track__outline" />
        <span className="ps-track__tag">
          <b className="t-field">DOG_01</b>
          <i className="t-value">{(score * 100).toFixed(1)}%</i>
        </span>
      </div>
    </div>
  )
}
