'use client';

import React from 'react';
import { useSimulationStore } from '@/stores/useSimulation';

export const ColumnSchematic: React.FC = () => {
  const { inputs, results } = useSimulationStore();
  const { zF, xD, xB, q, R } = inputs;
  const { totalStages, feedStage } = results;

  const visualTraysCount = Math.max(5, Math.min(24, Math.round(totalStages)));
  const clampedFeedStage = Math.max(1, Math.min(totalStages, feedStage));
  const colX = 220;
  const colY = 90;
  const colW = 160;
  const colH = 460;

  // Ensure feed tray maps exactly to one of the visual trays (clamp it inside the column, excluding bottom pool)
  const rawVisualFeedIndex = Math.round((clampedFeedStage / totalStages) * visualTraysCount);
  const visualFeedIndex = Math.max(1, Math.min(visualTraysCount - 2, rawVisualFeedIndex - 1));
  
  // Calculate exact Y coordinate of that visual tray
  const feedY = colY + 35 + (visualFeedIndex * (colH - 70)) / (visualTraysCount - 1);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl flex flex-col h-[560px] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-2 z-10">
        <div>
          <h2 className="text-lg font-semibold text-neutral-100 flex items-center space-x-2">
            <span>SCADA Physical Column Schematic</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              Interactive SVG
            </span>
          </h2>
          <p className="text-xs text-neutral-400">Continuous Sieve-Tray Fractionator & Hydraulics</p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="text-right">
            <span className="text-neutral-500 block text-[10px]">TRAYS</span>
            <span className="text-amber-400 font-bold">{totalStages} Stages</span>
          </div>
          <div className="text-right">
            <span className="text-neutral-500 block text-[10px]">FEED STAGE</span>
            <span className="text-emerald-400 font-bold">Tray #{feedStage}</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 w-full relative flex items-center justify-center">
        <svg
          viewBox="0 0 600 620"
          className="w-full h-full max-h-[480px] select-none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="colBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            <linearGradient id="vaporGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="condenserGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            <linearGradient id="reboilerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#881337" />
              <stop offset="100%" stopColor="#4c0519" />
            </linearGradient>

            {/* Pulsing Dash Animation Style */}
            <style>{`
              @keyframes flowAnimation {
                from { stroke-dashoffset: 24; }
                to { stroke-dashoffset: 0; }
              }
              .animated-flow {
                stroke-dasharray: 6 4;
                animation: flowAnimation 1.2s linear infinite;
              }
              .animated-reflux {
                stroke-dasharray: 6 4;
                animation: flowAnimation 1.5s linear infinite reverse;
              }
              .pulse-glow {
                animation: pulseGlow 2s ease-in-out infinite alternate;
              }
              @keyframes pulseGlow {
                from { opacity: 0.6; }
                to { opacity: 1; }
              }
            `}</style>
          </defs>

          {/* ================= COLUMN SHELL ================= */}
          {/* Main Column Body */}
          <rect
            x={colX}
            y={colY + 25}
            width={colW}
            height={colH - 50}
            fill="url(#colBodyGrad)"
            stroke="#475569"
            strokeWidth="3"
          />

          {/* Dished Top Cap (Condenser end) */}
          <path
            d={`M ${colX} ${colY + 25} C ${colX + 30} ${colY - 5}, ${colX + colW - 30} ${colY - 5}, ${colX + colW} ${colY + 25} Z`}
            fill="url(#colBodyGrad)"
            stroke="#475569"
            strokeWidth="3"
          />

          {/* Dished Bottom Cap (Reboiler end) */}
          <path
            d={`M ${colX} ${colY + colH - 25} C ${colX + 30} ${colY + colH + 5}, ${colX + colW - 30} ${colY + colH + 5}, ${colX + colW} ${colY + colH - 25} Z`}
            fill="url(#colBodyGrad)"
            stroke="#475569"
            strokeWidth="3"
          />

          {/* Column Internal Liquid Pool (Bottom Sump) */}
          <path
            d={`M ${colX + 3} ${colY + colH - 35} L ${colX + colW - 3} ${colY + colH - 35} C ${colX + colW - 30} ${colY + colH + 2}, ${colX + 30} ${colY + colH + 2}, ${colX + 3} ${colY + colH - 35} Z`}
            fill="#be123c"
            fillOpacity="0.4"
          />

          {/* ================= DYNAMIC TRAYS ================= */}
          {Array.from({ length: visualTraysCount }).map((_, i) => {
            const trayY = colY + 35 + (i * (colH - 70)) / (visualTraysCount - 1);
            const isFeed = Math.abs(trayY - feedY) < 5;

            return (
              <g key={i}>
                {/* Sieve Tray Metal Line */}
                <line
                  x1={colX + 12}
                  y1={trayY}
                  x2={colX + colW - 12}
                  y2={trayY}
                  stroke={isFeed ? '#10b981' : '#64748b'}
                  strokeWidth={isFeed ? '3' : '1.5'}
                  strokeDasharray="4 2"
                />

                {/* Liquid Holdup on Tray */}
                <rect
                  x={colX + 14}
                  y={trayY - 4}
                  width={colW - 28}
                  height={3}
                  fill={isFeed ? '#10b981' : '#f59e0b'}
                  fillOpacity="0.3"
                />

                {/* Downcomer (Alternating left/right) */}
                <line
                  x1={i % 2 === 0 ? colX + colW - 15 : colX + 15}
                  y1={trayY}
                  x2={i % 2 === 0 ? colX + colW - 15 : colX + 15}
                  y2={trayY + (colH - 70) / (visualTraysCount - 1) * 0.7}
                  stroke="#475569"
                  strokeWidth="1.5"
                />

                {/* Subtle Tray Numbers (Top, Feed, Bottom) */}
                {(i === 0 || isFeed || i === visualTraysCount - 1) && (
                  <text
                    x={colX + colW / 2}
                    y={trayY - 6}
                    fill={isFeed ? '#10b981' : '#475569'}
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {isFeed ? `Tray #${feedStage}` : i === 0 ? 'Tray #1' : `Tray #${Math.round(totalStages)}`}
                  </text>
                )}
              </g>
            );
          })}

          {/* ================= FEED INLET (DYNAMIC) ================= */}
          <g className="pulse-glow">
            {/* Feed Pipe */}
            <path
              d={`M 60 ${feedY} L ${colX} ${feedY}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
            />
            {/* Animated Stream */}
            <path
              d={`M 60 ${feedY} L ${colX} ${feedY}`}
              fill="none"
              stroke="#a7f3d0"
              strokeWidth="2"
              className="animated-flow"
            />
            {/* Feed Arrowhead */}
            <polygon 
              points={`${colX + 5},${feedY} ${colX - 5},${feedY - 4} ${colX - 5},${feedY + 4}`} 
              fill="#10b981" 
            />
            {/* Feed Nozzle Flange */}
            <rect
              x={colX - 8}
              y={feedY - 8}
              width={8}
              height={16}
              fill="#059669"
              rx={2}
            />
            {/* Feed Label Box */}
            <rect
              x={15}
              y={feedY - 22}
              width={140}
              height={44}
              rx={6}
              fill="#064e3b"
              fillOpacity="0.85"
              stroke="#10b981"
              strokeWidth="1"
            />
            <text x={24} y={feedY - 6} fill="#ecfdf5" fontSize="11" fontWeight="bold">
              FEED INLET (zF: {(zF * 100).toFixed(1)}%)
            </text>
            <text x={24} y={feedY + 11} fill="#6ee7b7" fontSize="10" fontFamily="monospace">
              Tray #{feedStage} • q={q.toFixed(2)}
            </text>
          </g>

          {/* ================= OVERHEAD CONDENSER & REFLUX ================= */}
          {/* Overhead Vapor Pipe */}
          <path
            d={`M ${colX + colW / 2} ${colY + 5} L ${colX + colW / 2} 40 L 460 40 L 460 70`}
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
          />
          <path
            d={`M ${colX + colW / 2} ${colY + 5} L ${colX + colW / 2} 40 L 460 40 L 460 70`}
            fill="none"
            stroke="#c7d2fe"
            strokeWidth="1.5"
            className="animated-flow"
          />

          {/* Condenser Vessel */}
          <rect
            x={420}
            y={70}
            width={80}
            height={50}
            rx={8}
            fill="url(#condenserGrad)"
            stroke="#818cf8"
            strokeWidth="2"
          />
          <text x={432} y={92} fill="#e0e7ff" fontSize="10" fontWeight="bold">TOTAL</text>
          <text x={428} y={106} fill="#818cf8" fontSize="9" fontWeight="bold">CONDENSER</text>

          {/* Pipe to Reflux Drum */}
          <line x1={460} y1={120} x2={460} y2={150} stroke="#6366f1" strokeWidth="2.5" />

          {/* Reflux Drum */}
          <ellipse cx={460} cy={165} rx={30} ry={16} fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
          <text x={442} y={169} fill="#c7d2fe" fontSize="8" fontWeight="bold">DRUM</text>

          {/* Distillate Product Stream (Right) */}
          <path d="M 490 165 L 565 165" fill="none" stroke="#6366f1" strokeWidth="3" />
          <path d="M 490 165 L 565 165" fill="none" stroke="#a5b4fc" strokeWidth="1.5" className="animated-flow" />
          {/* Distillate Arrow */}
          <polygon points="565,160 575,165 565,170" fill="#6366f1" />
          
          <rect x={485} y={180} width={105} height={38} rx={6} fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
          <text x={493} y={196} fill="#e0e7ff" fontSize="10" fontWeight="bold">DISTILLATE (xD)</text>
          <text x={493} y={210} fill="#818cf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
            {(xD * 100).toFixed(1)} mol%
          </text>

          {/* Reflux Return Stream (Back to Top Tray) */}
          <path
            d={`M 430 165 L 390 165 L 390 ${colY + 40} L ${colX + colW} ${colY + 40}`}
            fill="none"
            stroke="#818cf8"
            strokeWidth="2.5"
          />
          <path
            d={`M 430 165 L 390 165 L 390 ${colY + 40} L ${colX + colW} ${colY + 40}`}
            fill="none"
            stroke="#e0e7ff"
            strokeWidth="1.5"
            className="animated-reflux"
          />
          <text x={395} y={150} fill="#a5b4fc" fontSize="9" fontWeight="bold">Reflux R={R.toFixed(2)}</text>

          {/* ================= REBOILER & BOTTOMS ================= */}
          {/* Bottom Liquid Pipe to Reboiler */}
          <path
            d={`M ${colX + colW / 2} ${colY + colH + 2} L ${colX + colW / 2} 535 L 420 535`}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="3"
          />
          <path
            d={`M ${colX + colW / 2} ${colY + colH + 2} L ${colX + colW / 2} 535 L 420 535`}
            fill="none"
            stroke="#fecdd3"
            strokeWidth="1.5"
            className="animated-flow"
          />

          {/* Reboiler Vessel */}
          <rect
            x={420}
            y={495}
            width={80}
            height={55}
            rx={8}
            fill="url(#reboilerGrad)"
            stroke="#fb7185"
            strokeWidth="2"
          />
          <text x={434} y={518} fill="#ffe4e6" fontSize="10" fontWeight="bold">KETTLE</text>
          <text x={430} y={532} fill="#fb7185" fontSize="9" fontWeight="bold">REBOILER</text>

          {/* Reboiler Vapor Return to Column */}
          <path
            d={`M 430 495 L 430 480 L 390 480 L 390 ${colY + colH - 45} L ${colX + colW} ${colY + colH - 45}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
          />
          <path
            d={`M 430 495 L 430 480 L 390 480 L 390 ${colY + colH - 45} L ${colX + colW} ${colY + colH - 45}`}
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.5"
            className="animated-reflux"
          />
          <text x={394} y={470} fill="#f59e0b" fontSize="8" fontWeight="bold">Vapor Boilup (V)</text>

          {/* Bottoms Product Stream (Out of Reboiler) */}
          <path d="M 500 535 L 565 535" fill="none" stroke="#f43f5e" strokeWidth="3" />
          <path d="M 500 535 L 565 535" fill="none" stroke="#fecdd3" strokeWidth="1.5" className="animated-flow" />
          <polygon points="565,530 575,535 565,540" fill="#f43f5e" />

          <rect x={485} y={515} width={105} height={38} rx={6} fill="#4c0519" stroke="#f43f5e" strokeWidth="1" />
          <text x={493} y={531} fill="#ffe4e6" fontSize="10" fontWeight="bold">BOTTOMS (xB)</text>
          <text x={493} y={545} fill="#fb7185" fontSize="11" fontFamily="monospace" fontWeight="bold">
            {(xB * 100).toFixed(1)} mol%
          </text>
        </svg>
      </div>
    </div>
  );
};
