/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with safe limits for potential image uploads
app.use(express.json({ limit: "15mb" }));

// -------------------------------------------------------------
// SECURE LAZY GEMINI API INITIALIZATION
// -------------------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getGemini(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    console.warn("GEMINI_API_KEY is not configured. Running AI features in high-fidelity sandbox mode.");
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    return aiClient;
  } catch (err) {
    console.error("Failed to initialize Gemini SDK:", err);
    return null;
  }
}

// -------------------------------------------------------------
// SIMULATED IN-MEMORY CLASSROOM STATE
// -------------------------------------------------------------
interface Student {
  id: string;
  name: string;
  rollNo: string;
  deskId: string; // "row-col" format - 3 rows x 5 columns
  attendance: "present" | "absent" | "excused";
  attentionScore: number; // 0-100%
  participationCount: number;
  emotion: "attentive" | "confused" | "distracted" | "sleeping";
  lastDetected: string;
}

interface TimelineEntry {
  time: string;
  engagement: number;
  attentiveness: number;
  confusion: number;
}

interface ActivityLogs {
  timestamp: string;
  studentId: string;
  studentName: string;
  type: "raise_hand" | "emotion_change" | "clarity_up" | "distracted" | "attendance";
  message: string;
}

// Global active session state
let students: Student[] = [
  // Row 0
  { id: "s1", name: "Liam Smith", rollNo: "CS-201", deskId: "0-0", attendance: "present", attentionScore: 85, participationCount: 4, emotion: "attentive", lastDetected: "Just now" },
  { id: "s2", name: "Emma Johnson", rollNo: "CS-202", deskId: "0-1", attendance: "present", attentionScore: 92, participationCount: 6, emotion: "attentive", lastDetected: "Just now" },
  { id: "s3", name: "Oliver Williams", rollNo: "CS-203", deskId: "0-2", attendance: "present", attentionScore: 40, participationCount: 1, emotion: "confused", lastDetected: "1 min ago" },
  { id: "s4", name: "Sophia Brown", rollNo: "CS-204", deskId: "0-3", attendance: "present", attentionScore: 78, participationCount: 3, emotion: "attentive", lastDetected: "Just now" },
  { id: "s5", name: "Elijah Jones", rollNo: "CS-205", deskId: "0-4", attendance: "present", attentionScore: 25, participationCount: 0, emotion: "distracted", lastDetected: "3 min ago" },
  // Row 1
  { id: "s6", name: "Isabella Garcia", rollNo: "CS-206", deskId: "1-0", attendance: "present", attentionScore: 88, participationCount: 4, emotion: "attentive", lastDetected: "2 min ago" },
  { id: "s7", name: "James Miller", rollNo: "CS-207", deskId: "1-1", attendance: "absent", attentionScore: 0, participationCount: 0, emotion: "sleeping", lastDetected: "N/A" },
  { id: "s8", name: "Charlotte Davis", rollNo: "CS-208", deskId: "1-2", attendance: "present", attentionScore: 95, participationCount: 7, emotion: "attentive", lastDetected: "Just now" },
  { id: "s9", name: "Benjamin Rodriguez", rollNo: "CS-209", deskId: "1-3", attendance: "present", attentionScore: 45, participationCount: 2, emotion: "confused", lastDetected: "4 min ago" },
  { id: "s10", name: "Amelia Martinez", rollNo: "CS-210", deskId: "1-4", attendance: "present", attentionScore: 82, participationCount: 3, emotion: "attentive", lastDetected: "1 min ago" },
  // Row 2
  { id: "s11", name: "Lucas Hernandez", rollNo: "CS-211", deskId: "2-0", attendance: "present", attentionScore: 70, participationCount: 2, emotion: "attentive", lastDetected: "Just now" },
  { id: "s12", name: "Mia Lopez", rollNo: "CS-212", deskId: "2-1", attendance: "excused", attentionScore: 0, participationCount: 0, emotion: "sleeping", lastDetected: "N/A" },
  { id: "s13", name: "Alexander Gonzalez", rollNo: "CS-213", deskId: "2-2", attendance: "present", attentionScore: 10, participationCount: 0, emotion: "sleeping", lastDetected: "5 min ago" },
  { id: "s14", name: "Evelyn Wilson", rollNo: "CS-214", deskId: "2-3", attendance: "present", attentionScore: 90, participationCount: 5, emotion: "attentive", lastDetected: "Just now" },
  { id: "s15", name: "Henry Anderson", rollNo: "CS-215", deskId: "2-4", attendance: "present", attentionScore: 55, participationCount: 1, emotion: "distracted", lastDetected: "1 min ago" }
];

