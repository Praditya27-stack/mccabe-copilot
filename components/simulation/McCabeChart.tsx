'use client';

import React, { useMemo } from 'react';
import { useSimulationStore } from '@/stores/useSimulation';
import { generateVLEChartData } from '@/lib/thermo/vle';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const McCabeChart: React.FC = () => {
  const { results } = useSimulationStore();
  const { staircasePoints, qLinePoints, rolPoints, solPoints } = results;

  // Memoize static VLE data
  const { vleData, diagonalData } = useMemo(() => {
    const { vle, diagonal } = generateVLEChartData(50);
    return { vleData: vle, diagonalData: diagonal };
  }, []);

  // Empty shape to hide markers when only line is desired
  const EmptyShape = () => <circle r={0} />;

  // Custom tooltip to show clean coordinate information
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-neutral-900 border border-neutral-700 p-2.5 rounded-lg shadow-lg text-xs space-y-1">
          <p className="font-semibold text-neutral-200">{payload[0].name}</p>
          <p className="text-neutral-400">
            x: <span className="font-mono text-neutral-100">{data.x?.toFixed(3)}</span>
          </p>
          <p className="text-neutral-400">
            y: <span className="font-mono text-neutral-100">{data.y?.toFixed(3)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl flex flex-col h-[560px]">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-2">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100">McCabe-Thiele Equilibrium Diagram</h2>
          <p className="text-xs text-neutral-400">Ethanol - Water System @ 101.325 kPa</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block"></span>
            <span className="text-neutral-300">VLE</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span className="text-neutral-300">ROL</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
            <span className="text-neutral-300">SOL</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
            <span className="text-neutral-300">q-Line</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            <span className="text-neutral-300">Trays</span>
          </span>
        </div>
      </div>

      <div className="flex-1 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            
            <XAxis
              type="number"
              dataKey="x"
              name="Liquid Fraction (x)"
              domain={[0, 1]}
              tickCount={11}
              stroke="#737373"
              tick={{ fill: '#a3a3a3', fontSize: 11 }}
              label={{
                value: 'Liquid Mole Fraction (x)',
                position: 'insideBottom',
                offset: -15,
                fill: '#a3a3a3',
                fontSize: 12,
              }}
            />
            
            <YAxis
              type="number"
              dataKey="y"
              name="Vapor Fraction (y)"
              domain={[0, 1]}
              tickCount={11}
              stroke="#737373"
              tick={{ fill: '#a3a3a3', fontSize: 11 }}
              label={{
                value: 'Vapor Mole Fraction (y)',
                angle: -90,
                position: 'insideLeft',
                offset: 5,
                fill: '#a3a3a3',
                fontSize: 12,
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 45° Diagonal Reference Line */}
            <Scatter
              name="45° Line"
              data={diagonalData}
              line={{ stroke: '#525252', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              shape={EmptyShape}
              isAnimationActive={false}
            />

            {/* VLE Equilibrium Curve */}
            <Scatter
              name="Equilibrium Curve"
              data={vleData}
              line={{ stroke: '#818cf8', strokeWidth: 2.5 }}
              shape={EmptyShape}
              isAnimationActive={false}
            />

            {/* q-Line */}
            <Scatter
              name="q-Line"
              data={qLinePoints}
              line={{ stroke: '#22d3ee', strokeWidth: 2 }}
              shape={EmptyShape}
              isAnimationActive={false}
            />

            {/* Rectifying Operating Line (ROL) */}
            <Scatter
              name="ROL"
              data={rolPoints}
              line={{ stroke: '#34d399', strokeWidth: 2 }}
              shape={EmptyShape}
              isAnimationActive={false}
            />

            {/* Stripping Operating Line (SOL) */}
            <Scatter
              name="SOL"
              data={solPoints}
              line={{ stroke: '#fb7185', strokeWidth: 2 }}
              shape={EmptyShape}
              isAnimationActive={false}
            />

            {/* Staircase Steps */}
            <Scatter
              name="Staircase Trays"
              data={staircasePoints}
              line={{ stroke: '#fbbf24', strokeWidth: 2 }}
              fill="#fbbf24"
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
