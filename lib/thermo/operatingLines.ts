import { getVaporEquilibrium } from './vle';

export interface IntersectionPoint {
  x: number;
  y: number;
}

/**
 * Calculates the intersection of the q-line with the VLE equilibrium curve.
 * This point (xp, yp) is used to determine the feed pinch minimum reflux ratio.
 */
export function getQLineVLEIntersection(zF: number, q: number): IntersectionPoint {
  if (Math.abs(q - 1) < 1e-5) {
    // Saturated liquid (vertical q-line)
    return { x: zF, y: getVaporEquilibrium(zF) };
  }

  // q-line equation: y = (q / (q - 1)) * x - (zF / (q - 1))
  const qSlope = q / (q - 1);
  const qIntercept = -zF / (q - 1);

  // Scan for intersection (since VLE is piecewise linear, we can do a numerical binary search or fine scan)
  // The intersection will be between x = 0 and x = zF (if q > 1) or zF and 1 (if q < 1)
  let xLeft = 0;
  let xRight = 1;

  if (q > 1) {
    xRight = zF;
  } else if (q < 0) {
    xLeft = zF;
  }

  // Binary search for intersection
  let xMid = (xLeft + xRight) / 2;
  for (let iter = 0; iter < 100; iter++) {
    const yVLE = getVaporEquilibrium(xMid);
    const yQLine = qSlope * xMid + qIntercept;
    
    if (Math.abs(yVLE - yQLine) < 1e-6) break;

    // Depending on q, the q-line slope is positive (>1 for q>1) or negative (0<q<1) or positive (<1 for q<0)
    // We adjust binary search based on which curve is "above" the other
    if (yVLE > yQLine) {
      if (q > 1 || q < 0) xLeft = xMid;
      else xRight = xMid;
    } else {
      if (q > 1 || q < 0) xRight = xMid;
      else xLeft = xMid;
    }
    xMid = (xLeft + xRight) / 2;
  }

  return { x: xMid, y: getVaporEquilibrium(xMid) };
}

/**
 * Calculates the absolute minimum reflux ratio (R_min) considering both
 * feed pinch and potential tangent pinch (crucial for Ethanol-Water).
 */
export function calculateRMin(zF: number, xD: number, q: number): number {
  const pinch = getQLineVLEIntersection(zF, q);
  
  // R_min from feed pinch
  let rMin = (xD - pinch.y) / (pinch.y - pinch.x);

  // Tangent pinch check: scan VLE curve between pinch.x and xD
  // to see if a higher R is required to prevent crossing the curve.
  const steps = 200;
  const dx = (xD - pinch.x) / steps;
  for (let i = 1; i < steps; i++) {
    const xScan = pinch.x + i * dx;
    const yScan = getVaporEquilibrium(xScan);
    // R_local = (xD - y) / (y - x)
    // Avoid division by zero
    if (Math.abs(yScan - xScan) > 1e-5) {
      const rLocal = (xD - yScan) / (yScan - xScan);
      if (rLocal > rMin) {
        rMin = rLocal;
      }
    }
  }

  return Math.max(0, rMin);
}

/**
 * Calculates the intersection between the Rectifying Operating Line (ROL) and the q-line.
 */
export function getOperatingLinesIntersection(zF: number, xD: number, q: number, R: number): IntersectionPoint {
  if (Math.abs(q - 1) < 1e-5) {
    // Saturated liquid
    const xi = zF;
    const yi = (R / (R + 1)) * xi + (xD / (R + 1));
    return { x: xi, y: yi };
  }

  const xi = (xD * (q - 1) + zF * (R + 1)) / (R + q);
  const yi = (R / (R + 1)) * xi + (xD / (R + 1));
  return { x: xi, y: yi };
}

/**
 * Evaluates the y-value of the Rectifying Operating Line (ROL) at a given x.
 */
export function evaluateROL(x: number, xD: number, R: number): number {
  return (R / (R + 1)) * x + (xD / (R + 1));
}

/**
 * Evaluates the y-value of the Stripping Operating Line (SOL) at a given x.
 * The SOL connects (xB, xB) to the intersection point (xi, yi).
 */
export function evaluateSOL(x: number, xB: number, xi: number, yi: number): number {
  // Slope = (yi - xB) / (xi - xB)
  const slope = (yi - xB) / (xi - xB);
  return slope * (x - xB) + xB;
}