let timeline: TimelineEntry[] = [
  { time: "09:00", engagement: 65, attentiveness: 70, confusion: 15 },
  { time: "09:10", engagement: 72, attentiveness: 75, confusion: 10 },
  { time: "09:20", engagement: 74, attentiveness: 78, confusion: 12 },
  { time: "09:30", engagement: 68, attentiveness: 70, confusion: 20 },
  { time: "09:40", engagement: 75, attentiveness: 82, confusion: 12 },
  { time: "09:50", engagement: 70, attentiveness: 72, confusion: 18 }
];

let logs: ActivityLogs[] = [
  { timestamp: "09:47", studentId: "s3", studentName: "Oliver Williams", type: "emotion_change", message: "Turned confused during complex nested loop code showcase." },
  { timestamp: "09:48", studentId: "s8", studentName: "Charlotte Davis", type: "raise_hand", message: "Raised hand and successfully answered the variable scoping question." },
  { timestamp: "09:50", studentId: "s13", studentName: "Alexander Gonzalez", type: "distracted", message: "Flagged for closed-eyes/sleeping warning at desk 2-2." }
];

let isSimulating = true;
let currentConcept = "Understanding Multidimensional Arrays and Local Variables Scopes";

// Calculate Metrics helper
function calculateMetrics() {
  const activePresent = students.filter(s => s.attendance === "present");
  const presentCount = activePresent.length;
  const totalCount = students.length;

  if (presentCount === 0) {
    return {
      engagementIndex: 0,
      attentivenessRate: 0,
      confusionRatio: 0,
      presentCount: 0,
      totalCount,
      averageQuizScore: 82
    };
  }

  // Attendance affects stats conceptually but engagement values are relative to active present students
  const runningSum = activePresent.reduce((acc, current) => {
    let engWeight = 0;
    if (current.emotion === "attentive") engWeight = 90;
    else if (current.emotion === "confused") engWeight = 50;
    else if (current.emotion === "distracted") engWeight = 30;
    else if (current.emotion === "sleeping") engWeight = 5;

    // attentionScore also participates
    const individualEngagement = (engWeight * 0.6) + (current.attentionScore * 0.4);
    
    return {
      eng: acc.eng + individualEngagement,
      att: acc.att + current.attentionScore,
      conf: acc.conf + (current.emotion === "confused" ? 1 : 0)
    };
  }, { eng: 0, att: 0, conf: 0 });

  const engagementIndex = Math.round(runningSum.eng / presentCount);
  const attentivenessRate = Math.round(runningSum.att / presentCount);
  const confusionRatio = Math.round((runningSum.conf / presentCount) * 100);

  return {
    engagementIndex,
    attentivenessRate,
    confusionRatio,
    presentCount,
    totalCount,
    averageQuizScore: 82
  };
}

// -------------------------------------------------------------
// CORE ENDPOINTS
// -------------------------------------------------------------

// Active state fetch
app.get("/api/session/state", (req, res) => {
  res.json({
    students,
    metrics: calculateMetrics(),
    timeline,
    logs,
    currentConcept,
    isSimulating
  });
});

