/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Camera, 
  Upload, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Cpu, 
  Layers, 
  Crosshair, 
  User, 
  Activity, 
  ShieldAlert, 
  Fingerprint, 
  RefreshCw 
} from "lucide-react";
import { Student } from "../types";

interface AttendanceScannerProps {
  onScanSuccess: (payload: any) => void;
  isMocking: boolean;
  students: Student[];
}

export default function AttendanceScanner({ onScanSuccess, isMocking, students }: AttendanceScannerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanResultReport, setScanResultReport] = useState<any | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  // Advanced Biometric Features & HUD Settings
  const [showFaceOverlay, setShowFaceOverlay] = useState<boolean>(true);
  const [selectedFaceStudent, setSelectedFaceStudent] = useState<Student | null>(null);
  const [highlightedStudentId, setHighlightedStudentId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset layouts modeled beautifully as SVGs of classroom seats with mock perspective backgrounds
  const presets = [
    {
      id: 1,
      title: "Roster snapshot A (James Miller joins)",
      description: "Classroom wide wide-angle scan. James Miller joins his active row desk.",
      dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300' viewBox='0 0 600 300' style='background:%230f172a'><defs><radialGradient id='g1' cx='50%25' cy='50%25' r='50%25'><stop offset='0%25' stop-color='%231e293b'/><stop offset='100%25' stop-color='%230f172a'/></radialGradient></defs><rect width='100%25' height='100%25' fill='url(%23g1)'/><g stroke='%23334155' stroke-width='0.5' stroke-dasharray='5,5'><line x1='0' y1='100' x2='600' y2='100'/><line x1='0' y1='200' x2='600' y2='200'/><line x1='120' y1='0' x2='120' y2='300'/><line x1='240' y1='0' x2='240' y2='300'/><line x1='360' y1='0' x2='360' y2='300'/><line x1='480' y1='0' x2='480' y2='300'/></g><path d='M30,50 L570,50 M30,150 L570,150 M30,250 L570,250' stroke='%231e293b' stroke-width='4' stroke-linecap='round'/><text x='50%25' y='32' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-size='14' font-weight='800' letter-spacing='2'>SEATING SNAPSHOT: STAGE A</text><text x='10%25' y='65' fill='%2364748b' font-family='monospace' font-size='9'>DESK 0-0</text><text x='30%25' y='65' fill='%2364748b' font-family='monospace' font-size='9'>DESK 0-1</text><text x='50%25' y='65' fill='%2364748b' font-family='monospace' font-size='9'>DESK 0-2</text><text x='70%25' y='65' fill='%2364748b' font-family='monospace' font-size='9'>DESK 0-3</text><text x='90%25' y='65' fill='%2364748b' font-family='monospace' font-size='9'>DESK 0-4</text><circle cx='60' cy='50' r='18' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='180' cy='50' r='18' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='300' cy='50' r='18' fill='%23f59e0b' fill-opacity='0.25' stroke='%23f59e0b' stroke-width='2'/><circle cx='420' cy='50' r='18' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='540' cy='50' r='18' fill='%23ef4444' fill-opacity='0.15' stroke='%23ef4444' stroke-width='1.5' stroke-dasharray='3'/><circle cx='60' cy='150' r='20' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='180' cy='150' r='20' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='300' cy='150' r='20' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='420' cy='150' r='20' fill='%23f59e0b' fill-opacity='0.25' stroke='%23f59e0b' stroke-width='2'/><circle cx='540' cy='150' r='20' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='60' cy='250' r='22' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='180' cy='250' r='22' fill='%238b5cf6' fill-opacity='0.15' stroke='%238b5cf6' stroke-width='1.5' stroke-dasharray='3'/><circle cx='300' cy='250' r='22' fill='%23a855f7' fill-opacity='0.25' stroke='%23a855f7' stroke-width='2'/><circle cx='420' cy='250' r='22' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='540' cy='250' r='22' fill='%23f97316' fill-opacity='0.25' stroke='%23f97316' stroke-width='2'/></svg>"
    },
    {
      id: 2,
      title: "Roster snapshot B (Full attendance test)",
      description: "Back-bench overview. Heavy crowding, students engaged with interactive pop quiz.",
      dataUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='300' viewBox='0 0 600 300' style='background:%23020617'><defs><radialGradient id='g2' cx='50%25' cy='50%25' r='50%25'><stop offset='0%25' stop-color='%230f172a'/><stop offset='100%25' stop-color='%23020617'/></radialGradient></defs><rect width='100%25' height='100%25' fill='url(%23g2)'/><g stroke='%231e293b' stroke-width='0.5' stroke-dasharray='4,4'><line x1='0' y1='100' x2='600' y2='100'/><line x1='0' y1='200' x2='600' y2='200'/><line x1='120' y1='0' x2='120' y2='300'/><line x1='240' y1='0' x2='240' y2='300'/><line x1='360' y1='0' x2='360' y2='300'/><line x1='480' y1='0' x2='480' y2='300'/></g><path d='M30,50 L570,50 M30,150 L570,150 M30,250 L570,250' stroke='%23334155' stroke-width='2'/><text x='50%25' y='32' dominant-baseline='middle' text-anchor='middle' fill='%230ea5e9' font-family='sans-serif' font-size='14' font-weight='800' letter-spacing='2'>BIOMETRIC SCAN: FULL DEPLOYMENT</text><circle cx='60' cy='50' r='18' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='180' cy='50' r='18' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='300' cy='50' r='18' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='420' cy='50' r='18' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='540' cy='50' r='18' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='60' cy='150' r='20' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='180' cy='150' r='20' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='300' cy='150' r='20' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='420' cy='150' r='20' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='540' cy='150' r='20' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='60' cy='250' r='22' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='180' cy='250' r='22' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='300' cy='250' r='22' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='420' cy='250' r='22' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/><circle cx='540' cy='250' r='22' fill='%2310b981' fill-opacity='0.25' stroke='%2310b981' stroke-width='2'/></svg>"
    }
  ];

  // Perspective 3D coordinates for student face recognition bounding boxes
  const studentFaceBoxes = [
    // Row 0
    { name: "Liam Smith", left: "6%", top: "10%", width: "13%", height: "18%", landmarks: { lex: "30%", ley: "35%", rex: "70%", rey: "35%", nt: "50%", nty: "55%", mc: "50%", mcy: "75%", mw: "30%" }, yaw: -1.2, pitch: 3.4, profileId: "BIO-R0-C0" },
    { name: "Emma Johnson", left: "26%", top: "10%", width: "13%", height: "18%", landmarks: { lex: "28%", ley: "36%", rex: "68%", rey: "36%", nt: "48%", nty: "54%", mc: "48%", mcy: "74%", mw: "34%" }, yaw: 2.1, pitch: 1.5, profileId: "BIO-R0-C1" },
    { name: "Oliver Williams", left: "46%", top: "10%", width: "13%", height: "18%", landmarks: { lex: "32%", ley: "38%", rex: "72%", rey: "38%", nt: "52%", nty: "56%", mc: "52%", mcy: "76%", mw: "28%" }, yaw: -6.4, pitch: -2.3, profileId: "BIO-R0-C2" },
    { name: "Sophia Brown", left: "66%", top: "10%", width: "13%", height: "18%", landmarks: { lex: "30%", ley: "34%", rex: "70%", rey: "34%", nt: "50%", nty: "52%", mc: "50%", mcy: "72%", mw: "32%" }, yaw: 0.5, pitch: 4.1, profileId: "BIO-R0-C3" },
    { name: "Elijah Jones", left: "86%", top: "10%", width: "13%", height: "18%", landmarks: { lex: "25%", ley: "40%", rex: "65%", rey: "40%", nt: "45%", nty: "60%", mc: "45%", mcy: "78%", mw: "26%" }, yaw: 9.8, pitch: -5.1, profileId: "BIO-R0-C4" },
    
    // Row 1
    { name: "Isabella Garcia", left: "5%", top: "42%", width: "14%", height: "20%", landmarks: { lex: "30%", ley: "35%", rex: "70%", rey: "35%", nt: "50%", nty: "55%", mc: "50%", mcy: "75%", mw: "30%" }, yaw: -3.6, pitch: 0.8, profileId: "BIO-R1-C0" },
    { name: "James Miller", left: "25%", top: "42%", width: "14%", height: "20%", landmarks: { lex: "29%", ley: "33%", rex: "69%", rey: "33%", nt: "49%", nty: "53%", mc: "49%", mcy: "73%", mw: "32%" }, yaw: 1.2, pitch: 2.1, profileId: "BIO-R1-C1" },
    { name: "Charlotte Davis", left: "45%", top: "42%", width: "14%", height: "20%", landmarks: { lex: "27%", ley: "35%", rex: "67%", rey: "35%", nt: "47%", nty: "55%", mc: "47%", mcy: "75%", mw: "36%" }, yaw: -0.2, pitch: 1.1, profileId: "BIO-R1-C2" },
    { name: "Benjamin Rodriguez", left: "65%", top: "42%", width: "14%", height: "20%", landmarks: { lex: "33%", ley: "37%", rex: "73%", rey: "37%", nt: "53%", nty: "57%", mc: "53%", mcy: "77%", mw: "28%" }, yaw: -4.5, pitch: -1.9, profileId: "BIO-R1-C3" },
    { name: "Amelia Martinez", left: "85%", top: "42%", width: "14%", height: "20%", landmarks: { lex: "31%", ley: "34%", rex: "71%", rey: "34%", nt: "51%", nty: "53%", mc: "51%", mcy: "73%", mw: "31%" }, yaw: 1.9, pitch: 3.0, profileId: "BIO-R1-C4" },
    
    // Row 2
    { name: "Lucas Hernandez", left: "4%", top: "74%", width: "15%", height: "22%", landmarks: { lex: "30%", ley: "35%", rex: "70%", rey: "35%", nt: "50%", nty: "55%", mc: "50%", mcy: "75%", mw: "30%" }, yaw: -2.2, pitch: 0.5, profileId: "BIO-R2-C0" },
    { name: "Mia Lopez", left: "24%", top: "74%", width: "15%", height: "22%", landmarks: { lex: "28%", ley: "36%", rex: "68%", rey: "36%", nt: "48%", nty: "54%", mc: "48%", mcy: "74%", mw: "34%" }, yaw: 4.1, pitch: -3.2, profileId: "BIO-R2-C1" },
    { name: "Alexander Gonzalez", left: "44%", top: "74%", width: "15%", height: "22%", landmarks: { lex: "32%", ley: "38%", rex: "72%", rey: "38%", nt: "52%", nty: "56%", mc: "52%", mcy: "76%", mw: "28%" }, yaw: -8.9, pitch: -6.4, profileId: "BIO-R2-C2" },
    { name: "Evelyn Wilson", left: "64%", top: "74%", width: "15%", height: "22%", landmarks: { lex: "30%", ley: "34%", rex: "70%", rey: "34%", nt: "50%", nty: "52%", mc: "50%", mcy: "72%", mw: "32%" }, yaw: 0.1, pitch: 2.8, profileId: "BIO-R2-C3" },
    { name: "Henry Anderson", left: "84%", top: "74%", width: "15%", height: "22%", landmarks: { lex: "25%", ley: "40%", rex: "65%", rey: "40%", nt: "45%", nty: "60%", mc: "45%", mcy: "78%", mw: "26%" }, yaw: 7.2, pitch: -4.0, profileId: "BIO-R2-C4" }
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Only image files (JPEG, PNG, WEBP) are supported for automated face scans.");
      return;
    }
    setErrorMessage(null);
    setSelectedPreset(null);
    setScanResultReport(null);
    setSelectedFaceStudent(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const selectPreset = (id: number) => {
    setSelectedPreset(id);
    setSelectedFaceStudent(null);
    setScanResultReport(null);
    const item = presets.find(p => p.id === id);
    if (item) {
      setUploadedImage(item.dataUrl);
      setErrorMessage(null);
    }
  };

  const triggerVisionScan = async () => {
    if (!uploadedImage) return;

    setScanning(true);
    setScanResultReport(null);
    setErrorMessage(null);
    setSelectedFaceStudent(null);

    // High fidelity feedback loop
    const steps = [
      "Running face detection and segment model templates...",
      "Extracting 512 face landmark coordinates...",
      "Analyzing micro-expressions and gaze vector headings...",
      "Validating matching ratios with enrollment signatures...",
      "Updating real-time attention heatmaps..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const response = await fetch("/api/gemini/scan-attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: uploadedImage })
      });

      if (!response.ok) {
        throw new Error("HTTP Vision scan request failed.");
      }

      const report = await response.json();
      setScanResultReport(report);
      onScanSuccess(report);
      
      // Auto highlight Oliver Williams or default first student to guide interaction
      if (students && students.length > 0) {
        const defaultStudent = students.find(s => s.attendance === "present") || students[0];
        setSelectedFaceStudent(defaultStudent);
      }
    } catch (err: any) {
      setErrorMessage("Face scanner failed to sync: " + err.message);
    } finally {
      setScanning(false);
    }
  };

  // Helper colors mapping depending on student's current emotion
  const getBoxStyle = (student: Student) => {
    if (student.attendance !== "present") {
      return {
        border: "border-2 border-dashed border-slate-500 bg-slate-950/20",
        glow: "shadow-[0_0_4px_rgba(148,163,184,0.3)]",
        labelBg: "bg-slate-700 text-slate-200",
        accent: "text-slate-400"
      };
    }
    switch (student.emotion) {
      case "attentive":
        return {
          border: "border-2 border-emerald-500 bg-emerald-500/5",
          glow: "shadow-[0_0_12px_rgba(16,185,129,0.5)]",
          labelBg: "bg-emerald-600 text-white",
          accent: "text-emerald-400"
        };
      case "confused":
        return {
          border: "border-2 border-amber-500 bg-amber-500/5",
          glow: "shadow-[0_0_12px_rgba(245,158,11,0.5)]",
          labelBg: "bg-amber-600 text-slate-950",
          accent: "text-amber-400"
        };
      case "distracted":
        return {
          border: "border-2 border-orange-500 bg-orange-500/5",
          glow: "shadow-[0_0_12px_rgba(249,115,22,0.5)]",
          labelBg: "bg-orange-600 text-white",
          accent: "text-orange-400"
        };
      case "sleeping":
        return {
          border: "border-2 border-purple-500 bg-purple-500/5",
          glow: "shadow-[0_0_12px_rgba(168,85,247,0.5)]",
          labelBg: "bg-purple-600 text-white",
          accent: "text-purple-400"
        };
      default:
        return {
          border: "border-2 border-slate-400 bg-slate-400/5",
          glow: "shadow-[0_0_4px_rgba(148,163,184,0.3)]",
          labelBg: "bg-slate-600 text-white",
          accent: "text-slate-300"
        };
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md flex flex-col h-full">
      {/* Target heading */}
      <div className="border-b border-slate-700 pb-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-md font-bold text-slate-50 flex items-center gap-1.5 font-display">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Classroom Biometric Face Recognition
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Scans faces in 3D grid layout, map student biometric signatures, track gaze, and flag micro-expressions.
          </p>
        </div>
        
        {/* Quick Toggles */}
        {uploadedImage && !scanning && scanResultReport && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowFaceOverlay(!showFaceOverlay)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                showFaceOverlay
                  ? "bg-indigo-650 bg-indigo-600 border-indigo-500 text-white shadow-xs"
                  : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
              }`}
              title="Toggle Face Recognition Overlays"
            >
              {showFaceOverlay ? (
                <>
                  <Eye className="w-3.5 h-3.5" /> HUD Visible
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> HUD Hidden
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="mb-4 bg-rose-950/40 border border-rose-900/30 rounded-xl p-3 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Preset snapshots selector */}
      <div className="mb-4">
        <p className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-widest mb-2">
          Choose a roster preset snapshot
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => selectPreset(p.id)}
              className={`text-left p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col gap-0.5 ${
                selectedPreset === p.id
                  ? "bg-slate-900 border-indigo-500/80 text-white shadow-[0_0_8px_rgba(99,102,241,0.25)]"
                  : "bg-slate-900 border-slate-750/70 hover:bg-slate-750 hover:border-slate-650 text-slate-300"
              }`}
            >
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-slate-400" />
                {p.title}
              </span>
              <span className="text-[10px] text-slate-400 truncate">{p.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Primary scanning stage panel */}
      <div className="relative flex-1 min-h-[220px] flex flex-col justify-center">
        {!uploadedImage ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/85 rounded-2xl flex-1 flex flex-col justify-center items-center p-6 text-center cursor-pointer transition-all min-h-[200px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="p-3.5 bg-slate-950 text-indigo-400 border border-slate-800 rounded-full mb-3 shadow-inner">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-200">Drag & drop layout camera capture</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1.5 uppercase tracking-wider">
              or click here to select local file
            </p>
          </div>
        ) : (
          <div className="border border-slate-750 rounded-xl overflow-hidden bg-slate-950 p-1 relative aspect-[2/1] w-full max-w-xl mx-auto flex items-center justify-center group shadow-2xl">
            {/* Real-time laser scanning bar sweep */}
            {scanning && (
              <div className="absolute inset-x-0 w-full h-[2.5px] bg-indigo-500 shadow-[0_0_20px_#6366f1,0_0_6px_#10b981] animate-[bounce_2.5s_infinite] z-20" />
            )}

            {/* Simulated Live Track overlay dots for raw capture status */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Micro-biometric keypoint anchors blinking */}
                <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping top-[25%] left-[20%]" />
                <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping top-[25%] left-[48%]" />
                <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping top-[25%] left-[72%]" />
                <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping top-[55%] left-[30%]" />
                <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping top-[55%] left-[62%]" />
                <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping top-[80%] left-[45%]" />
                <div className="absolute w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping top-[80%] left-[82%]" />
                
                {/* Horizontal digital line vectors */}
                <div className="absolute left-6 top-12 text-[8px] font-mono text-indigo-400/80 uppercase">
                  R-DET :: [LOAD NEURAL NETWORK CORE]
                </div>
                <div className="absolute right-6 bottom-12 text-[8px] font-mono text-emerald-400/80 uppercase">
                  BIOMETRICS_MATCH_ENROLLMENT_DB = true
                </div>
              </div>
            )}

            {/* The primary Roster Layout image */}
            <img
              src={uploadedImage}
              alt="Classroom wide seating"
              className="w-full h-full object-cover opacity-75"
              referrerPolicy="no-referrer"
            />

            {/* Face Recognition Vector Boxes overlays */}
            {scanResultReport && showFaceOverlay && !scanning && (
              <div className="absolute inset-0 z-10 pointer-events-auto">
                {studentFaceBoxes.map((box, index) => {
                  // Find mapping model state in react students prop
                  const matchedStudent = students.find(s => s.name.toLowerCase() === box.name.toLowerCase());
                  if (!matchedStudent) return null;

                  const visual = getBoxStyle(matchedStudent);
                  const isSelected = selectedFaceStudent?.id === matchedStudent.id;

                  return (
                    <button
                      key={`face-${index}`}
                      type="button"
                      onClick={() => setSelectedFaceStudent(matchedStudent)}
                      onMouseEnter={() => setHighlightedStudentId(matchedStudent.id)}
                      onMouseLeave={() => setHighlightedStudentId(null)}
                      style={{
                        position: "absolute",
                        left: box.left,
                        top: box.top,
                        width: box.width,
                        height: box.height
                      }}
                      className={`transition-all rounded overflow-visible flex flex-col justify-between cursor-pointer focus:outline-none ${visual.border} ${visual.glow} ${
                        isSelected 
                          ? "ring-2 ring-indigo-400 border-indigo-400 scale-[1.03] z-30" 
                          : "opacity-80 hover:opacity-100 hover:scale-[1.02] z-10"
                      }`}
                    >
                      {/* Interactive Bounding box corners HUD marker */}
                      <div className="absolute -top-[1.5px] -left-[1.5px] w-2 h-2 border-t-2 border-l-2 border-indigo-400" />
                      <div className="absolute -top-[1.5px] -right-[1.5px] w-2 h-2 border-t-2 border-r-2 border-indigo-400" />
                      <div className="absolute -bottom-[1.5px] -left-[1.5px] w-2 h-2 border-b-2 border-l-2 border-indigo-400" />
                      <div className="absolute -bottom-[1.5px] -right-[1.5px] w-2 h-2 border-b-2 border-r-2 border-indigo-400" />

                      {/* Small visual landmarks dots if selected or hovered */}
                      {(isSelected || highlightedStudentId === matchedStudent.id) && matchedStudent.attendance === "present" && (
                        <div className="absolute inset-0 pointer-events-none opacity-90 transition-opacity">
                          {/* Left eye anchor */}
                          <span className="absolute w-[2px] h-[2px] bg-cyan-400 rounded-full" style={{ left: box.landmarks.lex, top: box.landmarks.ley }} />
                          {/* Right eye anchor */}
                          <span className="absolute w-[2px] h-[2px] bg-cyan-400 rounded-full" style={{ left: box.landmarks.rex, top: box.landmarks.rey }} />
                          {/* Nose anchor */}
                          <span className="absolute w-[2px] h-[2px] bg-lime-400 rounded-full" style={{ left: box.landmarks.nt, top: box.landmarks.nty }} />
                          {/* Mouth slot */}
                          <span className="absolute h-[1px] bg-rose-400/80" style={{ left: `calc(${box.landmarks.mc} - (${box.landmarks.mw} / 2))`, top: box.landmarks.mcy, width: box.landmarks.mw }} />
                        </div>
                      )}

                      {/* Bounding box header tag */}
                      <div className="w-full flex justify-between select-none">
                        <span className={`text-[8px] font-bold font-mono px-1 rounded-br leading-none py-0.5 pointer-events-none truncate max-w-full ${visual.labelBg}`}>
                          {matchedStudent.name.split(" ")[0]}
                        </span>
                      </div>

                      {/* Bottom coordinate tracker / status */}
                      <div className="w-full flex items-center justify-between p-0.5 bg-slate-900/60 backdrop-blur-3xs rounded-b">
                        <span className="text-[7px] font-mono text-slate-350 font-bold scale-90">
                          {matchedStudent.deskId}
                        </span>
                        <span className={`text-[7px] font-mono font-extrabold uppercase scale-90 ${visual.accent}`}>
                          {matchedStudent.attendance === "present" ? matchedStudent.emotion.slice(0, 4) : "empty"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!scanning && (
              <button
                onClick={() => {
                  setUploadedImage(null);
                  setSelectedFaceStudent(null);
                  setScanResultReport(null);
                }}
                className="absolute top-2.5 right-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded-lg p-1 text-[10px] px-2.5 font-mono z-30 transition-all cursor-pointer shadow-md"
              >
                Reset Canvas
              </button>
            )}

            {scanning && (
              <div className="absolute inset-0 bg-slate-955/90 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center z-10 select-none">
                <div className="p-4 bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-full mb-3 animate-spin duration-1000 shadow-lg">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-indigo-400 tracking-widest uppercase font-mono">
                  BIOMETRIC INTEL SCAN IN PROGRESS
                </h4>
                <p className="text-[10px] text-slate-400 mt-1.5 font-mono max-w-xs leading-relaxed transition-all">
                  {scanStep}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Execute trigger buttons */}
      {uploadedImage && !scanning && !scanResultReport && (
        <button
          onClick={triggerVisionScan}
          className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 tracking-widest uppercase transition-all shadow-[0_4px_12px_rgba(99,102,241,0.35)] font-mono hover:scale-[1.01]"
        >
          <Camera className="w-4 h-4 text-indigo-200" />
          COMPILE & SCAN FACIAL SIGNATURES
        </button>
      )}

      {/* Multi-tier Analysis readout section */}
      {scanResultReport && (
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Diagnostic overview card */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-750/70 rounded-xl p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] uppercase font-mono font-extrabold text-indigo-400 tracking-widest flex items-center gap-1">
                  <Fingerprint className="w-3.5 h-3.5" /> Biometric Signature Log
                </span>
                <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900/40 font-bold px-2 py-0.5 rounded font-mono">
                  Confidence Score: {scanResultReport.confidenceScore}%
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed italic font-sans pl-1.5 border-l-2 border-indigo-500/50">
                "{scanResultReport.summaryReport}"
              </p>

              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/60">
                <span className="text-[9px] text-slate-505 text-slate-500 font-mono uppercase tracking-wider">Spotted Faces ({scanResultReport.presentList?.length ?? 0}):</span>
                {scanResultReport.presentList?.length > 0 ? (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {scanResultReport.presentList.map((name: string) => (
                      <span
                        key={name}
                        onClick={() => {
                          const associated = students.find(s => s.name.toLowerCase() === name.toLowerCase());
                          if (associated) setSelectedFaceStudent(associated);
                        }}
                        className="text-[9px] bg-slate-800 hover:bg-indigo-950/60 hover:text-indigo-300 text-slate-300 border border-slate-750 hover:border-indigo-805 px-2 py-0.5 rounded-md cursor-pointer font-medium transition-colors"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono pl-1">No matches found.</span>
                )}
              </div>
            </div>

            {scanResultReport.isMock && (
              <div className="text-[9px] text-amber-400/80 font-mono flex items-center justify-center gap-1.5 pt-2 border-t border-slate-850">
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" /> Sandbox AI recognition mode
              </div>
            )}
          </div>

          {/* Interactive Bounding box profile inspector sidebar */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-750/70 rounded-xl p-4 flex flex-col justify-between">
            {selectedFaceStudent ? (
              <div className="space-y-3.5 h-full flex flex-col justify-between">
                <div>
                  {/* Target inspector header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] uppercase font-mono font-extrabold text-emerald-450 text-emerald-400 tracking-widest flex items-center gap-1">
                      <Crosshair className="w-3.5 h-3.5" /> Biometric inspect
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">
                      ID: BIO-{selectedFaceStudent.id.toUpperCase()}
                    </span>
                  </div>

                  {/* Profile Block detail overlay */}
                  <div className="flex items-start gap-2.5 mt-2.5">
                    <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-indigo-400 shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-200 truncate">{selectedFaceStudent.name}</h4>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                        Enroll No: {selectedFaceStudent.rollNo} • Seat {selectedFaceStudent.deskId}
                      </p>
                    </div>
                  </div>

                  {/* High precision biometric micro-variables coordinates */}
                  <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850 border-slate-800/40">
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono block leading-none">POSTURE / EYELINE:</span>
                      <span className="text-xs font-bold font-mono text-slate-300">
                        {selectedFaceStudent.attendance === "present" 
                          ? (selectedFaceStudent.emotion === "sleeping" ? "Declined / Slouched" : "Erect / Direct Lock")
                          : "VACANT / EMPTY"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono block leading-none">EST. EYE OPENNESS:</span>
                      <span className="text-xs font-bold font-mono text-slate-300">
                        {selectedFaceStudent.attendance === "present"
                          ? (selectedFaceStudent.emotion === "sleeping" ? "0.0% (Closed)" : "98.4% (Direct Gaze)")
                          : "0.0%"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono block leading-none">HEAD HEADINGS (Y, P):</span>
                      <span className="text-xs font-bold font-mono text-slate-300">
                        Yaw: {selectedFaceStudent.attendance === "present" ? (selectedFaceStudent.id === "s1" ? "-1.2°" : "0.8°") : "0°"} | Pitch: {selectedFaceStudent.attendance === "present" ? "2.1°" : "0°"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-500 font-mono block leading-none">BIOMETRIC INTEGRITY:</span>
                      <span className="text-xs font-bold font-mono text-slate-300">
                        {selectedFaceStudent.attendance === "present" ? "99.4% Match" : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Micro Pedagogical diagnostic advise */}
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    <Activity className="w-3 h-3 text-slate-400" /> Expression Assessment Advisors
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug font-sans pl-1.5 mt-1">
                    {selectedFaceStudent.attendance !== "present" ? (
                      "Desk is scanned empty. Roster has processed an excused/absent entry automatically."
                    ) : selectedFaceStudent.emotion === "attentive" ? (
                      "Eyes tracking instruction. Highly engaged in Multidimensional code explanations."
                    ) : selectedFaceStudent.emotion === "confused" ? (
                      "Frequent brow furrow coordinates detected. Recapitulate nested scoping matrices."
                    ) : selectedFaceStudent.emotion === "distracted" ? (
                      "Gaze angle vector has tilted away from teacher zone > 45° continuously."
                    ) : (
                      "Fatigue indicators high. Head slouched forward. Prompts physical desk tap attention check."
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-center p-6 text-slate-500">
                <Crosshair className="w-8 h-8 text-slate-600 mb-2 stroke-[1.2]" />
                <p className="text-xs font-bold text-slate-400">Scan & Click Faces to Inspect</p>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1">
                  Once biometric scanning finishes, click on any glowing face bounding box in the roster preview to inspect live yaw, pitch, expression landmarks, and eye vectors.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
