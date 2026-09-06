import type { Phase } from '../types'

const TITLE: Record<Phase, string> = {
  BOOT: '00 BOOT',
  SEARCHING: '01 SEARCHING',
  DETECTED: '02 DOG DETECTED',
  COUNTDOWN: '03 COUNTDOWN',
  CAPTURING: '03 COUNTDOWN',
  LOST: '01 SEARCHING',
  RESULT: '04 RESULT',
}

export function StateRow({
  phase,
  readout,
  title,
  onClose,
}: {
  phase: Phase
  readout: string
  /** Overrides the phase title — 05 PUP PROFILE is a view, not a phase. */
  title?: string
  onClose?: () => void
}) {
  return (
    <div className="ps-state">
      <span className="t-editorial">{title ?? TITLE[phase]}</span>
      <span className="ps-state__right">
        <span className="t-readout">{readout}</span>
        <span className="ps-dots" aria-hidden>
          <i /><i /><i />
        </span>
        {onClose && (
          <button className="ps-close" onClick={onClose}>
            <span className="t-nav">CLOSE</span>
            <span className="ps-close__x" aria-hidden>&times;</span>
          </button>
        )}
      </span>
    </div>
  )
}