// Update specific student properties manually
app.post("/api/session/update-student", (req, res) => {
  const { studentId, attendance, attentionScore, emotion, actionName } = req.body;
  const student = students.find(s => s.id === studentId);
  
  if (student) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    if (attendance !== undefined && student.attendance !== attendance) {
      logs.unshift({
        timestamp,
        studentId: student.id,
        studentName: student.name,
        type: "attendance",
        message: `Attendance changed manually from '${student.attendance}' to '${attendance}'.`
      });
      student.attendance = attendance;
      if (attendance !== "present") {
        student.attentionScore = 0;
        student.emotion = "sleeping";
      } else {
        student.attentionScore = 80;
        student.emotion = "attentive";
      }
    }
    
    if (attentionScore !== undefined && student.attendance === "present") {
      student.attentionScore = attentionScore;
    }
    
    if (emotion !== undefined && student.attendance === "present") {
      if (student.emotion !== emotion) {
        logs.unshift({
          timestamp,
          studentId: student.id,
          studentName: student.name,
          type: emotion === "confused" ? "emotion_change" : emotion === "distracted" ? "distracted" : "clarity_up",
          message: `Classroom monitor adjusted state: transitioned to '${emotion}'.`
        });
      }
      student.emotion = emotion;
    }

    if (actionName === "raise_hand" && student.attendance === "present") {
      student.participationCount += 1;
      logs.unshift({
        timestamp,
        studentId: student.id,
        studentName: student.name,
        type: "raise_hand",
        message: `Voluntarily raised hand to address a live concept query.`
      });
    }

    // Trim logs to last 30 entries
    if (logs.length > 30) logs = logs.slice(0, 30);
    
    res.json({ success: true, student, metrics: calculateMetrics(), logs });
  } else {
    res.status(404).json({ error: "Student not found" });
  }
});

// Simulate a classroom tick (e.g. state fluctuations or simulated student behaviors)
app.post("/api/session/simulate-tick", (req, res) => {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

  // Select 1 or 2 random active present students to change emotions or trigger events
  const presentStudents = students.filter(s => s.attendance === "present");
  if (presentStudents.length > 0) {
    const changeCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < changeCount; i++) {
      const luckyIndex = Math.floor(Math.random() * presentStudents.length);
      const student = presentStudents[luckyIndex];
      
      const eventChance = Math.random();
      if (eventChance < 0.25) {
        // Raise hand
        student.participationCount += 1;
        student.attentionScore = Math.min(100, student.attentionScore + 10);
        logs.unshift({
          timestamp,
          studentId: student.id,
          studentName: student.name,
          type: "raise_hand",
          message: `Asked or answered a question regarding current concept: "${currentConcept}".`
        });
      } else if (eventChance < 0.6) {
        // Change emotion
        const emotions: Array<"attentive" | "confused" | "distracted" | "sleeping"> = ["attentive", "confused", "distracted"];
        const oldEmotion = student.emotion;
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        
        if (oldEmotion !== newEmotion) {
          student.emotion = newEmotion;
          if (newEmotion === "attentive") {
            student.attentionScore = Math.floor(Math.random() * 21) + 80; // 80-100
          } else if (newEmotion === "confused") {
            student.attentionScore = Math.floor(Math.random() * 21) + 35; // 35-55
          } else {
            student.attentionScore = Math.floor(Math.random() * 21) + 15; // 15-35
          }
          logs.unshift({
            timestamp,
            studentId: student.id,
            studentName: student.name,
            type: "emotion_change",
            message: `Telemetry detected state change from '${oldEmotion}' to '${newEmotion}'.`
          });
        }
      } else {
        // Tiny fluctuation in attention score
        const delta = Math.floor(Math.random() * 15) - 7; // -7 to +7
        student.attentionScore = Math.max(10, Math.min(100, student.attentionScore + delta));
      }
    }
  }

  // Append new entry to the timeline list (keep max 10 for display graph)
  const currentMetrics = calculateMetrics();
  timeline.push({
    time: timestamp,
    engagement: currentMetrics.engagementIndex,
    attentiveness: currentMetrics.attentivenessRate,
    confusion: currentMetrics.confusionRatio
  });
  if (timeline.length > 10) timeline.shift();
  if (logs.length > 30) logs = logs.slice(0, 30);

  res.json({ students, metrics: currentMetrics, timeline, logs });
});

