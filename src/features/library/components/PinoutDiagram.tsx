import type { ReactNode } from 'react'
import type { ElectronicComponent } from '../../../types/domain'
import { geometryFor } from '../logic/geometry'
import { BAND_HEX, resistorBands } from '../../lab3d/logic/resistor'

const T = ({ x, y, children, a = 'middle', c = 'currentColor', s = 10 }: { x: number; y: number; children: ReactNode; a?: 'start' | 'middle' | 'end'; c?: string; s?: number }) => (
  <text x={x} y={y} fontSize={s} textAnchor={a} fill={c} stroke="none" fontFamily="JetBrains Mono, monospace">
    {children}
  </text>
)

function dualRowIc(c: ElectronicComponent, n: number, title: string) {
  const half = n / 2
  const pitch = 22
  const h = half * pitch + 16
  const labels = c.terminals.map((t) => t.label)
  return (
    <svg viewBox={`0 0 300 ${h + 30}`} className="w-full" role="img" aria-label={`${title} pinout, top view`}>
      <rect x="110" y="10" width="80" height={h} rx="3" fill="none" stroke="currentColor" />
      <path d={`M140 10 a10 10 0 0 0 20 0`} fill="none" stroke="currentColor" />
      <circle cx="122" cy="24" r="3" fill="currentColor" />
      {Array.from({ length: half }, (_, i) => {
        const yl = 20 + i * pitch + 6
        const right = n - i
        return (
          <g key={i}>
            <line x1="96" y1={yl} x2="110" y2={yl} stroke="currentColor" />
            <T x={92} y={yl + 3} a="end" c="#ffb84d">
              {labels[i] ?? i + 1}
            </T>
            <line x1="190" y1={yl} x2="204" y2={yl} stroke="currentColor" />
            <T x={208} y={yl + 3} a="start" c="#ffb84d">
              {labels[right - 1] ?? right}
            </T>
          </g>
        )
      })}
      <T x={150} y={h / 2 + 14} s={9}>
        {title}
      </T>
      <T x={150} y={h + 26} s={9} c="#8a94b0">
        top view · ● / notch = pin 1
      </T>
    </svg>
  )
}

/**
 * Pinout drawing derived from the component's 3D geometry type and its documented terminals.
 * Package views follow the conventions shown on datasheets; pin functions come from the entry.
 */
