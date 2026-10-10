import { create } from 'zustand';
import { solveMcCabeThiele, SolverInputs, SolverResult } from '@/lib/simulation/mccabeThieleSolver';
import { AZEOTROPE_ETHANOL } from '@/lib/thermo/vle';

export interface SimulationStoreState {
  inputs: SolverInputs;
  results: SolverResult;
  setInputs: (newInputs: Partial<SolverInputs>) => void;
  resetToDefaults: () => void;
}

const DEFAULT_INPUTS: SolverInputs = {
  zF: 0.40,
  xD: 0.85,
  xB: 0.05,
  q: 1.0,
  R: 2.5,
};

export const useSimulationStore = create<SimulationStoreState>((set, get) => ({
  inputs: DEFAULT_INPUTS,
  results: solveMcCabeThiele(DEFAULT_INPUTS),

  setInputs: (newInputs) => {
    set((state) => {
      // Merge new inputs
      const rawInputs = { ...state.inputs, ...newInputs };
      
      // Enforce physical constraints / guardrails
      let { zF, xD, xB, q, R } = rawInputs;
      
      // Constraints
      xD = Math.min(Math.max(xD, 0.01), AZEOTROPE_ETHANOL - 0.001); // Can't exceed azeotrope
      xB = Math.max(0.001, Math.min(xB, zF - 0.01)); // Bottoms must be less than Feed
      zF = Math.max(xB + 0.01, Math.min(zF, xD - 0.01)); // Feed must be between Bottoms and Distillate
      
      const clampedInputs = { zF, xD, xB, q, R };
      const newResults = solveMcCabeThiele(clampedInputs);

      return {
        inputs: clampedInputs,
        results: newResults,
      };
    });
  },

  resetToDefaults: () => {
    set({
      inputs: DEFAULT_INPUTS,
      results: solveMcCabeThiele(DEFAULT_INPUTS),
    });
  }
}));
