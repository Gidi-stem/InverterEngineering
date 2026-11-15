/** Labelled range input used by lesson demonstrations. */
export function Slider({ label, value, min, max, step, onChange, fmt }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; fmt: (v: number) => string }) {
  return (
    <label className="block text-xs text-ink-400">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="readout text-ink-100">{fmt(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-signal-500" />
    </label>
  )
}
