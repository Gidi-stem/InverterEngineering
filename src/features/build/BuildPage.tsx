import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BUILD_PROJECTS } from '../../content/buildProjects'
import { useProgress } from '../../store/progressStore'
import { Panel, SafetyNotice, Tag } from '../../ui/primitives'
import { useBuildLab } from './buildStore'
import { snapshot } from '../../store/progressStore'
import { gateStatus } from '../../content/academy/gates'

/** Build Your Own Inverter: the eight construction projects (each opens in the circuit laboratory). */
export default function BuildPage() {
  const visit = useProgress((s) => s.visitModule)
  const done = useProgress((s) => s.completedProjects)
  const suites = useBuildLab((s) => s.suites)
  const gate = gateStatus(snapshot(useProgress()), 'build')
  useEffect(() => {
    visit('build')
  }, [visit])
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
      <nav aria-label="Breadcrumb" className="mb-1 text-xs text-ink-500">
        <Link to="/" className="hover:text-ink-300">
          Dashboard
        </Link>{' '}
        / <span className="text-ink-300">Build Your Own Inverter</span>
      </nav>
      <h1 className="text-[26px] font-semibold">Build Your Own Inverter</h1>
      <p className="mt-1 max-w-3xl text-ink-400">
        Eight construction projects, from a bare H-bridge to a hybrid inverter. Each project is designed in a configurator that explains every calculation. Components are chosen against compatibility checks, and the circuit is assembled step by step. Every step is verified on the electrical connection graph, and the finished design is put through an engineering test suite in the simulator. Completion is awarded for correct connections and verified electrical behaviour, never for placement alone.
      </p>
      <div className="mt-4 space-y-2">
        <SafetyNotice tone="danger">
          <strong>Simulated only.</strong> Every mains-voltage (110/230 V) and high-voltage DC circuit in these projects exists only in the simulator. The designs are educational estimates, not certified construction designs. Real mains equipment must be designed, built and tested by qualified people to the applicable standards.
        </SafetyNotice>
        <p className="text-sm text-ink-400">
          These projects are the practical tasks of course{' '}
          <Link to="/academy/S1" className="text-signal-300 hover:underline">
            S1 Inverter Design and Construction
          </Link>{' '}
          in the Learning Academy, where each one is taught first.
        </p>
      </div>
      {!gate.open && (
        <div className="mt-4 rounded-md border border-caution-400/40 bg-caution-400/8 p-3 text-sm text-ink-300" data-testid="build-gate">
          Construction projects open after you pass {gate.missing.map((m, i) => (
            <span key={m.id}>
              {i > 0 && ' and '}
              <Link to={`/academy/${m.id}`} className="text-signal-300 underline">
                {m.id} {m.title}
              </Link>
            </span>
          ))}
          .
        </div>
      )}
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-testid="project-list">
        {BUILD_PROJECTS.map((p) => {
          const complete = done.includes(p.id)
          const tested = !!suites[p.id]
          return (
            <li key={p.id}>
              <Panel className="h-full">
                <div className="flex h-full flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="readout text-2xl font-semibold text-signal-300">{p.letter}</span>
                    <Tag tone={complete ? 'live' : tested ? 'signal' : 'neutral'}>{complete ? 'Complete' : tested ? 'Tested' : p.level}</Tag>
                  </div>
                  <h2 className="font-semibold text-ink-100">{p.title}</h2>
                  <p className="flex-1 text-xs text-ink-400">{p.summary}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.hazardous ? <Tag tone="danger">Mains / HV: simulated</Tag> : <Tag tone="live">Low voltage</Tag>}
                  </div>
                  <Link to={`/circuit-lab?ex=${p.id}`} className="mt-1 inline-flex min-h-10 items-center justify-center rounded-md border border-signal-400 bg-signal-500 px-3 text-sm font-medium text-white hover:bg-signal-400" data-testid={`open-${p.id}`}>
                    {complete ? 'Open project' : 'Start project'}
                  </Link>
                </div>
              </Panel>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
