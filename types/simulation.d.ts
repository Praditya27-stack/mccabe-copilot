export interface SimulationInputs {
  zF: number;
  xD: number;
  xB: number;
  q: number;
  R: number;
  F: number;
  Em: number;
}

export interface StageResult {
  number: number;
  x: number;
  y: number;
  T?: number;
  section: 'rectifying' | 'stripping' | 'reboiler';
}

export interface SimulationResult {
  stages: StageResult[];
  feedStage: number;
  N_total: number;
  D: number;
  B: number;
  QC: number;
  QR: number;
  Rmin: number;
  pinchType: 'feed' | 'tangent' | 'none';
  feasible: boolean;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  source: 'hydraulics' | 'thermo' | 'hazop';
}

export interface SimulationStoreState {
  inputs: SimulationInputs;
  results: SimulationResult | null;
  alerts: Alert[];
  setInputs: (newInputs: Partial<SimulationInputs>) => void;
  runSimulation: () => void;
}
