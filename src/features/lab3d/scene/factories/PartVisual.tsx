import type { PartGeometry } from '../../../../types/domain'
import { AcTerminalBlock, BatteryTerminal, DcLugs, Mc4, PeStud } from './connections'
import { DisplayBoard, EnclosureBase, EnclosureCover, Fan, HeatSink, Pcb } from './mechanical'
import { EiTransformer, Electrolytic, FilmCap, Toroid } from './passives'
import { DinBreaker, HallSensor, MegaFuse, Relay, VoltageSensor } from './protection'
import { AxialDiode, AxialResistor, IcPackage, To247 } from './semiconductors'

/** Maps a part's geometry recipe to its procedural 3D builder. Adding a builder here makes it available to every model. */
export function PartVisual({ id, g, xray = false }: { id: string; g: PartGeometry; xray?: boolean }) {
  switch (g.factory) {
    case 'to247':
      return <To247 kind={g.kind} marking={g.marking} />
    case 'electrolytic':
      return <Electrolytic diameter={g.diameter} height={g.height} rating={g.rating} />
    case 'film-cap':
      return <FilmCap size={g.size} rating={g.rating} />
    case 'axial-diode':
      return <AxialDiode marking={g.marking} />
    case 'axial-resistor':
      return <AxialResistor ohms={g.ohms} tolerancePct={g.tolerancePct} />
    case 'ei-transformer':
      return <EiTransformer size={g.size} rating={g.rating} />
    case 'toroid':
      return <Toroid outerDiameter={g.outerDiameter} height={g.height} turns={g.turns} rating={g.rating} />
    case 'ic':
      return <IcPackage pkg={g.pkg} marking={g.marking} />
    case 'relay':
      return <Relay marking={g.marking} />
    case 'heatsink':
      return <HeatSink length={g.length} height={g.height} finDepth={g.finDepth} fins={g.fins} />
    case 'fan':
      return <Fan size={g.size} depth={g.depth} rating={g.rating} />
    case 'mega-fuse':
      return <MegaFuse amps={g.amps} />
    case 'din-breaker':
      return <DinBreaker rating={g.rating} />
    case 'hall-sensor':
      return <HallSensor marking={g.marking} />
    case 'voltage-sensor':
      return <VoltageSensor marking={g.marking} />
    case 'pcb':
      return <Pcb id={id} size={g.size} color={g.color} silk={g.silk} />
    case 'battery-terminal':
      return <BatteryTerminal polarity={g.polarity} />
    case 'dc-lugs':
      return <DcLugs />
    case 'ac-terminal-block':
      return <AcTerminalBlock />
    case 'mc4':
      return <Mc4 polarity={g.polarity} />
    case 'display-board':
      return <DisplayBoard lines={g.lines} />
    case 'pe-stud':
      return <PeStud />
    case 'enclosure-base':
      return <EnclosureBase size={g.size} displayWindow={g.displayWindow} xray={xray} />
    case 'enclosure-cover':
      return <EnclosureCover size={g.size} nameplate={g.nameplate} />
  }
}
