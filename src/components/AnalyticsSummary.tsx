/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { MetricSummary } from "../types";

interface AnalyticsSummaryProps {
  metrics: MetricSummary;
}

export default function AnalyticsSummary({ metrics }: AnalyticsSummaryProps) {
  const { engagementIndex, attentivenessRate, confusionRatio, presentCount, totalCount } = metrics;

  // Circular progress builder helper
  const renderCircleMeter = (value: number, colorClass: string, trackClass: string) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(100, Math.max(0, value)) / 100) * circumference;

    return (
      <svg className="w-16 h-16 transform -rotate-90 select-none">
        {/* Background track */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          className={`${trackClass} fill-none`}
          strokeWidth="5"
        />
        {/* Fill level */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          className={`${colorClass} fill-none transition-all duration-700 ease-out`}
          strokeWidth="5.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // Get color indicators for index ranges (optimized for dark slate-800 widgets)
  const getEngagementColor = (val: number) => {
    if (val >= 75) return { text: "text-emerald-400", stroke: "stroke-emerald-500", track: "stroke-slate-700/50", bg: "bg-emerald-500/10" };
    if (val >= 50) return { text: "text-amber-400", stroke: "stroke-amber-400", track: "stroke-slate-700/50", bg: "bg-amber-500/10" };
    return { text: "text-rose-400", stroke: "stroke-rose-500", track: "stroke-slate-700/50", bg: "bg-rose-500/10" };
  };

  const getAttentiveColor = (val: number) => {
    if (val >= 80) return { text: "text-indigo-400", stroke: "stroke-indigo-500", track: "stroke-slate-700/50", bg: "bg-indigo-500/10" };
    if (val >= 55) return { text: "text-amber-400", stroke: "stroke-amber-400", track: "stroke-slate-700/50", bg: "bg-amber-500/10" };
    return { text: "text-rose-400", stroke: "stroke-rose-500", track: "stroke-slate-700/50", bg: "bg-rose-500/10" };
  };

  const getConfusionColor = (val: number) => {
    if (val > 30) return { text: "text-rose-400", stroke: "stroke-rose-500", track: "stroke-slate-700/50", bg: "bg-rose-500/10" };
    if (val > 12) return { text: "text-amber-400", stroke: "stroke-amber-400", track: "stroke-slate-700/50", bg: "bg-amber-500/10" };
    return { text: "text-emerald-400", stroke: "stroke-emerald-500", track: "stroke-slate-700/50", bg: "bg-emerald-500/10" };
  };

  const engColors = getEngagementColor(engagementIndex);
  const attColors = getAttentiveColor(attentivenessRate);
  const confColors = getConfusionColor(confusionRatio);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* CARD 1: ENGAGEMENT INDEX */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-all flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest font-display">
            <TrendingUp className="w-4 h-4 text-indigo-450 text-indigo-400" />
            Engagement Index
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${engColors.text}`}>
              {engagementIndex}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            {engagementIndex >= 75
              ? "High interaction energy"
              : engagementIndex >= 50
              ? "Moderate focus: tracking active"
              : "Action suggested: trigger quiz"}
          </p>
        </div>
        <div className="relative flex items-center justify-center">
          {renderCircleMeter(engagementIndex, engColors.stroke, engColors.track)}
          <span className={`absolute text-2xs font-bold font-mono ${engColors.text}`}>
            {engagementIndex}
          </span>
        </div>
      </div>

      {/* CARD 2: ATTENTIVENESS RATE */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-all flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest font-display">
            <CheckCircle2 className="w-4 h-4 text-emerald-450 text-emerald-400" />
            Attentiveness Rate
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${attColors.text}`}>
              {attentivenessRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            {attentivenessRate >= 80 ? "Superb visual attention keys" : attentivenessRate >= 50 ? "Occasional visual tracking gaps" : "Critical attention advisory"}
          </p>
        </div>
        <div className="relative flex items-center justify-center">
          {renderCircleMeter(attentivenessRate, attColors.stroke, attColors.track)}
          <span className={`absolute text-2xs font-bold font-mono ${attColors.text}`}>
            {attentivenessRate}
          </span>
        </div>
      </div>

      {/* CARD 3: CONFUSION RATIO */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-all flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest font-display">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Confusion Index
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-2xl md:text-3xl font-bold font-mono tracking-tight ${confColors.text}`}>
              {confusionRatio}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            {confusionRatio > 25 ? "Topic conceptual drift detected" : confusionRatio > 10 ? "Satisfactory pacing offset" : "Full cognitive processing"}
          </p>
        </div>
        <div className="relative flex items-center justify-center">
          {renderCircleMeter(confusionRatio, confColors.stroke, confColors.track)}
          <span className={`absolute text-2xs font-bold font-mono ${confColors.text}`}>
            {confusionRatio}
          </span>
        </div>
      </div>

      {/* CARD 4: ATTENDANCE RATIO */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm hover:border-slate-600 transition-all flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest font-display">
            <Users className="w-4 h-4 text-indigo-400" />
            Session Attendance
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl md:text-3xl font-bold font-mono text-slate-50 tracking-tight">
              {presentCount}
            </span>
            <span className="text-slate-400 text-sm font-semibold"> / {totalCount}</span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans leading-tight">
            {totalCount - presentCount === 0
              ? "All present & online"
              : `${totalCount - presentCount} student(s) absent/scanned empty`}
          </p>
        </div>
        <div className="p-3 bg-slate-900 text-indigo-400 rounded-xl border border-slate-700 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
