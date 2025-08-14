// Centralized game constants for Operation Nightfall
// Pure data only (safe to share between frontend & future backend engine)
// NOTE: Strings in requiredInputs MUST match mechanics.inputType for supporting roles in each room

import { Shield, Cpu, Radio, Eye } from 'lucide-react'

export const ROLES = {
  technician: {
    key: 'technician',
    name: 'Technician',
    description: 'Systems, security bypass, infrastructure control',
    color: '#00ff88',
    icon: Cpu
  },
  intelligence: {
    key: 'intelligence',
    name: 'Intelligence Analyst',
    description: 'Data, schematics, transmission analysis',
    color: '#0080ff',
    icon: Shield
  },
  communications: {
    key: 'communications',
    name: 'Communications Lead',
    description: 'Signals, coordination, intercepted comms',
    color: '#ff6b35',
    icon: Radio
  },
  fieldAgent: {
    key: 'fieldAgent',
    name: 'Field Recon Agent',
    description: 'On-site recon, route scouting, extraction facilitation',
    color: '#ff0080',
    icon: Eye
  }
}

// Four sequential mission rooms (sectors)
export const ROOMS = {
  1: {
    id: 1,
    name: 'Security Breach Containment',
    leadRole: 'technician',
    description: 'Stabilize breached perimeter & bypass layered security locks.',
    requiredInputs: ['schematic-sequence', 'timing-windows', 'safe-sequences'],
    mechanics: {
      technician: {
        interface: 'security-panel',
        ability: 'Bypass multi-layer security stack once all intel is received.'
      },
      intelligence: {
        interface: 'building-schematic',
        ability: 'Analyze blueprints to determine correct security layer order.',
        inputType: 'schematic-sequence'
      },
      communications: {
        interface: 'patrol-monitor',
        ability: 'Track guard patrol intervals to provide safe timing windows.',
        inputType: 'timing-windows'
      },
      fieldAgent: {
        interface: 'camera-scout',
        ability: 'Scout camera blind spots & provide safe input sequences.',
        inputType: 'safe-sequences'
      }
    }
  },
  2: {
    id: 2,
    name: 'Data Extraction Lab',
    leadRole: 'intelligence',
    description: 'Identify and extract critical intelligence before purge cycle.',
    requiredInputs: ['server-access-codes', 'target-priorities', 'decryption-keys'],
    mechanics: {
      intelligence: {
        interface: 'database-terminal',
        ability: 'Extract priority datasets after compiling team-provided intel.'
      },
      technician: {
        interface: 'server-access',
        ability: 'Provide system access credentials & server clusters.',
        inputType: 'server-access-codes'
      },
      communications: {
        interface: 'intercepted-calls',
        ability: 'Monitor enemy comms & flag high-value data targets.',
        inputType: 'target-priorities'
      },
      fieldAgent: {
        interface: 'physical-documents',
        ability: 'Locate physical docs containing database decryption keys.',
        inputType: 'decryption-keys'
      }
    }
  },
  3: {
    id: 3,
    name: 'Extraction Signal Coordination',
    leadRole: 'communications',
    description: 'Synchronize secure extraction uplink without detection.',
    requiredInputs: ['coordinates', 'frequencies', 'transmission-windows'],
    mechanics: {
      communications: {
        interface: 'radio-array',
        ability: 'Broadcast extraction signal after all uplink parameters received.'
      },
      fieldAgent: {
        interface: 'reconnaissance',
        ability: 'Transmit live extraction coordinates from field position.',
        inputType: 'coordinates'
      },
      technician: {
        interface: 'frequency-calibration',
        ability: 'Calibrate frequency bands & amplification values.',
        inputType: 'frequencies'
      },
      intelligence: {
        interface: 'enemy-transmissions',
        ability: 'Analyze enemy chatter to define safe signal windows.',
        inputType: 'transmission-windows'
      }
    }
  },
  4: {
    id: 4,
    name: 'Facility Escape & Evacuation',
    leadRole: 'fieldAgent',
    description: 'Plot safe escape route while avoiding lockdown traps.',
    requiredInputs: ['patrol-patterns', 'system-access', 'lockdown-status'],
    mechanics: {
      fieldAgent: {
        interface: 'facility-map',
        ability: 'Select safest exfil route after compiling operational status.'
      },
      intelligence: {
        interface: 'patrol-analysis',
        ability: 'Predict patrol movements for route safety matrix.',
        inputType: 'patrol-patterns'
      },
      technician: {
        interface: 'system-control',
        ability: 'Control doors / elevators / emergency overrides.',
        inputType: 'system-access'
      },
      communications: {
        interface: 'lockdown-monitor',
        ability: 'Monitor lockdown phases & report active hazard zones.',
        inputType: 'lockdown-status'
      }
    }
  }
}

export default { ROLES, ROOMS }