// Update current teaching concept
app.post("/api/session/update-concept", (req, res) => {
  const { concept } = req.body;
  if (concept && concept.trim() !== "") {
    currentConcept = concept;
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    logs.unshift({
      timestamp,
      studentId: "system",
      studentName: "Teacher Strategy",
      type: "clarity_up",
      message: `Began teaching new topic: "${concept}". Resetting baseline metrics.`
    });
    // Reset confusion slightly as introduction starts
    students.forEach(s => {
      if (s.attendance === "present" && s.emotion === "confused") {
        s.emotion = "attentive";
        s.attentionScore = 75;
      }
    });
    res.json({ success: true, currentConcept, logs, students, metrics: calculateMetrics() });
  } else {
    res.status(400).json({ error: "Invalid concept title" });
  }
});

// Reset classroom session back to defaults
app.post("/api/session/restart", (req, res) => {
  students = [
    { id: "s1", name: "Liam Smith", rollNo: "CS-201", deskId: "0-0", attendance: "present", attentionScore: 85, participationCount: 4, emotion: "attentive", lastDetected: "Just now" },
    { id: "s2", name: "Emma Johnson", rollNo: "CS-202", deskId: "0-1", attendance: "present", attentionScore: 92, participationCount: 6, emotion: "attentive", lastDetected: "Just now" },
    { id: "s3", name: "Oliver Williams", rollNo: "CS-203", deskId: "0-2", attendance: "present", attentionScore: 40, participationCount: 1, emotion: "confused", lastDetected: "1 min ago" },
    { id: "s4", name: "Sophia Brown", rollNo: "CS-204", deskId: "0-3", attendance: "present", attentionScore: 78, participationCount: 3, emotion: "attentive", lastDetected: "Just now" },
    { id: "s5", name: "Elijah Jones", rollNo: "CS-205", deskId: "0-4", attendance: "present", attentionScore: 25, participationCount: 0, emotion: "distracted", lastDetected: "3 min ago" },
    { id: "s6", name: "Isabella Garcia", rollNo: "CS-206", deskId: "1-0", attendance: "present", attentionScore: 88, participationCount: 4, emotion: "attentive", lastDetected: "2 min ago" },
    { id: "s7", name: "James Miller", rollNo: "CS-207", deskId: "1-1", attendance: "absent", attentionScore: 0, participationCount: 0, emotion: "sleeping", lastDetected: "N/A" },
    { id: "s8", name: "Charlotte Davis", rollNo: "CS-208", deskId: "1-2", attendance: "present", attentionScore: 95, participationCount: 7, emotion: "attentive", lastDetected: "Just now" },
    { id: "s9", name: "Benjamin Rodriguez", rollNo: "CS-209", deskId: "1-3", attendance: "present", attentionScore: 45, participationCount: 2, emotion: "confused", lastDetected: "4 min ago" },
    { id: "s10", name: "Amelia Martinez", rollNo: "CS-210", deskId: "1-4", attendance: "present", attentionScore: 82, participationCount: 3, emotion: "attentive", lastDetected: "1 min ago" },
    { id: "s11", name: "Lucas Hernandez", rollNo: "CS-211", deskId: "2-0", attendance: "present", attentionScore: 70, participationCount: 2, emotion: "attentive", lastDetected: "Just now" },
    { id: "s12", name: "Mia Lopez", rollNo: "CS-212", deskId: "2-1", attendance: "excused", attentionScore: 0, participationCount: 0, emotion: "sleeping", lastDetected: "N/A" },
    { id: "s13", name: "Alexander Gonzalez", rollNo: "CS-213", deskId: "2-2", attendance: "present", attentionScore: 10, participationCount: 0, emotion: "sleeping", lastDetected: "5 min ago" },
    { id: "s14", name: "Evelyn Wilson", rollNo: "CS-214", deskId: "2-3", attendance: "present", attentionScore: 90, participationCount: 5, emotion: "attentive", lastDetected: "Just now" },
    { id: "s15", name: "Henry Anderson", rollNo: "CS-215", deskId: "2-4", attendance: "present", attentionScore: 55, participationCount: 1, emotion: "distracted", lastDetected: "1 min ago" }
  ];
  timeline = [
    { time: "09:00", engagement: 65, attentiveness: 70, confusion: 15 },
    { time: "09:10", engagement: 72, attentiveness: 75, confusion: 10 },
    { time: "09:20", engagement: 74, attentiveness: 78, confusion: 12 },
    { time: "09:30", engagement: 68, attentiveness: 70, confusion: 20 },
    { time: "09:40", engagement: 75, attentiveness: 82, confusion: 12 },
    { time: "09:50", engagement: 70, attentiveness: 72, confusion: 18 }
  ];
  logs = [
    { timestamp: "09:50", studentId: "system", studentName: "Reset", type: "clarity_up", message: "Classroom monitor data re-scanned and synchronized." }
  ];
  currentConcept = "Understanding Multidimensional Arrays and Local Variables Scopes";
  res.json({ success: true, students, metrics: calculateMetrics(), timeline, logs, currentConcept });
});


