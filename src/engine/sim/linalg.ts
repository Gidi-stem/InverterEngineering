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

/** LU factors of a matrix (row-major, with the row permutation), reusable for many right-hand sides. */
export interface LuFactors {
  n: number
  lu: Float64Array
  perm: Int32Array
}

/** Factor A in place (copy first if needed). Returns null when singular. */
export function luFactor(A: Float64Array, n: number): LuFactors | null {
  const perm = new Int32Array(n)
  for (let i = 0; i < n; i++) perm[i] = i
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
      const t = perm[c]
      perm[c] = perm[piv]
      perm[piv] = t
    }
    const d = A[c * n + c]
    for (let r = c + 1; r < n; r++) {
      const f = A[r * n + c] / d
      A[r * n + c] = f
      if (f === 0) continue
      for (let k = c + 1; k < n; k++) A[r * n + k] -= f * A[c * n + k]
    }
  }
  return { n, lu: A, perm }
}

/** Solve with precomputed factors: O(n²). */
export function luApply(f: LuFactors, b: Float64Array): Float64Array {
  const { n, lu, perm } = f
  const x = new Float64Array(n)
  for (let i = 0; i < n; i++) {
    let s = b[perm[i]]
    for (let k = 0; k < i; k++) s -= lu[i * n + k] * x[k]
    x[i] = s
  }
  for (let i = n - 1; i >= 0; i--) {
    let s = x[i]
    for (let k = i + 1; k < n; k++) s -= lu[i * n + k] * x[k]
    x[i] = s / lu[i * n + i]
  }
  return x
}
