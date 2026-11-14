let cached: boolean | null = null

/** True when the browser can create a WebGL context (cached after the first check). */
export function hasWebGL(): boolean {
  if (cached !== null) return cached
  try {
    const c = document.createElement('canvas')
    cached = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    cached = false
  }
  return cached
}
