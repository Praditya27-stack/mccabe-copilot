import { solveMcCabeThiele } from '../lib/simulation/mccabeThieleSolver';
import { calculateRMin } from '../lib/thermo/operatingLines';
import { getVaporEquilibrium, getLiquidEquilibrium } from '../lib/thermo/vle';

function runUnitTests() {
  console.log("=== Running McCabe-Thiele Solver Tests ===");

  // 1. VLE Inversion Check
  const xTest = 0.4;
  const yTest = getVaporEquilibrium(xTest);
  const xRecovered = getLiquidEquilibrium(yTest);
  console.log(`[VLE Check] x=${xTest} -> y=${yTest.toFixed(4)} -> xRecovered=${xRecovered.toFixed(4)}`);
  if (Math.abs(xTest - xRecovered) < 0.01) {
    console.log("✅ VLE function invertibility test PASSED.");
  } else {
    console.error("❌ VLE function invertibility test FAILED.");
  }

  // 2. Minimum Reflux Ratio Test
  const rMin = calculateRMin(0.4, 0.8, 1.0);
  console.log(`[R_min Check] For zF=0.4, xD=0.8, q=1.0: R_min = ${rMin.toFixed(3)}`);
  if (rMin > 0 && rMin < 3.0) {
    console.log("✅ R_min calculation test PASSED.");
  } else {
    console.error("❌ R_min calculation test FAILED.");
  }

  // 3. Complete Solver Test
  const inputs = {
    zF: 0.4,
    xD: 0.8,
    xB: 0.05,
    q: 1.0,
    R: 1.5 // Operating above R_min
  };

  const result = solveMcCabeThiele(inputs);
  console.log(`[Solver Check] Total Stages = ${result.totalStages}, Feed Stage = ${result.feedStage}`);
  console.log(`[Solver Check] Staircase Points Generated = ${result.staircasePoints.length}`);

  if (result.stages.length > 0 && result.totalStages > 1 && result.feedStage >= 1) {
    console.log("✅ McCabe-Thiele solver test PASSED.");
  } else {
    console.error("❌ McCabe-Thiele solver test FAILED.");
  }
}

runUnitTests();
