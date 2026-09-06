/**
 * Pixel paw print, traced 1:1 from the 28x27 reference art in Figma
 * (node 122:252) at its own resolution — 28 columns, 25 rows once the empty
 * top and bottom rows are dropped. Rendered as one <rect> per horizontal run
 * so it stays crisp at any size.
 */
export const PAW_GRID = [
  '........####....###.........',
  '.......#####...#####........',
  '.......#####...#####........',
  '.......######.######........',
  '.......######.######........',
  '..##...######.######...##...',
  '.###...######.######...###..',
  '.####...#####.#####...####..',
  '.#####..#####..####...####..',
  '.#####...###....##....#####.',
  '.######.............#######.',
  '.######..#########..#######.',
  '..####..###########...###...',
  '..###...###########...###...',
  '...#...#############...#....',
  '.......#############........',
  '......################......',
  '.....##################.....',
  '....###################.....',
  '....###################.....',
  '....###################.....',
  '....###################.....',
  '......################......',
  '.......#####...######.......',
  '.......#####....####........',
]

export const PAW_COLS = 28
const GRID = PAW_GRID
const COLS = PAW_COLS
const ROWS = GRID.length

export function PixelPaw({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round((size * ROWS) / COLS)}
      viewBox={`0 0 ${COLS} ${ROWS}`}
      shapeRendering="crispEdges"
      aria-hidden
    >
      {GRID.flatMap((row, y) => {
        const rects: JSX.Element[] = []
        let x = 0
        while (x < COLS) {
          if (row[x] === '#') {
            let run = 1
            while (row[x + run] === '#') run++
            rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill="currentColor" />)
            x += run
          } else x++
        }
        return rects
      })}
    </svg>
  )
}
