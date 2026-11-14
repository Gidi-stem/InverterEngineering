import * as THREE from 'three'

/**
 * Shared PBR materials. Creating each once and reusing it keeps GPU memory and shader
 * compilations low, which matters on school laptops and tablets.
 */
const std = (color: string, metalness = 0, roughness = 0.6, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra })

export const MAT = {
  chassis: std('#7d8796', 0.5, 0.55),
  chassisInner: std('#5d6676', 0.45, 0.6),
  vent: std('#0d1018', 0.2, 0.9),
  /** Enclosure walls in X-ray view (cover removed): see-through so interior parts stay visible and clickable. */
  chassisXray: std('#8fa0b8', 0.3, 0.5, { transparent: true, opacity: 0.18, depthWrite: false }),
  aluminium: std('#c9d0d8', 0.85, 0.32),
  anodised: std('#2a2e36', 0.55, 0.42),
  copper: std('#c97a3e', 0.9, 0.28),
  enamel: std('#b0571f', 0.55, 0.32),
  tin: std('#d7dbe0', 0.9, 0.25),
  brass: std('#c8a548', 0.85, 0.3),
  steel: std('#a4abb4', 0.75, 0.38),
  blackPlastic: std('#1a1c21', 0, 0.55),
  greyPlastic: std('#8d939c', 0, 0.6),
  lightPlastic: std('#d9dde3', 0, 0.55),
  redPlastic: std('#c4262e', 0, 0.45),
  bluePlastic: std('#1f4fa6', 0, 0.45),
  brownPlastic: std('#7b4a24', 0, 0.5),
  greenPlastic: std('#2f8a3b', 0, 0.5),
  yellowPlastic: std('#e5c22e', 0, 0.5),
  beige: std('#d6c09a', 0, 0.6),
  ferrite: std('#2b2b2e', 0.15, 0.75),
  lamination: std('#666a72', 0.7, 0.42),
  ironPowder: std('#d9c43a', 0, 0.6),
  tape: std('#e8c43c', 0, 0.45),
  rubber: std('#121317', 0, 0.85),
  pcbBlue: std('#1c3f8f', 0, 0.55),
  pcbGreen: std('#1f6b3a', 0, 0.55),
  silverBand: std('#c9ccd1', 0.8, 0.3),
  filmYellow: std('#e1b02a', 0, 0.45),
  clear: std('#cfe3f0', 0, 0.15, { transparent: true, opacity: 0.45, depthWrite: false }),
  ledGreen: std('#2bd46d', 0, 0.3, { emissive: new THREE.Color('#2bd46d'), emissiveIntensity: 1.4 }),
  ledAmber: std('#ffae2b', 0, 0.3, { emissive: new THREE.Color('#ffae2b'), emissiveIntensity: 0.25 }),
  ledRed: std('#ff4b4b', 0, 0.3, { emissive: new THREE.Color('#ff4b4b'), emissiveIntensity: 0.15 }),
  marker: new THREE.MeshBasicMaterial({ color: '#ffd166' }),
  markerEarth: new THREE.MeshBasicMaterial({ color: '#3ddc97' }),
  markerControl: new THREE.MeshBasicMaterial({ color: '#6d93ff' }),
  hit: new THREE.MeshBasicMaterial({ visible: false }),
} as const

const labelMats = new Map<string, THREE.MeshStandardMaterial>()

/** Cached material carrying a canvas-drawn label (markings, silkscreen, nameplates). */
export function labelMaterial(key: string, texture: THREE.Texture, opts: { metalness?: number; roughness?: number; emissive?: boolean } = {}) {
  let m = labelMats.get(key)
  if (!m) {
    m = new THREE.MeshStandardMaterial({ map: texture, metalness: opts.metalness ?? 0, roughness: opts.roughness ?? 0.55 })
    if (opts.emissive) {
      m.emissive = new THREE.Color('#ffffff')
      m.emissiveMap = texture
      m.emissiveIntensity = 0.85
    }
    labelMats.set(key, m)
  }
  return m
}

const colourMats = new Map<string, THREE.MeshStandardMaterial>()
export function colourMaterial(hex: string, metalness = 0, roughness = 0.5) {
  const key = `${hex}|${metalness}|${roughness}`
  let m = colourMats.get(key)
  if (!m) colourMats.set(key, (m = std(hex, metalness, roughness)))
  return m
}
