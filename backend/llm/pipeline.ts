import type {
  AnalyzeRequest,
  AnalysisResult,
  StatisticalEvidence,
  Anomaly,
} from "@frontend/types/analysis";
import type { LLMProvider } from "./providers/stub";
import { StubProvider } from "./providers/stub";
import { GeminiProvider } from "./providers/gemini";
import { GroqProvider } from "./providers/groq";
import { emptyResult } from "./schema";
import { buildExtractPrompt, buildWritePrompt } from "./prompts";

function ensureStringArray(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.filter((v): v is string => typeof v === "string");
}

function ensureString(val: unknown, fallback = ""): string {
  return typeof val === "string" ? val : fallback;
}

function ensureStatEvidence(val: unknown): StatisticalEvidence[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter(
      (v): v is Record<string, unknown> =>
        v != null && typeof v === "object" && !Array.isArray(v),
    )
    .map((v) => ({
      metric: ensureString(v.metric, "Unknown metric"),
      value: ensureString(v.value, "N/A"),
      context: ensureString(v.context, ""),
    }));
}

const VALID_SEVERITIES = new Set(["low", "medium", "high"]);

function ensureAnomalies(val: unknown): Anomaly[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter(
      (v): v is Record<string, unknown> =>
        v != null && typeof v === "object" && !Array.isArray(v),
    )
    .map((v) => ({
      observation: ensureString(v.observation, "Unknown anomaly"),
      why_it_matters: ensureString(v.why_it_matters, ""),
      severity: VALID_SEVERITIES.has(v.severity as string)
        ? (v.severity as Anomaly["severity"])
        : "medium",
    }));
}

function safeParse(json: string): Record<string, unknown> {
  try {
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* fall through */
  }
  return {};
}

export function resolveProvider(): LLMProvider {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const model = process.env.GROQ_MODEL || undefined;
    return new GroqProvider(groqKey, model);
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    const model = process.env.GEMINI_MODEL || undefined;
    return new GeminiProvider(geminiKey, model);
  }

  return new StubProvider();
}

export async function runAnalysis(
  req: AnalyzeRequest,
  provider?: LLMProvider,
): Promise<AnalysisResult> {
  const active = provider ?? resolveProvider();
  const start = Date.now();

  const extractPrompt = buildExtractPrompt(req);
  const extractedRaw = await active.generateJson(extractPrompt);

  const writePrompt = buildWritePrompt(extractedRaw, req);
  const writtenRaw = await active.generateJson(writePrompt);

  const latency_ms = Date.now() - start;

  const parsed = safeParse(writtenRaw);

  if (Object.keys(parsed).length === 0) {
    throw new Error("The AI returned an invalid response. Please try again.");
  }

  const result: AnalysisResult = {
    ...emptyResult(),
    summary: ensureString(parsed.summary),
    analysis: ensureString(parsed.analysis),
    key_inferences: ensureStringArray(parsed.key_inferences),
    key_points: ensureStringArray(parsed.key_points),
    statistical_evidence: ensureStatEvidence(parsed.statistical_evidence),
    anomalies: ensureAnomalies(parsed.anomalies),
    focus_areas: ensureStringArray(parsed.focus_areas),
    risks: ensureStringArray(parsed.risks),
    recommendations: ensureStringArray(parsed.recommendations),
    follow_up_questions: ensureStringArray(parsed.follow_up_questions),
    meta: {
      provider: active.name,
      model:
        active instanceof GroqProvider
          ? active.model
          : active instanceof GeminiProvider
            ? active.model
            : undefined,
      input_chars: req.text.length,
      latency_ms,
    },
  };

  return result;
}
