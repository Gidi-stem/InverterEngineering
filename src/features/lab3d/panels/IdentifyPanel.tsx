import { useEffect, useState } from 'react'
import { PANEL_ENTRY_BY_ID } from '../../../content/components'
import { useProgress } from '../../../store/progressStore'
import type { InverterModel } from '../../../types/domain'
import { Button, Meter } from '../../../ui/primitives'
import { ATTEMPTS, CHALLENGE_SIZE, PASS_FRACTION, countsAsAssessment, buildChallenge } from '../logic/identify'
import { useLab } from '../store/labStore'

const DESCRIPTION = {
  beginner: `${CHALLENGE_SIZE.beginner} large, distinctive parts, named in the prompt with a hint. Unlimited attempts.`,
  intermediate: `${CHALLENGE_SIZE.intermediate} parts described only by what they do. ${ATTEMPTS.intermediate} attempts each.`,
  advanced: `${CHALLENGE_SIZE.advanced} parts by name, one attempt each, no labels. Scored as practical assessment asm-01 (pass ${PASS_FRACTION * 100} %).`,
}

export function IdentifyPanel({ model }: { model: InverterModel }) {
  const level = useProgress((s) => s.level)
  const c = useLab((s) => s.challenge)
  const start = useLab((s) => s.startChallenge)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!c || c.finishedAt) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [c])

  if (!c) {
    const available = buildChallenge(model, level, 1).length
    const willAssess = countsAsAssessment(model, level, available)
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink-100">Component identification challenge</h3>
        <p className="text-sm text-ink-300">
          <span className="font-medium capitalize text-ink-100">{level}:</span> {DESCRIPTION[level]}
        </p>
        {level === 'advanced' && !willAssess && <p className="text-xs text-caution-400">This model has {available} distinct components, so this run is practice only. Use the LF-3K for the 20-component assessment.</p>}
        <p className="text-xs text-ink-500">Correctly identified components count towards your “Components identified” progress. Change level at the top of the lab.</p>
        <Button variant="primary" onClick={start}>
          Start challenge
        </Button>
      </div>
    )
  }

  const prompt = c.prompts[c.index]
  const score = c.results.filter(Boolean).length
  const elapsed = Math.round(((c.finishedAt ?? now) - c.startedAt) / 1000)

  if (c.finishedAt) {
    const pct = Math.round((100 * score) / c.prompts.length)
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink-100">Results</h3>
        <div className="flex items-baseline gap-3">
          <span className="readout text-3xl text-ink-100">
            {score}/{c.prompts.length}
          </span>
          <span className="text-sm text-ink-400">
            {pct}% in {elapsed}s
          </span>
        </div>
        {c.assessed && <p className={`text-sm ${pct >= PASS_FRACTION * 100 ? 'text-live-400' : 'text-caution-400'}`}>Recorded as assessment asm-01: {pct >= PASS_FRACTION * 100 ? 'pass' : 'not yet passed (50 % needed)'}.</p>}
        <ol className="flex flex-col divide-y divide-chassis-700 text-sm">
          {c.prompts.map((p, i) => (
            <li key={i} className="flex items-start gap-2 py-1.5">
              <span className={c.results[i] ? 'text-live-400' : 'text-danger-400'} aria-label={c.results[i] ? 'correct' : 'incorrect'}>
                {c.results[i] ? '✓' : '✗'}
              </span>
              <span className="text-ink-300">{PANEL_ENTRY_BY_ID[p.componentId].name}</span>
            </li>
          ))}
        </ol>
        <Button variant="primary" onClick={start}>
          Try again
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-1 flex justify-between text-xs text-ink-400">
          <span>
            Prompt {c.index + 1} of {c.prompts.length}
          </span>
          <span className="readout">
            {score} correct · {elapsed}s
          </span>
        </div>
        <Meter value={c.index / c.prompts.length} label="Challenge progress" />
      </div>
      <p className="rounded-lg border border-signal-500/40 bg-signal-500/10 p-3 text-base text-ink-100" aria-live="polite">
        {prompt.text}
      </p>
      {prompt.hint && <p className="text-sm text-ink-400">Hint: {prompt.hint}</p>}
      <p className="text-xs text-ink-500">{Number.isFinite(c.attemptsLeft) ? `${c.attemptsLeft} attempt${c.attemptsLeft === 1 ? '' : 's'} left for this prompt.` : 'Unlimited attempts.'} Rotate, zoom and use the explode slider in Explore mode first if you need to study the layout.</p>
    </div>
  )
}
