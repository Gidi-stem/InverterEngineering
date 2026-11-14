/**
 * Dense linear solve A·x = b by LU decomposition with partial pivoting (row-major Float64Array).
 * Circuits in the lab have well under 100 unknowns, so a dense solver is simple and fast.
 * Returns null when the matrix is numerically singular.
 */
export function luSolve(A: Float64Array, b: Float64Array, n: number): Float64Array | null {
  const x = new Float64Array(b)
  let scale = 0
  for (let i = 0; i < n * n; i++) scale = Math.max(scale, Math.abs(A[i]))
  const tiny = Math.max(scale, 1) * 1e-14
  for (let c = 0; c < n; c++) {
    let piv = c
    let best = Math.abs(A[c * n + c])
    for (let r = c + 1; r < n; r++) {
      const v = Math.abs(A[r * n + c])
      if (v > best) {
        best = v
        piv = r
      }
    }
    if (best < tiny) return null
    if (piv !== c) {
      for (let k = 0; k < n; k++) {
        const t = A[c * n + k]
        A[c * n + k] = A[piv * n + k]
        A[piv * n + k] = t
      }
      const t = x[c]
      x[c] = x[piv]
      x[piv] = t
    }
    const d = A[c * n + c]
    for (let r = c + 1; r < n; r++) {
      const f = A[r * n + c] / d
      if (f === 0) continue
      for (let k = c; k < n; k++) A[r * n + k] -= f * A[c * n + k]
      x[r] -= f * x[c]
    }
  }
  for (let r = n - 1; r >= 0; r--) {
    let s = x[r]
    for (let k = r + 1; k < n; k++) s -= A[r * n + k] * x[k]
    x[r] = s / A[r * n + r]
  }
  return x
}
