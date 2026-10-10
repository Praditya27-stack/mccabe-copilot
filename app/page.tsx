'use client';

import React, { useState, Suspense } from 'react';
import { SimulationControls } from '@/components/simulation/SimulationControls';
import { SimulationMetrics } from '@/components/simulation/SimulationMetrics';
import { McCabeChart } from '@/components/simulation/McCabeChart';
import { ColumnSchematic } from '@/components/simulation/ColumnSchematic';
import { CopilotDock } from '@/components/copilot/CopilotDock';
import { UrlSyncManager } from '@/hooks/useUrlSync';
import { FlaskConical, Bot, Share2, Check, LineChart, Cpu } from 'lucide-react';

export default function Home() {
  const [copilotOpen, setCopilotOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'mccabe' | 'schematic'>('mccabe');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col p-4 md:p-6">
      {/* Background URL Synchronizer */}
      <Suspense fallback={null}>
        <UrlSyncManager />
      </Suspense>

      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-neutral-800 gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-inner">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-100">
              McCabe-Thiele Distillation Simulator
            </h1>
            <p className="text-xs md:text-sm text-neutral-400">
              Continuous Ethanol-Water Binary Rectification System & VLE Modeling
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Share Config Button */}
          <button
            onClick={handleShareLink}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition shadow-sm"
            title="Copy current simulation state URL link"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Share Config</span>
              </>
            )}
          </button>

          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/80">
            Engine: Deterministic VLE Active
          </span>
          
          <button
            onClick={() => setCopilotOpen((prev) => !prev)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              copilotOpen
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI Co-Pilot</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-4 max-w-[1700px] w-full mx-auto">
        {/* KPI Row */}
        <SimulationMetrics />

        {/* Dashboard Grid (3-column layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Controls Column */}
          <div className={copilotOpen ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <SimulationControls />
          </div>

          {/* Interactive Visualizations Column (Tabbed) */}
          <div className={copilotOpen ? 'lg:col-span-5' : 'lg:col-span-8'}>
            {/* View Switcher Tabs */}
            <div className="flex items-center space-x-2 mb-2 bg-neutral-900/60 p-1 rounded-xl border border-neutral-800/80 w-fit">
              <button
                onClick={() => setActiveTab('mccabe')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'mccabe'
                    ? 'bg-neutral-800 text-indigo-400 shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>McCabe-Thiele Diagram</span>
              </button>
              <button
                onClick={() => setActiveTab('schematic')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === 'schematic'
                    ? 'bg-neutral-800 text-emerald-400 shadow-sm border border-neutral-700'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>SCADA Column Schematic</span>
              </button>
            </div>

            {/* Active Visualization */}
            {activeTab === 'mccabe' ? <McCabeChart /> : <ColumnSchematic />}
          </div>

          {/* Copilot Dock Column */}
          {copilotOpen && (
            <div className="lg:col-span-4">
              <CopilotDock isOpen={copilotOpen} onClose={() => setCopilotOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
