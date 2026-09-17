/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, ShieldAlert, Award, Volume2, UserX, ToggleLeft } from "lucide-react";
import { Student } from "../types";

interface SeatingGridProps {
  students: Student[];
  onUpdateStudent: (payload: {
    studentId: string;
    attendance?: "present" | "absent" | "excused";
    attentionScore?: number;
    emotion?: "attentive" | "confused" | "distracted" | "sleeping";
    actionName?: string;
  }) => void;
}

export default function SeatingGrid({ students, onUpdateStudent }: SeatingGridProps) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Split student grid positioning
  const rowsCount = 3;
  const colsCount = 5;

  // Find student at specific row/col
  const getStudentAt = (row: number, col: number) => {
    const searchId = `${row}-${col}`;
    return students.find((s) => s.deskId === searchId);
  };

  // Classify visual state of desks (optimized for Geometric Balance dark theme)
  const getDeskStyles = (student: Student) => {
    if (student.attendance !== "present") {
      return {
        bg: "bg-slate-900/40 border-slate-800/80 border-dashed text-slate-500",
        text: "text-slate-500 font-normal",
        dot: "bg-slate-700",
        ring: "hover:border-slate-600",
        shadow: "",
        emText: "Absent"
      };
    }

    switch (student.emotion) {
      case "attentive":
        return {
          bg: "bg-slate-900 border-emerald-500/30 text-slate-200",
          dot: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
          ring: "hover:ring-2 hover:ring-emerald-500/40 hover:border-emerald-500/80",
          shadow: "shadow-xs shadow-emerald-950/15",
          emText: "Focused"
        };
      case "confused":
        return {
          bg: "bg-slate-900 border-amber-500/30 text-slate-200",
          dot: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
          ring: "hover:ring-2 hover:ring-amber-500/40 hover:border-amber-500/80",
          shadow: "shadow-xs shadow-amber-950/15",
          emText: "Confused"
        };
      case "distracted":
        return {
          bg: "bg-slate-900 border-orange-500/30 text-slate-200",
          dot: "bg-orange-500 shadow-[0_0_8px_#f97316]",
          ring: "hover:ring-2 hover:ring-orange-500/40 hover:border-orange-500/80",
          shadow: "shadow-xs shadow-orange-950/15",
          emText: "Distracted"
        };
      case "sleeping":
        return {
          bg: "bg-slate-900 border-purple-500/30 text-slate-200",
          dot: "bg-purple-500 shadow-[0_0_8px_#a855f7]",
          ring: "hover:ring-2 hover:ring-purple-500/40 hover:border-purple-500/80",
          shadow: "shadow-xs shadow-purple-950/15",
          emText: "Fatigued"
        };
      default:
        return {
          bg: "bg-slate-900 border-slate-700 text-slate-200",
          dot: "bg-slate-500",
          ring: "hover:border-slate-500",
          shadow: "",
          emText: "Idle"
        };
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleStateUpdate = (updates: any) => {
    if (selectedStudent) {
      onUpdateStudent({ studentId: selectedStudent.id, ...updates });
      // Update our temporary local state so modal redraws smoothly
      setSelectedStudent((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleSpecialAction = (action: string) => {
    if (selectedStudent) {
      onUpdateStudent({ studentId: selectedStudent.id, actionName: action });
      if (action === "raise_hand") {
        setSelectedStudent((prev) =>
          prev ? { ...prev, participationCount: prev.participationCount + 1 } : null
        );
      }
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md flex flex-col h-full">
      {/* Grid title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-700 pb-4 mb-4 gap-2">
        <div>
          <h2 className="text-md font-bold text-slate-50 flex items-center gap-1.5 font-display">
            <User className="w-4 h-4 text-indigo-400" />
            Classroom Seating Grid Plan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Click on any desk coordinates to manage individual student telemetry parameters.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[10px] font-mono text-slate-400 bg-slate-905 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_6px_#10b981]" /> Focus
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_6px_#f59e0b]" /> Confused
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full shadow-[0_0_6px_#f97316]" /> Distracted
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_6px_#a855f7]" /> Fatigue
          </div>
        </div>
      </div>

      {/* Podium Indicator representing classroom front orientation */}
      <div className="w-full flex justify-center mb-6">
        <div className="w-44 bg-slate-900 text-indigo-400 border border-slate-750 text-center text-[10px] font-mono leading-none py-2 rounded-lg tracking-widest uppercase font-bold shadow-md">
          ✦ TEACHER PODIUM / BOARD ✦
        </div>
      </div>

      {/* Row and Col layouts */}
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {Array.from({ length: rowsCount }).map((_, rIndex) => (
          <div key={`row-${rIndex}`} className="flex items-center gap-2">
            <span className="text-[10.5px] font-mono font-bold text-slate-400 w-8 text-right shrink-0">
              Row {rIndex + 1}
            </span>
            <div className="grid grid-cols-5 gap-3 w-full">
              {Array.from({ length: colsCount }).map((_, cIndex) => {
                const student = getStudentAt(rIndex, cIndex);
                if (!student) {
                  return (
                    <div
                      key={`empty-${rIndex}-${cIndex}`}
                      className="border border-dashed border-slate-700 bg-slate-900/30 rounded-xl min-h-[70px] flex items-center justify-center text-[10px] text-slate-500 font-mono"
                    >
                      Empty
                    </div>
                  );
                }

                const style = getDeskStyles(student);

                return (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className={`border rounded-xl p-3 text-left transition-all relative flex flex-col justify-between cursor-pointer min-h-[74px] ${style.bg} ${style.ring} ${style.shadow}`}
                  >
                    {/* Attendance / hand-raises badge */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[9px] font-mono font-semibold text-slate-400 leading-none">
                        Grid {student.deskId}
                      </span>
                      {student.attendance === "present" && student.participationCount > 4 ? (
                        <Award className="w-3.5 h-3.5 text-indigo-400 animate-pulse" title="Highly Active!" />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      )}
                    </div>

                    <div className="mt-1.5 truncate">
                      <p className={`text-xs font-bold leading-tight truncate ${student.attendance !== "present" ? "text-slate-500" : "text-slate-100"}`}>
                        {student.name}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5 leading-none">
                        {student.rollNo}
                      </p>
                    </div>

                    <div className="flex items-center justify-between w-full mt-2 border-t border-slate-800/80 pt-1.5">
                      <span className="text-[9px] bg-slate-950/40 px-1.5 py-0.5 rounded font-mono font-bold text-slate-350 text-slate-300 scale-90 -translate-x-1 uppercase tracking-tight">
                        {style.emText}
                      </span>
                      {student.attendance === "present" && (
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {student.attentionScore}%
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center border-t border-slate-700/60 pt-3">
        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
          ▲ Rear coordinates representing Zone C / Row 3 ▲
        </p>
      </div>

      {/* STUDENT DETAIL DRAWER / MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-950 p-5 border-b border-slate-850 border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-50 font-display flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-indigo-500 rounded-xs" />
                  Configure Student Telemetry Grid
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Roll: {selectedStudent.rollNo} • Desk: {selectedStudent.deskId}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-100 font-bold text-xs bg-slate-800 hover:bg-slate-700 w-7 h-7 flex items-center justify-center border border-slate-700 rounded-lg cursor-pointer transition-colors"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Profile Block */}
              <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="p-2.5 bg-slate-800 text-indigo-400 rounded-lg border border-slate-700 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-50 truncate">{selectedStudent.name}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">CS & Pedagogy Undergraduate</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-slate-500 font-mono leading-none">Participation</p>
                  <p className="text-xs font-bold text-indigo-400 font-mono mt-1">
                    {selectedStudent.participationCount} times
                  </p>
                </div>
              </div>

              {/* Attendance Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">
                  Attendance Marker
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["present", "absent", "excused"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStateUpdate({ attendance: status })}
                      className={`py-2 rounded-lg text-xs font-semibold border cursor-pointer capitalize text-center transition-all ${
                        selectedStudent.attendance === status
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                          : "bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {selectedStudent.attendance === "present" && (
                <>
                  {/* Emotion Selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">
                      Simulated Cognitive Emotion / Mood
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["attentive", "confused", "distracted", "sleeping"] as const).map((emo) => (
                        <button
                          key={emo}
                          type="button"
                          onClick={() => handleStateUpdate({ emotion: emo })}
                          className={`py-2 rounded-lg text-[11px] font-semibold border cursor-pointer capitalize text-center transition-all ${
                            selectedStudent.emotion === emo
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                              : "bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-800 hover:text-slate-200"
                          }`}
                        >
                          {emo}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attention Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">
                        Individual Attention Level
                      </label>
                      <span className="text-xs font-bold text-indigo-400 font-mono">
                        {selectedStudent.attentionScore}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedStudent.attentionScore}
                      onChange={(e) => handleStateUpdate({ attentionScore: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                      <span>0% Sleeping</span>
                      <span>50% Confused</span>
                      <span>100% Fully Focused</span>
                    </div>
                  </div>

                  {/* Active Actions */}
                  <div className="space-y-1.5 border-t border-slate-800 pt-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">
                      Interactive Classroom Actions
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleSpecialAction("raise_hand")}
                        className="flex-1 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Call on Student (Raise Hand)
                      </button>
                      <button
                        onClick={() => handleStateUpdate({ emotion: "attentive", attentionScore: 90 })}
                        className="py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg cursor-pointer flex items-center justify-center gap-1 transition-colors"
                        title="Focus back"
                      >
                        Prompt Focus
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-4 flex justify-end gap-2 border-t border-slate-850 border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Close Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
