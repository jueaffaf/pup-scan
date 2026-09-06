const CUT = 720

/** Grab one square, mirrored, lightly desaturated cut from the live video. */
export function captureCut(video: HTMLVideoElement): string {
  const canvas = document.createElement('canvas')
  canvas.width = CUT
  canvas.height = CUT
  const ctx = canvas.getContext('2d')!

  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh || video.readyState < 2) return placeholderCut(ctx, CUT)
  const side = Math.min(vw, vh)
  const sx = (vw - side) / 2
  const sy = (vh - side) / 2

  ctx.save()
  ctx.translate(CUT, 0)
  ctx.scale(-1, 1) // match the mirrored preview
  ctx.drawImage(video, sx, sy, side, side, 0, 0, CUT, CUT)
  ctx.restore()

  desaturate(ctx, CUT, CUT)
  return canvas.toDataURL('image/jpeg', 0.92)
}

function placeholderCut(ctx: CanvasRenderingContext2D, size: number): string {
  const g = ctx.createLinearGradient(0, 0, 0, size)
  g.addColorStop(0, '#8d8a87')
  g.addColorStop(1, '#5d5a58')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = '500 34px "Space Grotesk", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('NO SIGNAL', size / 2, size / 2)
  return ctx.canvas.toDataURL('image/jpeg', 0.9)
}

function desaturate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const img = ctx.getImageData(0, 0, w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const g = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
    // keep a trace of colour so skin/fur doesn't go dead flat
    d[i] = g * 0.9 + d[i] * 0.1
    d[i + 1] = g * 0.9 + d[i + 1] * 0.1
    d[i + 2] = g * 0.9 + d[i + 2] * 0.1
  }
  ctx.putImageData(img, 0, 0)
}

/** Compose the four cuts into one printable sheet and hand it to the user. */
export async function exportStrip(cuts: string[], sessionId: string) {
  const M = 60
  const G = 40
  const cell = 620
  const capH = 110
  const W = M * 2 + cell * 2 + G
  const H = M * 2 + cell * 2 + G + capH

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#faf8f5'
  ctx.fillRect(0, 0, W, H)

  const images = await Promise.all(cuts.map(loadImage))
  images.forEach((img, i) => {
    const cx = M + (i % 2) * (cell + G)
    const cy = M + Math.floor(i / 2) * (cell + G)
    ctx.drawImage(img, cx, cy, cell, cell)
  })

  ctx.fillStyle = '#161519'
  ctx.font = '500 30px "Space Grotesk", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('THANK YOU!   PUP.SCAN #' + sessionId, W / 2, H - M - 18)

  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `pupscan-${sessionId}.png`
  a.click()
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/* ---------------------------------------------------------------------- */

/**
 * Draw the enlarged profile ticket to a canvas and hand it over. Drawn rather
 * than screenshotted so it exports the ticket itself, not the blurred 05
 * background it happens to be sitting on.
 */
export async function exportProfile(input: {
  id: string
  date: string
  time: string
  confidence: number
  rows: Array<[string, string]>
  scores: Array<[string, number]>
  classification: string[]
  bars: number[]
  paw: string[]
}) {
  const S = 2 // draw at 2x for a crisp print
  const W = 380 * S
  const PAD = 34 * S
  const COL = W - PAD * 2

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = 1720 * S // trimmed to the real content height at the end
  const ctx = canvas.getContext('2d')!
  const font = (size: number, weight = 500) =>
    `${weight} ${size * S}px "Space Grotesk", Arial, sans-serif`

  ctx.fillStyle = '#faf8f5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  let y = 74 * S
  const line = (h: number) => (y += h * S)

  const kv = (k: string, v: string) => {
    ctx.font = font(12)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#89847e'
    ctx.fillText(k, PAD, y)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#161519'
    ctx.fillText(v, W - PAD, y)
    line(19)
  }
  const rule = () => {
    ctx.fillStyle = '#d8d5d1'
    ctx.fillRect(PAD, y - 5 * S, COL, 1 * S)
    line(15)
  }

  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
  ctx.fillStyle = '#161519'
  ctx.font = font(15, 700)
  ctx.fillText('PUP.SCAN DOG PROFILE', PAD, y)
  line(22)
  kv('PUP ID', `#${input.id}`)
  rule()
  kv('DATE', input.date)
  kv('TIME', input.time)
  rule()
  kv('PRIMARY SUBJECT', 'DOG')
  kv('DETECTION CONFIDENCE', `${(input.confidence * 100).toFixed(1)}%`)
  rule()
  for (const [k, v] of input.rows) kv(k, v)
  rule()
  for (const [k, v] of input.scores) {
    kv(k, `${v}%`)
    ctx.fillStyle = '#d8d5d1'
    ctx.fillRect(PAD, y - 12 * S, COL, 5 * S)
    ctx.fillStyle = '#161519'
    ctx.fillRect(PAD, y - 12 * S, (COL * v) / 100, 5 * S)
    line(14)
  }
  rule()

  ctx.textAlign = 'left'
  ctx.fillStyle = '#89847e'
  ctx.font = font(11)
  ctx.fillText('PUP ID', PAD, y)
  line(20)
  ctx.fillStyle = '#161519'
  ctx.font = font(16, 700)
  ctx.fillText(`#${input.id}`, PAD, y)
  line(26)
  ctx.fillStyle = '#89847e'
  ctx.font = font(11)
  ctx.fillText('CLASSIFICATION', PAD, y)
  line(26)
  ctx.fillStyle = '#161519'
  ctx.font = font(23, 700)
  for (const l of input.classification) {
    ctx.fillText(l, PAD, y)
    line(25)
  }
  line(18)

  ctx.textAlign = 'center'
  ctx.font = font(22, 700)
  for (const l of ['CERTIFIED', 'VERY GOOD DOG']) {
    ctx.fillText(l, W / 2, y)
    line(26)
  }
  line(16)

  // barcode
  let bx = PAD
  for (const b of input.bars) {
    if (b > 0) {
      ctx.fillStyle = '#161519'
      ctx.fillRect(bx, y, b * S, 32 * S)
    }
    bx += Math.abs(b) * S
  }
  line(32 + 22)

  ctx.fillStyle = '#89847e'
  ctx.font = font(11)
  ctx.fillText('AUTHORIZED COMPANION: HUMAN', W / 2, y)
  line(30)

  // THANK YOU! + the pixel paw, drawn from the same grid the screen uses
  const cols = input.paw[0].length
  const px = 1.15 * S
  const pawW = cols * px
  ctx.font = font(12)
  const label = 'THANK YOU!'
  const labelW = ctx.measureText(label).width
  const groupX = (W - (labelW + 12 * S + pawW)) / 2
  ctx.textAlign = 'left'
  ctx.fillStyle = '#161519'
  ctx.fillText(label, groupX, y)
  const pawX = groupX + labelW + 12 * S
  const pawY = y - input.paw.length * px + 3 * S
  input.paw.forEach((row, ry) => {
    for (let cx = 0; cx < cols; cx++) {
      if (row[cx] === '#') ctx.fillRect(pawX + cx * px, pawY + ry * px, px, px)
    }
  })
  line(30)

  // trim to what was actually drawn
  const out = document.createElement('canvas')
  out.width = W
  out.height = Math.round(y)
  const octx = out.getContext('2d')!
  octx.fillStyle = '#faf8f5'
  octx.fillRect(0, 0, out.width, out.height)
  octx.drawImage(canvas, 0, 0)

  const a = document.createElement('a')
  a.href = out.toDataURL('image/png')
  a.download = `pupscan-profile-${input.id}.png`
  a.click()
}
