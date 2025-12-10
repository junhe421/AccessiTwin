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
  detailText: string; // Step-by-step instructions (e.g. "Step 1: Turn dial. Step 2: Press Start.")
}

export interface DeviceAnalysis {
  deviceName: string;
  summary: string;
  safetyWarning?: string; // Critical warnings (e.g. "Hot Surface", "High Voltage")
  controls: DeviceControl[];
}

export type AppStatus = 'IDLE' | 'ANALYZING' | 'SUCCESS' | 'ERROR';