'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/useSimulation';
import { AZEOTROPE_ETHANOL } from '@/lib/thermo/vle';
import { AlertTriangle, Info, RefreshCw, Sliders } from 'lucide-react';

export const SimulationControls: React.FC = () => {
  const { inputs, results, setInputs, resetToDefaults } = useSimulationStore();
  const { zF, xD, xB, q, R } = inputs;
  const { rMin, feasible } = results;

  const isPinchRisk = R <= rMin * 1.1;
  const isAzeotropeClose = xD >= AZEOTROPE_ETHANOL - 0.02;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-neutral-100">Process Controls</h2>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center space-x-1 text-xs text-neutral-400 hover:text-indigo-400 transition"
          title="Reset to defaults"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Warnings & Alerts */}
      <div className="space-y-2">
        {isPinchRisk && (
          <div className="flex items-center space-x-2 bg-amber-950/40 border border-amber-800/60 rounded-lg p-2.5 text-amber-300 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              <strong>Pinch Warning:</strong> Operating R ({R.toFixed(2)}) is near or below R_min ({rMin.toFixed(2)}). Trays approach infinity.
            </span>
          </div>
        )}

        {isAzeotropeClose && (
          <div className="flex items-center space-x-2 bg-blue-950/40 border border-blue-800/60 rounded-lg p-2.5 text-blue-300 text-xs">
            <Info className="w-4 h-4 flex-shrink-0 text-blue-400" />
            <span>
              <strong>Azeotrope Limit:</strong> xD ({xD.toFixed(2)}) approaches binary azeotrope ({AZEOTROPE_ETHANOL}). Distillate purity is restricted.
            </span>
          </div>
        )}
      </div>

      {/* Control Sliders */}
      <div className="space-y-4">
        {/* Distillate Purity xD */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300 font-medium">Distillate Purity (x<sub>D</sub>)</span>
            <span className="text-indigo-400 font-mono">{(xD * 100).toFixed(1)} mol%</span>
          </div>
          <input
            type="range"
            min={zF + 0.02}
            max={AZEOTROPE_ETHANOL - 0.005}
            step="0.005"
            value={xD}
            onChange={(e) => setInputs({ xD: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Feed Composition zF */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300 font-medium">Feed Composition (z<sub>F</sub>)</span>
            <span className="text-emerald-400 font-mono">{(zF * 100).toFixed(1)} mol%</span>
          </div>
          <input
            type="range"
            min={xB + 0.02}
            max={xD - 0.02}
            step="0.01"
            value={zF}
            onChange={(e) => setInputs({ zF: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Bottoms Purity xB */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300 font-medium">Bottoms Impurity (x<sub>B</sub>)</span>
            <span className="text-rose-400 font-mono">{(xB * 100).toFixed(1)} mol%</span>
          </div>
          <input
            type="range"
            min="0.005"
            max={zF - 0.02}
            step="0.005"
            value={xB}
            onChange={(e) => setInputs({ xB: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
        </div>

        {/* Reflux Ratio R */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300 font-medium">Reflux Ratio (R)</span>
            <span className="text-amber-400 font-mono">{R.toFixed(2)} (Min: {rMin.toFixed(2)})</span>
          </div>
          <input
            type="range"
            min={Math.max(0.1, rMin * 0.8)}
            max={Math.max(5.0, rMin * 4)}
            step="0.05"
            value={R}
            onChange={(e) => setInputs({ R: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Feed Thermal Quality q */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-neutral-300 font-medium">Feed Thermal Condition (q)</span>
            <span className="text-cyan-400 font-mono">
              {q.toFixed(2)}{' '}
              <span className="text-neutral-500 text-[10px]">
                {q > 1 ? '(Subcooled)' : q === 1 ? '(Sat. Liquid)' : q > 0 ? '(Two-Phase)' : q === 0 ? '(Sat. Vapor)' : '(Superheated)'}
              </span>
            </span>
          </div>
          <input
            type="range"
            min="-0.2"
            max="1.5"
            step="0.05"
            value={q}
            onChange={(e) => setInputs({ q: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
};
