/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Brain, Sparkles, BookOpen, Clock, RefreshCw } from "lucide-react";

interface HeaderProps {
  currentConcept: string;
  isSimulating: boolean;
  onUpdateConcept: (concept: string) => void;
  onRestartSession: () => void;
  onToggleSimulation: () => void;
  isMocking: boolean;
}

export default function Header({
  currentConcept,
  isSimulating,
  onUpdateConcept,
  onRestartSession,
  onToggleSimulation,
  isMocking,
}: HeaderProps) {
  const [conceptInput, setConceptInput] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conceptInput.trim()) {
      onUpdateConcept(conceptInput.trim());
      setShowEditor(false);
    }
  };

  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title and Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-md animate-pulse">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-slate-50 tracking-tight font-display">
                Classroom Intelligence & Engagement Monitor
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.25)]">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Live Session
              </span>
              {isMocking && (
                <span className="px-2 py-0.5 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" /> Sandbox Mode
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
              <span className="text-indigo-400 font-semibold">localhost:3000</span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3" /> Real-time Pedagogy Diagnostics
              </span>
            </p>
          </div>
        </div>

        {/* Concept display and controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3.5 max-w-sm md:max-w-md">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
                Active Topic Concept
              </p>
              {showEditor ? (
                <form onSubmit={handleSubmit} className="flex gap-1.5 mt-1">
                  <input
                    type="text"
                    defaultValue={currentConcept}
                    onChange={(e) => setConceptInput(e.target.value)}
                    placeholder="Enter current topic"
                    className="text-xs text-slate-200 bg-slate-950 border border-slate-700 rounded px-2 py-1 focus:outline-hidden focus:border-indigo-400 font-sans w-full"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10px] px-2.5 py-1 rounded cursor-pointer transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditor(false)}
                    className="text-slate-400 hover:text-slate-200 text-[10px] px-1"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-2 mt-1">
                  <p
                    className="text-xs font-semibold text-slate-200 truncate cursor-pointer hover:text-indigo-400 font-sans"
                    onClick={() => {
                      setConceptInput(currentConcept);
                      setShowEditor(true);
                    }}
                    title="Click to edit topic"
                  >
                    {currentConcept || "Default Subject Scope"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live simulation ticker toggler */}
            <button
              onClick={onToggleSimulation}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border transition-all ${
                isSimulating
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-slate-905 bg-slate-900 border-slate-800 text-slate-450 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isSimulating ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-600"
                }`}
              />
              {isSimulating ? "Ticker Active" : "Ticker Paused"}
            </button>

            {/* Sync / Reset session */}
            <button
              onClick={onRestartSession}
              title="Reset data models to defaults"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
