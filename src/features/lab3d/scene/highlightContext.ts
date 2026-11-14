import { createContext } from 'react'

export type Highlight = 'none' | 'hover' | 'selected' | 'target' | 'wrong'

/** Highlight state of the enclosing part; every mesh in the part outlines itself accordingly. */
export const HighlightContext = createContext<Highlight>('none')