// -------------------------------------------------------------
// AI POWERED INTELLIGENCE ENDPOINTS (GEMINI PRO / FLASH)
// -------------------------------------------------------------

// POST /api/gemini/insights
// Solicits precise teaching recommendations based on current physical student emotions
app.post("/api/gemini/insights", async (req, res) => {
  const activePresent = students.filter(s => s.attendance === "present");
  const metrics = calculateMetrics();

  // JSON list of students for prompt context
  const targetSummary = activePresent.map(s => ({
    name: s.name,
    desk: s.deskId,
    emotion: s.emotion,
    attention: s.attentionScore,
    handRaises: s.participationCount
  }));

  const prompt = `You are a real-time classroom intelligence bot and pedagogical assistant. 
Review the following metrics of our current session topic: "${currentConcept}".
Classroom Summary Metrics:
- Engagement Index: ${metrics.engagementIndex}/100
- Class Attentiveness: ${metrics.attentivenessRate}/100
- Class Confusion Ratio: ${metrics.confusionRatio}%
- Total Active/Present students: ${activePresent.length}/${students.length}

Roster Telemetry:
${JSON.stringify(targetSummary)}

Generate a response populated with:
1. generalScore: An overall attendance and harmony score.
2. insights: A list of 2-3 precise indicators. For each, specify category ('alert', 'insight', or 'recommendation'), text (a unique diagnostic item under 20 words), and urgency ('high', 'medium', or 'low').
3. pedagogicalTip: A tailored actionable micro-strategy.`;

  const ai = getGemini();

  if (!ai) {
    // Generate high quality Mock Sandbox response if Gemini API Key isn't configured yet
    const simulatedResponse = generateMockInsights(metrics, activePresent);
    return res.json({ ...simulatedResponse, isMock: true });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generalScore: {
              type: Type.INTEGER,
              description: "A number between 1 and 100 for overall classroom attention harmony based on data."
            },
            insights: {
              type: Type.ARRAY,
              description: "List of real-time insights or warnings based on the metrics and roster.",
              items: {
                type: Type.OBJECT,
                properties: {
                  category: {
                    type: Type.STRING,
                    description: "Category of the item: alert, insight, or recommendation."
                  },
                  text: {
                    type: Type.STRING,
                    description: "A brief scannable tip (max 20 words) detailing which rows, zones, or specific students display low focus or high confusion."
                  },
                  urgency: {
                    type: Type.STRING,
                    description: "Severity of notification: high, medium, or low."
                  }
                },
                required: ["category", "text", "urgency"]
              }
            },
            pedagogicalTip: {
              type: Type.STRING,
              description: "Actionable teaching micro-strategy tailored to these specific metrics to boost focus, resolve confusion, or validate eager students."
            }
          },
          required: ["generalScore", "insights", "pedagogicalTip"]
        },
        systemInstruction: "You are an expert educational psychologist and teaching feedback coach. You provide concise, objective recommendations based on real-time visual telemetry of a classroom."
      }
    });

    const bodyText = response.text || "{}";
    const data = JSON.parse(bodyText.trim());
    res.json({ ...data, isMock: false });
  } catch (err: any) {
    console.error("Gemini Insights Generator Error:", err);
    // Graceful fallback to sandbox simulation
    const simulatedResponse = generateMockInsights(metrics, activePresent);
    res.json({ ...simulatedResponse, isMock: true, error: err.message });
  }
});

