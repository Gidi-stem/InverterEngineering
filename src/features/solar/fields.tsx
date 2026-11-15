import { useState } from 'react'
import { textToWindows, windowsToText } from './windows'

/** Form fields for the solar laboratory. Numeric fields keep the last valid value while typing. */
export function NumField({ label, value, onChange, step = 1, min, max, unit, testid }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; unit?: string; testid?: string }) {
  const [text, setText] = useState<string | null>(null)
  return (
    <label className="block text-xs text-ink-400">
      <span>
        {label}
        {unit ? <span className="text-ink-500"> ({unit})</span> : null}
      </span>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        value={text ?? String(Number.isFinite(value) ? +value.toFixed(6) : '')}
        onChange={(e) => {
          setText(e.target.value)
          const v = Number(e.target.value)
          if (e.target.value !== '' && Number.isFinite(v) && (min === undefined || v >= min) && (max === undefined || v <= max)) onChange(v)
        }}
        onBlur={() => setText(null)}
        className="mt-1 block w-full min-w-0 rounded border border-chassis-600 bg-chassis-850 px-2 py-1.5 text-sm text-ink-100"
        data-testid={testid}
      />
    </label>
  )
}

export function SelectField<T extends string | number>({ label, value, options, onChange, testid }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; testid?: string }) {
  return (
    <label className="block text-xs text-ink-400">
      {label}
      <select
        value={String(value)}
        onChange={(e) => {
          const o = options.find((x) => String(x.value) === e.target.value)
          if (o) onChange(o.value)
        }}
        className="mt-1 block w-full min-w-0 rounded border border-chassis-600 bg-chassis-850 px-2 py-1.5 text-sm text-ink-100"
        data-testid={testid}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function Toggle({ label, value, onChange, testid }: { label: string; value: boolean; onChange: (v: boolean) => void; testid?: string }) {
  return (
    <label className="flex min-h-10 items-center gap-2 text-sm text-ink-300">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-signal-500" data-testid={testid} />
      {label}
    </label>
  )
}

export function WindowsField({ value, onChange, testid }: { value: [number, number][]; onChange: (w: [number, number][]) => void; testid?: string }) {
  const [text, setText] = useState<string | null>(null)
  const bad = text !== null && textToWindows(text) === null
  return (
    <input
      aria-label="Hours on (for example 18-23, 5-7)"
      value={text ?? windowsToText(value)}
      onChange={(e) => {
        setText(e.target.value)
        const w = textToWindows(e.target.value)
        if (w) onChange(w)
      }}
      onBlur={() => setText(null)}
      className={`block w-full min-w-0 rounded border bg-chassis-850 px-2 py-1 text-sm text-ink-100 ${bad ? 'border-danger-400' : 'border-chassis-600'}`}
      data-testid={testid}
    />
  )
}
