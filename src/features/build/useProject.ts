import { useMemo } from 'react'
import { BUILD_PROJECT_BY_ID, DEFAULT_SELECTION, type BuildProject } from '../../content/buildProjects'
import { calculate } from '../../engine/design/calc'
import { checkCompatibility } from '../../engine/design/compat'
import { generateProject, type ProjectBuild } from '../../engine/design/generate'
import type { SuiteContext } from '../../engine/design/testing'
import type { CalcItem, CompatCheck, DesignNumbers, DesignSpec, Selection } from '../../engine/design/types'
import { useBuildLab } from './buildStore'

export interface ProjectModel {
  project: BuildProject
  design: DesignSpec
  sel: Selection
  items: CalcItem[]
  numbers: DesignNumbers
  compat: CompatCheck[]
  build: ProjectBuild
  ctx: SuiteContext
}

/** Everything derived from one project's design and selection (pure functions of the stored inputs). */
export function modelOf(project: BuildProject, design: DesignSpec, sel: Selection): ProjectModel {
  const { items, numbers } = calculate(project.id, design, sel)
  const compat = checkCompatibility(project.id, design, sel, numbers)
  const build = generateProject(project.id, design, sel, numbers)
  const ctx: SuiteContext = { projectId: project.id, design, numbers, build: { probes: build.probes, simStep: build.simStep }, regulated: design.waveform === 'sine' && sel.vsensor, waveform: design.waveform }
  return { project, design, sel, items, numbers, compat, build, ctx }
}

export function useProject(id: string | null): ProjectModel | null {
  const project = id ? (BUILD_PROJECT_BY_ID[id] ?? null) : null
  const storedDesign = useBuildLab((s) => (id ? s.design[id] : undefined))
  const storedSel = useBuildLab((s) => (id ? s.selection[id] : undefined))
  return useMemo(() => (project ? modelOf(project, storedDesign ?? project.defaults, storedSel ?? DEFAULT_SELECTION) : null), [project, storedDesign, storedSel])
}