// POST /api/gemini/quiz-gen
// Generates a quick 3-question student pop quiz dynamically matching classroom attention state
app.post("/api/gemini/quiz-gen", async (req, res) => {
  const { topic } = req.body;
  const currentTopic = topic || currentConcept;

  const prompt = `Create a pop quiz with exactly 3 multiple choice questions based on the topic: "${currentTopic}". 
We need questions that range from general comprehension to edge cases.
Please populate:
1. id: "q1", "q2", "q3" successively
2. question: The question text
3. options: Array of exactly 4 strings
4. correctIndex: 0-indexed integer corresponding to the correct option in the options array
5. explanation: Descriptive text explaining the breakdown of why this option is correct.`;

  const ai = getGemini();

  if (!ai) {
    const mockQuiz = [
      {
        id: "q1",
        question: `In the topic of '${currentTopic}', which core fundamental is primary?`,
        options: ["Data encapsulation and bounds validation", "Constant syntax declaration loops", "Garbage collection indexes", "Dynamic runtime casting"],
        correctIndex: 0,
        explanation: "Correct bounds checks represent fundamental memory stability principles key to standard data arrays."
      },
      {
        id: "q2",
        question: "How do we mitigate cognitive overload in students when teaching this concept?",
        options: ["Present continuous visual analogies and interactive coding steps", "Deliver exhaustive lecture-only slides", "Fast-track intermediate examples immediately", "Refrain from addressing live questions entirely"],
        correctIndex: 0,
        explanation: "Varying instructional material with visual and auditory touchpoints reinforces abstract topics gracefully."
      },
      {
        id: "q3",
        question: "What does high confusion in student seating row 2 usually indicate?",
        options: ["The pace of material explanation exceeds current schema adaptation rate", "The room temperature is inadequate", "Desks are arranged too far back", "Technical microphone hardware static interference"],
        correctIndex: 0,
        explanation: "Localized clusters of confusion are classic indicators that scaffolding steps require brief recapitulation."
      }
    ];
    return res.json({ quiz: mockQuiz, isMock: true });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of exactly 3 multiple-choice question objects.",
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Iterative identifier like q1, q2, q3." },
              question: { type: Type.STRING, description: "A clear, multiple choice concept question." },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of exactly 4 choices."
              },
              correctIndex: { type: Type.INTEGER, description: "0-based index of the correct answer." },
              explanation: { type: Type.STRING, description: "A short, instructive reason for why that choice is correct." }
            },
            required: ["id", "question", "options", "correctIndex", "explanation"]
          }
        },
        systemInstruction: "You are an educator assistant that creates clean, valid multiple-choice quizzes in standard parseable JSON."
      }
    });

    const quizData = JSON.parse((response.text || "[]").trim());
    res.json({ quiz: quizData, isMock: false });
  } catch (err: any) {
    console.error("Gemini Pop Quiz Generator Error:", err);
    const mockQuiz = [
      {
        id: "q1",
        question: `In the topic of '${currentTopic}', which core fundamental is primary?`,
        options: ["Data encapsulation and bounds validation", "Constant syntax declaration loops", "Garbage collection indexes", "Dynamic runtime casting"],
        correctIndex: 0,
        explanation: "Correct bounds checks represent fundamental memory stability principles key to standard data arrays."
      },
      {
        id: "q2",
        question: "How do we mitigate cognitive overload in students when teaching this concept?",
        options: ["Present continuous visual analogies and interactive coding steps", "Deliver exhaustive lecture-only slides", "Fast-track intermediate examples immediately", "Refrain from addressing live questions entirely"],
        correctIndex: 0,
        explanation: "Varying instructional material with visual and auditory touchpoints reinforces abstract topics gracefully."
      },
      {
        id: "q3",
        question: "What does high confusion in student seating row 2 usually indicate?",
        options: ["The pace of material explanation exceeds current schema adaptation rate", "The room temperature is inadequate", "Desks are arranged too far back", "Technical microphone hardware static interference"],
        correctIndex: 0,
        explanation: "Localized clusters of confusion are classic indicators that scaffolding steps require brief recapitulation."
      }
    ];
    res.json({ quiz: mockQuiz, isMock: true, rateLimited: true, error: err.message });
  }
});

