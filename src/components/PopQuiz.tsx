/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, HelpCircle, GraduationCap, Play, RotateCcw, CheckCircle, XCircle } from "lucide-react";

interface PopQuizProps {
  currentConcept: string;
  onSimulationLog: (msg: string) => void;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function PopQuiz({ currentConcept, onSimulationLog }: PopQuizProps) {
  const [loading, setLoading] = useState(false);
  const [topicInput, setTopicInput] = useState("");
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [classResponseSimulated, setClassResponseSimulated] = useState<Record<string, { passRate: number; correctCount: number }>>({});
  const [isSandbox, setIsSandbox] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setQuiz(null);
    setUserAnswers({});
    setClassResponseSimulated({});
    setIsRateLimited(false);

    const targetTopic = topicInput.trim() || currentConcept;

    try {
      const response = await fetch("/api/gemini/quiz-gen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: targetTopic })
      });

      if (!response.ok) throw new Error("HTTP quiz architect error.");
      const data = await response.json();
      setQuiz(data.quiz);
      setIsSandbox(data.isMock ?? true);
      setIsRateLimited(data.rateLimited ?? false);
      if (data.rateLimited) {
        onSimulationLog(`Gemini Pop Quiz fallback: Loaded local syllabus questions to bypass active API rate limits.`);
      } else {
        onSimulationLog(`Gemini generated a customized 3-item pop quiz on: "${targetTopic}".`);
      }
    } catch (err: any) {
      console.error("Quiz Generator Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, optIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optIndex
    }));
  };

  const runClassSim = (question: Question) => {
    // Generate randomized student answers
    const passRandom = Math.floor(Math.random() * 26) + 65; // 65% - 90% pass rate
    const totalPresent = 13; // Approximate present roster
    const correctCount = Math.round((passRandom / 100) * totalPresent);

    setClassResponseSimulated(prev => ({
      ...prev,
      [question.id]: {
        passRate: passRandom,
        correctCount
      }
    }));

    onSimulationLog(`Broadcasted Pop Quiz of "${question.question.substring(0, 30)}..." to active present students. Spot simulation score: ${passRandom}% correct answers computed.`);
  };

  const handleResetQuiz = () => {
    setQuiz(null);
    setUserAnswers({});
    setClassResponseSimulated({});
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md flex flex-col h-full">
      <div className="border-b border-slate-700 pb-4 mb-4">
        <h2 className="text-md font-bold text-slate-50 flex items-center gap-1.5 font-display">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          AI Interactive Pop Quiz Architect
        </h2>
        <p className="text-xs text-slate-400 mt-0.5 font-sans">
          Draft pop quiz questions to prompt real-time comprehension validation during active sessions.
        </p>
      </div>

      {!quiz && !loading && (
        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest font-display">
              Enter target quiz core theme
            </label>
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder={`Default: "${currentConcept}"`}
              className="w-full text-xs text-slate-20 * text-slate-200 bg-slate-900 border border-slate-750 rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-indigo-505 focus:border-indigo-500/80 transition-colors placeholder-slate-500"
            />
          </div>

          <button
            onClick={handleGenerateQuiz}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 tracking-widest uppercase transition-colors shadow-[0_0_12px_rgba(99,102,241,0.4)]"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            ARCHITECT QUIZ WITH GEMINI AI
          </button>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[220px]">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
            Synthesizing Conceptual MCQ Questions
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">Consulting educational syllabus taxonomies...</p>
        </div>
      )}

      {quiz && (
        <div className="flex-1 flex flex-col justify-between space-y-4 max-h-[380px] overflow-y-auto pr-1">
          <div className="space-y-4">
            {quiz.map((q, idx) => {
              const selected = userAnswers[q.id];
              const isCorrect = selected === q.correctIndex;
              const simStats = classResponseSimulated[q.id];

              return (
                <div key={q.id} className="border border-slate-750 bg-slate-900/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded bg-slate-850 border border-slate-750 text-indigo-400 font-bold text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 leading-snug">{q.question}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pl-7.5 pl-7">
                    {q.options.map((opt, oIdx) => {
                      const isOptionSelected = selected === oIdx;
                      let colorBorder = "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700 hover:bg-slate-900";
                      
                      if (selected !== undefined) {
                        if (oIdx === q.correctIndex) {
                          colorBorder = "border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-bold";
                        } else if (isOptionSelected) {
                          colorBorder = "border-rose-500/40 bg-rose-955/35 bg-rose-950/30 text-rose-300";
                        } else {
                          colorBorder = "border-slate-900/55 bg-slate-950/40 opacity-40 text-slate-500";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => selected === undefined && handleOptionSelect(q.id, oIdx)}
                          disabled={selected !== undefined}
                          className={`text-left p-2.5 rounded-lg border text-[11px] truncate leading-tight cursor-pointer transition-all ${colorBorder}`}
                          title={opt}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {selected !== undefined && (
                    <div className="pl-7 pt-1 flex items-start gap-1.5 text-[11px] leading-relaxed select-none">
                      {isCorrect ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        {isCorrect ? (
                          <span className="font-bold text-emerald-400">Correct! </span>
                        ) : (
                          <span className="font-bold text-rose-400">Incorrect. </span>
                        )}
                        <span className="text-slate-400 italic">{q.explanation}</span>
                      </div>
                    </div>
                  )}

                  {/* Simulator hook */}
                  <div className="pl-7 pt-1 flex flex-wrap gap-2 items-center justify-between">
                    {!simStats ? (
                      <button
                        onClick={() => runClassSim(q)}
                        className="py-1 px-2.5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-400 text-[10px] rounded font-mono font-bold cursor-pointer transition-colors flex items-center gap-1.5"
                      >
                        <Play className="w-2.5 h-2.5" /> Sim Roster Submissions
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="bg-emerald-950 text-emerald-300 border border-emerald-900/35 font-bold px-2 py-0.5 rounded font-mono">
                          Sim Correct: {simStats.correctCount}/13 ({simStats.passRate}%)
                        </span>
                        <span className="text-slate-500 text-[9px] font-mono">Roster aligned</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-slate-705 border-slate-700 pt-3 flex-wrap gap-2 text-[10px] font-mono text-slate-500">
            <span>Model: {isSandbox ? (isRateLimited ? "Sandbox Model (API Rate-Limited)" : "Sandbox Roster Model") : "Gemini Generative API"}</span>
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 text-slate-300 bg-slate-900 hover:bg-slate-750 px-3 py-1.5 rounded-lg border border-slate-750 font-sans cursor-pointer text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Redesign New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
