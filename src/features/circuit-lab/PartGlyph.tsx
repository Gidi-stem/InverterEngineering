import type { PartType } from '../../engine/circuit/types'

/**
 * IEC 60617-style circuit symbols drawn in grid units (1 = one grid pitch), centred on the part
 * origin, with leads ending exactly on the terminal positions defined in engine/circuit/parts.ts.
 * The caller scales and rotates the group. `on` lights LEDs and lamps, and flips switch contacts.
 */
interface GlyphProps {
  type: PartType
  /** Switch/breaker/relay contacts closed, LED or lamp lit, transistor conducting. */
  on?: boolean
  /** 0…1 brightness for lamps and LEDs. */
  glow?: number
}

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 0.12, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const L = ({ d }: { d: string }) => <path d={d} {...S} />
const dot = (x: number, y: number, r = 0.14) => <circle cx={x} cy={y} r={r} fill="currentColor" />

export function PartGlyph({ type, on = false, glow = 0 }: GlyphProps) {
  switch (type) {
    case 'resistor':
      return (
        <g>
          <L d="M-2 0H-1.2M1.2 0H2" />
          <rect x={-1.2} y={-0.4} width={2.4} height={0.8} {...S} />
        </g>
      )
    case 'capacitor':
      return <L d="M-2 0H-0.25M0.25 0H2M-0.25 -0.8V0.8M0.25 -0.8V0.8" />
    case 'electrolytic':
      return (
        <g>
          <L d="M-2 0H-0.3M0.3 0H2M-0.3 -0.8V0.8M-1.1 -0.75H-0.7M-0.9 -0.95V-0.55" />
          <rect x={0.2} y={-0.8} width={0.22} height={1.6} fill="currentColor" stroke="none" />
        </g>
      )
    case 'inductor':
      return <L d="M-2 0H-1.5A0.5 0.5 0 0 1 -0.5 0A0.5 0.5 0 0 1 0.5 0A0.5 0.5 0 0 1 1.5 0H2" />
    case 'diode':
    case 'led':
      return (
        <g>
          <L d="M-2 0H-0.5M0.5 0H2M0.5 -0.6V0.6" />
          <path d="M-0.5 -0.6L0.5 0L-0.5 0.6Z" {...S} fill={type === 'led' && on ? `rgba(250,204,21,${0.35 + 0.65 * glow})` : 'none'} />
          {type === 'led' && (
            <g>
              <L d="M0.1 -0.8L0.6 -1.3M0.6 -1.3H0.3M0.6 -1.3V-1.0M0.6 -0.6L1.1 -1.1M1.1 -1.1H0.8M1.1 -1.1V-0.8" />
              {on && <circle cx={0} cy={0} r={1.2} fill={`rgba(250,204,21,${0.12 + 0.3 * glow})`} stroke="none" />}
            </g>
          )}
        </g>
      )
    case 'mosfet':
      return (
        <g>
          <L d="M-2 0H-0.6M-0.6 -1V1M-0.2 -1.1V-0.6M-0.2 -0.25V0.25M-0.2 0.6V1.1M-0.2 -0.85H1V-2M-0.2 0.85H1V2M-0.2 0H1V0.85" />
          <path d="M-0.15 0L0.35 -0.25V0.25Z" fill="currentColor" />
          {on && <L d="M1.35 -1.4V1.4" />}
        </g>
      )
    case 'igbt':
      return (
        <g>
          <L d="M-2 0H-0.6M-0.6 -1V1M-0.2 -1.1V1.1M-0.2 -0.5L1 -1.2V-2M-0.2 0.5L1 1.2V2" />
          <path d="M1 1.2L0.45 1.12L0.72 0.75Z" fill="currentColor" />
          {on && <L d="M1.35 -1.4V1.4" />}
        </g>
      )
    case 'transformer':
      return (
        <g>
          <L d="M-2 -2H-0.8V-1.5A0.5 0.5 0 0 0 -0.8 -0.5A0.5 0.5 0 0 0 -0.8 0.5A0.5 0.5 0 0 0 -0.8 1.5V2H-2" />
          <L d="M2 -2H0.8V-1.5A0.5 0.5 0 0 1 0.8 -0.5A0.5 0.5 0 0 1 0.8 0.5A0.5 0.5 0 0 1 0.8 1.5V2H2" />
          <L d="M-0.12 -1.6V1.6M0.12 -1.6V1.6" />
          {dot(-1.45, -1.55, 0.12)}
          {dot(1.45, -1.55, 0.12)}
        </g>
      )
    case 'transformer-ct':
      return (
        <g>
          <L d="M-2 -3H-0.8V-2.5A0.5 0.5 0 0 0 -0.8 -1.5A0.5 0.5 0 0 0 -0.8 -0.5V0H-2M-0.8 0V0.5A0.5 0.5 0 0 0 -0.8 1.5A0.5 0.5 0 0 0 -0.8 2.5V3H-2" />
          <L d="M2 -2H0.8V-1.5A0.5 0.5 0 0 1 0.8 -0.5A0.5 0.5 0 0 1 0.8 0.5A0.5 0.5 0 0 1 0.8 1.5V2H2" />
          <L d="M-0.12 -2.6V2.6M0.12 -2.6V2.6" />
          {dot(-1.45, -2.55, 0.12)}
          {dot(-1.45, 0.45, 0.12)}
          {dot(1.45, -1.55, 0.12)}
        </g>
      )
    case 'vsense':
      return (
        <g>
          <L d="M0 -2V-1.1M0 1.1V2M-0.45 -0.45L0 0.45L0.45 -0.45" />
          <circle cx={0} cy={0} r={1.1} {...S} />
          {on && <circle cx={0} cy={0} r={0.85} fill="rgba(56,189,248,0.18)" stroke="none" />}
        </g>
      )
    case 'pv-array':
      return (
        <g>
          <L d="M0 -2V-1.2M0 1.2V2M-0.9 -1.2H0.9V1.2H-0.9ZM-0.9 0H0.9M0 -1.2V1.2M1.3 -1.9L1.0 -1.5M1.6 -1.4L1.25 -1.1" />
          <L d="M-0.25 -0.6H0.25M0 -0.85V-0.35M-0.25 0.6H0.25" />
        </g>
      )
    case 'relay':
      return (
        <g>
          <L d="M-3 -2V-0.8M-3 0.8V2M1 -2V-0.7M3 -2V-0.7M2 2V0.7" />
          <rect x={-3.6} y={-0.8} width={1.2} height={1.6} {...S} />
          <L d={on ? 'M2 0.7L2.9 -0.6' : 'M2 0.7L1.1 -0.6'} />
          <path d="M-2.4 0H1.55" {...S} strokeDasharray="0.25 0.2" />
          {dot(1, -0.7, 0.1)}
          {dot(3, -0.7, 0.1)}
          {dot(2, 0.7, 0.1)}
        </g>
      )
    case 'fuse':
      return (
        <g>
          <L d="M-2 0H2" />
          <rect x={-1.2} y={-0.35} width={2.4} height={0.7} {...S} />
        </g>
      )
    case 'breaker':
      return (
        <g>
          {[-1, 1].map((x) => (
            <g key={x}>
              <L d={`M${x} -2V-0.7M${x} 0.7V2`} />
              <L d={on ? `M${x} 0.7V-0.7` : `M${x} 0.7L${x - 0.65} -0.45`} />
              <L d={`M${x - 0.18} -0.88L${x + 0.18} -0.52M${x + 0.18} -0.88L${x - 0.18} -0.52`} />
            </g>
          ))}
          <path d={on ? 'M-1 0H1' : 'M-1.3 0H0.7'} {...S} strokeDasharray="0.2 0.18" />
          <rect x={-1.8} y={-1.3} width={3.6} height={2.6} {...S} strokeDasharray="0.3 0.25" strokeWidth={0.06} />
        </g>
      )
    case 'switch':
      return (
        <g>
          <L d="M-2 0H-0.8M0.8 0H2" />
          <L d={on ? 'M-0.8 0H0.8' : 'M-0.8 0L0.65 -0.75'} />
          {dot(-0.8, 0, 0.13)}
          {dot(0.8, 0, 0.13)}
        </g>
      )
    case 'ground':
      return <L d="M0 0V0.5M-0.8 0.5H0.8M-0.5 0.8H0.5M-0.2 1.1H0.2" />
    case 'battery':
      return (
        <g>
          <L d="M0 -2V-0.3M0 0.3V2M-1 -0.3H1M0.7 -1.1H1.2M0.95 -1.35V-0.85" />
          <L d="M-0.5 0.3H0.5" />
          <path d="M-0.5 0.3H0.5" {...S} strokeWidth={0.28} />
        </g>
      )
    case 'dc-supply':
      return (
        <g>
          <L d="M0 -2V-1.1M0 1.1V2M-0.5 -0.25H0.5M-0.25 0.25H0.25M0.7 -1.55H1.2M0.95 -1.8V-1.3" />
          <circle cx={0} cy={0} r={1.1} {...S} />
        </g>
      )
    case 'ac-source':
      return (
        <g>
          <L d="M0 -2V-1.1M0 1.1V2M-0.6 0Q-0.3 -0.8 0 0T0.6 0" />
          <circle cx={0} cy={0} r={1.1} {...S} />
        </g>
      )
    case 'gate-source':
      return (
        <g>
          <L d="M0 -2V-1.1M0 1.1V2M-0.65 0.35H-0.3V-0.35H0.3V0.35H0.65" />
          <circle cx={0} cy={0} r={1.1} {...S} />
          {on && <circle cx={0} cy={0} r={0.85} fill="rgba(56,189,248,0.18)" stroke="none" />}
        </g>
      )
    case 'dc-load':
      return (
        <g>
          {on && <circle cx={0} cy={0} r={1.3} fill={`rgba(250,204,21,${0.1 + 0.45 * glow})`} stroke="none" />}
          <L d="M0 -2V-1M0 1V2M-0.7 -0.7L0.7 0.7M0.7 -0.7L-0.7 0.7" />
          <circle cx={0} cy={0} r={1} {...S} />
        </g>
      )
    case 'ac-load':
      return (
        <g>
          {on && <rect x={-0.9} y={-1.5} width={1.8} height={3} rx={0.3} fill={`rgba(251,146,60,${0.1 + 0.4 * glow})`} stroke="none" />}
          <L d="M0 -2V-1.2M0 1.2V2M-0.3 -0.6Q0 -0.95 0 -0.3T0.3 0.1Q0 0.6 0 0.9" />
          <rect x={-0.6} y={-1.2} width={1.2} height={2.4} {...S} />
        </g>
      )
  }
}
