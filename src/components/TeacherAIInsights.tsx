/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sparkles, HelpCircle, AlertOctagon, Lightbulb, TrendingUp, RefreshCw } from "lucide-react";
import { TeacherInsight } from "../types";

interface TeacherAIInsightsProps {
  studentsCount: number;
  triggerGeneration: number; // Increment to force refetch
}

export default function TeacherAIInsights({ studentsCount, triggerGeneration }: TeacherAIInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [harmonyScore, setHarmonyScore] = useState(78);
  const [tips, setTips] = useState<string>("Engage distracted seating coordinates in Row 3 through continuous inquiry. Introduce visual illustrations of nested looping structures to align the back-row clusters displaying conceptual confusion.");
  const [insights, setInsights] = useState<TeacherInsight[]>([
    { timestamp: "Current", category: "alert", text: "Liam and Henry show 5 min focus drifts. Call on them to reorient.", urgency: "high" },
    { timestamp: "Current", category: "insight", text: "Class-wide attention peaked during interactive grid simulation.", urgency: "low" },
    { timestamp: "Current", category: "recommendation", text: "Slow down teaching pace. Sub-topic multidimensional arrays shows 40% confusion.", urgency: "medium" }
  ]);
  const [isSimulation, setIsSimulation] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setIsRateLimited(false);
    try {
      const response = await fetch("/api/gemini/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.generalScore) setHarmonyScore(data.generalScore);
        if (data.pedagogicalTip) setTips(data.pedagogicalTip);
        if (data.insights && Array.isArray(data.insights)) {
          // Map to match internal structure
          const formatted = data.insights.map((item: any) => ({
            timestamp: "Live",
            category: item.category || "insight",
            text: item.text,
            urgency: item.urgency || "medium"
          }));
          setInsights(formatted);
        }
        setIsSimulation(data.isMock ?? true);
        if (data.error && data.isMock) {
          setIsRateLimited(true);
        }
      }
    } catch (err) {
      console.error("Failed to load Gemini insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [triggerGeneration]);

  // Color mappings for urgencies (optimized for dark slate-800 widgets)
  const getUrgencyBadge = (urgency: "high" | "medium" | "low") => {
    switch (urgency) {
      case "high":
        return "bg-rose-950/40 text-rose-300 border-rose-900/30";
      case "medium":
        return "bg-amber-950/40 text-amber-300 border-amber-900/30";
      case "low":
        return "bg-indigo-950/40 text-indigo-300 border-indigo-900/30";
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md flex flex-col h-full">
      <div className="border-b border-slate-700 pb-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-md font-bold text-slate-50 flex items-center gap-1.5 font-display">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            AI Co-Pilot Pedagogy Insights
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Cognitive analyzer evaluating student emotions to provide strategic live micro-interventions.
          </p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="p-2.5 bg-slate-900 hover:bg-slate-750 border border-slate-750 text-slate-405 text-slate-400 hover:text-indigo-400 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50"
          title="Force AI Rerock Analysis"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
          <div className="w-6 h-6 border-2 border-indigo-505 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
            Evaluating Classroom Harmony Model
          </h4>
          <p className="text-[10px] text-slate-450 mt-1 font-mono">Analyzing attention grids & response vectors...</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Harmony score bar meter */}
            <div className="bg-slate-900/60 border border-slate-750/70 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 font-sans flex items-center gap-1.5">
                  Classroom Harmony Index
                  <HelpCircle className="w-3.5 h-3.5 text-slate-505 text-slate-500 cursor-help" title="Weighted ratio of attentiveness against active confusion clusters." />
                </span>
                <span className="text-sm font-extrabold text-indigo-400 font-mono">{harmonyScore}/100</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  style={{ width: `${harmonyScore}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-2">
                {harmonyScore >= 75 ? "✦ Optimal resonance state" : harmonyScore >= 55 ? "✦ Moderated pacing recommended" : "✦ Immediate activation required"}
              </p>
            </div>

            {/* Warning Cards List */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-widest">
                Live Interventions Queue
              </p>
              {insights.map((ins, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-3 flex gap-2.5 items-start text-xs transition-all ${getUrgencyBadge(ins.urgency)}`}
                >
                  {ins.category === "alert" ? (
                    <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5 text-rose-455 text-rose-400" />
                  ) : ins.category === "recommendation" ? (
                    <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-amber-455 text-amber-400" />
                  ) : (
                    <TrendingUp className="w-4 h-4 shrink-0 mt-0.5 text-indigo-455 text-indigo-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans leading-relaxed text-slate-200">{ins.text}</p>
                    <span className="text-[9px] font-mono opacity-60 uppercase mt-1 block">
                      Category: {ins.category} • Urgency: {ins.urgency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Teaching assistant advice box */}
          <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 relative mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-400 tracking-widest">
                AI Pedagogical Strategist
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
              "{tips}"
            </p>
            <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-indigo-900/20 text-[10px] text-slate-500 font-mono leading-none">
              <span>Model: gemini-3.5-flash</span>
              <span>•</span>
              <span>{isSimulation ? (isRateLimited ? "Sandbox Fallback (Rate Limited)" : "Sandbox Cache") : "Live API Sync"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
