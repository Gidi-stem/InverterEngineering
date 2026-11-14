/**
 * Package and part dimensions in model units (1 unit = 10 mm), shared by the 3D builders
 * and the terminal-position tables so pins always appear where the geometry puts them.
 * Package values follow JEDEC outlines (TO-247, SOIC-8, DIP-16, LQFP-64) and DO-201AD.
 */
export const TO247 = { w: 1.56, bodyH: 2.0, t: 0.5, leadL: 1.2, tabAbove: 0.55, pitch: 0.545, holeY: 0.3 }
export const SOIC8 = { l: 0.49, w: 0.39, h: 0.15, pitch: 0.127, reach: 0.11 }
export const DIP16 = { l: 1.93, w: 0.65, h: 0.33, pitch: 0.254, row: 0.762, standoff: 0.05 }
export const LQFP64 = { l: 1.0, h: 0.14, pitch: 0.05, reach: 0.1, perSide: 16 }
export const DO201 = { len: 0.95, d: 0.53, span: 1.5, lift: 0.5 }
export const AXIAL_R = { len: 1.2, d: 0.45, span: 2.0, lift: 0.45 }
export const SNAPIN_PITCH = 1.0
export const RELAY = { size: [3.3, 2.8, 2.7] as const }
export const MEGA = { len: 6, lugX: 2.55, h: 0.6 }
export const BREAKER = { w: 3.6, h: 8.5, d: 6.5 }
export const HALL = { size: [2.2, 1.8, 1.1] as const, pinPitch: 0.25 }
export const VSENSE = { w: 3.0, d: 2.2 }
export const BATT_TERM = { studTop: 2.4 }
export const DC_LUGS = { gap: 1.8, h: 0.8 }
export const AC_BLOCK = { pitch: 1.05, h: 1.5 }
export const MC4 = { top: 2.5 }
export const DISPLAY = { w: 9, h: 5 }
export const PE_STUD = { top: 1.5 }
export const FAN_WIRE = 1.6
