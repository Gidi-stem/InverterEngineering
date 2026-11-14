import type { ReactNode } from 'react'
import type { SymbolKey } from './keys'

/**
 * IEC 60617-style schematic symbols. 160 × 100 viewBox, stroke = currentColor.
 * Pin labels are drawn next to each terminal so students can relate the symbol to the 3D part.
 */
const T = ({ x, y, children, a = 'middle' }: { x: number; y: number; children: ReactNode; a?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} fontSize="10" textAnchor={a} fill="currentColor" stroke="none" fontFamily="JetBrains Mono, monospace">
    {children}
  </text>
)

const icBlock = (title: string, left: string[], right: string[]) => (
  <g>
    <rect x="50" y="10" width="60" height="80" rx="2" />
    <T x={80} y={55}>
      {title}
    </T>
    {left.map((p, i) => {
      const y = 22 + i * (68 / Math.max(left.length - 1, 1))
      return (
        <g key={p}>
          <line x1="28" y1={y} x2="50" y2={y} />
          <T x={26} y={y + 3} a="end">
            {p}
          </T>
        </g>
      )
    })}
    {right.map((p, i) => {
      const y = 22 + i * (68 / Math.max(right.length - 1, 1))
      return (
        <g key={p}>
          <line x1="110" y1={y} x2="132" y2={y} />
          <T x={134} y={y + 3} a="start">
            {p}
          </T>
        </g>
      )
    })}
  </g>
)

