import { Link } from 'react-router-dom'
import type { GateStatus } from '../../content/academy/gates'

/** Shown in a laboratory when a mandatory prerequisite course has not been passed. */
export function GateNotice({ status, activity }: { status: GateStatus; activity: string }) {
  return (
    <div className="panel mx-auto my-6 max-w-2xl space-y-3 p-5" role="alert" data-testid="practical-gate">
      <h2 className="text-lg font-semibold text-ink-100">Complete the prerequisite course{status.missing.length > 1 ? 's' : ''} first</h2>
      <p className="text-sm text-ink-300">
        {activity} is practical work on electrical systems. The programme requires {status.missing.map((m) => `${m.id} ${m.title}`).join(' and ')} to be passed before it, so that you work safely and understand what you are doing.
      </p>
      <ul className="space-y-1.5">
        {status.missing.map((m) => (
          <li key={m.id}>
            <Link to={`/academy/${m.id}`} className="inline-flex min-h-10 items-center rounded-md border border-signal-400 bg-signal-500 px-3.5 text-sm font-medium text-white hover:bg-signal-400" data-testid={`gate-course-${m.id}`}>
              Go to {m.id}: {m.title}
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-500">Reading the Component Library, exploring the 3D models and studying the academy lessons are always available.</p>
    </div>
  )
}
