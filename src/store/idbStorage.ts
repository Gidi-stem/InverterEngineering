import type { StateStorage } from 'zustand/middleware'
import { del, get, set } from 'idb-keyval'

/** IndexedDB-backed storage with in-memory fallback (private mode / sandboxed frames). */
const memory = new Map<string, string>()
export const idbStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return (await get<string>(name)) ?? memory.get(name) ?? null
    } catch {
      return memory.get(name) ?? null
    }
  },
  setItem: async (name, value) => {
    memory.set(name, value)
    try {
      await set(name, value)
    } catch {
      /* storage unavailable: keep in memory for this session */
    }
  },
  removeItem: async (name) => {
    memory.delete(name)
    try {
      await del(name)
    } catch {
      /* ignore */
    }
  },
}
