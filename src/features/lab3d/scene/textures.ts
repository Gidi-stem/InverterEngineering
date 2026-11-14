import * as THREE from 'three'

/**
 * Canvas-generated textures for markings, silkscreen and labels. Everything is drawn locally,
 * so the lab needs no network access and no image assets.
 */
const cache = new Map<string, THREE.CanvasTexture>()
const FONT = '"IBM Plex Sans", "Segoe UI", Arial, sans-serif'
const MONO = '"JetBrains Mono", Consolas, monospace'

export function canvasTexture(key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void): THREE.CanvasTexture {
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  draw(ctx, w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  cache.set(key, t)
  return t
}

/** Device marking: centred lines of text on a coloured ground (e.g. "IRFP4468" on a TO-247 body). */
export function markingTexture(lines: string[], bg = '#1a1c21', fg = '#d8dde6', opts: { w?: number; h?: number; mono?: boolean; scale?: number } = {}) {
  const w = opts.w ?? 256
  const h = opts.h ?? 256
  return canvasTexture(`mark|${lines.join('/')}|${bg}|${fg}|${w}x${h}|${opts.mono}|${opts.scale}`, w, h, (ctx) => {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = fg
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const size = (opts.scale ?? 1) * Math.min(w / (Math.max(...lines.map((l) => l.length)) * 0.62), h / (lines.length * 1.35))
    ctx.font = `600 ${size}px ${opts.mono ? MONO : FONT}`
    lines.forEach((l, i) => ctx.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.25))
  })
}

/** Electrolytic sleeve: rating text plus a negative stripe of "−" signs centred at u = 0.75 (the −x side). */
export function capacitorSleeve(rating: string) {
  return canvasTexture(`sleeve|${rating}`, 512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#18294d'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#c9cfd8'
    ctx.fillRect(w * 0.68, 0, w * 0.14, h)
    ctx.fillStyle = '#18294d'
    ctx.font = `700 34px ${FONT}`
    ctx.textAlign = 'center'
    for (let y = 26; y < h; y += 40) ctx.fillText('−', w * 0.75, y + 12)
    ctx.save()
    ctx.translate(w * 0.27, h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = '#e6eaf0'
    ctx.font = `600 30px ${FONT}`
    rating.split(' ').forEach((part, i, arr) => ctx.fillText(part, 0, (i - (arr.length - 1) / 2) * 36))
    ctx.restore()
  })
}

/** Lamination edges: fine lines showing the stacked steel plates. */
export function laminationTexture() {
  return canvasTexture('lamination', 256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#6a6e76'
    ctx.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? '#5a5e65' : '#767a82'
      ctx.fillRect(0, y, w, 2)
    }
  })
}

/** PCB: solder mask with copper traces, pads, mounting holes and white silkscreen designators. */
export function pcbTexture(key: string, size: [number, number], colour: 'green' | 'blue', silk: { at: [number, number]; text: string }[]) {
  const px = 48
  const W = Math.min(2048, Math.round(size[0] * px))
  const H = Math.min(2048, Math.round(size[1] * px))
  return canvasTexture(`pcb|${key}`, W, H, (ctx) => {
    const sx = W / size[0]
    const sz = H / size[1]
    const toPx = (x: number, z: number): [number, number] => [(x + size[0] / 2) * sx, (z + size[1] / 2) * sz]
    ctx.fillStyle = colour === 'green' ? '#1d6a39' : '#1b3c88'
    ctx.fillRect(0, 0, W, H)
    // Copper pours and traces (deterministic layout derived from designator positions).
    ctx.strokeStyle = colour === 'green' ? '#3f8f4f' : '#3a5fae'
    ctx.lineCap = 'round'
    silk.forEach((s, i) => {
      const [x, y] = toPx(s.at[0], s.at[1])
      const n = silk[(i + 1) % silk.length]
      const [x2, y2] = toPx(n.at[0], n.at[1])
      ctx.lineWidth = i % 3 === 0 ? 14 : 5
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, (y + y2) / 2)
      ctx.lineTo(x2, (y + y2) / 2)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    })
    // Mounting holes with plated rings.
    for (const [hx, hz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const [x, y] = toPx(hx * (size[0] / 2 - 0.45), hz * (size[1] / 2 - 0.45))
      ctx.fillStyle = '#d7dbe0'
      ctx.beginPath()
      ctx.arc(x, y, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#20242c'
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#f2f4f7'
    ctx.font = `600 18px ${MONO}`
    ctx.textAlign = 'center'
    for (const s of silk) {
      const [x, y] = toPx(s.at[0], s.at[1])
      ctx.fillText(s.text, x, y)
    }
  })
}

/** LCD screen showing live readings. */
export function lcdTexture(lines: string[]) {
  return canvasTexture(`lcd|${lines.join('/')}`, 512, 240, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#0d2a3a')
    g.addColorStop(1, '#0a1f2c')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#7ff0ff'
    ctx.font = `600 40px ${MONO}`
    ctx.textBaseline = 'middle'
    lines.forEach((l, i) => ctx.fillText(l, 24, 48 + i * 58))
  })
}

/** Green/yellow striped sleeve for protective-earth conductors. */
export function earthStripeTexture() {
  return canvasTexture('earth-stripe', 64, 256, (ctx, w, h) => {
    for (let y = 0; y < h; y += 32) {
      ctx.fillStyle = (y / 32) % 2 === 0 ? '#2e9d44' : '#e6cf2a'
      ctx.fillRect(0, y, w, 32)
    }
  })
}
