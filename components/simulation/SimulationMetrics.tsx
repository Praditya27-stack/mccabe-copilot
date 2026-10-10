'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/useSimulation';
import { Layers, Activity, Thermometer, Droplets } from 'lucide-react';

export const SimulationMetrics: React.FC = () => {
  const { inputs, results } = useSimulationStore();
  const { R } = inputs;
  const { totalStages, feedStage, rMin } = results;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Total Stages */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center space-x-4 shadow-md">
        <div className="p-3 bg-indigo-950/50 rounded-lg text-indigo-400">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Total Stages</p>
          <p className="text-2xl font-semibold text-neutral-100">{totalStages}</p>
        </div>
      </div>

      {/* Metric 2: Feed Stage */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center space-x-4 shadow-md">
        <div className="p-3 bg-emerald-950/50 rounded-lg text-emerald-400">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Feed Stage</p>
          <p className="text-2xl font-semibold text-neutral-100">{feedStage}</p>
        </div>
      </div>

      {/* Metric 3: Minimum Reflux */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center space-x-4 shadow-md">
        <div className="p-3 bg-amber-950/50 rounded-lg text-amber-400">
          <Droplets className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">R Minimum</p>
          <p className="text-2xl font-semibold text-neutral-100">{rMin.toFixed(2)}</p>
        </div>
      </div>

      {/* Metric 4: Operating Reflux */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center space-x-4 shadow-md">
        <div className="p-3 bg-rose-950/50 rounded-lg text-rose-400">
          <Thermometer className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">Op. Reflux (R)</p>
          <p className="text-2xl font-semibold text-neutral-100">{R.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};
