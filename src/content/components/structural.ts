import type { ElectronicComponent } from '../../types/domain'

/**
 * Mechanical parts that appear in 3D models but are not electronic components in the library.
 * They still get a full information panel.
 */
export const STRUCTURAL_COMPONENTS: ElectronicComponent[] = [
  {
    id: 'enclosure',
    name: 'Enclosure (chassis and cover)',
    category: 'io-connection',
    symbol: 'protective-earth',
    plainSummary: 'The metal case. It protects people from live parts inside, protects the electronics from dust and knocks, guides cooling air, and is connected to earth for safety.',
    function: 'Provides mechanical support, protection against contact with live parts, airflow paths for cooling, electromagnetic shielding and a bonded protective-earth frame.',
    operatingPrinciple:
      'Powder-coated sheet steel forms an earthed Faraday enclosure: radiated switching noise is contained and any internal insulation fault to the case is cleared by the protective devices. Vent slots and the fan create a front-to-back or side-to-side airflow path; the IP rating states how well it excludes dust and water.',
    applications: ['All mains-powered equipment', 'Wall-mounted inverters (typically IP20 indoors, IP65 outdoors)'],
    terminals: [{ id: 'pe-bond', label: 'PE bond', role: 'earth', description: 'Bonded to the PE stud; every panel must keep its earth connection.' }],
    ioBehaviour: 'Passive; carries fault current to earth only during an insulation failure.',
    failureSymptoms: ['Overheating from blocked vents or dust', 'Corrosion at earth contact points', 'Rattles or hum from loose panels'],
    replacementNotes: ['Reinstall every screw and earth strap; star washers must bite bare metal.'],
    safety: ['Never operate with the cover removed except during qualified testing.', 'Sharp sheet-metal edges.'],
    related: ['protective-earth', 'cooling-fan', 'heat-sink'],
    typicalSpecs: [
      { name: 'Sheet steel thickness', value: '≈ 1–1.5', unit: 'mm', kind: 'typical' },
      { name: 'Indoor protection rating', value: 'IP20', unit: '', kind: 'typical' },
    ],
    advancedNote: 'Cover removal is the first step after isolation because the nameplate warning ("wait 5 min after disconnection") refers to capacitor discharge inside. Panel seams and vent sizes are chosen against EMC as well as cooling requirements.',
  },
]
