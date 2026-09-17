/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header.tsx";
import AnalyticsSummary from "./components/AnalyticsSummary.tsx";
import SeatingGrid from "./components/SeatingGrid.tsx";
import AttendanceScanner from "./components/AttendanceScanner.tsx";
import TeacherAIInsights from "./components/TeacherAIInsights.tsx";
import PopQuiz from "./components/PopQuiz.tsx";
import ActivityTimelineLogs from "./components/ActivityTimelineLogs.tsx";
import { Student, MetricSummary, TimelineEntry } from "./types.ts";
import { Sparkles, Play, Pause, RefreshCw } from "lucide-react";

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [metrics, setMetrics] = useState<MetricSummary>({
    engagementIndex: 0,
    attentivenessRate: 0,
    confusionRatio: 0,
    presentCount: 0,
    totalCount: 0,
    averageQuizScore: 82,
  });
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [currentConcept, setCurrentConcept] = useState("");
  const [isSimulating, setIsSimulating] = useState(true);
  
  // Shared trigger integer which lets secondary components know when to refresh active LLM suggestions
  const [triggerInsights, setTriggerInsights] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMockingKey, setIsMockingKey] = useState(false);

  // Load baseline state
  const loadActiveState = async () => {
    try {
      const response = await fetch("/api/session/state");
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
        setMetrics(data.metrics);
        setTimeline(data.timeline);
        setLogs(data.logs);
        setCurrentConcept(data.currentConcept);
        setIsSimulating(data.isSimulating);
      }
    } catch (err) {
      console.error("Failed to query backend session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveState();
    
    // Check if the backend is using mock fallback due to missing key
    const checkSandboxStatus = async () => {
      try {
        const res = await fetch("/api/gemini/insights", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setIsMockingKey(data.isMock ?? true);
        }
      } catch (err) {
        console.warn("Keys status check failed:", err);
      }
    };
    checkSandboxStatus();
  }, []);

  // Set up periodic simulated telemetry background tick
  useEffect(() => {
    if (!isSimulating) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch("/api/session/simulate-tick", { method: "POST" });
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students);
          setMetrics(data.metrics);
          setTimeline(data.timeline);
          setLogs(data.logs);
        }
      } catch (err) {
        console.warn("Heartbeat tick push failed:", err);
      }
    }, 8000); // Ticks every 8 seconds to show a lively interactive classroom

    return () => clearInterval(intervalId);
  }, [isSimulating]);

  // Update specific student parameters
  const handleUpdateStudent = async (payload: any) => {
    try {
      const response = await fetch("/api/session/update-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(prev =>
          prev.map((s) => (s.id === data.student.id ? data.student : s))
        );
        setMetrics(data.metrics);
        setLogs(data.logs);
        
        // Let the insights panel know student stats shifted (triggers soft analysis update)
        setTriggerInsights((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Student state shift failed:", err);
    }
  };

  // Automated attendance optical AI scanned results handler
  const handleRosterScanned = (scannedReport: any) => {
    if (scannedReport.students) {
      setStudents(scannedReport.students);
    }
    if (scannedReport.metrics) {
      setMetrics(scannedReport.metrics);
    }
    if (scannedReport.logs) {
      setLogs(scannedReport.logs);
    }
    // Always trigger immediate AI strategy rebuild based on newly spotted present students
    setTriggerInsights((prev) => prev + 1);
  };

  // Change active session current educational topic
  const handleUpdateConcept = async (concept: string) => {
    try {
      const response = await fetch("/api/session/update-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept }),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentConcept(data.currentConcept);
        setLogs(data.logs);
        setStudents(data.students);
        setMetrics(data.metrics);
        setTriggerInsights((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to commit active theme update:", err);
    }
  };

  // Flush and reset session database back to defaults
  const handleRestartSession = async () => {
    try {
      const response = await fetch("/api/session/restart", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students);
        setMetrics(data.metrics);
        setTimeline(data.timeline);
        setLogs(data.logs);
        setCurrentConcept(data.currentConcept);
        setTriggerInsights((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Roster reset failed:", err);
    }
  };

  const handleToggleSimulation = () => {
    setIsSimulating((prev) => !prev);
  };

  // Interactive logger utility to inject simulator telemetry logs from children components
  const logClientEvent = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    setLogs((prev) => [
      {
        timestamp,
        studentId: "system",
        studentName: "Interactive Hub",
        type: "clarity_up",
        message: msg,
      },
      ...prev,
    ]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl mb-4 text-indigo-400 animate-pulse shadow-lg">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-sm font-extrabold text-slate-200 uppercase tracking-widest font-mono">
          Spawning Fullstack Ingress Portals
        </h2>
        <p className="text-xs text-slate-500 mt-2.5 font-mono">
          Starting Express process & syncing client assets on port 3000...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-950 selection:text-indigo-400 pb-16">
      {/* Visual Header */}
      <Header
        currentConcept={currentConcept}
        isSimulating={isSimulating}
        onUpdateConcept={handleUpdateConcept}
        onRestartSession={handleRestartSession}
        onToggleSimulation={handleToggleSimulation}
        isMocking={isMockingKey}
      />

      {/* Roster Sandbox Callout */}
      {isMockingKey && (
        <div className="bg-slate-900 border-b border-amber-500/20 text-amber-300 text-center py-2 text-xs font-semibold shadow-md flex items-center justify-center gap-2 px-4 selection:bg-indigo-950">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
          <span>
            Classroom Sandbox: To activate real-time Gemini AI, configure your <b>GEMINI_API_KEY</b> in the <b>Settings &gt; Secrets</b> panel.
          </span>
        </div>
      )}

      {/* Main Roster grids & dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Core dynamic metrics summary block representing Circular indicators */}
        <AnalyticsSummary metrics={metrics} />

        {/* Dynamic double columns for primary elements */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* Seating layout grid coordinates */}
          <div className="xl:col-span-7 h-full">
            <SeatingGrid students={students} onUpdateStudent={handleUpdateStudent} />
          </div>

          {/* AI Strategy Insights dashboard */}
          <div className="xl:col-span-5 h-full">
            <TeacherAIInsights
              studentsCount={students.length}
              triggerGeneration={triggerInsights}
            />
          </div>
        </div>

        {/* Classroom support utilities: Vision scanning and MCQ generator pop quizzes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AttendanceScanner onScanSuccess={handleRosterScanned} isMocking={isMockingKey} students={students} />
          <PopQuiz currentConcept={currentConcept} onSimulationLog={logClientEvent} />
        </div>

        {/* Graphical Trends and logs feed */}
        <ActivityTimelineLogs timeline={timeline} logs={logs} />
      </main>
    </div>
  );
}
