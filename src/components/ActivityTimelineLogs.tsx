/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { TrendingUp, Terminal, Circle } from "lucide-react";
import { TimelineEntry } from "../types";

interface ActivityLogs {
  timestamp: string;
  studentId: string;
  studentName: string;
  type: "raise_hand" | "emotion_change" | "clarity_up" | "distracted" | "attendance";
  message: string;
}

interface ActivityTimelineLogsProps {
  timeline: TimelineEntry[];
  logs: ActivityLogs[];
}

export default function ActivityTimelineLogs({ timeline, logs }: ActivityTimelineLogsProps) {
  // Chart dimensions config
  const chartWidth = 500;
  const chartHeight = 180;
  const paddingLeft = 30;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 25;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingTop - paddingBottom;

  // Convert timeline data points to SVG line paths
  const getLineCoordinates = (key: "engagement" | "attentiveness" | "confusion") => {
    if (timeline.length < 2) return "";
    
    return timeline
      .map((entry, index) => {
        const x = paddingLeft + (index / (timeline.length - 1)) * graphWidth;
        const val = entry[key] || 0;
        const y = paddingTop + graphHeight - (val / 100) * graphHeight;
        return `${index === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  };

  const getAreaCoordinates = (key: "engagement") => {
    if (timeline.length < 2) return "";
    const points = timeline.map((entry, index) => {
      const x = paddingLeft + (index / (timeline.length - 1)) * graphWidth;
      const val = entry[key] || 0;
      const y = paddingTop + graphHeight - (val / 100) * graphHeight;
      return `${x},${y}`;
    });
    
    // Bottom limits to close the area
    const startX = paddingLeft;
    const endX = paddingLeft + graphWidth;
    const bottomY = paddingTop + graphHeight;
    return `M ${startX},${bottomY} L ${points.join(" L ")} L ${endX},${bottomY} Z`;
  };

  // Label tags helper
  const getLogTypeBadge = (type: ActivityLogs["type"]) => {
    switch (type) {
      case "raise_hand":
        return "bg-indigo-950/40 border border-indigo-900/30 text-indigo-300";
      case "emotion_change":
        return "bg-amber-950/40 border border-amber-900/30 text-amber-300";
      case "clarity_up":
        return "bg-emerald-950/40 border border-emerald-900/30 text-emerald-300";
      case "distracted":
        return "bg-orange-950/40 border border-orange-900/30 text-orange-200/90 text-orange-300";
      case "attendance":
        return "bg-slate-900 border border-slate-800 text-slate-400";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* COLUMN 1: INTERACTIVE SVG TRENDS CHART */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md lg:col-span-7 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
            <div>
              <h2 className="text-md font-bold text-slate-50 flex items-center gap-1.5 font-display">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Live Classroom Session Analytics
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Timeline visualization tracking attentiveness waves and classroom comprehension levels.
              </p>
            </div>
          </div>

          <div className="flex gap-4 text-[10px] font-mono mb-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 bg-indigo-500 rounded-full" />
              <span>Engagement index</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>Attentiveness</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 bg-amber-500 rounded-full" />
              <span>Confusion</span>
            </div>
          </div>
        </div>

        {/* SVG Area display */}
        <div className="relative w-full overflow-hidden select-none">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">
            <defs>
              <linearGradient id="engagementFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Horizontal rule indicators */}
            {[0, 25, 50, 75, 100].map((level) => {
              const y = paddingTop + graphHeight - (level / 100) * graphHeight;
              return (
                <g key={level}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    className="stroke-slate-700/65"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft - 6}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] font-mono fill-slate-500 font-bold"
                  >
                    {level}%
                  </text>
                </g>
              );
            })}

            {/* Grid vertical ticks */}
            {timeline.length > 0 &&
              timeline.map((entry, index) => {
                const x = paddingLeft + (index / (timeline.length - 1)) * graphWidth;
                return (
                  <g key={index}>
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + graphHeight}
                      className="stroke-slate-700/40"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-500"
                    >
                      {entry.time}
                    </text>
                  </g>
                );
              })}

            {timeline.length >= 2 && (
              <>
                {/* Visual Area gradient under engagement curve */}
                <path d={getAreaCoordinates("engagement")} fill="url(#engagementFill)" />

                {/* Engagement curve line */}
                <path
                  d={getLineCoordinates("engagement")}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Attentiveness rate curve line */}
                <path
                  d={getLineCoordinates("attentiveness")}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />

                {/* Confusion curve line */}
                <path
                  d={getLineCoordinates("confusion")}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.8"
                  strokeDasharray="1 1"
                  strokeLinecap="round"
                  className="stroke-[2.5]"
                />

                {/* Endpoint visual coordinates dot */}
                {(() => {
                  const lastIndex = timeline.length - 1;
                  const eX = paddingLeft + graphWidth;
                  const eY1 = paddingTop + graphHeight - (timeline[lastIndex].engagement / 100) * graphHeight;
                  const eY2 = paddingTop + graphHeight - (timeline[lastIndex].attentiveness / 100) * graphHeight;

                  return (
                    <g>
                      <circle cx={eX} cy={eY1} r="3.5" fill="#6366f1" />
                      <circle cx={eX} cy={eY2} r="3.5" fill="#10b981" />
                    </g>
                  );
                })()}
              </>
            )}
          </svg>
        </div>
      </div>

      {/* COLUMN 2: ROLLING CLASSROOM ALERTS LOG CONTAINER */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md lg:col-span-5 flex flex-col justify-between h-[300px] lg:h-auto">
        <div className="border-b border-slate-700 pb-4 mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-md font-bold text-slate-50 flex items-center gap-1.5 font-display">
              <Terminal className="w-4 h-4 text-slate-400" />
              Roster Activity & Telemetry Feed
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              Live historical updates of student transitions, hand-raises, and attendance.
            </p>
          </div>
        </div>

        {/* Live List Scroll overflow */}
        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[220px] lg:max-h-[190px] pr-1">
          {logs.length === 0 ? (
            <div className="text-slate-500 text-xs text-center py-8 font-mono">
              Listening for classroom activities...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-2 items-start text-xs leading-relaxed">
                <span className="text-[10px] font-mono text-slate-500 font-medium shrink-0 mt-0.5">
                  [{log.timestamp}]
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`px-1.5 py-0.5 border rounded text-[9.3px] font-bold font-mono inline-block mr-1.5 tracking-tight ${getLogTypeBadge(log.type)}`}>
                    {log.type.replace("_", " ")}
                  </span>
                  <span className="font-bold text-slate-205 text-slate-200">{log.studentName}: </span>
                  <span className="text-slate-400 font-sans">{log.message}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
