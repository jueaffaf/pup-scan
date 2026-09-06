function ScanIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
      <circle cx="13" cy="13" r="4.5" stroke="currentColor" strokeWidth="1.1" />
      {[
        'M0 .55h7M.55 0v7',
        'M26 .55h-7M25.45 0v7',
        'M0 25.45h7M.55 26v-7',
        'M26 25.45h-7M25.45 26v-7',
      ].map((d) => (
        <path key={d} d={d} stroke="currentColor" strokeWidth="1.1" />
      ))}
    </svg>
  )
}

export function StatusOverlay({
  headline,
  caption,
  progress,
}: {
  headline: string
  caption?: string
  progress?: number
}) {
  const SEGMENTS = 22
  const filled = progress === undefined ? 0 : Math.round(progress * SEGMENTS)
  return (
    <div className="ps-status">
      <ScanIcon />
      <div className="ps-status__stack">
        <span className="t-editorial ps-status__headline">{headline}</span>
        {caption && <span className="t-caption ps-status__caption">{caption}</span>}
        {progress !== undefined && (
          <span className="ps-progress" aria-hidden>
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <i key={i} className={i < filled ? 'is-on' : undefined} />
            ))}
          </span>
        )}
      </div>
    </div>
  )
}
