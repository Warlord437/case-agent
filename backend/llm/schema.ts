import type { AnalysisResult } from "@frontend/types/analysis";

export function emptyResult(): AnalysisResult {
  return {
    summary: "",
    analysis: "",
    key_inferences: [],
    key_points: [],
    statistical_evidence: [],
    anomalies: [],
    focus_areas: [],
    risks: [],
    recommendations: [],
    follow_up_questions: [],
    meta: { provider: "unknown" },
  };
}
