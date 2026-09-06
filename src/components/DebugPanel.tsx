import type { RawPrediction } from '../hooks/useDogDetection'

/** Dev-only readout of what the model is actually seeing, so thresholds can
 *  be tuned against the real room and the real dog rather than guessed. */
export function DebugPanel({
  preds,
  misses,
  present,
  stable,
  modelBase,
}: {
  preds: RawPrediction[]
  misses: number
  present: boolean
  stable: boolean
  modelBase: string
}) {
  return (
    <div className="ps-debug">
      <span className="ps-debug__title">MODEL RAW · {modelBase || 'loading'}</span>
      {preds.length === 0 && <span className="ps-debug__row">— nothing above 0.20 —</span>}
      {preds.map((p, i) => (
        <span key={i} className={`ps-debug__row ${p.accepted ? 'is-dog' : ''}`}>
          <b>{p.label}</b>
          <i>{p.score.toFixed(3)}</i>
        </span>
      ))}
      <span className="ps-debug__gate">
        present {String(present)} · stable {String(stable)} · misses {misses}
      </span>
    </div>
  )
}