const SYMBOLS: Record<SymbolKey, ReactNode> = {
  mosfet: (
    <g>
      <line x1="30" y1="60" x2="62" y2="60" />
      <line x1="62" y1="35" x2="62" y2="65" />
      <line x1="70" y1="32" x2="70" y2="42" />
      <line x1="70" y1="45" x2="70" y2="55" />
      <line x1="70" y1="58" x2="70" y2="68" />
      <line x1="70" y1="37" x2="95" y2="37" />
      <line x1="95" y1="37" x2="95" y2="15" />
      <line x1="70" y1="63" x2="95" y2="63" />
      <line x1="95" y1="63" x2="95" y2="88" />
      <line x1="70" y1="50" x2="95" y2="50" />
      <line x1="95" y1="50" x2="95" y2="63" />
      <path d="M72 50 l8 -4 v8 z" fill="currentColor" />
      <path d="M112 44 l-6 10 h12 z M106 44 h12" fill="none" />
      <line x1="112" y1="37" x2="112" y2="63" />
      <line x1="95" y1="37" x2="112" y2="37" />
      <line x1="95" y1="63" x2="112" y2="63" />
      <T x={22} y={63} a="end">G</T>
      <T x={100} y={14}>D</T>
      <T x={100} y={98}>S</T>
    </g>
  ),
  igbt: (
    <g>
      <line x1="30" y1="55" x2="62" y2="55" />
      <line x1="62" y1="35" x2="62" y2="70" />
      <line x1="70" y1="32" x2="70" y2="72" />
      <line x1="70" y1="40" x2="95" y2="28" />
      <line x1="95" y1="28" x2="95" y2="12" />
      <line x1="70" y1="64" x2="95" y2="76" />
      <line x1="95" y1="76" x2="95" y2="90" />
      <path d="M95 76 l-9 -1 l4 -7 z" fill="currentColor" />
      <line x1="95" y1="20" x2="120" y2="20" />
      <line x1="120" y1="20" x2="120" y2="84" />
      <line x1="95" y1="84" x2="120" y2="84" />
      <path d="M114 58 l6 -10 l6 10 z M114 48 h12" fill="none" />
      <T x={22} y={58} a="end">G</T>
      <T x={102} y={10}>C</T>
      <T x={102} y={99}>E</T>
    </g>
  ),
  transformer: (
    <g>
      <path d="M50 18 a7 7 0 0 1 0 14 a7 7 0 0 1 0 14 a7 7 0 0 1 0 14 a7 7 0 0 1 0 14 a7 7 0 0 1 0 14" fill="none" />
      <path d="M110 18 a7 7 0 0 0 0 14 a7 7 0 0 0 0 14 a7 7 0 0 0 0 14 a7 7 0 0 0 0 14 a7 7 0 0 0 0 14" fill="none" />
      <line x1="76" y1="14" x2="76" y2="90" />
      <line x1="84" y1="14" x2="84" y2="90" />
      <line x1="20" y1="18" x2="50" y2="18" />
      <line x1="20" y1="88" x2="50" y2="88" />
      <line x1="110" y1="18" x2="140" y2="18" />
      <line x1="110" y1="88" x2="140" y2="88" />
      <circle cx="58" cy="22" r="2" fill="currentColor" />
      <circle cx="102" cy="22" r="2" fill="currentColor" />
      <T x={16} y={21} a="end">P1</T>
      <T x={16} y={91} a="end">P2</T>
      <T x={144} y={21} a="start">S1</T>
      <T x={144} y={91} a="start">S2</T>
    </g>
  ),
  inductor: (
    <g>
      <line x1="15" y1="50" x2="40" y2="50" />
      <path d="M40 50 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0 a10 10 0 0 1 20 0" fill="none" />
      <line x1="40" y1="34" x2="120" y2="34" />
      <line x1="120" y1="50" x2="145" y2="50" />
      <T x={20} y={66}>1</T>
      <T x={140} y={66}>2</T>
    </g>
  ),
  capacitor: (
    <g>
      <line x1="10" y1="35" x2="34" y2="35" />
      <line x1="34" y1="20" x2="34" y2="50" />
      <path d="M44 20 q-6 15 0 30" fill="none" />
      <line x1="42" y1="35" x2="68" y2="35" />
      <T x={26} y={18}>+</T>
      <T x={39} y={66}>polarised</T>
      <line x1="92" y1="35" x2="116" y2="35" />
      <line x1="116" y1="20" x2="116" y2="50" />
      <line x1="126" y1="20" x2="126" y2="50" />
      <line x1="126" y1="35" x2="150" y2="35" />
      <T x={121} y={66}>film</T>
      <T x={80} y={92}>E = ½CV²</T>
    </g>
  ),
  diode: (
    <g>
      <line x1="15" y1="50" x2="60" y2="50" />
      <path d="M60 30 L60 70 L95 50 Z" fill="none" />
      <line x1="95" y1="30" x2="95" y2="70" />
      <line x1="95" y1="50" x2="145" y2="50" />
      <T x={22} y={40}>A</T>
      <T x={138} y={40}>K</T>
    </g>
  ),
  resistor: (
    <g>
      <line x1="15" y1="50" x2="50" y2="50" />
      <rect x="50" y="38" width="60" height="24" fill="none" />
      <line x1="110" y1="50" x2="145" y2="50" />
      <T x={22} y={40}>1</T>
      <T x={138} y={40}>2</T>
      <T x={80} y={85}>V = I·R</T>
    </g>
  ),
  'gate-driver': icBlock('HB DRIVER', ['VDD', 'HB', 'HI', 'LI'], ['HO', 'HS', 'LO', 'VSS']),
  'pwm-controller': icBlock('SG3525', ['VIN', 'INV', 'NI', 'SD'], ['OUT A', 'OUT B', 'VREF', 'GND']),
  microcontroller: icBlock('MCU', ['VDD', 'NRST', 'ADC', 'SWD'], ['PWM', 'I/O', 'UART', 'VSS']),
  'display-board': (
    <g>
      <rect x="40" y="18" width="80" height="50" rx="3" />
      <rect x="50" y="26" width="60" height="26" />
      <T x={80} y={43}>230V 50Hz</T>
      <circle cx="56" cy="60" r="3" />
      <circle cx="70" cy="60" r="3" />
      <circle cx="84" cy="60" r="3" />
      <line x1="80" y1="68" x2="80" y2="88" />
      <T x={80} y={98}>serial bus</T>
    </g>
  ),
  'main-pcb': (
    <g>
      <rect x="25" y="18" width="110" height="64" rx="4" />
      <path d="M38 34 h30 v16 h30 M38 64 h60 v-14 M110 30 v40" fill="none" />
      <circle cx="35" cy="28" r="3" />
      <circle cx="125" cy="72" r="3" />
      <T x={80} y={96}>no schematic symbol</T>
    </g>
  ),
  relay: (
    <g>
      <rect x="20" y="30" width="34" height="40" fill="none" />
      <line x1="20" y1="70" x2="54" y2="30" />
      <line x1="37" y1="10" x2="37" y2="30" />
      <line x1="37" y1="70" x2="37" y2="90" />
      <line x1="58" y1="50" x2="96" y2="50" strokeDasharray="4 3" />
      <line x1="100" y1="80" x2="100" y2="65" />
      <line x1="100" y1="65" x2="128" y2="40" />
      <line x1="132" y1="30" x2="132" y2="12" />
      <line x1="120" y1="70" x2="150" y2="70" />
      <line x1="150" y1="70" x2="150" y2="88" />
      <T x={30} y={10}>A1</T>
      <T x={30} y={98}>A2</T>
      <T x={92} y={95}>COM</T>
      <T x={140} y={12}>NO</T>
      <T x={145} y={98}>NC</T>
    </g>
  ),
  fuse: (
    <g>
      <line x1="15" y1="50" x2="50" y2="50" />
      <rect x="50" y="40" width="60" height="20" fill="none" />
      <line x1="50" y1="50" x2="110" y2="50" />
      <line x1="110" y1="50" x2="145" y2="50" />
      <T x={22} y={40}>1</T>
      <T x={138} y={40}>2</T>
    </g>
  ),
  'circuit-breaker': (
    <g>
      {[45, 105].map((x, i) => (
        <g key={x}>
          <line x1={x} y1="10" x2={x} y2="35" />
          <line x1={x} y1="65" x2={x - 14} y2="38" />
          <line x1={x} y1="65" x2={x} y2="90" />
          <path d={`M${x - 4} 31 l8 8 M${x + 4} 31 l-8 8`} />
          <T x={x + 12} y={14}>{i === 0 ? '+' : '−'}</T>
        </g>
      ))}
      <line x1="38" y1="52" x2="98" y2="52" strokeDasharray="4 3" />
      <T x={80} y={99}>2-pole DC</T>
    </g>
  ),
  'voltage-sensor': (
    <g>
      <circle cx="80" cy="50" r="24" fill="none" />
      <T x={80} y={55}>V</T>
      <line x1="20" y1="50" x2="56" y2="50" />
      <line x1="104" y1="50" x2="140" y2="50" />
      <line x1="80" y1="74" x2="80" y2="92" />
      <T x={20} y={42}>IN+</T>
      <T x={140} y={42}>IN−</T>
      <T x={98} y={92} a="start">OUT</T>
    </g>
  ),
  'current-sensor': (
    <g>
      <line x1="10" y1="50" x2="150" y2="50" strokeWidth={3} />
      <ellipse cx="80" cy="50" rx="18" ry="30" fill="none" />
      <T x={80} y={14}>Hall</T>
      <line x1="98" y1="62" x2="130" y2="86" />
      <T x={132} y={96}>OUT</T>
      <T x={22} y={42}>I →</T>
    </g>
  ),
  'heat-sink': (
    <g>
      <rect x="35" y="62" width="90" height="10" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={38 + i * 13} y="22" width="5" height="40" />
      ))}
      <T x={80} y={92}>thermal element</T>
    </g>
  ),
  'cooling-fan': (
    <g>
      <circle cx="80" cy="48" r="26" fill="none" />
      <T x={80} y={53}>M</T>
      <line x1="30" y1="48" x2="54" y2="48" />
      <line x1="106" y1="48" x2="130" y2="48" />
      <T x={30} y={40}>+</T>
      <T x={130} y={40}>−</T>
      <T x={80} y={94}>fan motor</T>
    </g>
  ),
  'battery-terminals': (
    <g>
      <line x1="15" y1="50" x2="60" y2="50" />
      <line x1="60" y1="28" x2="60" y2="72" />
      <line x1="70" y1="38" x2="70" y2="62" strokeWidth={3} />
      <line x1="84" y1="28" x2="84" y2="72" />
      <line x1="94" y1="38" x2="94" y2="62" strokeWidth={3} />
      <line x1="94" y1="50" x2="145" y2="50" />
      <T x={52} y={24}>+</T>
      <T x={100} y={30}>−</T>
      <T x={80} y={92}>48 V battery</T>
    </g>
  ),
  'dc-input': (
    <g>
      <circle cx="50" cy="50" r="8" fill="none" />
      <circle cx="110" cy="50" r="8" fill="none" />
      <line x1="50" y1="58" x2="50" y2="85" />
      <line x1="110" y1="58" x2="110" y2="85" />
      <T x={50} y={30}>DC+</T>
      <T x={110} y={30}>DC−</T>
    </g>
  ),
  'ac-output': (
    <g>
      {['L', 'N', 'PE'].map((l, i) => (
        <g key={l}>
          <circle cx={40 + i * 40} cy="45" r="8" fill="none" />
          <line x1={40 + i * 40} y1="53" x2={40 + i * 40} y2="80" />
          <T x={40 + i * 40} y={25}>{l}</T>
        </g>
      ))}
      <T x={80} y={96}>230 V~ 50 Hz</T>
    </g>
  ),
  'solar-input': (
    <g>
      <circle cx="80" cy="50" r="22" fill="none" />
      <line x1="66" y1="50" x2="94" y2="50" />
      <line x1="80" y1="38" x2="80" y2="62" />
      <path d="M40 18 l12 12 M48 14 l12 12" />
      <path d="M52 30 l-5 -1 l1 -5 M60 26 l-5 -1 l1 -5" fill="none" />
      <line x1="20" y1="50" x2="58" y2="50" />
      <line x1="102" y1="50" x2="140" y2="50" />
      <T x={22} y={42}>PV+</T>
      <T x={138} y={42}>PV−</T>
    </g>
  ),
  'protective-earth': (
    <g>
      <circle cx="80" cy="52" r="30" fill="none" />
      <line x1="80" y1="28" x2="80" y2="52" />
      <line x1="62" y1="52" x2="98" y2="52" />
      <line x1="68" y1="60" x2="92" y2="60" />
      <line x1="74" y1="68" x2="86" y2="68" />
      <T x={80} y={99}>IEC 60417-5019</T>
    </g>
  ),
}

export function ComponentSymbol({ symbol, className = 'h-24 w-36' }: { symbol: string; className?: string }) {
  const s = SYMBOLS[symbol as SymbolKey]
  return (
    <svg viewBox="0 0 160 100" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" role="img" aria-label={`Schematic symbol: ${symbol}`}>
      {s ?? <T x={80} y={55}>?</T>}
    </svg>
  )
}
