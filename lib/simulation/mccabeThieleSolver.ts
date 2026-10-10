import { getLiquidEquilibrium } from '../thermo/vle';
import { 
  calculateRMin, 
  getOperatingLinesIntersection, 
  evaluateROL, 
  evaluateSOL, 
  getQLineVLEIntersection 
} from '../thermo/operatingLines';

export interface Point {
  x: number;
  y: number;
}

export interface StageInfo {
  stageNumber: number;
  x: number; // Liquid composition
  y: number; // Vapor composition
  section: 'rectifying' | 'stripping';
}

export interface SolverResult {
  stages: StageInfo[];
  staircasePoints: Point[];
  totalStages: number;
  feedStage: number;
  rMin: number;
  intersection: Point;
  qLinePoints: Point[];
  rolPoints: Point[];
  solPoints: Point[];
  feasible: boolean;
}

export interface SolverInputs {
  zF: number;
  xD: number;
  xB: number;
  q: number;
  R: number;
}

/**
 * Solves the McCabe-Thiele distillation model step-by-step.
 */
export function solveMcCabeThiele(inputs: SolverInputs): SolverResult {
  const { zF, xD, xB, q, R } = inputs;

  // 1. Calculate Minimum Reflux Ratio
  const rMin = calculateRMin(zF, xD, q);
  const feasible = R > rMin && xD > zF && zF > xB;

  // 2. Find Operating Lines Intersection (xi, yi)
  const intersection = getOperatingLinesIntersection(zF, xD, q, R);
  const { x: xi, y: yi } = intersection;

  // 3. Operating Line plotting coordinates
  const rolPoints: Point[] = [
    { x: xi, y: yi },
    { x: xD, y: xD }
  ];

  const solPoints: Point[] = [
    { x: xB, y: xB },
    { x: xi, y: yi }
  ];

  // q-line plotting points (from (zF, zF) to (xi, yi))
  const qLinePoints: Point[] = [
    { x: zF, y: zF },
    { x: xi, y: yi }
  ];

  // 4. Stepping Algorithm
  const stages: StageInfo[] = [];
  const staircasePoints: Point[] = [];

  let currentY = xD;
  let currentX = xD;
  staircasePoints.push({ x: currentX, y: currentY });

  let stageCount = 0;
  let feedStage = 1;
  let feedStageAssigned = false;
  const MAX_STAGES = 100;

  let xPrev = xD;

  while (currentX > xB && stageCount < MAX_STAGES) {
    stageCount++;

    // Step Horizontal: to VLE curve
    const xEquilibrium = getLiquidEquilibrium(currentY);
    staircasePoints.push({ x: xEquilibrium, y: currentY });

    const isRectifying = xEquilibrium > xi;
    const section = isRectifying ? 'rectifying' : 'stripping';

    if (!isRectifying && !feedStageAssigned) {
      feedStage = stageCount;
      feedStageAssigned = true;
    }

    stages.push({
      stageNumber: stageCount,
      x: xEquilibrium,
      y: currentY,
      section
    });

    // Step Vertical: down to operating line
    let yNext: number;
    if (isRectifying) {
      yNext = evaluateROL(xEquilibrium, xD, R);
    } else {
      yNext = evaluateSOL(xEquilibrium, xB, xi, yi);
    }

    // Guard: yNext shouldn't go below xB for graph clarity
    yNext = Math.max(xB, yNext);
    staircasePoints.push({ x: xEquilibrium, y: yNext });

    xPrev = currentX;
    currentX = xEquilibrium;
    currentY = yNext;
  }

  // Fractional Stage calculation
  let totalStages = stageCount;
  if (stages.length > 0) {
    const lastStageX = stages[stages.length - 1].x;
    if (lastStageX < xB && stages.length > 1) {
      const prevStageX = stages[stages.length - 2].x;
      const frac = (prevStageX - xB) / (prevStageX - lastStageX);
      totalStages = (stages.length - 1) + Math.max(0, Math.min(1, frac));
    }
  }

  return {
    stages,
    staircasePoints,
    totalStages: parseFloat(totalStages.toFixed(2)),
    feedStage: feedStageAssigned ? feedStage : stageCount,
    rMin: parseFloat(rMin.toFixed(3)),
    intersection: { x: parseFloat(xi.toFixed(4)), y: parseFloat(yi.toFixed(4)) },
    qLinePoints,
    rolPoints,
    solPoints,
    feasible
  };
}
