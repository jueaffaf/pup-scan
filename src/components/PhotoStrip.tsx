import { PixelPaw } from './PixelPaw'

export function PhotoStrip({ cuts, sessionId }: { cuts: string[]; sessionId: string }) {
  return (
    <div className="ps-strip">
      <div className="ps-strip__grid">
        {Array.from({ length: 4 }, (_, i) => (
          <div className="ps-strip__cut" key={i}>
            {cuts[i] && <img src={cuts[i]} alt={`cut ${i + 1}`} />}
          </div>
        ))}
      </div>
      <div className="ps-strip__caption">
        <span className="t-caption">THANK YOU!</span>
        <PixelPaw size={28} />
        <span className="t-value ps-strip__id">#{sessionId}</span>
      </div>
    </div>
  )
}
