import type { ReactNode } from 'react'

export function CameraViewport({
  videoRef,
  flash,
  children,
}: {
  videoRef: React.MutableRefObject<HTMLVideoElement | null>
  flash: boolean
  children?: ReactNode
}) {
  return (
    <section className="ps-camera">
      <video ref={videoRef} className="ps-camera__video" playsInline muted autoPlay />
      <span className="ps-camera__scrim" aria-hidden />

      <span className="ps-mark ps-mark--tl" aria-hidden />
      <span className="ps-mark ps-mark--br" aria-hidden />

      <span className="ps-live">
        <i className="ps-live__dot" aria-hidden />
        <span className="t-descriptor">CAMERA &bull; LIVE</span>
      </span>

      {children}
      {flash && <span className="ps-flash" aria-hidden />}
    </section>
  )
}
