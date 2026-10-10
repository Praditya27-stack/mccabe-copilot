import { useSimulationStore } from '@/stores/useSimulation';
import { SolverInputs, SolverResult } from '../simulation/mccabeThieleSolver';
import { AZEOTROPE_ETHANOL } from '../thermo/vle';

export interface TelemetrySnapshot {
  inputs: SolverInputs;
  results: SolverResult;
}

export const copilotTools = {
  /**
   * get_simulation_state: Reads metrics and active parameters from the Zustand store.
   */
  get_simulation_state(): TelemetrySnapshot {
    const state = useSimulationStore.getState();
    return {
      inputs: state.inputs,
      results: state.results,
    };
  },

  /**
   * set_simulation_parameters: Autonomously mutates the Zustand state.
   * Normalizes lowercase and camelCase parameter names.
   */
  set_simulation_parameters(rawParams: Record<string, any>): string {
    const store = useSimulationStore.getState();
    const normalized: Partial<SolverInputs> = {};

    if (rawParams.xd !== undefined) normalized.xD = Number(rawParams.xd);
    if (rawParams.xD !== undefined) normalized.xD = Number(rawParams.xD);
    if (rawParams.xb !== undefined) normalized.xB = Number(rawParams.xb);
    if (rawParams.xB !== undefined) normalized.xB = Number(rawParams.xB);
    if (rawParams.zf !== undefined) normalized.zF = Number(rawParams.zf);
    if (rawParams.zF !== undefined) normalized.zF = Number(rawParams.zF);
    if (rawParams.r !== undefined) normalized.R = Number(rawParams.r);
    if (rawParams.R !== undefined) normalized.R = Number(rawParams.R);
    if (rawParams.q !== undefined) normalized.q = Number(rawParams.q);

    store.setInputs(normalized);
    return `Successfully updated parameters: ${JSON.stringify(normalized)}`;
  },

  /**
   * run_optimization: Finds a sweet spot reflux ratio (e.g., 1.35 * R_min)
   * and adjusts the simulation accordingly.
   */
  run_optimization(): string {
    const store = useSimulationStore.getState();
    const { rMin } = store.results;
    
    // Heuristic for optimal reflux ratio (1.35 * R_min)
    const optimalR = Math.max(0.1, parseFloat((rMin * 1.35).toFixed(2)));
    
    store.setInputs({ R: optimalR });
    return `Optimization complete. Set Reflux Ratio to ${optimalR} (1.35x R_min) to balance energy (Q) and stage count (N).`;
  },

  /**
   * generate_hazop_report: Evaluates operational risks, pinch, and mass balance.
   */
  generate_hazop_report(): string[] {
    const { inputs, results } = useSimulationStore.getState();
    const { R, xD, zF, xB } = inputs;
    const { rMin, totalStages } = results;
    
    const hazards: string[] = [];

    // 1. Pinch / Infinite Stages Risk
    if (R <= rMin * 1.05) {
      hazards.push(`[CRITICAL] Reflux ratio (R=${R.toFixed(2)}) is dangerously close to R_min (${rMin.toFixed(2)}). Column is approaching infinite stages and flooding risk is elevated.`);
    }

    // 2. Azeotrope Proximity
    if (xD >= AZEOTROPE_ETHANOL - 0.01) {
      hazards.push(`[WARNING] Distillate purity (xD=${xD.toFixed(2)}) is approaching the ethanol-water azeotrope (${AZEOTROPE_ETHANOL}). Product may fail to meet spec under slight disturbances.`);
    }

    // 3. High Capital / Pressure Drop Risk
    if (totalStages > 35) {
      hazards.push(`[INFO] High stage count (${totalStages} trays) calculated. Significant pressure drop and high capital cost expected.`);
    }

    // 4. Feed vs Bottoms Warning
    if (zF - xB < 0.02) {
      hazards.push(`[WARNING] Bottoms purity is very close to feed composition. Stripping section efficiency is low.`);
    }

    if (hazards.length === 0) {
      hazards.push(`[SAFE] No critical operational deviations detected. Column operating within robust stability margins.`);
    }

    return hazards;
  }
};