export function PinoutDiagram({ component }: { component: ElectronicComponent }) {
  const g = geometryFor(component.id)
  const term = component.terminals
  if (g?.factory === 'to247') {
    const pins = term.slice(0, 3).map((t) => t.label.split(' ')[0])
    return (
      <svg viewBox="0 0 240 200" className="w-full" role="img" aria-label="TO-247 pinout, front (marked) view">
        <rect x="80" y="10" width="80" height="34" rx="2" fill="none" stroke="currentColor" />
        <circle cx="120" cy="26" r="8" fill="none" stroke="currentColor" />
        <rect x="80" y="44" width="80" height="80" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" />
        {[-28, 0, 28].map((dx, i) => (
          <g key={dx}>
            <line x1={120 + dx} y1="124" x2={120 + dx} y2="168" stroke="currentColor" strokeWidth="5" />
            <T x={120 + dx} y={184} c="#ffb84d">
              {pins[i]}
            </T>
            <T x={120 + dx} y={196} s={8} c="#8a94b0">
              {i + 1}
            </T>
          </g>
        ))}
        <T x={120} y={88} s={9}>
          marked face
        </T>
        <T x={178} y={30} a="start" s={9} c="#ffb84d">
          tab = {pins[1]}
        </T>
      </svg>
    )
  }
  if (g?.factory === 'ic' && g.pkg === 'soic8') return dualRowIc(component, 8, 'SOIC-8')
  if (g?.factory === 'ic' && g.pkg === 'dip16') return dualRowIc(component, 16, 'DIP-16')
  if (g?.factory === 'electrolytic')
    return (
      <svg viewBox="0 0 240 170" className="w-full" role="img" aria-label="Snap-in electrolytic, viewed from above with pins underneath">
        <circle cx="120" cy="80" r="62" fill="none" stroke="currentColor" />
        <path d="M70 42 A62 62 0 0 0 70 118 L88 108 A44 44 0 0 1 88 52 Z" fill="currentColor" fillOpacity="0.25" />
        <circle cx="95" cy="80" r="6" fill="currentColor" />
        <circle cx="145" cy="80" r="6" fill="currentColor" />
        <T x={95} y={104} c="#ffb84d">
          −
        </T>
        <T x={145} y={104} c="#ffb84d">
          +
        </T>
        <T x={40} y={80} a="end" s={9}>
          stripe
        </T>
        <T x={120} y={160} s={9} c="#8a94b0">
          view from above (pins underneath) · stripe marks the − pin
        </T>
      </svg>
    )
  if (g?.factory === 'axial-diode' || g?.factory === 'axial-resistor') {
    const bands = g.factory === 'axial-resistor' ? resistorBands(g.ohms, g.tolerancePct) : null
    return (
      <svg viewBox="0 0 260 110" className="w-full" role="img" aria-label="Axial component lead identification">
        <line x1="10" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="3" />
        <line x1="180" y1="50" x2="250" y2="50" stroke="currentColor" strokeWidth="3" />
        <rect x="80" y="32" width="100" height="36" rx="16" fill={bands ? '#d6c09a' : '#202228'} stroke="currentColor" />
        {bands
          ? bands.map((b, i) => <rect key={i} x={[96, 112, 128, 160][i]} y="32" width="8" height="36" fill={BAND_HEX[b]} />)
          : <rect x="160" y="32" width="10" height="36" fill="#c9ccd1" />}
        <T x={20} y={40} c="#ffb84d">
          {term[0]?.label.split(' ')[0]}
        </T>
        <T x={240} y={40} c="#ffb84d">
          {term[1]?.label.split(' ')[0]}
        </T>
        <T x={130} y={96} s={9} c="#8a94b0">
          {bands ? `${bands.join(' · ')} (example value)` : 'band = cathode (K)'}
        </T>
      </svg>
    )
  }
  // Generic terminal map: the component with each documented terminal as a labelled connection.
  const left = term.slice(0, Math.ceil(term.length / 2))
  const right = term.slice(Math.ceil(term.length / 2))
  const rows = Math.max(left.length, right.length, 1)
  const h = rows * 24 + 20
  return (
    <svg viewBox={`0 0 300 ${h + 22}`} className="w-full" role="img" aria-label={`${component.name} terminal map`}>
      <rect x="110" y="10" width="80" height={h} rx="4" fill="none" stroke="currentColor" />
      <T x={150} y={h / 2 + 14} s={9}>
        {g?.factory === 'ic' ? 'LQFP-64' : 'terminals'}
      </T>
      {left.map((t, i) => (
        <g key={t.id}>
          <line x1="94" y1={28 + i * 24} x2="110" y2={28 + i * 24} stroke="currentColor" />
          <circle cx="92" cy={28 + i * 24} r="3" fill="none" stroke="currentColor" />
          <T x={86} y={31 + i * 24} a="end" c="#ffb84d">
            {t.label}
          </T>
        </g>
      ))}
      {right.map((t, i) => (
        <g key={t.id}>
          <line x1="190" y1={28 + i * 24} x2="206" y2={28 + i * 24} stroke="currentColor" />
          <circle cx="208" cy={28 + i * 24} r="3" fill="none" stroke="currentColor" />
          <T x={214} y={31 + i * 24} a="start" c="#ffb84d">
            {t.label}
          </T>
        </g>
      ))}
      <T x={150} y={h + 20} s={9} c="#8a94b0">
        {g?.factory === 'ic' ? 'pin groups (numbers vary by MCU family)' : 'terminal identification'}
      </T>
    </svg>
  )
}
