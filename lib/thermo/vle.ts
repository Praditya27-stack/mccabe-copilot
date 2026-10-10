// Experimental VLE data for Ethanol (1) - Water (2) at 1 atm (101.325 kPa)
// (x = mole fraction of ethanol in liquid, y = mole fraction of ethanol in vapor)
const VLE_DATA = [
  [0.0, 0.0],
  [0.0190, 0.1700],
  [0.0721, 0.3891],
  [0.0966, 0.4375],
  [0.1238, 0.4704],
  [0.1661, 0.5089],
  [0.2337, 0.5445],
  [0.2608, 0.5580],
  [0.3273, 0.5826],
  [0.3965, 0.6122],
  [0.5079, 0.6564],
  [0.5198, 0.6599],
  [0.5732, 0.6841],
  [0.6763, 0.7385],
  [0.7472, 0.7815],
  [0.8943, 0.8943], // Azeotrope
  [1.0, 1.0]
];

export const AZEOTROPE_ETHANOL = 0.8943;

/**
 * Returns the vapor mole fraction (y) for a given liquid mole fraction (x)
 * using linear interpolation on empirical Ethanol-Water VLE data.
 */
export function getVaporEquilibrium(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  for (let i = 0; i < VLE_DATA.length - 1; i++) {
    const [x1, y1] = VLE_DATA[i];
    const [x2, y2] = VLE_DATA[i + 1];

    if (x >= x1 && x <= x2) {
      // Linear interpolation
      return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
    }
  }
  return x;
}

/**
 * Returns the liquid mole fraction (x) for a given vapor mole fraction (y)
 * using linear interpolation (Inverse function of VLE).
 */
export function getLiquidEquilibrium(y: number): number {
  if (y <= 0) return 0;
  if (y >= 1) return 1;

  // Search through VLE data (which is strictly monotonically increasing)
  for (let i = 0; i < VLE_DATA.length - 1; i++) {
    const [x1, y1] = VLE_DATA[i];
    const [x2, y2] = VLE_DATA[i + 1];

    if (y >= y1 && y <= y2) {
      // Linear interpolation
      return x1 + ((y - y1) / (y2 - y1)) * (x2 - x1);
    }
  }
  return y;
}

export interface ChartPoint {
  x: number;
  y: number;
}

/**
 * Generates the VLE curve data points and the 45-degree reference line
 * mapped specifically for Recharts.
 */
export function generateVLEChartData(pointsCount: number = 100): { vle: ChartPoint[], diagonal: ChartPoint[] } {
  const vle: ChartPoint[] = [];
  const diagonal: ChartPoint[] = [];

  for (let i = 0; i <= pointsCount; i++) {
    const x = i / pointsCount;
    const y = getVaporEquilibrium(x);
    vle.push({ x, y });
    diagonal.push({ x, y: x });
  }

  return { vle, diagonal };
}
