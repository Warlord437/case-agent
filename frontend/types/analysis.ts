export type Depth = "concise" | "standard" | "detailed";
export type Lens =
  | "general"
  | "pm"
  | "ba"
  | "consulting"
  | "ux"
  | "swe"
  | "aiml"
  | "economist";

export interface AnalyzeRequest {
  text: string;
  depth: Depth;
  lens: Lens;
}

export interface AnalysisMeta {
  provider: string;
  model?: string;
  latency_ms?: number;
  input_chars?: number;
}

export interface StatisticalEvidence {
  metric: string;
  value: string;
  context: string;
}

export interface Anomaly {
  observation: string;
  why_it_matters: string;
  severity: "low" | "medium" | "high";
}

export interface AnalysisResult {
  summary: string;
  analysis: string;
  key_inferences: string[];
  key_points: string[];
  statistical_evidence: StatisticalEvidence[];
  anomalies: Anomaly[];
  focus_areas: string[];
  risks: string[];
  recommendations: string[];
  follow_up_questions: string[];
  meta: AnalysisMeta;
}
