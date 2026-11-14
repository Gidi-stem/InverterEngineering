import type * as THREE from 'three'

/** Live Object3D for each part, used by the camera rig to frame selections and by browser tests. */
export const partObjects = new Map<string, THREE.Object3D>()
