/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  name: string;
  rollNo: string;
  deskId: string; // e.g. "row-col" e.g. "0-0"
  attendance: "present" | "absent" | "excused";
  attentionScore: number; // 0 - 100
  participationCount: number;
  emotion: "attentive" | "confused" | "distracted" | "sleeping";
  lastDetected: string;
}

export interface MetricSummary {
  engagementIndex: number; // 0 - 100
  attentivenessRate: number; // 0 - 100
  confusionRatio: number; // 0 - 100
  presentCount: number;
  totalCount: number;
  averageQuizScore: number;
}

export interface TimelineEntry {
  time: string;
  engagement: number;
  attentiveness: number;
  confusion: number;
}

export interface TeacherInsight {
  timestamp: string;
  category: "alert" | "insight" | "recommendation";
  text: string;
  urgency: "high" | "medium" | "low";
}

export interface AttendanceScanResult {
  presentIds: string[];
  absentIds: string[];
  confidence: number;
  summaryText: string;
}

export interface ConceptFeedback {
  concept: string;
  clarityIndex: number; // 0 - 100
  sentiment: string; // positive, neutral, negative
  count: number;
}
