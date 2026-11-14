import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Panel({ title, action, children, className = '' }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-chassis-700 px-4 py-3">
          {title && <h2 className="text-sm font-semibold text-ink-100">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-signal-500 text-white hover:bg-signal-400 border-signal-400',
  secondary: 'bg-chassis-800 text-ink-100 hover:bg-chassis-700 border-chassis-600',
  danger: 'bg-danger-400/10 text-danger-400 hover:bg-danger-400/20 border-danger-400/40',
  ghost: 'bg-transparent text-ink-300 hover:text-ink-100 hover:bg-chassis-800 border-transparent',
}

export function Button({ variant = 'secondary', className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
    />
  )
}

type Tone = 'neutral' | 'signal' | 'live' | 'caution' | 'danger'
const TONES: Record<Tone, string> = {
  neutral: 'bg-chassis-700 text-ink-300 border-chassis-600',
  signal: 'bg-signal-500/15 text-signal-300 border-signal-500/30',
  live: 'bg-live-400/12 text-live-400 border-live-400/30',
  caution: 'bg-caution-400/12 text-caution-400 border-caution-400/30',
  danger: 'bg-danger-400/12 text-danger-400 border-danger-400/30',
}

export function Tag({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] font-medium ${TONES[tone]}`}>{children}</span>
}

export function Meter({ value, tone = 'signal', label }: { value: number; tone?: 'signal' | 'live'; label: string }) {
  const pct = Math.max(0, Math.min(100, value * 100))
  return (
    <div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} className="h-1.5 w-full overflow-hidden rounded-full bg-chassis-700">
      <div className={`h-full rounded-full ${tone === 'live' ? 'bg-live-400' : 'bg-signal-500'}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function SafetyNotice({ children, tone = 'caution' }: { children: ReactNode; tone?: 'caution' | 'danger' }) {
  const c = tone === 'danger' ? 'border-danger-400/40 bg-danger-400/8 text-danger-400' : 'border-caution-400/35 bg-caution-400/8 text-caution-400'
  return (
    <div role="note" className={`flex gap-3 rounded-md border px-3.5 py-3 text-sm ${c}`}>
      <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M12 3l10 18H2L12 3z M12 10v5 M12 18h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="text-ink-300 [&_strong]:text-ink-100">{children}</div>
    </div>
  )
}
