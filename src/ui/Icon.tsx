import type { IconName } from '../types/modules'

const PATHS: Record<IconName, string> = {
  gauge: 'M4 15a8 8 0 1 1 16 0 M12 15l4-5 M7 15h.01 M17 15h.01 M12 7v.01',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z M8 7h7 M8 11h5',
  cube: 'M12 2l9 5v10l-9 5-9-5V7l9-5z M12 22V12 M21 7l-9 5-9-5',
  chip: 'M7 7h10v10H7z M10 3v4 M14 3v4 M10 17v4 M14 17v4 M3 10h4 M3 14h4 M17 10h4 M17 14h4',
  circuit: 'M3 12h4l2-4 3 8 2-4h7 M5 12a2 2 0 1 0 0 .01 M19 12a2 2 0 1 0 0 .01',
  'wrench-build': 'M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9a4 4 0 0 0-2-2z M4 4h5v5H4z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  scope: 'M3 5h18v12H3z M3 11h3l2-4 3 8 3-6 2 2h5 M8 21h8',
  repair: 'M12 2l3 3-3 3-3-3z M12 8v5 M7 13h10l-1 8H8z',
  folder: 'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6z',
  check: 'M9 11l3 3 8-8 M20 12v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h11',
  chart: 'M4 20V4 M4 20h16 M8 16v-5 M12 16V8 M16 16v-3',
}

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  )
}
