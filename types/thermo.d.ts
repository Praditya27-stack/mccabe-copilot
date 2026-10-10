export interface AntoineParameters {
  A: number;
  B: number;
  C: number;
}

export interface WilsonParameters {
  lambda12: number;
  lambda21: number;
}

export interface VLEPoint {
  x: number; // Liquid mole fraction (Ethanol)
  y: number; // Vapor mole fraction (Ethanol)
  T?: number; // Bubble point temperature in °C
}

export interface AzeotropePoint {
  x: number;
  y: number;
  T: number;
}
