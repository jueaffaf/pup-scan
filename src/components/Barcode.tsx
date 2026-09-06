import { barsFromSeed } from '../utils/barcode'

export function Barcode({ seed, width = 240, height = 44 }: { seed: string; width?: number; height?: number }) {
  const bars = barsFromSeed(seed, width)
  let x = 0
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} shapeRendering="crispEdges" aria-hidden>
      {bars.map((b, i) => {
        const at = x
        x += Math.abs(b)
        return b > 0 ? <rect key={i} x={at} y={0} width={b} height={height} fill="currentColor" /> : null
      })}
    </svg>
  )
}