// POST /api/gemini/scan-attendance
// Takes a reference classroom image (or mock preset) to run face detection & attendance matching
app.post("/api/gemini/scan-attendance", async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "Classroom snapshot image payload missing" });
  }

  // Clean pure base64 prefix
  const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

  const studentNameList = students.map(s => s.name).join(", ");
  const prompt = `Below is a classroom wide roster/student layout snapshot. We have a set of students enrolled:
${studentNameList}.

Using spatial face and context recognition clues inside the layout image:
1. Determine which of these students are present.
2. Determine which of these students are absent or excused due to completely empty desks.
3. Classify detected student emotions (attentive, confused, distracted, or sleeping) for present students.

Return a valid JSON output matching this strict schema:
{
  "analyzedCount": <number of students spotted>,
  "presentList": ["Student Name 1", "Student Name 2"],
  "absentList": ["Student Name 3"],
  "emotionsMap": {
    "Student Name 1": "attentive" | "confused" | "distracted" | "sleeping"
  },
  "confidenceScore": <number 0 to 100>,
  "summaryReport": "Brief scanning summary describing classroom seating densities and spotted engagement trends."
}

Do not include any code formatting tags. Just output valid raw JSON string.`;

  const ai = getGemini();

  if (!ai) {
    // If no key is set, we simulate automatic image scanning on our student list!
    // We randomly change James Miller to Present, add custom alert log
    const indexToPresent = students.find(s => s.id === "s7"); // James Miller (absent)
    if (indexToPresent) {
      indexToPresent.attendance = "present";
      indexToPresent.emotion = "attentive";
      indexToPresent.attentionScore = 80;
    }

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    logs.unshift({
      timestamp,
      studentId: "s7",
      studentName: "James Miller",
      type: "attendance",
      message: `Vision Scanner detected and marked present during classroom seating scan.`
    });

    return res.json({
      analyzedCount: 14,
      presentList: students.filter(s => s.attendance === "present").map(s => s.name),
      absentList: ["Mia Lopez"],
      emotionsMap: { "Liam Smith": "attentive", "James Miller": "attentive" },
      confidenceScore: 94,
      summaryReport: "Preset Vision AI Scanner parsed snapshot coordinates. Successfully flagged James Miller as newly present at desk row-1-1. Seating density stands at 93%.",
      isMock: true
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: pureBase64
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const report = JSON.parse((response.text || "{}").trim());

    // Adapt database based on AI visual intelligence results
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    students.forEach(s => {
      // Check if present list mentions their name
      const isAIReportingPresent = report.presentList?.some((name: string) => name.toLowerCase().includes(s.name.toLowerCase()));
      const isAIReportingAbsent = report.absentList?.some((name: string) => name.toLowerCase().includes(s.name.toLowerCase()));
      
      if (isAIReportingPresent) {
        if (s.attendance !== "present") {
          s.attendance = "present";
          logs.unshift({
            timestamp,
            studentId: s.id,
            studentName: s.name,
            type: "attendance",
            message: `Vision AI marked present automatically based on image feature parsing.`
          });
        }
        
        // Update detected emotions if available
        const aiEmotion = report.emotionsMap?.[s.name] || report.emotionsMap?.[Object.keys(report.emotionsMap).find(k => k.toLowerCase().includes(s.name.toLowerCase())) || ""];
        if (aiEmotion && ["attentive", "confused", "distracted", "sleeping"].includes(aiEmotion)) {
          s.emotion = aiEmotion;
          if (aiEmotion === "attentive") s.attentionScore = 85;
          else if (aiEmotion === "confused") s.attentionScore = 50;
          else if (aiEmotion === "distracted") s.attentionScore = 30;
          else s.attentionScore = 15;
        }
      } else if (isAIReportingAbsent) {
        if (s.attendance === "present") {
          s.attendance = "absent";
          s.attentionScore = 0;
          s.emotion = "sleeping";
          logs.unshift({
            timestamp,
            studentId: s.id,
            studentName: s.name,
            type: "attendance",
            message: `Vision AI marked absent based on classroom snapshot.`
          });
        }
      }
    });

    res.json({ ...report, isMock: false, students, metrics: calculateMetrics(), logs });
  } catch (err: any) {
    console.error("Gemini Vision Parser Error:", err);
    // Graceful fallback to simulated coordinates on rate-limits
    const indexToPresent = students.find(s => s.id === "s7"); // James Miller (absent)
    if (indexToPresent) {
      indexToPresent.attendance = "present";
      indexToPresent.emotion = "attentive";
      indexToPresent.attentionScore = 80;
    }

    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    logs.unshift({
      timestamp,
      studentId: "s7",
      studentName: "James Miller",
      type: "attendance",
      message: `Vision Scanner detected and marked present during classroom seating scan.`
    });

    res.json({
      analyzedCount: 14,
      presentList: students.filter(s => s.attendance === "present").map(s => s.name),
      absentList: ["Mia Lopez"],
      emotionsMap: { "Liam Smith": "attentive", "James Miller": "attentive" },
      confidenceScore: 94,
      summaryReport: "Preset Vision AI Scanner parsed snapshot coordinates. Successfully flagged James Miller as newly present at desk row-1-1. Seating density stands at 93%.",
      isMock: true,
      rateLimited: true,
      error: err.message,
      students,
      metrics: calculateMetrics(),
      logs
    });
  }
});

