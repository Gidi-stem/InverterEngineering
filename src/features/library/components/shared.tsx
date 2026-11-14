import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../../../store/progressStore'
import type { ElectronicComponent } from '../../../types/domain'
import type { LearnerLevel } from '../../../types/progress'
import { LEVELS } from '../logic/format'


/** Shared learner-level selector (stored in progress, so it matches the 3D lab). */
export function LevelSelector() {
  const level = useProgress((s) => s.level)
  const setLevel = useProgress((s) => s.setLevel)
  return (
    <div role="radiogroup" aria-label="Learning level" className="flex rounded-md border border-chassis-600 bg-chassis-950 p-0.5">
      {LEVELS.map((l) => (
        <button key={l.id} type="button" role="radio" aria-checked={level === l.id} onClick={() => setLevel(l.id)} className={`min-h-9 rounded px-3 text-xs font-medium ${level === l.id ? 'bg-signal-500 text-white' : 'text-ink-400 hover:text-ink-100'}`}>
          {l.label}
        </button>
      ))}
    </div>
  )
}

/** The same component explained at three depths; opens at the learner's level. */
export function ExplanationLevels({ c }: { c: ElectronicComponent }) {
  const level = useProgress((s) => s.level)
  const [tab, setTab] = useState<LearnerLevel | null>(null)
  const active = tab ?? level
  const text: Record<LearnerLevel, { heading: string; body: string[] }> = {
    beginner: { heading: 'In plain words', body: [c.plainSummary] },
    intermediate: { heading: 'How it works', body: [c.function, c.operatingPrinciple] },
    advanced: { heading: 'Design and selection', body: [c.advancedNote] },
  }
  return (
    <div>
      <div role="tablist" aria-label="Explanation level" className="inline-flex rounded-md bg-chassis-950 p-1">
        {LEVELS.map((l) => (
          <button key={l.id} type="button" role="tab" aria-selected={active === l.id} onClick={() => setTab(l.id)} className={`min-h-8 rounded px-3 text-xs ${active === l.id ? 'bg-chassis-700 text-ink-100' : 'text-ink-400 hover:text-ink-100'}`}>
            {l.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="mt-3 rounded-md border border-chassis-700 bg-chassis-900/60 p-4">
        <h3 className="text-xs font-semibold text-signal-300">{text[active].heading}</h3>
        {text[active].body.map((b) => (
          <p key={b.slice(0, 24)} className="mt-2 text-[15px] leading-relaxed text-ink-100">
            {b}
          </p>
        ))}
      </div>
    </div>
  )
}

export function Breadcrumb({ trail }: { trail: { to?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink-500">
      {trail.map((t, i) => (
        <span key={t.label}>
          {i > 0 && ' / '}
          {t.to ? (
            <Link to={t.to} className="hover:text-ink-300">
              {t.label}
            </Link>
          ) : (
            <span className="text-ink-300">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

