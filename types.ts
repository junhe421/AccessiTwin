export enum ControlType {
  BUTTON = 'BUTTON',
  KNOB = 'KNOB',
  SWITCH = 'SWITCH',
  DISPLAY = 'DISPLAY'
}

export enum ControlCategory {
  PRIMARY = 'PRIMARY', // Happy path actions (Start, Stop, Power)
  SECONDARY = 'SECONDARY', // Configuration (Temp, Speed)
  ADVANCED = 'ADVANCED', // Rare settings
  DANGER = 'DANGER' // Reset, Delete, Self-Destruct
}

export interface DeviceControl {
  id: string;
  label: string; // The accessible name
  type: ControlType;
  description: string; // Physical description for context (e.g., "Top right red button")
  category: ControlCategory;
  detailText: string; // The extracted content or detailed instruction to be read aloud
}

export interface DeviceAnalysis {
  deviceName: string;
  summary: string;
  controls: DeviceControl[];
}

export type AppStatus = 'IDLE' | 'ANALYZING' | 'SUCCESS' | 'ERROR';