// Helper for Mock recommendations
function generateMockInsights(metrics: any, activePresent: Student[]) {
  const insights = [];
  
  const sleepingStudents = activePresent.filter(s => s.emotion === "sleeping");
  const distractedStudents = activePresent.filter(s => s.emotion === "distracted");
  const confusedStudents = activePresent.filter(s => s.emotion === "confused");

  if (sleepingStudents.length > 0) {
    insights.push({
      category: "alert",
      text: `${sleepingStudents.map(s => s.name).join(", ")} flagged as sleeping/fatigued. Tap desk to prompt.`,
      urgency: "high"
    });
  }

  if (confusedStudents.length > 0) {
    insights.push({
      category: "insight",
      text: `Row 1, back rows show custom confusion with '${currentConcept}'. Slow down pacing.`,
      urgency: "medium"
    });
  } else {
    insights.push({
      category: "insight",
      text: "Front coordinates display excellent compliance and high attention levels.",
      urgency: "low"
    });
  }

  if (distractedStudents.length > 0) {
    insights.push({
      category: "recommendation",
      text: "Seating Zone C (back right) attention scores dipping. Call on Elijah or Henry to raise engagement.",
      urgency: "medium"
    });
  }

  return {
    generalScore: Math.round((metrics.engagementIndex + metrics.attentivenessRate) / 2),
    insights: insights.slice(0, 3),
    pedagogicalTip: "Cognitive focus peaks during interactive live coding exercises. Introduce a quick pop quiz or micro-session to reorient distracted desks."
  };
}


// -------------------------------------------------------------
// VITE INTEGRATION FOR FULL-STACK INGRESS
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Assets serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Classroom Intelligence Server active on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch(err => {
  console.error("Critical server boot loop failure:", err);
});
